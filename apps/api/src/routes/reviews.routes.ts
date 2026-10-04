import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.middleware.js";

const ReviewSchema = z.object({
  name: z.string().min(1).max(100),
  role: z.string().max(120).nullable().default(null),
  company: z.string().max(120).nullable().default(null),
  quote: z.string().min(1).max(2000),
  rating: z.number().int().min(1).max(5).default(5),
  initials: z.string().min(1).max(4),
  photoUrl: z.string().url().nullable().default(null),
  linkedinUrl: z.string().url().nullable().default(null),
  relation: z.enum(["TEAM", "CLIENT", "COLLEAGUE"]).default("COLLEAGUE"),
  published: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
});

export async function reviewRoutes(app: FastifyInstance) {
  // ── PUBLIC ─────────────────────────────────────────────────────────────────

  // GET /reviews — published reviews only, for the social-proof section.
  // The frontend (Testimonials.tsx) falls back to its placeholder set when
  // this returns an empty array, so real reviews take over automatically
  // the moment the first one is added.
  app.get("/", async (_request, reply) => {
    const reviews = await app.prisma.review.findMany({
      where: { published: true },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    });
    return reply.send({ ok: true, data: reviews });
  });

  // ── ADMIN ──────────────────────────────────────────────────────────────────

  // GET /reviews/admin/all — every review, published or not
  app.get("/admin/all", { preHandler: requireAuth }, async (_request, reply) => {
    const reviews = await app.prisma.review.findMany({
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    });
    return reply.send({ ok: true, data: reviews });
  });

  // POST /reviews/admin — add a review. Image upload itself happens
  // client-side straight to Cloudinary (same unsigned-upload pattern as
  // the CV uploader in the dashboard settings page) — this endpoint only
  // ever receives the resulting photoUrl string, never a raw file, so
  // there's no multipart handling needed here at all.
  app.post("/admin", { preHandler: requireAuth }, async (request, reply) => {
    const parsed = ReviewSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ ok: false, error: parsed.error.issues[0]?.message, statusCode: 400 });
    }

    const review = await app.prisma.review.create({ data: parsed.data });
    return reply.status(201).send({ ok: true, data: review });
  });

  // PUT /reviews/admin/:id — full update (e.g. toggling published, editing
  // a typo, reordering)
  app.put("/admin/:id", { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = ReviewSchema.partial().safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ ok: false, error: parsed.error.issues[0]?.message, statusCode: 400 });
    }

    const review = await app.prisma.review.update({ where: { id }, data: parsed.data });
    return reply.send({ ok: true, data: review });
  });

  // DELETE /reviews/admin/:id — remove a review
  app.delete("/admin/:id", { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await app.prisma.review.delete({ where: { id } });
    return reply.send({ ok: true, data: null });
  });
}
