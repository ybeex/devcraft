import type { Project } from "@devcraft/types";
import { RigaDivider } from "@/components/hausa";
import { ThemedProjectFrame } from "@/components/portfolio/ThemedProjectFrame";
import { IconFill } from "@/components/ui/IconFill";
import { ArrowUpRight, ExternalLink, FileText } from "lucide-react";
import Link from "next/link";
import { buttonClassName, buttonStyle } from "@/components/ui/buttonStyles";
import { ProjectEraBlock } from "@/components/portfolio/ProjectEraBlock";
import { ProjectRevealList } from "@/components/portfolio/ProjectRevealList";
import { ERA_CONFIG } from "@/components/portfolio/projectConfig";

// ERA_CONFIG is shared with the archive and disclosure header to keep all
// era labels, accents, and icons consistent across project surfaces.

export function ProjectPreview({ p, isSaas, interactive = false }: { p: Project; isSaas: boolean; interactive?: boolean }) {
  const previewColor = isSaas ? "var(--indigo)" : "var(--brand)";

  if (p.liveUrl) {
    return (
      <div
        className="relative aspect-16/10 overflow-hidden bg-(--raised)"
        style={{ borderBottom: `1px solid ${previewColor}` }}
      >
        {/* Fake browser chrome so the iframe reads as a "live preview",
            not an accidentally-embedded page */}
        <div
          className="absolute top-0 left-0 right-0 z-10 flex items-center gap-1.5 px-3 h-6"
          style={{ background: "var(--card)", borderBottom: "1px solid var(--rim-sub)" }}
        >
          <span className="w-2 h-2 rounded-full" style={{ background: "#ff5f57" }} />
          <span className="w-2 h-2 rounded-full" style={{ background: "#febc2e" }} />
          <span className="w-2 h-2 rounded-full" style={{ background: "#28c840" }} />
          <span
            className="ml-2 text-[11px] font-mono truncate"
            style={{ color: "var(--ghost)" }}
          >
            {p.liveUrl.replace(/^https?:\/\//, "")}
          </span>
        </div>

        {/* Scaled-down live iframe — rendered at 2x and scaled to 50% so a
            full desktop layout fits the card without looking cramped.
            On the card (interactive=false) it stays pointer-events-none
            since the preview itself is wrapped in an <a> to the live site
            (see ProjectCard) — letting the iframe capture clicks there
            would fight that link, and the Live/GitHub/Case-study icon
            buttons overlaid on top of it. On the project detail page
            (interactive=true) there's no surrounding <a>, so the preview
            can be a genuinely usable, clickable live site instead of just
            a picture of one. */}
        <div
          className={interactive ? "absolute" : "absolute pointer-events-none"}
          style={{
            top: 24, left: 0,
            width: "200%", height: "200%",
            transform: "scale(0.5)",
            transformOrigin: "top left",
          }}
        >
          <ThemedProjectFrame src={p.liveUrl} title={`Live preview of ${p.title}`} />
        </div>

        {interactive ? (
          /* Sticky (always-on, not hover-gated) open-in-new-tab affordance —
             centered at the bottom so it never sits over the iframe's own
             top-of-page nav/header, wherever that happens to be. */
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20">
            <a
              href={p.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="fill-trigger flex items-center gap-1.5 text-[12px] font-semibold px-4 py-2 rounded-full border shadow-lg transition-transform hover:-translate-y-0.5"
              style={{ background: "var(--card)", borderColor: previewColor, color: previewColor, boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}
            >
              <IconFill scale={1.25}><ExternalLink size={14} strokeWidth={2.1} aria-hidden="true" /></IconFill>
              Open in new tab
              <ArrowUpRight size={13} />
            </a>
          </div>
        ) : null}
      </div>
    );
  }

  if (p.thumbnailUrl) {
    return (
      <div className="aspect-16/10 overflow-hidden bg-(--raised)">
        <img
          src={p.thumbnailUrl}
          alt={p.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
    );
  }

  return null;
}

// Monochrome GitHub mark (same path as components/icons' GitHubIcon, which is a
// dark filled badge — wrong for a currentColor icon button).
function GithubMark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="10 10 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 10c-6.6 0-12 5.4-12 12 0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.4-1.3-5.4-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2 1-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.1 0 4.5-2.8 5.5-5.4 5.8.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6C30.6 31.8 34 27.3 34 22c0-6.6-5.4-12-12-12Z" />
    </svg>
  );
}

/**
 * Live / GitHub / Case study as icon buttons.
 * Sits over the bottom-right of the preview (a SIBLING of the preview's <a>,
 * never inside it — nested anchors are invalid HTML), which lets the old
 * full-width CTA row go and the card shrink. Hidden until the card is
 * hovered or a button inside it gets keyboard focus, so the preview reads
 * clean by default. Each button carries aria-label + title so the icon-only
 * treatment stays accessible and gets a native tooltip.
 */
function ProjectLinks({ p, accent, overlay }: { p: Project; accent: string; overlay: boolean }) {
  return (
    <div
      className={
        overlay
          ? "absolute bottom-3 right-3 z-20 flex items-center gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200"
          : "flex items-center justify-end gap-2 mb-4"
      }
      style={{ ["--proj-accent" as string]: accent }}
    >
      {p.liveUrl && (
        <a
          href={p.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="proj-icon-btn"
          aria-label={`Open ${p.title} live site`}
          title="Open live site"
        >
          <ExternalLink size={16} strokeWidth={2} aria-hidden="true" />
        </a>
      )}
      {p.githubUrl && (
        <a
          href={p.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="proj-icon-btn"
          aria-label={`View ${p.title} source on GitHub`}
          title="Source on GitHub"
        >
          <GithubMark size={16} />
        </a>
      )}
      <Link
        href={`/projects/${p.slug}`}
        className="proj-icon-btn"
        aria-label={`Read the ${p.title} case study`}
        title="Case study"
      >
        <FileText size={16} strokeWidth={2} aria-hidden="true" />
      </Link>
    </div>
  );
}

export function ProjectCard({ p, era }: { p: Project; era: keyof typeof ERA_CONFIG }) {
  const cfg = ERA_CONFIG[era];
  const isSaas = era === "SAAS";
  const accent = isSaas ? "var(--indigo)" : "var(--brand)";

  return (
    <div
      className="group fill-trigger flex flex-col rounded-[22px] overflow-hidden h-full relative transition-all duration-300 ease-site-out hover:-translate-y-1.5 shadow-[inset_0_1px_0_0_var(--glass-highlight)] hover:shadow-[inset_0_1px_0_0_var(--glass-highlight),0_24px_48px_-18px_rgba(0,0,0,0.3)]"
      style={{
        background: "var(--glass-bg-strong)",
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
        border: `1px solid ${cfg.cardBorder}`,
      }}
    >
      {/* Gradient accent bar, replacing the flat solid borderTop */}
      <div
        className="h-0.75 w-full shrink-0"
        style={{ background: `linear-gradient(90deg, ${cfg.cardTop}, color-mix(in srgb, ${cfg.cardTop} 35%, transparent))` }}
      />

      {/* Thumbnail / live preview — links to the live site when available,
          otherwise straight to the case study so every project stays
          reachable even without a live deployment. */}
      <div className="relative">
        {p.liveUrl ? (
          <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open live preview of ${p.title}`}>
            <ProjectPreview p={p} isSaas={isSaas} />
          </a>
        ) : (
          <Link href={`/projects/${p.slug}`} aria-label={`View case study for ${p.title}`}>
            <ProjectPreview p={p} isSaas={isSaas} />
          </Link>
        )}
        {/* Icon buttons over the preview's bottom edge. With no preview at
            all there's nothing to overlay, so they fall back to a plain row
            at the top of the content instead. */}
        {(p.liveUrl || p.thumbnailUrl) && <ProjectLinks p={p} accent={accent} overlay />}
      </div>

      <div className="flex flex-col flex-1 p-6">
        {!(p.liveUrl || p.thumbnailUrl) && <ProjectLinks p={p} accent={accent} overlay={false} />}
        {/* Live indicator — era badge removed for a cleaner header */}
        {isSaas && p.liveUrl && (
          <div className="flex items-center gap-1.5 text-[10px] font-semibold mb-3" style={{ color: "#10b981" }}>
            <span className="pulse-dot" style={{ width: 7, height: 7 }} />
            Live
          </div>
        )}
        {/* Title */}
        <Link href={`/projects/${p.slug}`} className="no-underline">
          <h3 className="font-display font-bold text-[20px] leading-tight mb-2 transition-colors duration-200 hover:text-(--brand)" style={{ color: "var(--ink)" }}>
            {p.title}
          </h3>
        </Link>
        <p className="text-[13px] leading-[1.65] mb-3" style={{ color: "var(--dim)" }}>
          {p.tagline}
        </p>

        {/* Impact / learned copy is a bottom overlay so it doesn't change the
            card's normal content flow or height. It appears on pointer hover
            and keyboard focus within the card. */}
        {(p.impact || p.problem) && (
          <div
            role="note"
            className="invisible absolute inset-x-0 bottom-0 z-30 max-h-[55%] translate-y-full overflow-y-auto border-t p-5 transition-transform duration-[700ms] ease-site-out group-hover:visible group-hover:translate-y-0 group-focus-within:visible group-focus-within:translate-y-0 motion-reduce:transition-none"
            style={{
              background: `linear-gradient(180deg, color-mix(in srgb, ${accent} 8%, var(--card)) 0%, var(--card) 24%)`,
              borderColor: `color-mix(in srgb, ${accent} 30%, var(--rim))`,
              backdropFilter: "blur(16px)",
            }}
          >
            <span
              className="mb-1 block text-[10px] font-bold uppercase tracking-[1px]"
              style={{ color: accent }}
            >
              {p.impact ? "Impact" : "Problem"}
            </span>
            <span className="text-[12.5px] leading-[1.65]" style={{ color: "var(--dim)" }}>
              {p.impact || p.problem}
            </span>
          </div>
        )}

        {/* Metrics — mini stat chips (value stacked over label) */}
        {p.metrics && (
          <div className="flex flex-wrap gap-2 mb-3">
            {Object.entries(p.metrics).map(([k, v]) => (
              <div
                key={k}
                className="flex flex-col items-start px-3 py-1.5 rounded-xl border"
                style={{ background: "var(--raised)", borderColor: "var(--rim)" }}
              >
                <span className="font-display font-bold text-[13.5px] leading-tight" style={{ color: accent }}>
                  {v}
                </span>
                <span className="text-[9.5px] uppercase tracking-[0.6px]" style={{ color: "var(--ghost)" }}>
                  {k}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="flex-1" />

        {/* Stack chips */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {p.techStack.map((t) => (
            <span
              key={t}
              className="text-[11px] px-2 py-0.5 rounded-full border font-mono"
              style={{ color: "var(--dim)", background: "var(--raised)", borderColor: "var(--rim-sub)" }}
            >
              {t}
            </span>
          ))}
        </div>

      </div>
    </div>
  );
}

function EraBlock({
  era,
  projects,
  initialCollapsed = false,
}: {
  era: keyof typeof ERA_CONFIG;
  projects: Project[];
  initialCollapsed?: boolean;
}) {
  if (projects.length === 0) return null;

  return (
    <ProjectEraBlock era={era} projectCount={projects.length} initialCollapsed={initialCollapsed}>
      <ProjectRevealList era={era}>
        {projects.map((p) => (
          <div key={p.id} className="reveal">
            <ProjectCard p={p} era={era} />
          </div>
        ))}
      </ProjectRevealList>
    </ProjectEraBlock>
  );
}

export function ProjectsSection({ projects }: { projects: Project[] }) {
  const byEra = {
    FOUNDATION: projects.filter((p) => p.era === "FOUNDATION"),
    INTERNSHIP: projects.filter((p) => p.era === "INTERNSHIP"),
    SAAS:       projects.filter((p) => p.era === "SAAS"),
  };

  return (
    <section
      id="projects"
      style={{ padding: "100px clamp(24px, 8vw, 120px)", background: "var(--canvas)" }}
    >
      <div className="max-w-260 mx-auto">
        <span className="reveal swatch-tag mb-5">
          Work
        </span>
        <h2 className="reveal font-display font-bold leading-[1.12] mb-4"
          style={{ fontSize: "clamp(28px, 4.5vw, 46px)", color: "var(--ink)" }}>
          Three eras.<br />One progression.
        </h2>
        <p className="reveal text-[16px] leading-[1.65] mb-14 max-w-140" style={{ color: "var(--dim)" }}>
          Every project is a checkpoint. Foundation shows I can learn. Internship shows I can
          collaborate. SaaS shows I can own.
        </p>

        <EraBlock era="FOUNDATION" projects={byEra.FOUNDATION} initialCollapsed />

        {byEra.FOUNDATION.length > 0 && byEra.INTERNSHIP.length > 0 && (
          <div className="reveal my-10 opacity-65">
            <RigaDivider />
          </div>
        )}

        <EraBlock era="INTERNSHIP" projects={byEra.INTERNSHIP} initialCollapsed />

        {byEra.INTERNSHIP.length > 0 && byEra.SAAS.length > 0 && (
          <div className="reveal my-10 opacity-65">
            <RigaDivider color="var(--indigo)" />
          </div>
        )}

        <EraBlock era="SAAS" projects={byEra.SAAS} />

        {/* Archive link */}
        <div className="reveal text-center mt-12">
          <Link
            href="/projects"
            className={buttonClassName("md", false, "no-underline")}
            style={buttonStyle("secondary")}
          >
            View all projects archive →
          </Link>
        </div>
      </div>
    </section>
  );
}
