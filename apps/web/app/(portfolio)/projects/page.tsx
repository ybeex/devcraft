import type { Metadata } from "next";
import type { ReactElement } from "react";
import type { Project, Era } from "@devcraft/types";
import { fetchList } from "@/lib/fetch";
import { PortfolioNav }  from "@/components/portfolio/Nav";
import { FooterSection } from "@/components/portfolio/Sections";
import { RigaDivider, SawakiLineDivider } from "@/components/hausa";
import { AiChat }       from "@/components/portfolio/AiChat";
import { CustomCursor } from "@/components/ui/Cursor";
import { ScrollInit }   from "../ScrollInit";
import { SkillsRadar }  from "./SkillsRadar";
// UI redesign: the archive page now shares the exact same live-iframe-preview
// card system used on the homepage's Projects section, instead of a plain
// text-row list. ERA_CONFIG here is the homepage's richer config (badge
// colors, card accents) — reused so the two surfaces stay visually in sync.
import Image from "next/image";
import { ERA_CONFIG } from "@/components/portfolio/projectConfig";
import { ProjectCard } from "@/components/portfolio/Projects";
import { ProjectRevealList } from "@/components/portfolio/ProjectRevealList";
import { buildStackFrequency } from "@/lib/techStack";

export const metadata: Metadata = {
  title:       "All Projects — DevCraft",
  description: "Every project across three eras — Foundation, HNG Internship, and SaaS.",
};

const API_URL: string = process.env.NEXT_PUBLIC_API_URL!;

const ERA_NUM: Record<Era, string> = {
  FOUNDATION: "01",
  INTERNSHIP: "02",
  SAAS:       "03",
};

interface RadarPoint {
  label: string;
  value: number;
}

export default async function ProjectsArchivePage(): Promise<ReactElement> {
  const projects: Project[] = await fetchList<Project>(`${API_URL}/projects`, {
    revalidate: 300,
    tags: ["projects"],
  });

  const byEra: Record<Era, Project[]> = {
    FOUNDATION: projects.filter((p: Project) => p.era === "FOUNDATION"),
    INTERNSHIP: projects.filter((p: Project) => p.era === "INTERNSHIP"),
    SAAS:       projects.filter((p: Project) => p.era === "SAAS"),
  };

  // Count each canonical technology once per project.
  const radarData: RadarPoint[] = buildStackFrequency(projects)
    .slice(0, 8)
    .map(({ label, share }): RadarPoint => ({
      label,
      value: share,
    }));

  const eraOrder: Era[] = ["SAAS", "INTERNSHIP", "FOUNDATION"];

  return (
    <>
      <ScrollInit />
      <CustomCursor />
      <PortfolioNav />

      <main style={{ minHeight: "100vh", background: "var(--canvas)", paddingTop: 80 }}>
        <div className="sawaki-bg relative" style={{ padding: "64px clamp(24px, 8vw, 120px) 48px" }}>
          <div className="max-w-260 mx-auto flex items-start justify-between gap-8">
            <div>
              <span className="swatch-tag mb-5">
                Project Archive
              </span>
              <h1 className="font-display font-bold leading-[1.1] mb-4" style={{ fontSize: "clamp(32px, 5vw, 52px)", color: "var(--ink)" }}>
                {projects.length} projects.<br />Three eras.
              </h1>
              <p className="text-[16px] leading-[1.7]" style={{ color: "var(--dim)", maxWidth: 500 }}>
                Everything I've built — from the first clumsy React app to live SaaS products
                serving real users. Honest about the journey.
              </p>
            </div>
          </div>
        </div>

        <SawakiLineDivider />

        <div style={{ padding: "48px clamp(24px, 8vw, 120px) 80px" }}>
          <div className="max-w-260 mx-auto">
            <div className="grid gap-5 mb-16 reveal" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
              {[
                { num: projects.length,           label: "Total projects"  },
                { num: byEra.FOUNDATION.length,    label: "Foundation era"  },
                { num: byEra.INTERNSHIP.length,    label: "HNG Internship"  },
                { num: byEra.SAAS.length,          label: "SaaS products"   },
              ].map(({ num, label }: { num: number; label: string }) => (
                <div key={label} className="rounded-2xl p-5 border" style={{ background: "var(--card)", borderColor: "var(--rim)" }}>
                  <p
                    className="font-mono text-[32px] font-bold mb-1"
                    style={{ color: "var(--brand)" }}
                  >
                    {num}
                  </p>
                  <p className="text-[12px]" style={{ color: "var(--dim)" }}>{label}</p>
                </div>
              ))}
            </div>

            {radarData.length > 0 && (
              <div
                className="reveal rounded-2xl border p-4 sm:p-5 mb-14 flex flex-col sm:flex-row gap-6 items-center"
                style={{ background: "var(--card)", borderColor: "var(--rim)" }}
              >
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[2px] mb-1" style={{ color: "var(--brand)" }}>
                    Stack Frequency
                  </p>
                  <p className="font-display font-bold text-[18px] mb-2" style={{ color: "var(--ink)" }}>
                    Technologies across all projects
                  </p>
                  <p className="text-[13px]" style={{ color: "var(--dim)" }}>
                    Based on {projects.length} projects — larger = used more often.
                  </p>
                </div>
                <div className="w-full max-w-110 min-w-0 ml-auto mr-2">
                  <SkillsRadar data={radarData} />
                </div>
              </div>
            )}

            {eraOrder.map((era: Era, idx: number) => {
              const cfg  = ERA_CONFIG[era];
              const list: Project[] = byEra[era];
              if (list.length === 0) return null;

              return (
                <div key={era} className="mb-12">
                  <div className="reveal flex items-center gap-4 mb-7">
                    {cfg.iconSrc ? (
                      <span className="icon-badge flex items-center justify-center shrink-0 relative" style={{ width: 56, height: 56 }}>
                        <Image src={cfg.iconSrc} alt="" fill sizes="56px" className="object-contain" />
                      </span>
                    ) : (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-mono text-[14px] font-bold shrink-0"
                        style={{ background: cfg.numBg, border: cfg.numBorder, color: cfg.numColor }}
                      >
                        {ERA_NUM[era]}
                      </div>
                    )}
                    <div>
                      <p className="font-display font-bold text-[20px]" style={{ color: "var(--ink)" }}>{cfg.label}</p>
                      <p className="text-[12px]" style={{ color: "var(--ghost)" }}>
                        {list.length} project{list.length !== 1 ? "s" : ""} · {cfg.sub}
                      </p>
                    </div>
                    <div className="flex-1 h-px ml-4" style={{ background: "var(--rim)" }} />
                  </div>

                  {/* Card grid with live iframe previews for SaaS projects —
                      same ProjectCard/ProjectPreview system as the homepage. */}
                  <ProjectRevealList era={era}>
                    {list.map((p: Project) => (
                      <div key={p.id} className="reveal">
                        <ProjectCard p={p} era={era} />
                      </div>
                    ))}
                  </ProjectRevealList>

                  {idx < eraOrder.length - 1 && (
                    <div className="mt-12 mb-4 opacity-50">
                      <RigaDivider color={cfg.dividerColor} />
                    </div>
                  )}
                </div>
              );
            })}

            {projects.length === 0 && (
              <div className="py-24 text-center" style={{ color: "var(--ghost)" }}>
                No projects published yet.
              </div>
            )}
          </div>
        </div>
      </main>

      <SawakiLineDivider />
      <FooterSection />
      <AiChat />
    </>
  );
}
