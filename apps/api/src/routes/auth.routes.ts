import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.middleware.js";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function authRoutes(app: FastifyInstance) {
  // POST /auth/login
  app.post(
    "/login",
    {
      config: { rateLimit: { max: 5, timeWindow: "15 minutes" } },
    },
    async (request, reply) => {
      const parsed = LoginSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ ok: false, error: "Invalid input", statusCode: 400 });
      }

      const { email, password } = parsed.data;

      // Single admin check — credentials live in env
      const adminEmail = process.env.ADMIN_EMAIL!;
      const adminHash = process.env.ADMIN_PASSWORD_HASH!;

      if (!adminEmail || !adminHash) {
        return reply.status(503).send({ ok: false, error: "Admin not configured", statusCode: 503 });
      }

      if (email !== adminEmail) {
        return reply.status(401).send({ ok: false, error: "Invalid credentials", statusCode: 401 });
      }

      const valid = await bcrypt.compare(password, adminHash);
      if (!valid) {
        return reply.status(401).send({ ok: false, error: "Invalid credentials", statusCode: 401 });
      }

      // Access token (15m)
      const accessToken = app.jwt.sign({ sub: "admin", email }, { expiresIn: "15m" });

      // Refresh token (7d) — stored in httpOnly cookie
      const refreshToken = app.jwt.sign({ sub: "admin", type: "refresh" }, { expiresIn: "7d" });

      reply.setCookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV! === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        signed: true,
      });

      return reply.send({ ok: true, data: { accessToken } });
    }
  );

  // POST /auth/refresh
  app.post("/refresh", async (request, reply) => {
    const raw = request.cookies.refresh_token;
    if (!raw) {
      return reply.status(401).send({ ok: false, error: "No refresh token", statusCode: 401 });
    }

    const unsigned = request.unsignCookie(raw);
    if (!unsigned.valid || !unsigned.value) {
      return reply.status(401).send({ ok: false, error: "Invalid refresh token", statusCode: 401 });
    }
    const token = unsigned.value;

    try {
      const payload = app.jwt.verify<{ sub: string; type: string }>(token);
      if (payload.type !== "refresh") throw new Error("Not a refresh token");

      const accessToken = app.jwt.sign({ sub: "admin", email: process.env.ADMIN_EMAIL! }, { expiresIn: "15m" });
      return reply.send({ ok: true, data: { accessToken } });
    } catch {
      return reply.status(401).send({ ok: false, error: "Invalid refresh token", statusCode: 401 });
    }
  });

  // POST /auth/logout
  app.post("/logout", { preHandler: requireAuth }, async (request, reply) => {
    reply.clearCookie("refresh_token", { path: "/" });
    return reply.send({ ok: true, data: null });
  });
}
