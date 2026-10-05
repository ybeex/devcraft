"use client";

import { useEffect, useState, type MouseEvent } from "react";
import Image from "next/image";
import { MousePointerClick } from "lucide-react";
import { Magnetic } from "@/components/ui/Magnetic";
import { IconFill } from "@/components/ui/IconFill";
import { ButtonLink } from "@/components/ui/Button";
import { api } from "@/lib/api";
import type { ApiResponse, SiteSettings } from "@devcraft/types";

const DEFAULT_SOCIALS = {
  githubUrl: "",
  linkedinUrl: "",
  twitterUrl: "",
  availability: "Open to new roles · Remote-first",
  tagline: "Mathematics graduate. Self-taught. From Kano — building products that fit the people who'll use them. Precisely, deliberately, from scratch.",
  cvUrl: "",
};

// Small framed thumbnails read fine at hero scale (see the Process rail
// below) — it was a large, uncropped collage that clashed with the SVG
// brand system elsewhere (see About.tsx's history). Kept in sync with the
// pillar images used in About.tsx so the same concept isn't shown as two
// different photos in two places.
const HERO_ICONS = [
  "/file_00000000244481f4ac156d3da89afd6a.png",
  "/file_0000000076e08246a1f093073c74968a.png",
  "/file_00000000ef2481f4963eabc8eeb6ddaf.png",
];

// Load Three.js canvas only client-side — SSR would crash
// const HeroThreeJS = dynamic(() => import("./HeroThreeJS"), {
//   ssr: false,
//   loading: () => <div className="absolute inset-0 sawaki-bg opacity-60" />,
// });

export function HeroSection() {
  // Subtle cursor-parallax on the signature motif — the hero shouldn't go
  // still once the entrance animation finishes.
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SOCIALS);

  useEffect((): void => {
    const loadSettings = async (): Promise<void> => {
      const res = (await api.settings()) as ApiResponse<SiteSettings>;
      if (res.ok) {
        setSiteSettings((current) => ({ ...current, ...res.data }));
      }
    };
    void loadSettings();
  }, []);

  function handleMouseMove(e: MouseEvent<HTMLElement>) {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMouse({
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5,
    });
  }

  return (
    <section
      id="hero"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMouse({ x: 0, y: 0 })}
      className="portfolio-hero relative min-h-100dvh flex flex-col justify-center overflow-hidden"
      style={{ padding: "100px clamp(20px, 8vw, 120px) 80px", background: "var(--canvas)" }}
    >
      {/* Breathing background glow — isolated from the canvas so its opacity
          can animate independently */}
      <div
        className="hero-glow absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 60% at 50% -10%, var(--brand-glow) 0%, transparent 65%)",
        }}
      />

      {/* Same textured backdrop as the login page / contact section */}
      <div className="sawaki-bg absolute inset-0 pointer-events-none" aria-hidden="true" />

      {/* Three.js service-graph particle system — ambient, sits behind everything */}
      {/* <HeroThreeJS /> */}

      {/* Hero portrait motif — a profile in a traditional Hausa cap flowing
          into a circuit trace, bleeding off the right edge. Replaces the
          flat AskaTakwas SVG that stood in for the (currently disabled)
          Three.js hero: this is the "self-taught engineer from Kano" story
          as one image, at a scale and opacity tuned so it stays a backdrop,
          not competing with the headline as the primary anchor. */}
      <div
        className="absolute right-0 top-1/2 pointer-events-none transition-transform duration-300 ease-out"
        style={{
          transform: `translate(${mouse.x * -28}px, calc(-50% + ${mouse.y * -22}px))`,
        }}
      >
        <Image
          src="/hero-portrait.png"
          alt=""
          width={540}
          height={540}
          priority
          className="hero-portrait reveal aska-idle w-55 h-55 sm:w-85 sm:h-85 lg:w-130 lg:h-130 object-contain opacity-[0.28] sm:opacity-[0.34] lg:opacity-[0.42]"
        />
      </div>

      {/* Right gradient edge */}
      <div
        className="absolute right-0 bottom-0 w-40 h-0.75 pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, var(--brand))" }}
      />

      <div className="absolute right-[5%] bottom-[10%] z-10 hidden xl:flex pointer-events-none">
        <div
          className="rounded-[20px] border px-3 py-2 backdrop-blur-sm"
          style={{
            background: "color-mix(in srgb, var(--glass-bg-strong) 80%, transparent)",
            borderColor: "var(--glass-border)",
            boxShadow: "inset 0 1px 0 0 var(--glass-highlight)",
          }}
        >
          <div className="mb-2 text-[9px] font-bold uppercase tracking-[2px]" style={{ color: "var(--ghost)" }}>
            Process
          </div>
          <div className="flex items-center gap-2.5">
            {HERO_ICONS.map((src, index) => (
              <img
                key={src}
                src={src}
                alt=""
                className="block object-contain"
                style={{
                  width: index === 0 ? 34 : 30,
                  height: index === 0 ? 34 : 30,
                  filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.25))",
                  transform: index === 0 ? "translateY(-6px) rotate(-10deg)" : index === 1 ? "translateY(3px) rotate(8deg)" : "translateY(-4px) rotate(-4deg)",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div
        className="relative z-10 max-w-180 transition-transform duration-300 ease-out"
        style={{ transform: `translate(${mouse.x * 6}px, ${mouse.y * 4}px)` }}
      >
        {/* Availability badge */}
        <div className="hero-badge mb-7">
          <span className="swatch-tag">
            <span className="pulse-dot" />
            {siteSettings.availability}
          </span>
        </div>

        {/* Main headline */}
        <h1
          className="hero-title font-display font-extrabold leading-[1.03] mb-5"
          style={{ color: "var(--ink)" }}
        >
          Full-stack<br />
          <span style={{ color: "var(--brand)" }}>engineer.</span><br />
          Ex-tailor.
        </h1>

        {/* Sub */}
        <p
          className="hero-sub leading-[1.7] mb-10"
          style={{
            fontSize: "clamp(16px, 2.2vw, 20px)",
            color: "var(--dim)",
            maxWidth: 520,
          }}
        >
          {siteSettings.tagline}
        </p>

        {/* CTAs */}
        <div className="hero-ctas flex gap-3 flex-wrap mb-10">
          <Magnetic>
            <ButtonLink href="#projects" size="lg" className="fill-trigger">
              <IconFill scale={1.25}><MousePointerClick size={18} strokeWidth={2.1} aria-hidden="true" /></IconFill>
              View Work
            </ButtonLink>
          </Magnetic>
          {siteSettings.cvUrl && <Magnetic>
            <ButtonLink
              href={siteSettings.cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              size="lg"
              className="group hover:border-(--brand)"
              iconTrailing={
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
              }
            >
              Download CV
            </ButtonLink>
          </Magnetic>}
        </div>

        {/* Social links */}
        <div className="hero-social flex items-center gap-4">
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
              title={label}
              className="fill-trigger"
            >
              <IconFill scale={1.35}>
                <Image src={src} alt="" width={36} height={36} className="object-contain" />
              </IconFill>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
