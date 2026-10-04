import { readFileSync } from "node:fs";
import nodemailer, { type Transporter } from "nodemailer";

const BRAND_NAME = "DevCraft";
const SMTP_USER = process.env.SMTP_USER?.trim();
const FROM = process.env.EMAIL_FROM?.trim() || (
  SMTP_USER && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(SMTP_USER)
    ? `${BRAND_NAME} <${SMTP_USER}>`
    : undefined
);
const REPLY_TO = process.env.EMAIL_REPLY_TO?.trim();
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;
const EMAIL_LOGO_CID = "devcraft-logo";
const EMAIL_LOGO = readFileSync(new URL("../../../web/public/logo.png", import.meta.url));
const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const SITE_ORIGIN = SITE_URL.replace(/\/+$/, "");
const API_ORIGIN = API_URL.replace(/\/+$/, "");
let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const secureValue = process.env.SMTP_SECURE;
  const secure = secureValue?.toLowerCase();
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !Number.isInteger(port) || port < 1 || port > 65535 || (secure !== "true" && secure !== "false")) {
    throw new Error("SMTP is not configured. Set SMTP_HOST, SMTP_PORT, and SMTP_SECURE.");
  }
  if ((user && !pass) || (!user && pass)) {
    throw new Error("SMTP_USER and SMTP_PASS must either both be set or both be empty.");
  }

  transporter = nodemailer.createTransport({
    pool: true,
    host,
    port,
    secure: secure === "true",
    ...(user && pass ? { auth: { user, pass } } : {}),
    maxConnections: 5,
    maxMessages: 100,
  });
  return transporter;
}

interface OutgoingEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
  unsubscribeUrl?: string;
}

async function sendEmail(message: OutgoingEmail): Promise<void> {
  if (!FROM) throw new Error("EMAIL_FROM is not configured. Set it to a verified sender address.");

  const { unsubscribeUrl, ...mail } = message;
  const info = await getTransporter().sendMail({
    from: FROM,
    ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
    ...mail,
    attachments: [{
      filename: "devcraft-logo.png",
      content: EMAIL_LOGO,
      contentType: "image/png",
      contentDisposition: "inline",
      cid: EMAIL_LOGO_CID,
    }],
    ...(unsubscribeUrl ? {
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    } : {}),
  });

  const accepted = info.accepted ?? [];
  const rejected = info.rejected ?? [];
  if (accepted.length === 0 || rejected.length > 0) {
    throw new Error(info.response || "SMTP server did not accept the recipient.");
  }
}

async function sendEmailBatch(messages: OutgoingEmail[]): Promise<NotifyResult> {
  const result: NotifyResult = { accepted: 0, failed: 0, errors: [] };
  const settled = await Promise.allSettled(messages.map(sendEmail));

  settled.forEach((delivery): void => {
    if (delivery.status === "fulfilled") {
      result.accepted += 1;
    } else {
      result.failed += 1;
      result.errors.push(delivery.reason instanceof Error ? delivery.reason.message : "Unknown SMTP error");
    }
  });

  return result;
}

export function getEmailTestRecipient(): string | null {
  if (process.env.NODE_ENV === "production") return null;
  return process.env.EMAIL_TEST_TO?.trim() || null;
}

export function isEmailTestMode(): boolean {
  return getEmailTestRecipient() !== null;
}

// ── SECURITY: HTML-escape any value interpolated into a template ───────────
// Bug fix: every template below used to interpolate values straight into
// the HTML string with no escaping at all — most seriously the
// subscriber-supplied `name` in the welcome email, which comes straight
// from the public, unauthenticated /subscribe form. Someone subscribing
// with a name like `<img src=x onerror=...>` would have that HTML land,
// unescaped, in an email actually sent from this domain. Blog/project
// fields come from the authenticated dashboard so the risk there is much
// lower, but they're escaped too for consistency and because it costs
// nothing.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Bug fix: none of these emails had a plain-text part — Nodemailer accepts a
// `text` field alongside `html`, and mail without one scores
// worse with most spam filters and renders as nothing at all in the rare
// client that can't/won't show HTML. Callers below now build both.

interface SendResult {
  ok: boolean;
  error?: string;
}

// ── TEMPLATES ────────────────────────────────────────────────────────────────
// Plain HTML — react-email would require build step; this keeps the API lean
// and lets you swap to react-email templates easily later.

