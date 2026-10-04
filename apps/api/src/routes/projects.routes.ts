import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { Prisma } from "@devcraft/db";
import { requireAuth } from "../middleware/auth.middleware.js";

const ProjectSchema = z.object({
  title: z.string().min(1).max(120),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/),
  tagline: z.string().min(1).max(200),
  description: z.string().min(1),
  era: z.enum(["FOUNDATION", "INTERNSHIP", "SAAS"]),
  problem: z.string().default(""),
  solution: z.string().default(""),
  impact: z.string().default(""),
  metrics: z.record(z.string(), z.union([z.string(), z.number()])).nullable().default(null),
  codeExamples: z.array(z.object({
    language: z.string().min(1).max(40),
    solves: z.string().min(1).max(300),
    code: z.string().min(1).max(10000),
  }).strict()).max(20).default([]),
  techStack: z.array(z.string()).default([]),
  liveUrl: z.string().url().nullable().default(null),
  githubUrl: z.string().url().nullable().default(null),
  thumbnailUrl: z.string().url().nullable().default(null),
  galleryUrls: z.array(z.string().url()).default([]),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
});

const ReorderSchema = z.array(z.object({ id: z.string(), displayOrder: z.number().int() }));

/**
 * Prisma's nullable Json columns don't accept a bare JS `null` — the column
 * can hold an actual JSON null value, distinct from SQL NULL, so Prisma
 * requires the explicit `Prisma.JsonNull` sentinel to disambiguate. Zod's
 * `.nullable().default(null)` naturally produces plain `null`, so every
 * write path funnels through this helper instead of passing `parsed.data`
 * straight into `.create()` / `.update()`.
 */
function toPrismaMetrics(
  metrics: Record<string, string | number> | null
): Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue {
  return metrics === null ? Prisma.JsonNull : metrics;
}

function toPrismaCodeExamples(
  examples: Array<{ language: string; solves: string; code: string }>,
): Prisma.InputJsonValue {
  return examples as unknown as Prisma.InputJsonValue;
}

export async function projectRoutes(app: FastifyInstance) {
  // ── PUBLIC ─────────────────────────────────────────────────────────────────

  // GET /projects — public list (published only)
  app.get("/", async (request, reply) => {
    const { era, featured } = request.query as {
      era?: "FOUNDATION" | "INTERNSHIP" | "SAAS";
      featured?: string;
    };

    const projects = await app.prisma.project.findMany({
      where: {
        published: true,
        archived: false,
        ...(era ? { era } : {}),
        ...(featured === "true" ? { featured: true } : {}),
      },
      orderBy: [{ era: "asc" }, { displayOrder: "asc" }, { createdAt: "desc" }],
    });

    return reply.send({ ok: true, data: projects });
  });

  // GET /projects/:slug — single project + view count
  app.get("/:slug", async (request, reply) => {
    const { slug } = request.params as { slug: string };

    const project = await app.prisma.project.findUnique({
      where: { slug, published: true, archived: false },
    });

    if (!project) {
      return reply.status(404).send({ ok: false, error: "Not found", statusCode: 404 });
    }

    // Increment views (fire and forget)
    app.prisma.project
      .update({ where: { id: project.id }, data: { views: { increment: 1 } } })
      .catch(() => {});

    // Log page view
    const ua = request.headers["user-agent"] ?? "";
    const device = ua.match(/mobile/i) ? "MOBILE" : ua.match(/tablet/i) ? "TABLET" : "DESKTOP";
    app.prisma.pageView
      .create({
        data: {
          path: `/projects/${slug}`,
          referrer: request.headers.referer ?? null,
          device: device as "DESKTOP" | "MOBILE" | "TABLET",
        },
      })
      .catch(() => {});

    return reply.send({ ok: true, data: project });
  });

  // ── ADMIN ──────────────────────────────────────────────────────────────────

  // GET /projects/admin/all — all projects including drafts
  app.get("/admin/all", { preHandler: requireAuth }, async (request, reply) => {
    const projects = await app.prisma.project.findMany({
      where: { archived: false },
      orderBy: [{ era: "asc" }, { displayOrder: "asc" }],
    });
    return reply.send({ ok: true, data: projects });
  });

  // POST /projects/admin — create
  app.post("/admin", { preHandler: requireAuth }, async (request, reply) => {
    const parsed = ProjectSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ ok: false, error: parsed.error.issues[0]?.message, statusCode: 400 });
    }

    const project = await app.prisma.project.create({
      data: {
        ...parsed.data,
        metrics: toPrismaMetrics(parsed.data.metrics),
        codeExamples: toPrismaCodeExamples(parsed.data.codeExamples),
      },
    });
    return reply.status(201).send({ ok: true, data: project });
  });

  // PUT /projects/admin/:id — full update
  app.put("/admin/:id", { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = ProjectSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ ok: false, error: parsed.error.issues[0]?.message, statusCode: 400 });
    }

    const project = await app.prisma.project.update({
      where: { id },
      data: {
        ...parsed.data,
        metrics: toPrismaMetrics(parsed.data.metrics),
        codeExamples: toPrismaCodeExamples(parsed.data.codeExamples),
      },
    });
    return reply.send({ ok: true, data: project });
  });

  // PATCH /projects/admin/reorder — bulk display order update
  app.patch("/admin/reorder", { preHandler: requireAuth }, async (request, reply) => {
    const parsed = ReorderSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ ok: false, error: "Invalid reorder payload", statusCode: 400 });
    }

    await app.prisma.$transaction(
      parsed.data.map(({ id, displayOrder }) =>
        app.prisma.project.update({ where: { id }, data: { displayOrder } })
      )
    );

    return reply.send({ ok: true, data: { reordered: parsed.data.length } });
  });

  // DELETE /projects/admin/:id — soft delete (archive)
  app.delete("/admin/:id", { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { hard } = request.query as { hard?: string };

    if (hard === "true") {
      await app.prisma.project.delete({ where: { id } });
    } else {
      await app.prisma.project.update({
        where: { id },
        data: { archived: true, published: false },
      });
    }

    return reply.send({ ok: true, data: { deleted: true } });
  });
}
