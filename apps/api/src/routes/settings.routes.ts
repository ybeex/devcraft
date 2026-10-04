import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.middleware.js";

const SETTINGS_ID = "site";

const SiteSettingsSchema = z.object({
  name:         z.string().trim().min(1).max(100),
  tagline:      z.string().trim().min(1).max(300),
  availability: z.string().trim().min(1).max(160),
  githubUrl:    z.string().trim().url().max(500),
  linkedinUrl:  z.string().trim().url().max(500),
  twitterUrl:   z.string().trim().url().max(500),
  email:        z.string().trim().email().max(320),
  cvUrl:        z.string().trim().min(1).max(500),
});

type SiteSettingsInput = z.infer<typeof SiteSettingsSchema>;

const DEFAULT_SETTINGS: SiteSettingsInput = {
  name:         "DevCraft",
  tagline:      "Full-stack engineer. Mathematics graduate. Ex-tailor.",
  availability: "Open to new roles · Remote-first",
  githubUrl:    "https://github.com/yourusername",
  linkedinUrl:  "https://linkedin.com/in/yourusername",
  twitterUrl:   "https://twitter.com/yourusername",
  email:        "hello@devcraft.dev",
  cvUrl:        "/cv.pdf",
};

async function getSettings(app: FastifyInstance) {
  return app.prisma.siteSettings.upsert({
    where:  { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, ...DEFAULT_SETTINGS },
    update: {},
  });
}

export async function settingsRoutes(app: FastifyInstance): Promise<void> {
  // Public portfolio configuration. This deliberately exposes only display data.
  app.get("/settings", async (_request, reply) => {
    const settings = await getSettings(app);
    return reply.send({ ok: true, data: settings });
  });

  app.get("/admin/settings", { preHandler: requireAuth }, async (_request, reply) => {
    const settings = await getSettings(app);
    return reply.send({ ok: true, data: settings });
  });

  app.put("/admin/settings", { preHandler: requireAuth }, async (request, reply) => {
    const parsed = SiteSettingsSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        ok:         false,
        error:      parsed.error.issues[0]?.message ?? "Invalid settings.",
        statusCode: 400,
      });
    }

    const settings = await app.prisma.siteSettings.upsert({
      where:  { id: SETTINGS_ID },
      create: { id: SETTINGS_ID, ...parsed.data },
      update: parsed.data,
    });
    return reply.send({ ok: true, data: settings });
  });
}