function baseLayout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <meta name="color-scheme" content="light"/>
  <title>${BRAND_NAME}</title>
  <style>
    body { margin:0; padding:0; background:#f1ecde; font-family:Arial,Helvetica,sans-serif; color:#1c2036; }
    table { border-collapse:collapse; }
    .outer { width:100%; background:#f1ecde; }
    .card { width:100%; max-width:600px; background:#fffdf7; border:1px solid #e2d8c2; border-radius:18px; overflow:hidden; }
    .masthead { padding:28px 32px 22px; background:#161c30; border-bottom:3px solid #a2762a; }
    .brand-name { color:#f4efe3; font-family:Georgia,'Times New Roman',serif; font-size:21px; font-weight:bold; letter-spacing:.2px; }
    .brand-tagline { color:#c7cbe0; font-size:11px; line-height:1.5; padding-top:4px; }
    .body { padding:34px 36px 30px; }
    h1 { font-family:Georgia,'Times New Roman',serif; font-size:28px; font-weight:700; color:#1c2036; margin:0 0 14px; line-height:1.25; }
    h2 { font-family:Georgia,'Times New Roman',serif; font-size:19px; font-weight:700; color:#1c2036; margin:0 0 10px; line-height:1.35; }
    p { font-size:15px; line-height:1.75; color:#5b5847; margin:0 0 17px; }
    .eyebrow { color:#8a6321; font-size:10px; line-height:1.4; font-weight:bold; letter-spacing:1.8px; text-transform:uppercase; margin:0 0 10px; }
    .panel { background:#f5f0e4; border:1px solid #e2d8c2; border-radius:12px; padding:18px 20px; margin:22px 0; }
    .btn { display:inline-block; padding:14px 25px; background:#a2762a; color:#fff !important;
           text-decoration:none; border-radius:9px; font-size:14px; font-weight:bold; margin:6px 0; }
    .secondary { display:inline-block; padding:12px 20px; background:#e9e1cf; color:#1c2036 !important;
           text-decoration:none; border-radius:9px; font-size:14px; font-weight:bold; margin:6px 0; }
    .rule { border:0; border-top:1px solid #e2d8c2; margin:25px 0; }
    .footer { padding:21px 30px 25px; background:#f5f0e4; border-top:1px solid #e2d8c2;
              font-size:11px; color:#766d59; text-align:center; line-height:1.7; }
    .footer p { font-size:11px; line-height:1.7; color:#766d59; margin:0 0 6px; }
    .footer a { color:#805b20; text-decoration:underline; }
    .logo { display:block; width:48px; height:48px; border:0; margin-right:14px; }
    .cover { display:block; width:100%; max-width:528px; height:auto; border:0; border-radius:10px; margin:0 0 23px; }
    @media screen and (max-width:620px) {
      .outer-pad { padding:12px !important; }
      .masthead { padding:23px 22px 19px !important; }
      .body { padding:27px 23px 24px !important; }
      h1 { font-size:25px !important; }
    }
  </style>
</head>
<body>
  <table role="presentation" class="outer" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td class="outer-pad" align="center" style="padding:30px 16px;">
      <table role="presentation" class="card" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#fffdf7;border:1px solid #e2d8c2;border-radius:18px;">
        <tr><td class="masthead" style="padding:28px 32px 22px;background:#161c30;border-bottom:3px solid #a2762a;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td valign="middle"><a href="${SITE_ORIGIN}" style="text-decoration:none"><img class="logo" src="cid:${EMAIL_LOGO_CID}" width="48" height="48" alt="${BRAND_NAME}" style="display:block;width:48px;height:48px;border:0;margin-right:14px;"/></a></td>
            <td valign="middle"><div class="brand-name" style="color:#f4efe3;font-family:Georgia,'Times New Roman',serif;font-size:21px;font-weight:bold">${BRAND_NAME}</div><div class="brand-tagline" style="color:#c7cbe0;font-size:11px;line-height:1.5;padding-top:4px">Engineering, with craft.</div></td>
          </tr></table>
        </td></tr>
        <tr><td class="body" style="padding:34px 36px 30px;">${content}</td></tr>
        <tr><td class="footer" style="padding:21px 30px 25px;background:#f5f0e4;border-top:1px solid #e2d8c2;font-size:11px;color:#766d59;text-align:center;line-height:1.7;">
          <p style="font-size:11px;line-height:1.7;color:#766d59;margin:0 0 6px">${BRAND_NAME} · Built from Kano, northern Nigeria.</p>
          <p style="font-size:11px;line-height:1.7;color:#766d59;margin:0">You're receiving this because you subscribed at <a href="${SITE_ORIGIN}" style="color:#805b20">${SITE_ORIGIN}</a>.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── WELCOME ───────────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(email: string, name?: string, unsubscribeToken?: string): Promise<SendResult> {
  const testRecipient = getEmailTestRecipient();
  const safeName = name ? escapeHtml(name) : "";
  const greeting = safeName ? `Hey ${safeName}` : "Hey there";
  const html = baseLayout(`
    <p class="eyebrow" style="color:#8a6321;font-size:10px;font-weight:bold;letter-spacing:1.8px;text-transform:uppercase;margin:0 0 10px">WELCOME TO THE LIST</p>
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:28px;color:#1c2036;margin:0 0 14px;line-height:1.25">You're in.</h1>
    <p>${greeting}, welcome to DevCraft.</p>
    <p>
      I'm a self-taught full-stack engineer from Kano — maths graduate, ex-tailor, builder of things
      that fit. You'll hear from me when I ship new projects or write something worth reading.
      No spam. No cadence. Just signal.
    </p>
    <p><a href="${SITE_ORIGIN}" class="btn" style="display:inline-block;padding:14px 25px;background:#a2762a;color:#fff;text-decoration:none;border-radius:9px;font-size:14px;font-weight:bold">Explore the portfolio</a></p>
    <hr class="rule" style="border:0;border-top:1px solid #e2d8c2;margin:25px 0"/>
    <p style="font-size:13px;font-style:italic;color:#766d59;">
      "Ginin da a gina shi da hankali, shi ne ginin da ya tsaya" —
      The building built with care is the one that stands.
    </p>
    ${unsubscribeToken ? `<p style="font-size:12px;color:#766d59;margin-top:28px">Prefer not to receive these updates? <a href="${API_ORIGIN}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}" style="color:#805b20">Unsubscribe</a>.</p>` : ""}
  `);

  const text = `${greeting.replace(/&amp;/g, "&")}, welcome to DevCraft.

I'm a self-taught full-stack engineer from Kano — maths graduate, ex-tailor, builder of things
that fit. You'll hear from me when I ship new projects or write something worth reading.
No spam. No cadence. Just signal.

Explore the portfolio: ${SITE_ORIGIN}

"Ginin da a gina shi da hankali, shi ne ginin da ya tsaya" — The building built with care is the one that stands.`;

  try {
    await sendEmail({
      to: testRecipient ?? email,
      subject: `${testRecipient ? "[DEV TEST] " : ""}You're in. Welcome to DevCraft.`,
      html,
      text: unsubscribeToken
        ? `${text}\n\nUnsubscribe: ${API_ORIGIN}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`
        : text,
      ...(unsubscribeToken ? { unsubscribeUrl: `${API_ORIGIN}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}` } : {}),
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown SMTP error" };
  }
}

// ── NEW BLOG NOTIFICATION ─────────────────────────────────────────────────────

interface NotifyResult {
  accepted: number;
  failed: number;
  errors: string[];
}

export async function sendBlogNotification(
  subscribers: { email: string; unsubscribeToken: string }[],
  post: { title: string; slug: string; excerpt: string; coverImageUrl?: string | null; readingTime?: number | null }
): Promise<NotifyResult> {
  const testRecipient = getEmailTestRecipient();
  const postUrl = `${SITE_URL}/blog/${post.slug}`;
  const title = escapeHtml(post.title);
  const excerpt = escapeHtml(post.excerpt);

  const chunks = chunk(testRecipient ? subscribers.slice(0, 1) : subscribers, testRecipient ? 1 : 50);
  const result: NotifyResult = { accepted: 0, failed: 0, errors: [] };

  for (const batch of chunks) {
    const emails: OutgoingEmail[] = batch.map(({ email, unsubscribeToken }) => ({
      to: testRecipient ?? email,
      subject: `${testRecipient ? "[DEV TEST] " : ""}New post: ${post.title}`,
      html: baseLayout(`
        ${post.coverImageUrl ? `<img class="cover" src="${escapeHtml(post.coverImageUrl)}" alt="${title}" style="display:block;width:100%;max-width:528px;height:auto;border:0;border-radius:10px;margin:0 0 23px;"/>` : ""}
        <p class="eyebrow" style="color:#8a6321;font-size:10px;font-weight:bold;letter-spacing:1.8px;text-transform:uppercase;margin:0 0 10px">FROM THE DEVCRAFT JOURNAL</p>
        <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:28px;color:#1c2036;margin:0 0 14px;line-height:1.25">${title}</h1>
        ${post.readingTime ? `<p style="font-size:12px;color:#766d59;margin-bottom:12px">${post.readingTime} min read</p>` : ""}
        <div class="panel" style="background:#f5f0e4;border:1px solid #e2d8c2;border-radius:12px;padding:18px 20px;margin:22px 0"><p style="margin:0">${excerpt}</p></div>
        <p><a href="${escapeHtml(postUrl)}" class="btn" style="display:inline-block;padding:14px 25px;background:#a2762a;color:#fff;text-decoration:none;border-radius:9px;font-size:14px;font-weight:bold">Read the article</a></p>
        <hr class="rule" style="border:0;border-top:1px solid #e2d8c2;margin:25px 0"/>
        <p style="font-size:12px;color:#766d59">You subscribed to DevCraft updates. <a href="${API_ORIGIN}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}" style="color:#805b20">Unsubscribe</a>.</p>
      `),
      text: `${post.title}\n\n${post.excerpt}\n\nRead the article: ${postUrl}\n\nUnsubscribe: ${API_ORIGIN}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`,
      unsubscribeUrl: `${API_ORIGIN}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`,
    }));

    const batchResult = await sendEmailBatch(emails);
    result.accepted += batchResult.accepted;
    result.failed += batchResult.failed;
    result.errors.push(...batchResult.errors);
  }

  return result;
}

// ── NEW PROJECT NOTIFICATION ──────────────────────────────────────────────────

export async function sendProjectNotification(
  subscribers: { email: string; unsubscribeToken: string }[],
  project: {
    title: string; slug: string; tagline: string;
    era: string; techStack: string[];
    liveUrl?: string | null; githubUrl?: string | null;
    thumbnailUrl?: string | null;
  }
): Promise<NotifyResult> {
  const testRecipient = getEmailTestRecipient();
  const projectUrl = `${SITE_URL}/projects/${project.slug}`;
  const eraLabel = { FOUNDATION: "Foundation", INTERNSHIP: "HNG Internship", SAAS: "SaaS · Live" }[project.era] ?? project.era;
  const title = escapeHtml(project.title);
  const tagline = escapeHtml(project.tagline);
  const stackLine = project.techStack.map(escapeHtml).join(" · ");

  const chunks = chunk(testRecipient ? subscribers.slice(0, 1) : subscribers, testRecipient ? 1 : 50);
  const result: NotifyResult = { accepted: 0, failed: 0, errors: [] };

  for (const batch of chunks) {
    const emails: OutgoingEmail[] = batch.map(({ email, unsubscribeToken }) => ({
      to: testRecipient ?? email,
      subject: `${testRecipient ? "[DEV TEST] " : ""}I shipped something: ${project.title}`,
      html: baseLayout(`
        ${project.thumbnailUrl ? `<img class="cover" src="${escapeHtml(project.thumbnailUrl)}" alt="${title}" style="display:block;width:100%;max-width:528px;height:auto;border:0;border-radius:10px;margin:0 0 23px;"/>` : ""}
        <p class="eyebrow" style="color:#8a6321;font-size:10px;font-weight:bold;letter-spacing:1.8px;text-transform:uppercase;margin:0 0 10px">${escapeHtml(eraLabel)} · NEW PROJECT</p>
        <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:28px;color:#1c2036;margin:0 0 14px;line-height:1.25">${title}</h1>
        <p>${tagline}</p>
        <div style="margin:16px 0">
          ${project.liveUrl ? `<a href="${escapeHtml(project.liveUrl)}" class="btn" style="display:inline-block;padding:14px 25px;background:#a2762a;color:#fff;text-decoration:none;border-radius:9px;font-size:14px;font-weight:bold;margin-right:8px">Open live demo</a>` : ""}
          <a href="${escapeHtml(projectUrl)}" class="secondary" style="display:inline-block;padding:12px 20px;background:#e9e1cf;color:#1c2036;text-decoration:none;border-radius:9px;font-size:14px;font-weight:bold">Project details</a>
        </div>
        <div class="panel" style="background:#f5f0e4;border:1px solid #e2d8c2;border-radius:12px;padding:18px 20px;margin:22px 0"><p style="font-size:12px;color:#766d59;margin:0"><strong style="color:#1c2036">Built with:</strong> ${stackLine}</p></div>
        <hr class="rule" style="border:0;border-top:1px solid #e2d8c2;margin:25px 0"/>
        <p style="font-size:12px;color:#766d59">You subscribed to DevCraft updates. <a href="${API_ORIGIN}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}" style="color:#805b20">Unsubscribe</a>.</p>
      `),
      text: `${project.title}\n\n${project.tagline}\n\nStack: ${project.techStack.join(" · ")}\n\nProject details: ${projectUrl}${project.liveUrl ? `\nLive demo: ${project.liveUrl}` : ""}\n\nUnsubscribe: ${API_ORIGIN}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`,
      unsubscribeUrl: `${API_ORIGIN}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`,
    }));

    const batchResult = await sendEmailBatch(emails);
    result.accepted += batchResult.accepted;
    result.failed += batchResult.failed;
    result.errors.push(...batchResult.errors);
  }

  return result;
}

// ── UTIL ──────────────────────────────────────────────────────────────────────

function chunk<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}
