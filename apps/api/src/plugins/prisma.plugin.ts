import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { prisma } from "@devcraft/db";

declare module "fastify" {
  interface FastifyInstance {
    prisma: typeof prisma;
  }
}

export const prismaPlugin = fp(async (app: FastifyInstance) => {
  // BUG-ADJACENT FIX: this used to be `await prisma.$connect()` with nothing
  // catching a failure. If the DB is briefly unreachable — Neon cold-starting,
  // a network blip, a paused project — that throw propagates straight out of
  // `app.register(prismaPlugin)` at module load time, before `app.listen()`
  // ever runs. The whole API fails to start, taking every route down with
  // it, including the AI endpoints that don't touch the database at all
  // (/ai/generate/project, /ai/insights, /ai/complete) and would otherwise
  // work fine. Prisma doesn't actually require an explicit $connect() — it
  // lazily connects on first query by default — so catching the failure
  // here and logging it (same pattern as the OPENROUTER_API_KEY warning in
  // server.ts) lets the server start regardless, and only the routes that
  // genuinely need the DB fail, with a normal per-request error, until it
  // recovers.
  try {
    await prisma.$connect();
  } catch (err) {
    app.log.warn(err, "[startup] ⚠  Could not connect to the database at boot — will retry lazily on first query");
  }
  app.decorate("prisma", prisma);

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });
});
