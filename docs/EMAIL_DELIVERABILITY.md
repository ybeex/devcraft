# Email Deliverability

Branded templates and correct SMTP code improve consistency, but Gmail decides inbox placement from domain authentication, reputation, recipient engagement, and message quality. No application change can guarantee inbox delivery.

## Required DNS Setup

Use the DNS values provided by your SMTP/email provider. Do not copy generic record values from this guide; DKIM selectors and SPF include values are provider-specific.

1. Verify your sending domain with the SMTP provider.
2. Publish the provider's DKIM records. Confirm the provider reports DKIM as verified.
3. Publish one SPF TXT record at the sending domain. If SPF already exists, merge the provider's `include:` mechanism into that record; never publish multiple SPF records for the same hostname.
4. Publish a DMARC TXT record at `_dmarc.<your-domain>`. Start with monitoring, for example `v=DMARC1; p=none; rua=mailto:dmarc-reports@<your-domain>`, then review reports and progress to `quarantine`/`reject` when all legitimate senders align. Use a real monitored report address.
5. Make `EMAIL_FROM` use a mailbox on the verified domain. Keep the visible From domain aligned with the authenticated SPF or DKIM domain.
6. Publish a correct PTR/reverse-DNS record if your SMTP provider gives you control of the sending IP. Shared SMTP services usually manage this.

Verify records with your provider's dashboard and a DNS lookup before sending production campaigns. For Gmail bulk-sender requirements, also configure one-click unsubscribe (implemented in the API) and keep the visible unsubscribe link in newsletter messages.

## Warm-Up and Reputation

- Start with opted-in recipients who expect the message, then increase volume gradually.
- Send welcome mail promptly, but avoid sending campaigns to stale or unengaged lists.
- Remove hard bounces and honor unsubscribes immediately. Never purchase lists.
- Keep sender name, From address, domain, and message purpose consistent.
- Avoid misleading subjects, URL shorteners, image-only messages, and excessive links.
- Configure Google Postmaster Tools for the sending domain and monitor spam rate, domain reputation, authentication, and delivery errors.
- Test messages to Gmail and inspect the original headers for `SPF: PASS`, `DKIM: PASS`, and `DMARC: PASS`.

The templates embed the DevCraft logo as an inline CID attachment, so the logo does not depend on external image loading. Portfolio, blog, and project links always use `https://devcraft-me.vercel.app`, including during local development. Email unsubscribe links and RFC 8058 one-click headers go directly to `https://devcraft.up.railway.app/unsubscribe`; the API redirects browser requests to the public confirmation page. The Next.js `/api/unsubscribe` rewrite remains available for older emails. Blog and project cover images remain externally hosted and must be reachable by recipients' email clients.

## Free Gmail Sender Avatar

Nodemailer cannot set the avatar shown beside a message in Gmail; Gmail gets it from the Google Account that authenticated SMTP. For the free option, set a profile photo at [Google Account](https://myaccount.google.com/personal-info), under **Personal info → Photo**, and send using that same account address. A bare `EMAIL_FROM` address is automatically formatted as `DevCraft <address>`; an explicit display name is preserved. Leave `EMAIL_FROM` unset to use the `DevCraft <SMTP_USER>` fallback. Gmail may take time to propagate the photo, and recipients' contacts or organization settings can override it. BIMI/domain logo branding is separate and requires domain authentication; it is not a free Nodemailer setting.
