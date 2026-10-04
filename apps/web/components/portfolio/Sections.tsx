"use client";

import { ZaureArch, SawakiBg, MiniRigaDivider } from "@/components/hausa";
import { LogoMark } from "@/components/ui/LogoMark";
import Image from "next/image";
import { SubscribeWidget } from "@/components/ui/SubscribeWidget";
import { ContactForm } from "@/components/portfolio/ContactForm";
import { IconFill } from "@/components/ui/IconFill";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ApiResponse, SiteSettings } from "@devcraft/types";

const DEFAULT_SITE_SETTINGS = {
  githubUrl: "",
  linkedinUrl: "",
  twitterUrl: "",
  availability: "Open to new roles · Remote-first",
  cvUrl: "",
};

// Each layer of the stack mapped to a Hausa architectural motif — the arch
// visitors pass through first, the gate that controls what gets in, the
// tower where things are kept, the column that holds the rest up.
const SKILL_GROUPS = [
  {
    key: "frontend",
    label: "Frontend",
    tagline: "What people touch",
    accent: "var(--brand)",
    items: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion"],
    image: "/skill-frontend.png",
  },
  {
    key: "backend",
    label: "Backend",
    tagline: "What controls access",
    accent: "var(--indigo)",
    items: ["Node.js", "Fastify", "REST APIs", "JWT Auth", "WebSockets"],
    image: "/skill-server-backend.png",
  },
  {
    key: "database",
    label: "Database",
    tagline: "Where it's kept",
    accent: "var(--brand)",
    items: ["PostgreSQL", "Prisma ORM", "SQL", "Database Design"],
    image: "/skill-database.png",
  },
  {
    key: "infra",
    label: "Infrastructure",
    tagline: "What holds it up",
    accent: "var(--indigo)",
    items: ["Vercel", "Railway", "Neon DB", "Cloudinary", "CI/CD"],
    image: "/skill-cloud-infra.png",
  },
];

