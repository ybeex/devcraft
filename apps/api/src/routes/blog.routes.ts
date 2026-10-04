import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.middleware.js";
import { detectDevice } from "../utils/device.js";

const BlogSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().min(1).max(500),
  content: z.string().min(1),
  coverImageUrl: z.string().url().nullable().default(null),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(false),
});

function calcReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export async function blogRoutes(app: FastifyInstance) {
  // ── PUBLIC ─────────────────────────────────────────────────────────────────

  // GET /blog — paginated published list
  app.get("/", async (request, reply) => {
    const { tag, page = "1", limit = "10" } = request.query as {
      tag?: string; page?: string; limit?: string;
    };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));

    const where = {
      published: true,
      ...(tag ? { tags: { has: tag } } : {}),
    };

    const [posts, total] = await Promise.all([
      app.prisma.blogPost.findMany({
        where,
        select: {
          id: true, title: true, slug: true, excerpt: true,
          coverImageUrl: true, tags: true, publishedAt: true,
          readingTime: true, views: true,
        },
        orderBy: { publishedAt: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      app.prisma.blogPost.count({ where }),
    ]);

    return reply.send({
      ok: true,
      data: { posts, pagination: { total, page: pageNum, limit: limitNum } },
    });
  });

  // GET /blog/:slug — full post + view count
  app.get("/:slug", async (request, reply) => {
    const { slug } = request.params as { slug: string };

    const post = await app.prisma.blogPost.findUnique({
      where: { slug, published: true },
    });

    if (!post) {
      return reply.status(404).send({ ok: false, error: "Not found", statusCode: 404 });
    }

    // Increment + log (fire and forget)
    app.prisma.blogPost.update({ where: { id: post.id }, data: { views: { increment: 1 } } }).catch(() => {});
    const ua: string = (request.headers["user-agent"] as string | undefined) ?? "";
    const device = detectDevice(ua);
    app.prisma.pageView.create({
      data: { path: `/blog/${slug}`, referrer: request.headers.referer ?? null, device },
    }).catch(() => {});

    // Related posts (same tag, excluding current)
    const related = post.tags.length
      ? await app.prisma.blogPost.findMany({
          where: { published: true, tags: { hasSome: post.tags }, id: { not: post.id } },
          select: { title: true, slug: true, excerpt: true, publishedAt: true, readingTime: true },
          take: 3,
          orderBy: { publishedAt: "desc" },
        })
      : [];

    return reply.send({ ok: true, data: { post, related } });
  });

  // ── ADMIN ──────────────────────────────────────────────────────────────────

  // GET /blog/admin/all
  app.get("/admin/all", { preHandler: requireAuth }, async (request, reply) => {
    const posts = await app.prisma.blogPost.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true, title: true, slug: true, published: true,
        publishedAt: true, views: true, tags: true, readingTime: true, updatedAt: true,
      },
    });
    return reply.send({ ok: true, data: posts });
  });

  // GET /blog/admin/:id — full post for editing
  app.get("/admin/:id", { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const post = await app.prisma.blogPost.findUnique({ where: { id } });
    if (!post) return reply.status(404).send({ ok: false, error: "Not found", statusCode: 404 });
    return reply.send({ ok: true, data: post });
  });

  // POST /admin — create (prefix /blog already applied → resolves to POST /blog/admin)
  app.post("/admin", { preHandler: requireAuth }, async (request, reply) => {
    const parsed = BlogSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ ok: false, error: parsed.error.issues[0]?.message, statusCode: 400 });
    }

    const data = parsed.data;
    const post = await app.prisma.blogPost.create({
      data: {
        ...data,
        readingTime: calcReadingTime(data.content),
        publishedAt: data.published ? new Date() : null,
      },
    });

    return reply.status(201).send({ ok: true, data: post });
  });

  // PUT /blog/admin/:id — update
  app.put("/admin/:id", { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = BlogSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ ok: false, error: parsed.error.issues[0]?.message, statusCode: 400 });
    }

    const existing = await app.prisma.blogPost.findUnique({ where: { id }, select: { published: true, publishedAt: true } });
    if (!existing) return reply.status(404).send({ ok: false, error: "Not found", statusCode: 404 });

    const data = parsed.data;
    const post = await app.prisma.blogPost.update({
      where: { id },
      data: {
        ...data,
        readingTime: calcReadingTime(data.content),
        // Only set publishedAt on first publish
        publishedAt: data.published && !existing.publishedAt ? new Date() : existing.publishedAt,
      },
    });

    return reply.send({ ok: true, data: post });
  });

  // DELETE /blog/admin/:id
  app.delete("/admin/:id", { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await app.prisma.blogPost.delete({ where: { id } });
    return reply.send({ ok: true, data: { deleted: true } });
  });
}
