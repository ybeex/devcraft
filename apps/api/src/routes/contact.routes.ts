import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.middleware.js";

// ── VALIDATION ────────────────────────────────────────────────────────────────

const ContactSchema = z.object({
  name:     z.string().min(2, "Name must be at least 2 characters.").max(80),
  email:    z.string().email("Please enter a valid email address."),
  subject:  z.string().min(3, "Subject must be at least 3 characters.").max(120),
  message:  z.string().min(10, "Message must be at least 10 characters.").max(4000),
  // Honeypot values are handled below so bots receive a successful response
  // instead of a validation error that reveals the check.
  website:  z.string().max(200).optional(),
});

type ContactBody = z.infer<typeof ContactSchema>;

// ── ROUTES ────────────────────────────────────────────────────────────────────

export async function contactRoutes(app: FastifyInstance): Promise<void> {

  // ── PUBLIC ──────────────────────────────────────────────────────────────────

  // POST /contact — submit a contact form message
  app.post<{ Body: ContactBody }>(
    "/contact",
    {
      config:    { rateLimit: { max: 3, timeWindow: "1 hour" } },
      bodyLimit: 8 * 1024, // 8 KB — more than enough for a contact message
    },
    async (request, reply) => {
      const parsed = ContactSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.status(400).send({
          ok:         false,
          error:      parsed.error.issues[0]?.message ?? "Invalid input.",
          statusCode: 400,
        });
      }

      const { name, email, subject, message, website } = parsed.data;

      // Honeypot check — legitimate users leave this blank
      if (website && website.length > 0) {
        // Silently succeed so bots don't know they were detected
        return reply.status(201).send({ ok: true, data: { message: "Message received." } });
      }

      // Capture metadata for spam review
      const ua        = (request.headers["user-agent"] as string | undefined) ?? null;
      const ipAddress = request.ip ?? null;

      await app.prisma.contactMessage.create({
        data: { name, email, subject, message, ipAddress, userAgent: ua },
      });

      return reply.status(201).send({
        ok:   true,
        data: { message: "Message received. I'll be in touch soon." },
      });
    }
  );

  // ── ADMIN ────────────────────────────────────────────────────────────────────

  // GET /admin/contacts — paginated list
  app.get(
    "/admin/contacts",
    { preHandler: requireAuth },
    async (request, reply) => {
      const { read, page = "1", limit = "20" } = request.query as {
        read?:  "true" | "false";
        page?:  string;
        limit?: string;
      };

      const pageNum  = Math.max(1, parseInt(page,  10));
      const limitNum = Math.min(100, parseInt(limit, 10));
      const skip     = (pageNum - 1) * limitNum;

      const where =
        read === "true"  ? { read: true }  :
        read === "false" ? { read: false } :
        {};

      const [messages, total, unreadCount] = await Promise.all([
        app.prisma.contactMessage.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limitNum,
        }),
        app.prisma.contactMessage.count({ where }),
        app.prisma.contactMessage.count({ where: { read: false } }),
      ]);

      return reply.send({
        ok:   true,
        data: {
          messages,
          pagination: {
            total,
            page:  pageNum,
            limit: limitNum,
            pages: Math.ceil(total / limitNum),
          },
          unreadCount,
        },
      });
    }
  );

  // PATCH /admin/contacts/:id/read — mark as read
  app.patch(
    "/admin/contacts/:id/read",
    { preHandler: requireAuth },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { read = true } = request.body as { read?: boolean };

      const msg = await app.prisma.contactMessage.update({
        where: { id },
        data:  { read },
      });

      return reply.send({ ok: true, data: msg });
    }
  );

  // DELETE /admin/contacts/:id
  app.delete(
    "/admin/contacts/:id",
    { preHandler: requireAuth },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      await app.prisma.contactMessage.delete({ where: { id } });

      return reply.send({ ok: true, data: { deleted: true } });
    }
  );

  // GET /admin/contacts/unread-count — lightweight badge endpoint
  app.get(
    "/admin/contacts/unread-count",
    { preHandler: requireAuth },
    async (_request, reply) => {
      const count = await app.prisma.contactMessage.count({ where: { read: false } });
      return reply.send({ ok: true, data: { count } });
    }
  );
}
