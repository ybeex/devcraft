"use client";

import { useRef, type ReactElement } from "react";
import Image from "next/image";

interface Stop {
  id:       string;
  place:    string;
  year:     string;
  category: "origin" | "education" | "work" | "saas";
  title:    string;
  detail:   string;
  color:    string;
  /** Per-stop illustration; falls back to the category default when omitted. */
  icon?:    string;
}

const JOURNEY: Stop[] = [
  { id: "kano", place: "Kano", year: "1999", category: "origin",
    title: "Born & raised in Kano",
    detail: "The ancient city — walled, storied, and geometric. Where the Kofar Mata dye pits have run for 500 years and the mud architecture is algebra made visible.",
    color: "#c19144",
    icon: "/djenne-towers.png" },
  { id: "tailor", place: "Kano Market", year: "2014", category: "work",
    title: "Professional tailor & fashion designer",
    detail: "Built a tailoring practice from scratch. Measured, cut, constructed — learned that craft is a discipline. Pattern-making is systems design for fabric.",
    color: "#b8a67c" },
  { id: "university", place: "Bayero University", year: "2017", category: "education",
    title: "BSc Mathematics",
    detail: "Four years reasoning about systems, proofs, and edge cases. A maths degree doesn't teach you code — it teaches you how to think before you code.",
    color: "#dbb568",
    icon: "/file_0000000081548246a37d5a5295791bcd.png" },
  { id: "firstcode", place: "Kano — First Line", year: "2020", category: "work",
    title: "First line of code",
    detail: "No bootcamp. No mentor. Just MDN, Stack Overflow, and stubbornness. The first app crashed 17 times before it worked. Then I shipped it anyway.",
    color: "#b8a67c",
    icon: "/code-scroll.png" },
  { id: "hng", place: "HNG Internship (Remote)", year: "2022", category: "work",
    title: "HNG Tech Internship",
    detail: "One of Africa's most competitive internship programs. Built an auth microservice in 48hrs that 4 teams adopted. Shipped a product listing page with a 99 Lighthouse score.",
    color: "#b8a67c",
    icon: "/hng-internship.png" },
  { id: "devrent", place: "Kano — DevRent HQ", year: "2023", category: "saas",
    title: "First SaaS — DevRent",
    detail: "Built a rental management platform for Nigerian landlords. 120 active landlords. ₦284,700 tracked monthly. Still running. Built with Fastify + PostgreSQL + Next.js.",
    color: "#3d5aa8" },
  { id: "now", place: "Kano — Now", year: "2026", category: "saas",
    title: "Open to new opportunities",
    detail: "Building products in northern Nigeria. Open to remote roles worldwide. Looking for teams that care about craft as much as shipping.",
    color: "#3d5aa8",
    icon: "/file_00000000f3d48210911561b3a246a2ea.png" },
];

const CATEGORY_LABELS: Record<Stop["category"], string> = { origin: "Origin", education: "Education", work: "Work", saas: "SaaS" };
const CATEGORY_ORDER: Stop["category"][] = ["origin", "education", "work", "saas"];

// Each era mapped to a Hausa architectural motif — the arch where the story
// starts, the column that founded the thinking, the gate each job opened,
// the tower raised once there was something to build — now the matching set
// of illustrated medallions rather than the SVG stand-ins, so all four read
// as one consistent set instead of a mix of photos and flat icons.
const CATEGORY_IMAGE: Record<Stop["category"], string> = {
  origin:    "/file_0000000002f881f4bc5a7be90318a63d.png",
  education: "/file_00000000dab881f4aa3faf287625e2e6.png",
  work:      "/journey-gate-work.png",
  saas:      "/file_000000008d48821091398897fcb2d230.png",
};

function JourneyCard({ stop, isLast }: { stop: Stop; isLast: boolean }) {
  return (
    <div
      className="reveal journey-card"
      style={{
        background: `linear-gradient(155deg, color-mix(in srgb, ${stop.color} 12%, var(--card)) 0%, var(--card) 60%)`,
        borderColor: "var(--rim)",
      }}
    >
      <span className="journey-card-watermark" style={{ color: stop.color }} aria-hidden="true">
        {stop.year}
      </span>

      <div className="flex items-center gap-3 mb-3.5 relative">
        <span
          className="icon-badge flex items-center justify-center shrink-0 relative"
          style={{ width: 68, height: 68 }}
        >
          <Image src={stop.icon ?? CATEGORY_IMAGE[stop.category]} alt="" fill sizes="68px" className="object-contain" />
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-[1.2px]" style={{ color: stop.color }}>
            {stop.year} · {stop.place}
          </span>
          {isLast && <span className="pulse-dot" style={{ background: stop.color }} />}
        </div>
      </div>

      <h3 className="font-display font-bold text-[18px] leading-tight mb-2 relative" style={{ color: "var(--ink)" }}>
        {stop.title}
      </h3>
      <p className="text-[13.5px] leading-[1.7] relative" style={{ color: "var(--dim)" }}>
        {stop.detail}
      </p>
    </div>
  );
}

export function JourneyMap(): ReactElement {
  const stopRefs = useRef<(HTMLDivElement | null)[]>([]);

  const jumpTo = (i: number): void => {
    stopRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section id="journey" style={{ padding: "100px clamp(24px, 8vw, 120px)", background: "var(--canvas)", overflowX: "clip" }}>
      <div className="max-w-260 mx-auto">
        <p className="reveal text-[11px] font-bold uppercase tracking-[2.5px] mb-3" style={{ color: "var(--brand)" }}>The Journey</p>
        <h2 className="reveal font-display font-bold leading-[1.12] mb-4" style={{ fontSize: "clamp(28px, 4.5vw, 46px)", color: "var(--ink)" }}>
          Kano to the cloud.
        </h2>
        <p className="reveal text-[16px] leading-[1.65] mb-8 max-w-140" style={{ color: "var(--dim)" }}>
          Every stop on this ledger is a decision. Tap a year to jump straight to it.
        </p>

        {/* Legend + year quick-nav */}
        <div className="reveal flex flex-wrap items-center gap-2 mb-10">
          {CATEGORY_ORDER.map((cat) => {
            const sample = JOURNEY.find((s) => s.category === cat)!;
            return (
              <span key={cat} className="journey-legend-pill">
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: sample.color, flexShrink: 0 }} />
                {CATEGORY_LABELS[cat]}
              </span>
            );
          })}
          <span className="w-px h-4 mx-1 shrink-0" style={{ background: "var(--rim)" }} />
          {JOURNEY.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => jumpTo(i)}
              className="journey-year-chip"
              style={{ color: s.color, borderColor: "var(--rim)" }}
            >
              {s.year}
            </button>
          ))}
        </div>

        {/* Ledger — alternating stepped timeline on desktop, single-column
            spine on mobile. Replaces the previous D3-drawn thread graphic
            with a clearer, fully static-layout, no-canvas-scaling design. */}
        <div className="relative">
          <div className="journey-spine-line" aria-hidden="true" />
          <div className="flex flex-col gap-6 md:gap-3">
            {JOURNEY.map((stop, i) => (
              <div
                key={stop.id}
                ref={(el) => { stopRefs.current[i] = el; }}
                className="journey-row"
                data-side={i % 2 === 0 ? "left" : "right"}
              >
                <div className="journey-row-spine">
                  <span className="journey-dot" style={{ background: stop.color }} />
                </div>
                <div className="journey-card-wrap">
                  <JourneyCard stop={stop} isLast={i === JOURNEY.length - 1} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
