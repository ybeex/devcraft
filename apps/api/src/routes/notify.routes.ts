import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.middleware.js";
import { getEmailTestRecipient, sendBlogNotification, sendProjectNotification } from "../services/email.service.js";

const NotifySchema = z.object({
  type: z.enum(["BLOG", "PROJECT"]),
  referenceId: z.string().min(1),
});

export async function notifyRoutes(app: FastifyInstance) {
  // POST /admin/notify — send notification blast to all active subscribers
  app.post("/notify", { preHandler: requireAuth }, async (request, reply) => {
    const parsed = NotifySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ ok: false, error: "Invalid input", statusCode: 400 });
    }

    const { type, referenceId } = parsed.data;

    // Prevent accidental repeat sends, but allow retrying legacy history
    // entries that recorded zero accepted recipients.
    const testRecipient = getEmailTestRecipient();
    const already = testRecipient ? null : await app.prisma.emailNotification.findFirst({
      where: {
        type,
        blogPostId: type === "BLOG" ? referenceId : undefined,
        projectId: type === "PROJECT" ? referenceId : undefined,
        recipientCount: { gt: 0 },
      },
    });
    if (already) {
      return reply.status(409).send({
        ok: false,
        error: `A ${type.toLowerCase()} notification for this item was already accepted by SMTP on ${already.sentAt.toISOString()}.`,
        statusCode: 409,
      });
    }

    // Fetch all active subscribers
    const subscribers = await app.prisma.subscriber.findMany({
      where: { unsubscribedAt: null },
      select: { email: true, unsubscribeToken: true },
    });

    if (subscribers.length === 0) {
      return reply.status(409).send({
        ok: false,
        error: "No active subscribers; no notification email was sent.",
        statusCode: 409,
      });
    }

    let subject = "";
    let result: { accepted: number; failed: number; errors: string[] };

    if (type === "BLOG") {
      const post = await app.prisma.blogPost.findUnique({ where: { id: referenceId } });
      if (!post) return reply.status(404).send({ ok: false, error: "Blog post not found", statusCode: 404 });
      subject = `New post: ${post.title}`;
      result = await sendBlogNotification(subscribers, post);
    } else {
      const project = await app.prisma.project.findUnique({ where: { id: referenceId } });
      if (!project) return reply.status(404).send({ ok: false, error: "Project not found", statusCode: 404 });
      subject = `I shipped something: ${project.title}`;
      result = await sendProjectNotification(subscribers, project);
    }

    // Log the notification only after the SMTP server accepted at least one
    // message, not based on the requested subscriber count.
    if (result.accepted === 0) {
      app.log.error(
        { failed: result.failed, errors: result.errors },
        `📧 ${type} notification: SMTP accepted no recipients`
      );
      return reply.status(502).send({
        ok: false,
        error: result.errors[0]
          ? `SMTP did not accept any notification emails: ${result.errors[0]}`
          : "SMTP did not accept any notification emails.",
        statusCode: 502,
      });
    }

    // Store history only after SMTP accepted at least one recipient. This is
    // submission acceptance, not proof the recipient's mailbox delivered it.
    if (!testRecipient) {
      await app.prisma.emailNotification.create({
        data: {
          type,
          blogPostId: type === "BLOG" ? referenceId : null,
          projectId: type === "PROJECT" ? referenceId : null,
          subject,
          recipientCount: result.accepted,
        },
      });
    }

    if (result.failed > 0) {
      app.log.error(
        { failed: result.failed, accepted: result.accepted, errors: result.errors },
        `📧 ${type} notification: SMTP accepted ${result.accepted}; ${result.failed} recipients failed`
      );
    } else {
      app.log.info(`📧 SMTP accepted ${type} notification for ${result.accepted} subscribers`);
    }

    return reply.send({
      ok: true,
      data: {
        accepted: result.accepted,
        failed: result.failed,
        ...(testRecipient ? { testMode: true, testRecipient } : {}),
        errors: result.failed > 0 ? result.errors : undefined,
      },
    });
  });

  // GET /admin/notifications — history
  app.get("/notifications", { preHandler: requireAuth }, async (request, reply) => {
    const notifications = await app.prisma.emailNotification.findMany({
      orderBy: { sentAt: "desc" },
      take: 50,
      include: { blogPost: { select: { title: true, slug: true } } },
    });

    return reply.send({ ok: true, data: notifications });
  });
}
