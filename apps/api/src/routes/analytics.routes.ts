import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type { DeviceType } from "@devcraft/db";
import { requireAuth } from "../middleware/auth.middleware.js";
import { detectDevice } from "../utils/device.js";

// ── REQUEST BODY TYPES ────────────────────────────────────────────────────────

interface PageviewBody {
  path?:     string;
  referrer?: string;
}

interface PeriodQuery {
  days?: string;
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function sanitizeReferrer(referrer: string | undefined): string | null {
  if (!referrer) return null;
  try {
    const u: URL = new URL(referrer);
    if (u.protocol === "http:" || u.protocol === "https:") {
      return referrer.slice(0, 500);
    }
    return null;
  } catch {
    return null; // discard malformed referrers silently
  }
}

interface DaySeriesPoint {
  date:  string;
  count: number;
}

function buildDaySeries(
  dates: Date[],
  since: Date,
  daysNum: number
): DaySeriesPoint[] {
  const byDay: Record<string, number> = {};
  for (const d of dates) {
    const key: string = d.toISOString().slice(0, 10);
    byDay[key] = (byDay[key] ?? 0) + 1;
  }

  return Array.from({ length: daysNum }, (_unused: unknown, i: number): DaySeriesPoint => {
    const d: Date = new Date(since.getTime() + i * 24 * 60 * 60 * 1000);
    const key: string = d.toISOString().slice(0, 10);
    return { date: key, count: byDay[key] ?? 0 };
  });
}

// ── ROUTES ────────────────────────────────────────────────────────────────────

export async function analyticsRoutes(app: FastifyInstance): Promise<void> {

  // ── PUBLIC ──────────────────────────────────────────────────────────────────

  // POST /analytics/pageview — called from Next.js middleware on every route
  app.post(
    "/pageview",
    { config: { rateLimit: { max: 600, timeWindow: "1 minute" } } },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { path, referrer } = request.body as PageviewBody;

      if (!path) {
        return reply.status(400).send({ ok: false, error: "path required", statusCode: 400 });
      }

      // Skip dashboard and auth paths
      if (path.startsWith("/dashboard") || path.startsWith("/auth")) {
        return reply.send({ ok: true, data: null });
      }

      const cleanReferrer: string | null = sanitizeReferrer(referrer);
      const ua: string = (request.headers["user-agent"] as string | undefined) ?? "";
      const device: DeviceType = detectDevice(ua);

      await app.prisma.pageView.create({
        data: { path, referrer: cleanReferrer, device },
      });

      return reply.status(201).send({ ok: true, data: null });
    }
  );

  // ── ADMIN ──────────────────────────────────────────────────────────────────

  // GET /analytics/overview — 30-day summary
  app.get(
    "/overview",
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { days = "30" } = request.query as PeriodQuery;
      const daysNum: number    = Math.min(90, parseInt(days, 10));
      const since: Date        = new Date(Date.now() - daysNum * 24 * 60 * 60 * 1000);
      const prevSince: Date    = new Date(Date.now() - daysNum * 2 * 24 * 60 * 60 * 1000);

      const [allViews, prevViews, deviceRows, topPages, topReferrers] = await Promise.all([
        app.prisma.pageView.findMany({
          where:  { viewedAt: { gte: since } },
          select: { viewedAt: true, device: true },
        }),
        app.prisma.pageView.count({ where: { viewedAt: { gte: prevSince, lt: since } } }),
        app.prisma.pageView.groupBy({
          by: ["device"],
          where: { viewedAt: { gte: since } },
          _count: { id: true },
        }),
        app.prisma.pageView.groupBy({
          by: ["path"],
          where: { viewedAt: { gte: since } },
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
          take: 10,
        }),
        app.prisma.pageView.groupBy({
          by: ["referrer"],
          where: { viewedAt: { gte: since }, referrer: { not: null } },
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
          take: 10,
        }),
      ]);

      const viewsByDay: DaySeriesPoint[] = buildDaySeries(
        allViews.map((v: { viewedAt: Date }): Date => v.viewedAt),
        since,
        daysNum
      );

      const deviceSplit = { desktop: 0, mobile: 0, tablet: 0 };
      for (const row of deviceRows) {
        const key: keyof typeof deviceSplit = row.device.toLowerCase() as keyof typeof deviceSplit;
        deviceSplit[key] = row._count.id;
      }

      return reply.send({
        ok: true,
        data: {
          totalViews:      allViews.length,
          viewsLastPeriod: prevViews,
          viewsByDay,
          deviceSplit,
          topPages:     topPages.map((r): { path: string; count: number } => ({ path: r.path, count: r._count.id })),
          topReferrers: topReferrers.map((r): { referrer: string; count: number } => ({
            referrer: r.referrer ?? "direct",
            count: r._count.id,
          })),
        },
      });
    }
  );

  // GET /analytics/subscribers — subscriber growth
  app.get(
    "/subscribers",
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { days = "30" } = request.query as PeriodQuery;
      const daysNum: number = Math.min(90, parseInt(days, 10));
      const since: Date     = new Date(Date.now() - daysNum * 24 * 60 * 60 * 1000);

      const [allSubs, recentSubs] = await Promise.all([
        app.prisma.subscriber.count({ where: { unsubscribedAt: null } }),
        app.prisma.subscriber.findMany({
          where:   { subscribedAt: { gte: since } },
          select:  { subscribedAt: true },
          orderBy: { subscribedAt: "asc" },
        }),
      ]);

      const growthByDay: DaySeriesPoint[] = buildDaySeries(
        recentSubs.map((s: { subscribedAt: Date }): Date => s.subscribedAt),
        since,
        daysNum
      );

      return reply.send({
        ok: true,
        data: {
          total:         allSubs,
          newThisPeriod: recentSubs.length,
          growthByDay,
        },
      });
    }
  );
}
