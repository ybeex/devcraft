"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import type { Era } from "@devcraft/types";
import { ChevronDown } from "lucide-react";
import { ERA_CONFIG } from "@/components/portfolio/projectConfig";

interface ProjectEraBlockProps {
  era: Era;
  projectCount: number;
  initialCollapsed?: boolean;
  children: ReactNode;
}

export function ProjectEraBlock({
  era,
  projectCount,
  initialCollapsed = false,
  children,
}: ProjectEraBlockProps) {
  const [isExpanded, setIsExpanded] = useState(!initialCollapsed);
  const cfg = ERA_CONFIG[era];
  const panelId = `home-projects-${era.toLowerCase()}`;

  if (projectCount === 0) return null;

  return (
    <div className="mb-12">
      <button
        type="button"
        aria-controls={panelId}
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? "Collapse" : "Expand"} ${cfg.label} projects`}
        onClick={() => setIsExpanded((expanded) => !expanded)}
        className="reveal group/era flex w-full cursor-pointer items-center gap-4 border-0 bg-transparent mb-7 text-left"
      >
        {cfg.iconSrc ? (
          <span className="icon-badge relative flex h-16 w-16 shrink-0 items-center justify-center">
            <Image src={cfg.iconSrc} alt="" fill sizes="64px" className="object-contain" />
          </span>
        ) : (
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-mono text-[14px] font-bold"
            style={{ background: cfg.numBg, border: cfg.numBorder, color: cfg.numColor }}
            aria-hidden="true"
          >
            {cfg.num}
          </span>
        )}
        <span className="min-w-0">
          <span className="block font-display text-[20px] font-bold" style={{ color: "var(--ink)" }}>
            {cfg.label}
          </span>
          <span className="block text-[12px]" style={{ color: "var(--ghost)" }}>
            {projectCount} project{projectCount !== 1 ? "s" : ""} · {cfg.sub}
          </span>
        </span>
        <span className="ml-4 h-px flex-1" style={{ background: "var(--rim)" }} aria-hidden="true" />
        <ChevronDown
          size={18}
          aria-hidden="true"
          className={`shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
          style={{ color: "var(--ghost)" }}
        />
      </button>

      <div id={panelId} hidden={!isExpanded}>
        {children}
      </div>
    </div>
  );
}