export function SkillsSection() {
  return (
    <section
      id="skills"
      style={{
        // borderTop/borderBottom removed — the SawakiLineDivider placed
        // before and after this section on the homepage now owns that seam.
        padding: "100px clamp(24px, 8vw, 120px)",
        background: "var(--card)",
      }}
    >
      <div className="max-w-260 mx-auto">
        <span className="reveal swatch-tag mb-5">
          Stack
        </span>
        <h2 className="reveal font-display font-bold leading-[1.12] mb-4"
          style={{ fontSize: "clamp(28px, 4.5vw, 46px)", color: "var(--ink)" }}>
          Tools of the trade
        </h2>
        <p className="reveal text-[16px] leading-[1.65] mb-10 max-w-140" style={{ color: "var(--dim)" }}>
          Four layers, one stack — from what people touch down to what holds it all up.
        </p>

        {/* Bento showcase — one gradient-washed panel per layer, the whole
            stack visible at once instead of gated behind a click */}
        <div className="reveal-group grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          {SKILL_GROUPS.map((g, i) => (
            <div
              key={g.key}
              className="reveal interactive-lift fill-trigger bento-panel"
              style={{
                background: `linear-gradient(155deg, color-mix(in srgb, ${g.accent} 13%, var(--glass-bg-strong)) 0%, var(--glass-bg-strong) 60%)`,
                borderColor: "var(--glass-border)",
              }}
            >
              <span className="bento-panel-watermark" style={{ color: g.accent }}>
                0{i + 1}
              </span>

              <div className="flex items-center gap-4 mb-6 relative">
                <span
                  className="icon-badge flex items-center justify-center shrink-0"
                  style={{ width: 64, height: 64 }}
                >
                  {/* Bare image (no badge fill/border). IconFill applies
                      `transform: scale(1)` at rest, and a non-"none" transform
                      creates a new containing block — which silently broke
                      next/image's `fill` mode when it sat directly inside
                      (it sized itself against IconFill's zero-size box and
                      never rendered). The explicitly-sized, position:relative
                      wrapper below gives `fill` a real box to measure. */}
                  <IconFill scale={1.12}>
                    <span style={{ position: "relative", width: 64, height: 64, display: "block" }}>
                      <Image src={g.image} alt="" fill sizes="64px" className="object-contain" />
                    </span>
                  </IconFill>
                </span>
                <div>
                  <p className="font-display font-bold text-[20px] leading-tight" style={{ color: "var(--ink)" }}>
                    {g.label}
                  </p>
                  <p className="text-[11px] uppercase tracking-[1.2px] mt-1" style={{ color: "var(--ghost)" }}>
                    {g.tagline}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 relative">
                {g.items.map((s, idx) => (
                  <span
                    key={s}
                    className="text-[12.5px] font-mono px-3 py-1.5 rounded-lg border"
                    style={{
                      color: idx === 0 ? g.accent : "var(--dim)",
                      fontWeight: idx === 0 ? 700 : 500,
                      background: idx === 0
                        ? `color-mix(in srgb, ${g.accent} 13%, var(--raised))`
                        : "var(--raised)",
                      borderColor: idx === 0
                        ? `color-mix(in srgb, ${g.accent} 42%, transparent)`
                        : "var(--rim-sub)",
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Note */}
        <div
          className="reveal p-5 rounded-r-xl text-[13.5px] leading-[1.75] italic"
          style={{
            background: "var(--canvas)",
            borderLeft: "3px solid var(--brand)",
            color: "var(--dim)",
          }}
        >
          <strong className="not-italic" style={{ color: "var(--brand)" }}>On learning new things: </strong>
          A mathematics degree teaches you that syntax is trivial — the hard part is reasoning about the
          problem. I pick up new tools quickly because I understand the abstractions beneath them.
        </div>
      </div>
    </section>
  );
}

// ── CONTACT ──────────────────────────────────────────────────────────────────

export function ContactSection() {
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SITE_SETTINGS);

  useEffect((): void => {
    const loadSettings = async (): Promise<void> => {
      const res = (await api.settings()) as ApiResponse<SiteSettings>;
      if (res.ok) setSiteSettings((current) => ({ ...current, ...res.data }));
    };
    void loadSettings();
  }, []);

  return (
    <section
      id="contact"
      className="relative overflow-hidden ambient-glow"
      style={{ padding: "100px clamp(24px, 8vw, 120px) 80px", background: "var(--canvas)" }}
    >
      <SawakiBg />

      <div className="max-w-260 mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="reveal flex justify-center mb-8">
            <ZaureArch size={140} opacity={0.3} />
          </div>
          <span
            className="reveal swatch-tag mb-5"
          >
            Contact
          </span>
          <h2
            className="reveal font-display font-bold leading-[1.1] mb-5"
            style={{ fontSize: "clamp(30px, 5.5vw, 54px)", color: "var(--ink)" }}
          >
            Let's build something<br />
            <span style={{ color: "var(--brand)" }}>that fits.</span>
          </h2>
          <p
            className="reveal text-[16px] leading-[1.65] max-w-120 mx-auto"
            style={{ color: "var(--dim)" }}
          >
            Open to full-time roles, freelance contracts, and interesting problems.
            Send a message and it lands directly in my inbox — no middleman.
          </p>
        </div>

        {/* Two-column: form + sidebar */}
        <div className="reveal contact-grid">
          {/* Contact form */}
          <div
            className="rounded-[22px] border p-7 sm:p-8"
            style={{
              background: "linear-gradient(155deg, color-mix(in srgb, var(--brand) 8%, var(--glass-bg)) 0%, var(--glass-bg) 55%)",
              borderColor: "var(--glass-border)",
              backdropFilter: "var(--glass-blur)",
              WebkitBackdropFilter: "var(--glass-blur)",
              boxShadow: "inset 0 1px 0 0 var(--glass-highlight)",
            }}
          >
            <ContactForm />
          </div>

          {/* Sidebar: social + subscribe */}
          <div className="flex flex-col gap-5">
            {/* Social links card */}
            <div
              className="rounded-[22px] border p-6"
              style={{
                background: "linear-gradient(155deg, color-mix(in srgb, var(--indigo) 10%, var(--glass-bg)) 0%, var(--glass-bg) 55%)",
                borderColor: "var(--glass-border)",
                backdropFilter: "var(--glass-blur)",
                WebkitBackdropFilter: "var(--glass-blur)",
                boxShadow: "inset 0 1px 0 0 var(--glass-highlight)",
              }}
            >
              <p className="text-[12px] font-bold uppercase tracking-[1.5px] mb-4" style={{ color: "var(--brand)" }}>
                Find me elsewhere
              </p>
              <div className="flex flex-col gap-2.5">
                {[
                  { label: "GitHub",   href: siteSettings.githubUrl,   src: "/social-github.png"   },
                  { label: "LinkedIn", href: siteSettings.linkedinUrl, src: "/social-linkedin.png" },
                  { label: "Twitter",  href: siteSettings.twitterUrl,  src: "/social-x.png"        },
                ].filter(({ href }) => Boolean(href)).map(({ label, href, src }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="interactive-lift fill-trigger flex items-center gap-3 px-3.5 py-3 rounded-xl border"
                    style={{ background: "var(--raised)", borderColor: "var(--rim-sub)" }}
                  >
                    <span className="flex items-center justify-center shrink-0" style={{ width: 38, height: 38 }}>
                      <IconFill scale={1.15}>
                        <Image src={src} alt="" width={34} height={34} className="object-contain" />
                      </IconFill>
                    </span>
                    <span className="text-[13px] font-semibold flex-1" style={{ color: "var(--ink)" }}>
                      {label}
                    </span>
                    <span style={{ color: "var(--brand)" }}>↗</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Subscribe widget */}
            <div
              className="rounded-[22px] border p-6"
              style={{
                background: "var(--glass-bg)",
                borderColor: "var(--glass-border)",
                backdropFilter: "var(--glass-blur)",
                WebkitBackdropFilter: "var(--glass-blur)",
                boxShadow: "inset 0 1px 0 0 var(--glass-highlight)",
              }}
            >
              <SubscribeWidget />
            </div>

            {/* Status note */}
            <div
              className="rounded-[22px] border fill-trigger p-6 flex items-center gap-4"
              style={{
                background: "linear-gradient(155deg, color-mix(in srgb, var(--brand) 14%, var(--glass-bg)) 0%, var(--glass-bg) 60%)",
                borderColor: "var(--glass-border)",
                backdropFilter: "var(--glass-blur)",
                WebkitBackdropFilter: "var(--glass-blur)",
                boxShadow: "inset 0 1px 0 0 var(--glass-highlight)",
              }}
            >
              <span
                className="icon-badge flex items-center justify-center shrink-0"
                style={{ width: 56, height: 56 }}
              >
                <IconFill scale={1.15}>
                  <Image src="/availability-badge.png" alt="" width={56} height={56} className="object-contain" />
                </IconFill>
              </span>
              <div>
                <p className="text-[13px] font-semibold" style={{ color: "var(--ink)" }}>
                  {siteSettings.availability}
                </p>
                <p className="text-[11px] flex items-center gap-1.5 mt-0.5" style={{ color: "var(--ghost)" }}>
                  <span className="pulse-dot" style={{ width: 6, height: 6 }} />
                  Remote-first · Available now
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── FOOTER ────────────────────────────────────────────────────────────────────

const FOOTER_LINKS = [
  { href: "/#about", label: "About" },
  { href: "/#skills", label: "Skills" },
  { href: "/#projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/#contact", label: "Contact" },
];

export function FooterSection() {
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SITE_SETTINGS);

  useEffect((): void => {
    const loadSettings = async (): Promise<void> => {
      const res = (await api.settings()) as ApiResponse<SiteSettings>;
      if (res.ok) setSiteSettings((current) => ({ ...current, ...res.data }));
    };
    void loadSettings();
  }, []);

  return (
    <footer
      /* borderTop removed — the SawakiLineDivider placed just above the
         footer on the homepage now owns that seam. footer-texture adds the
         dot-grid + bottom glow treatment via a ::before layer, so it can't
         collide with the inline background-color below. */
      className="footer-texture"
      style={{ padding: "64px clamp(24px, 8vw, 120px) 32px", background: "var(--card)" }}
    >
      <div className="max-w-260 mx-auto">
        {/* Top: brand+explore stacked on the left, connect on the right */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-10 mb-10">
          {/* Brand, with Explore links horizontal directly beneath it */}
          <div className="max-w-105">
            <div className="flex items-center gap-2.5 mb-3 fill-trigger">
              <IconFill scale={1.3}>
                <LogoMark size={32} />
              </IconFill>
              <p className="font-display font-bold text-[16px]" style={{ color: "var(--ink)" }}>
                DevCraft Portfolio
              </p>
            </div>
            <p className="text-[12.5px] leading-[1.7] mb-5" style={{ color: "var(--ghost)" }}>
              Designed &amp; coded from scratch — Kano, northern Nigeria.
            </p>

            <p className="text-[11px] font-bold uppercase tracking-[1.5px] mb-3" style={{ color: "var(--brand)" }}>
              Explore
            </p>
            <ul className="flex flex-row flex-wrap items-center gap-x-5 gap-y-2">
              {FOOTER_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="riga-underline-trigger relative inline-block text-[13px] transition-colors duration-200 hover:text-(--brand)"
                    style={{ color: "var(--dim)" }}
                  >
                    {l.label}
                    <span className="riga-underline-wrap">
                      <MiniRigaDivider />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social + CV */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[1.5px] mb-3" style={{ color: "var(--brand)" }}>
              Connect
            </p>
            <div className="flex items-center gap-2.5 mb-4">
              {[
                { label: "GitHub",   href: siteSettings.githubUrl,   src: "/social-github.png"   },
                { label: "LinkedIn", href: siteSettings.linkedinUrl, src: "/social-linkedin.png" },
                { label: "Twitter",  href: siteSettings.twitterUrl,  src: "/social-x.png"        },
              ].filter(({ href }) => Boolean(href)).map(({ label, href, src }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="interactive-lift fill-trigger flex items-center justify-center shrink-0"
                  style={{ width: 38, height: 38 }}
                >
                  <IconFill scale={1.15}>
                    <Image src={src} alt="" width={34} height={34} className="object-contain" />
                  </IconFill>
                </a>
              ))}
            </div>
            {siteSettings.cvUrl && <a
              href={siteSettings.cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold transition-opacity hover:opacity-70"
              style={{ color: "var(--brand)" }}
            >
              Download CV ↓
            </a>}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full mb-8" style={{ background: "var(--rim-sub)" }} />

        {/* Hausa proverb */}
        <div
          className="text-[12px] leading-[1.7] italic max-w-110 mx-auto text-center px-5 py-4 rounded-xl border mb-6"
          style={{ background: "var(--raised)", borderColor: "var(--rim)", color: "var(--dim)" }}
        >
          "Ginin da a gina shi da hankali, shi ne ginin da ya tsaya"
          <br />
          <span className="not-italic" style={{ color: "var(--ghost)" }}>
            The building built with care is the one that stands. — Hausa proverb
          </span>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p className="text-[11px]" style={{ color: "var(--ghost)" }}>
            © {new Date().getFullYear()} DevCraft. All rights reserved.
          </p>
          <p className="text-[11px]" style={{ color: "var(--ghost)" }}>
            Next.js 14 · Fastify · PostgreSQL · TypeScript · Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
}
