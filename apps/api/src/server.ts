import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import formbody from "@fastify/formbody";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import helmet from "@fastify/helmet";

import { prismaPlugin } from "./plugins/prisma.plugin.js";
import { authRoutes } from "./routes/auth.routes.js";
import { projectRoutes } from "./routes/projects.routes.js";
import { blogRoutes } from "./routes/blog.routes.js";
import { subscriberRoutes } from "./routes/subscribers.routes.js";
import { analyticsRoutes } from "./routes/analytics.routes.js";
import { notifyRoutes } from "./routes/notify.routes.js";
import { aiRoutes }      from "./routes/ai.routes.js";
import { contactRoutes } from "./routes/contact.routes.js";
import { settingsRoutes } from "./routes/settings.routes.js";
import { reviewRoutes } from "./routes/reviews.routes.js";
import { uploadRoutes } from "./routes/uploads.routes.js";

// ── SEC-04 + SEC-06: Validate all critical env vars at startup ────────────────

function requireEnv(name: string, minLength = 1): string {
  const val = process.env[name];
  if (!val || val.length < minLength) {
    throw new Error(
      `[startup] Missing or invalid env var: ${name}` +
      (minLength > 1 ? ` (must be ≥ ${minLength} chars)` : "")
    );
  }
  return val;
}

const JWT_SECRET    = requireEnv("JWT_SECRET", 32);
const COOKIE_SECRET = requireEnv("JWT_SECRET", 32); // reuse for cookie signing
const CORS_ORIGIN   = requireEnv("CORS_ORIGIN");
  
// SEC-09: Validate CORS_ORIGIN is a real URL (or comma-separated URLs)
const ALLOWED_ORIGINS = CORS_ORIGIN.split(",").map((o) => {
  const trimmed = o.trim();
  try { new URL(trimmed); } catch {
    throw new Error(`[startup] Invalid CORS_ORIGIN: "${trimmed}" is not a valid URL`);
  }
  return trimmed;
});

// Warn (not throw) if OPENROUTER_API_KEY is missing — AI features will fail gracefully
if (!process.env.OPENROUTER_API_KEY) {
  console.warn("[startup] ⚠  OPENROUTER_API_KEY not set — AI features will be unavailable");
}

if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || process.env.SMTP_SECURE === undefined) {
  console.warn("[startup] SMTP is not configured — email delivery will fail until SMTP_HOST, SMTP_PORT, and SMTP_SECURE are set");
}
if (Boolean(process.env.SMTP_USER) !== Boolean(process.env.SMTP_PASS)) {
  console.warn("[startup] SMTP_USER and SMTP_PASS must either both be set or both be empty");
}

// ── FASTIFY INSTANCE ─────────────────────────────────────────────────────────

const app = Fastify({
  // SEC-01: Hard body size limit — 512KB prevents payload flooding
  bodyLimit: 512 * 1024,
  logger: {
    level: process.env.NODE_ENV! === "production" ? "warn" : "info",
    transport:
      process.env.NODE_ENV! !== "production"
        ? { target: "pino-pretty", options: { colorize: true } }
        : undefined,
  },
});

// ── PLUGINS ──────────────────────────────────────────────────────────────────

// SEC-02: Security headers via Helmet
await app.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", "data:", "https://res.cloudinary.com"],
      connectSrc: ["'self'", "https://openrouter.ai"],
      frameSrc:   ["'none'"],
      objectSrc:  ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // allow embedding in Next.js
});

await app.register(cors, {
  // SEC-09: Use validated origin list
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error("CORS: origin not allowed"), false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
});

await app.register(cookie, {
  secret: COOKIE_SECRET,
  parseOptions: {},
});

await app.register(formbody);

await app.register(jwt, {
  secret: JWT_SECRET,
  sign: { expiresIn: "15m" },
});

await app.register(rateLimit, {
  max: 200,
  timeWindow: "1 minute",
  allowList: ["127.0.0.1", "::1"],
  errorResponseBuilder: () => ({
    ok: false,
    error: "Too many requests. Please slow down.",
    statusCode: 429,
  }),
});

await app.register(prismaPlugin);

// ── ROUTES ────────────────────────────────────────────────────────────────────

await app.register(authRoutes,       { prefix: "/auth"      });
await app.register(projectRoutes,    { prefix: "/projects"  });
await app.register(blogRoutes,       { prefix: "/blog"      });
await app.register(subscriberRoutes, { prefix: "/"          });
await app.register(analyticsRoutes,  { prefix: "/analytics" });
await app.register(notifyRoutes,     { prefix: "/admin"     });
await app.register(aiRoutes,         { prefix: "/ai"        });
await app.register(contactRoutes,    { prefix: "/"          });
await app.register(settingsRoutes,   { prefix: "/"          });
await app.register(reviewRoutes,     { prefix: "/reviews"   });
await app.register(uploadRoutes,     { prefix: "/"          });

// ── HEALTH ────────────────────────────────────────────────────────────────────

app.get("/health", async () => ({
  ok: true,
  ts: new Date().toISOString(),
  env: process.env.NODE_ENV_DEV!,
}));

// ── START ─────────────────────────────────────────────────────────────────────

const port = Number(process.env.API_PORT!);
const host = process.env.API_HOST!;

try {
  await app.listen({ port, host });
  console.log(`\n🚀  API running at http://${host}:${port}`);
  console.log(`🔒  CORS allowed: ${ALLOWED_ORIGINS.join(", ")}\n`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
