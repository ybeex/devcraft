import type { FastifyInstance } from "fastify";
import { createHash } from "node:crypto";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.middleware.js";

// SECURITY FIX: both the CV uploader (settings page) and the review photo
// uploader were doing *unsigned* direct-to-Cloudinary uploads, authorized
// only by an "unsigned upload preset" name. That name (and the cloud
// name) ship in the client JS bundle by necessity — NEXT_PUBLIC_* env
// vars are inlined at build time — so anyone who opens devtools can read
// them straight out of the bundle and POST directly to
// https://api.cloudinary.com/v1_1/{cloud}/{resource}/upload with that
// same preset, with no login and no rate limit of ours involved at all.
// It's not a theoretical risk: it's public information sitting in plain
// text in every page load.
//
// A *signed* upload closes this: Cloudinary requires a per-request
// signature computed from the exact params being uploaded plus the
// account's API secret, and the secret only ever lives here, server-side,
// behind requireAuth. An attacker without a valid session can no longer
// get a usable signature at all, so they can no longer upload anything.
//
// The signing algorithm itself is Cloudinary's own public spec (not a
// secret in itself): every param to be signed (everything except file,
// cloud_name, resource_type, and api_key) gets sorted alphabetically,
// joined as key=value&key=value..., the API secret is appended directly
// (no separator), and the result is SHA-1 hashed to hex.
export async function uploadRoutes(app: FastifyInstance) {
  const SignRequestSchema = z.object({
    // Extra params the client wants included in the signed upload — e.g.
    // { public_id: "Yusuf_Bashir_Nayaya_CV", overwrite: true } for the CV,
    // or { folder: "reviews" } for a review photo. Whatever is sent here
    // must be sent as-is (same keys/values) in the actual Cloudinary
    // upload request, or the signature won't match.
    params: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).default({}),
  });

  app.post("/admin/uploads/sign", { preHandler: requireAuth }, async (request, reply) => {
    const parsed = SignRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ ok: false, error: parsed.error.issues[0]?.message, statusCode: 400 });
    }

    const apiKey    = process.env.CLOUDINARY_API_KEY!;
    const apiSecret = process.env.CLOUDINARY_API_SECRET!;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
    if (!apiKey || !apiSecret || !cloudName) {
      return reply.status(500).send({ ok: false, error: "Cloudinary is not configured on the server.", statusCode: 500 });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const toSign: Record<string, string | number | boolean> = { ...parsed.data.params, timestamp };

    const signatureBase = Object.keys(toSign)
      .sort()
      .map((key) => `${key}=${toSign[key]}`)
      .join("&");

    const signature = createHash("sha1").update(signatureBase + apiSecret).digest("hex");

    return reply.send({
      ok: true,
      data: { signature, timestamp, apiKey, cloudName },
    });
  });
}
