import type { Metadata } from "next";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import type { ReactElement } from "react";
import Link from "next/link";
import type { Project, Era } from "@devcraft/types";
import { fetchJSON } from "@/lib/fetch";
import { PortfolioNav }  from "@/components/portfolio/Nav";
import { FooterSection } from "@/components/portfolio/Sections";
import Image from "next/image";
import { RigaDivider, LaujeSpinner } from "@/components/hausa";
import { SubscribeWidget } from "@/components/ui/SubscribeWidget";
import { IconFill } from "@/components/ui/IconFill";
import { ExternalLink } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { buttonClassName, buttonStyle } from "@/components/ui/buttonStyles";
import { AiChat }       from "@/components/portfolio/AiChat";
import { CustomCursor } from "@/components/ui/Cursor";
import { ScrollInit }   from "../../ScrollInit";
import { ProjectPreview } from "@/components/portfolio/Projects";

const API_URL: string = process.env.NEXT_PUBLIC_API_URL!;

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

interface EraConfig {
  label:    string;
  color:    string;
  iconSrc:  string;
}

// Same three images used for these eras everywhere else (the homepage/
// archive era headers) — kept in sync manually since this page has always
// had its own small EraConfig rather than importing the richer one from
// components/portfolio/Projects.tsx.
const ERA_CONFIG: Record<Era, EraConfig> = {
  FOUNDATION: { label: "Foundation Era",     color: "var(--ghost)",  iconSrc: "/file_00000000dab881f4aa3faf287625e2e6.png" },
  INTERNSHIP: { label: "HNG Internship Era", color: "var(--brand)",  iconSrc: "/hng-internship.png" },
  SAAS:       { label: "SaaS — Live",        color: "var(--indigo)", iconSrc: "/era-saas-hula.png" },
};

// ── DATA ──────────────────────────────────────────────────────────────────────

async function getProject(slug: string): Promise<Project | null> {
  // fetchJSON<Project> resolves to Project | null — strongly typed,
  // no `any` anywhere in the chain.
  return fetchJSON<Project>(`${API_URL}/projects/${slug}`, {
    revalidate: 300,
    tags: [`project:${slug}`],
  });
}

