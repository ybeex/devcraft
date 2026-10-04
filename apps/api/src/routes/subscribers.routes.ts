import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.middleware.js";
import { sendWelcomeEmail } from "../services/email.service.js";

const SubscribeSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  name: z.string().max(80).optional(),
});

// SEC-07: Top disposable email domain blocklist
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com","guerrillamail.com","10minutemail.com","throwam.com",
  "tempmail.com","yopmail.com","sharklasers.com","guerrillamailblock.com",
  "grr.la","guerrillamail.info","spam4.me","trashmail.com","trashmail.me",
  "fakeinbox.com","maildrop.cc","dispostable.com","spamgourmet.com",
  "33mail.com","spamgourmet.net","tempr.email","discard.email",
]);

export async function subscriberRoutes(app: FastifyInstance) {
  // ── PUBLIC ─────────────────────────────────────────────────────────────────

  // POST /subscribe — direct subscribe, no confirmation needed
  app.post(
    "/subscribe",
    { config: { rateLimit: { max: 3, timeWindow: "1 hour" } } },
    async (request, reply) => {
      const parsed = SubscribeSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          ok: false,
          error: parsed.error.issues[0]?.message ?? "Invalid input",
          statusCode: 400,
        });
      }

      const { email, name } = parsed.data;

      // SEC-07: Reject disposable domains
      const domain = email.split("@")[1]?.toLowerCase() ?? "";
      if (DISPOSABLE_DOMAINS.has(domain)) {
        return reply.status(400).send({
          ok: false,
          error: "Please use a permanent email address.",
          statusCode: 400,
        });
      }

      // Check if already subscribed (active)
      const existing = await app.prisma.subscriber.findUnique({ where: { email } });

      if (existing && !existing.unsubscribedAt) {
        // Already subscribed — return success silently (don't leak info)
        return reply.send({ ok: true, data: { message: "You're already subscribed!" } });
      }

      let unsubscribeToken = existing?.unsubscribeToken;
      if (existing && existing.unsubscribedAt) {
        // Re-subscribing — clear the unsubscribed date
        await app.prisma.subscriber.update({
          where: { email },
          data: { unsubscribedAt: null, name: name ?? existing.name },
        });
      } else {
        // New subscriber
        const created = await app.prisma.subscriber.create({
          data: { email, name },
        });
        unsubscribeToken = created.unsubscribeToken;
      }

      if (!unsubscribeToken) {
        const subscriber = await app.prisma.subscriber.findUnique({ where: { email }, select: { unsubscribeToken: true } });
        unsubscribeToken = subscriber?.unsubscribeToken;
      }

      if (process.env.NODE_ENV !== "production") {
        const result = await sendWelcomeEmail(email, name, unsubscribeToken);
        if (!result.ok) {
          app.log.error({ error: result.error }, "Development welcome email was not delivered");
          return reply.status(502).send({
            ok: false,
            error: "Subscription saved, but the development email was not delivered. Check EMAIL_TEST_TO and the API logs.",
            statusCode: 502,
          });
        }
        return reply.status(201).send({
          ok: true,
          data: { message: "You're subscribed! The development email was sent to the configured test recipient." },
        });
      }

      // Production sends stay fire-and-forget so subscription success is not
      // blocked by provider latency. The result's error field is still logged.
      sendWelcomeEmail(email, name, unsubscribeToken)
        .then((result) => {
          if (!result.ok) app.log.error({ error: result.error }, "Welcome email was not delivered");
        })
        .catch((err) => app.log.error({ err }, "Failed to send welcome email"));

      return reply.status(201).send({
        ok: true,
        data: { message: "You're subscribed! Check your inbox for a welcome note." },
      });
    }
  );

  // GET /unsubscribe?token=xxx — one-click unsubscribe from email links
  app.get("/unsubscribe", async (request, reply) => {
    const { token } = request.query as { token?: string };

    if (!token) {
      return reply.status(400).send({ ok: false, error: "Missing token", statusCode: 400 });
    }

    const subscriber = await app.prisma.subscriber.findUnique({
      where: { unsubscribeToken: token },
    });

    if (!subscriber) {
      // Don't reveal whether the token exists
      return reply.redirect(`${process.env.NEXT_PUBLIC_SITE_URL!}/unsubscribed?status=ok`);
    }

    if (!subscriber.unsubscribedAt) {
      await app.prisma.subscriber.update({
        where: { id: subscriber.id },
        data: { unsubscribedAt: new Date() },
      });
    }

    return reply.redirect(`${process.env.NEXT_PUBLIC_SITE_URL!}/unsubscribed?status=ok`);
  });

  // RFC 8058 one-click unsubscribe used by Gmail and other mailbox providers.
  app.post("/unsubscribe", async (request, reply) => {
    const { token } = request.query as { token?: string };
    const body = request.body as Record<string, unknown> | undefined;
    if (!token || body?.["List-Unsubscribe"] !== "One-Click") {
      return reply.status(400).send({ ok: false, error: "Invalid unsubscribe request", statusCode: 400 });
    }

    await app.prisma.subscriber.updateMany({
      where: { unsubscribeToken: token, unsubscribedAt: null },
      data: { unsubscribedAt: new Date() },
    });
    return reply.status(200).send({ ok: true });
  });

  // ── ADMIN ──────────────────────────────────────────────────────────────────

  // GET /admin/subscribers
  app.get(
    "/admin/subscribers",
    { preHandler: requireAuth },
    async (request, reply) => {
      const { status = "active", page = "1", limit = "50" } = request.query as {
        status?: "active" | "unsubscribed" | "all";
        page?: string;
        limit?: string;
      };

      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, parseInt(limit));
      const skip = (pageNum - 1) * limitNum;

      const where =
        status === "active"
          ? { unsubscribedAt: null }
          : status === "unsubscribed"
          ? { unsubscribedAt: { not: null } }
          : {};

      const [subscribers, total, activeCount, unsubscribedCount] = await Promise.all([
        app.prisma.subscriber.findMany({
          where,
          orderBy: { subscribedAt: "desc" },
          skip,
          take: limitNum,
        }),
        app.prisma.subscriber.count({ where }),
        app.prisma.subscriber.count({ where: { unsubscribedAt: null } }),
        app.prisma.subscriber.count({ where: { unsubscribedAt: { not: null } } }),
      ]);

      return reply.send({
        ok: true,
        data: {
          subscribers,
          pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
          counts: { active: activeCount, unsubscribed: unsubscribedCount, total: activeCount + unsubscribedCount },
        },
      });
    }
  );

  // DELETE /admin/subscribers/:id — GDPR removal (nulls the email field, keeps shell)
  app.delete(
    "/admin/subscribers/:id",
    { preHandler: requireAuth },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      await app.prisma.subscriber.updateMany({
        where: { id },
        data: {
          email: `deleted-${Date.now()}@deleted.invalid`,
          name: null,
          unsubscribedAt: new Date(),
        },
      });

      return reply.send({ ok: true, data: { message: "Subscriber removed." } });
    }
  );

  // GET /admin/subscribers/export — CSV download
  app.get(
    "/admin/subscribers/export",
    { preHandler: requireAuth },
    async (request, reply) => {
      const subscribers = await app.prisma.subscriber.findMany({
        where: { unsubscribedAt: null },
        orderBy: { subscribedAt: "asc" },
        select: { email: true, name: true, subscribedAt: true },
      });

      // Bug fixes, both in csvField() below:
      // 1. Fields were interpolated with no quoting at all, so a name
      //    containing a comma (e.g. "Doe, Jane") silently broke the
      //    column alignment for that row and everything after it looked
      //    shifted when opened.
      // 2. A name beginning with =, +, -, or @ is the classic "CSV/
      //    formula injection" vector — Excel, Sheets, and LibreOffice all
      //    treat a cell starting with one of those as a formula to
      //    evaluate on open, which is how a subscriber's own name field
      //    could end up running arbitrary spreadsheet formulas for
      //    whoever opens this export. Prefixing with a leading apostrophe
      //    is the standard (OWASP-recommended) mitigation — spreadsheet
      //    apps treat that as "force plain text" and it neutralizes the
      //    formula without visibly changing the text.
      const csv = [
        "email,name,subscribed_at",
        ...subscribers.map(
          (s) => `${csvField(s.email)},${csvField(s.name ?? "")},${csvField(s.subscribedAt.toISOString())}`
        ),
      ].join("\n");

      reply.header("Content-Type", "text/csv");
      reply.header("Content-Disposition", `attachment; filename="subscribers-${Date.now()}.csv"`);
      return reply.send(csv);
    }
  );
}

function csvField(value: string): string {
  let v = value;
  if (/^[=+\-@\t\r]/.test(v)) v = `'${v}`;
  if (/[",\n\r]/.test(v)) v = `"${v.replace(/"/g, '""')}"`;
  return v;
}