// ── METADATA ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const p: Project | null = await getProject(slug);
  if (!p) return { title: "Project not found" };

  return {
    title:       `${p.title} — DevCraft`,
    description: p.tagline,
    openGraph: {
      title:       p.title,
      description: p.tagline,
      images:      p.thumbnailUrl ? [{ url: p.thumbnailUrl }] : [],
    },
  };
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default async function ProjectPage({ params }: ProjectPageProps): Promise<ReactElement> {
  const { slug } = await params;
  const p: Project | null = await getProject(slug);

  // Explicit `return notFound()` narrows `p` to `Project` (never null)
  // for every line below — this is the fix for the same class of error
  // seen on the blog [slug] page.
  if (!p) {
    return notFound();
  }

  const era: EraConfig = ERA_CONFIG[p.era];
  const isSaas: boolean = p.era === "SAAS";
  const metrics: Record<string, string | number> | null =
    p.metrics as Record<string, string | number> | null;

  return (
    <>
      <ScrollInit />
      <CustomCursor />
      <PortfolioNav />

      <main style={{ minHeight: "100vh", background: "var(--canvas)", paddingTop: 80 }}>
        {/* Hero */}
        <div className="sawaki-bg relative overflow-hidden" style={{ padding: "64px clamp(24px, 8vw, 120px) 56px" }}>
          <div className="absolute bottom-0 right-[10%] opacity-10 pointer-events-none">
            <Image src={era.iconSrc} alt="" width={320} height={320} className="object-contain" />
          </div>
          <div className="max-w-215 relative">
            <div className="flex items-center gap-2 text-[12px] mb-6" style={{ color: "var(--ghost)" }}>
              <Link href="/#projects" className="hover:text-(--brand) transition-colors">Portfolio</Link>
              <span>·</span>
              <Link href="/projects" className="hover:text-(--brand) transition-colors">Projects</Link>
              <span>·</span>
              <span style={{ color: "var(--dim)" }}>{p.title}</span>
            </div>

            <span
              className="swatch-tag mb-4"
              style={{
                background: `color-mix(in srgb, ${era.color} 15%, transparent)`,
                color: era.color,
                borderColor: `color-mix(in srgb, ${era.color} 40%, transparent)`,
              }}
            >
              {era.label}
            </span>

            <h1
              className="font-display font-bold leading-[1.05] mb-4"
              style={{ fontSize: "clamp(36px, 6vw, 64px)", color: "var(--ink)", letterSpacing: "-1.5px" }}
            >
              {p.title}
            </h1>
            <p className="text-[18px] leading-[1.65] mb-8" style={{ color: "var(--dim)", maxWidth: 560 }}>
              {p.description || p.tagline}
            </p>

            <div className="flex gap-3 flex-wrap mb-6">
              {p.liveUrl && (
                <ButtonLink
                  href={p.liveUrl} target="_blank" rel="noopener noreferrer"
                  size="lg"
                  icon={<ExternalLink size={17} aria-hidden="true" />}
                  style={isSaas ? { background: "var(--indigo)", borderColor: "var(--indigo)", color: "var(--on-brand)" } : undefined}
                >
                  View Live
                </ButtonLink>
              )}
              {p.githubUrl && (
                <a
                  href={p.githubUrl} target="_blank" rel="noopener noreferrer"
                  className={buttonClassName("lg", false, "no-underline")}
                  style={buttonStyle("secondary")}
                >
                  GitHub →
                </a>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {p.techStack.map((t: string) => (
                <span
                  key={t}
                  className="text-[12px] font-mono px-2.5 py-1 rounded-full border"
                  style={{ background: "var(--raised)", borderColor: "var(--rim)", color: "var(--dim)" }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {(p.thumbnailUrl || p.liveUrl) && (
          <div style={{ padding: "0 clamp(24px, 8vw, 120px)" }}>
            <div
              className="group max-w-215 mx-auto -mt-6 rounded-2xl overflow-hidden border"
              style={{ borderColor: "var(--rim)", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}
            >
              <ProjectPreview p={p} isSaas={isSaas} interactive />
            </div>
          </div>
        )}

        <div style={{ padding: "64px clamp(24px, 8vw, 120px) 80px" }}>
          <div className="max-w-215 mx-auto">
            {metrics && Object.keys(metrics).length > 0 && (
              <div className="reveal grid gap-4 mb-12" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
                {Object.entries(metrics).map(([k, v]: [string, string | number]) => (
                  <div
                    key={k}
                    className="rounded-2xl p-5 border text-center"
                    style={{ background: isSaas ? "var(--indigo-bg)" : "var(--card)", borderColor: "var(--rim)" }}
                  >
                    <p
                      className="font-mono text-[28px] font-bold mb-1"
                      style={{ color: isSaas ? "var(--indigo)" : "var(--brand)" }}
                    >
                      {v}
                    </p>
                    <p className="text-[11px] uppercase tracking-[1px]" style={{ color: "var(--ghost)" }}>{k}</p>
                  </div>
                ))}
              </div>
            )}

            {([
              { heading: "The Problem",      content: p.problem  },
              { heading: "The Solution",     content: p.solution },
              { heading: "Impact & Outcomes", content: p.impact   },
            ] as { heading: string; content: string }[])
              .filter((s) => s.content)
              .map(({ heading, content }: { heading: string; content: string }) => (
                <div key={heading} className="reveal mb-10">
                  <h2 className="font-display font-bold text-[24px] mb-4" style={{ color: "var(--ink)" }}>
                    {heading}
                  </h2>
                  <p className="text-[16px] leading-[1.8]" style={{ color: "var(--dim)" }}>{content}</p>
                </div>
              ))}

            <div className="my-12 opacity-50">
              <RigaDivider />
            </div>

            <div className="reveal fill-trigger rounded-2xl border p-6 mb-10" style={{ background: "var(--card)", borderColor: "var(--rim)" }}>
              <div className="flex items-center gap-3 mb-4">
                <IconFill scale={1.3}>
                  <LaujeSpinner size={32} color="var(--brand)" />
                </IconFill>
                <div>
                  <p className="font-display font-bold text-[18px]" style={{ color: "var(--ink)" }}>
                    Want to see what I build next?
                  </p>
                  <p className="text-[13px]" style={{ color: "var(--ghost)" }}>
                    Subscribe and you'll be the first to know when I ship something new.
                  </p>
                </div>
              </div>
              <SubscribeWidget />
            </div>

            <div className="reveal flex items-center justify-between flex-wrap gap-4">
              <Link href="/projects" className="text-[13px] font-semibold hover:opacity-70 transition-opacity" style={{ color: "var(--dim)" }}>
                ← All projects
              </Link>
              <Link href="/#contact" className="text-[13px] font-semibold hover:opacity-70 transition-opacity" style={{ color: "var(--brand)" }}>
                Work together →
              </Link>
            </div>
          </div>
        </div>
      </main>

      <FooterSection />
      <AiChat />
    </>
  );
}
