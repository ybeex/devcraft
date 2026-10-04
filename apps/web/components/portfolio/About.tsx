import Image from "next/image";
import { IconFill } from "@/components/ui/IconFill";

const PILLARS = [
  { image: "/file_0000000076e08246a1f093073c74968a.png", head: "Mathematics", sub: "Graduate", accent: "var(--brand)",
    body: "A maths degree isn't background noise — it's how I think. Systems, proofs, edge cases, algorithmic complexity. I don't just write code; I reason about it. That's rarer than a certification.",
    chips: ["Logic", "Precision", "Systems thinking"] },
  { image: "/file_00000000ef2481f4963eabc8eeb6ddaf.png", head: "Tailoring", sub: "Fashion Designer", accent: "var(--indigo)",
    body: "I've constructed garments from raw fabric — measured twice, cut once. That instinct — craft, fit, iteration, the user is the body you're designing for — is the design sense most engineers never develop.",
    chips: ["Craft", "Pattern", "Fit-to-purpose"] },
  { image: "/file_00000000f21481f49132b75983eebfe9.png", head: "Self-Taught", sub: "Developer", accent: "var(--brand)",
    body: "No shortcuts. No cohort. No CS degree. Documentation, open source, and relentless curiosity. That isn't a limitation — it's proof of the only thing worth measuring: resourcefulness that ships.",
    chips: ["Resourceful", "Self-directed", "Proven"] },
];

export function AboutSection() {
  return (
    <section id="about" style={{ padding: "100px clamp(24px, 8vw, 120px)" }}>
      <div className="max-w-260 mx-auto">
        <span className="reveal swatch-tag mb-5">
          The story behind the stack
        </span>
        <h2 className="reveal font-display font-bold leading-[1.12] mb-4" style={{ fontSize: "clamp(28px, 4.5vw, 46px)", color: "var(--ink)" }}>
          Three lives,<br />one craft.
        </h2>
        <p className="reveal text-[16px] leading-[1.65] mb-10 max-w-140" style={{ color: "var(--dim)" }}>
          None of these were plan B. Each one shaped how the others get built.
        </p>

        {/* Bento showcase — same panel language as the Stack section below */}
        <div className="reveal-group grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {PILLARS.map(({ image, head, sub, body, chips, accent }, i) => (
            <div
              key={head}
              className="reveal interactive-lift fill-trigger bento-panel flex flex-col"
              style={{
                background: `linear-gradient(155deg, color-mix(in srgb, ${accent} 12%, var(--glass-bg-strong)) 0%, var(--glass-bg-strong) 60%)`,
                borderColor: "var(--glass-border)",
              }}
            >
              <span className="bento-panel-watermark" style={{ color: accent }}>0{i + 1}</span>

              {/* Illustrated medallions render bare — no badge fill or border —
                  so the object itself is the icon. The hover lift/rotate/
                  drop-shadow still comes from .icon-badge, and the grow-to-
                  fill from IconFill, neither of which needed the frame. */}
              <span
                className="icon-badge flex items-center justify-center shrink-0 relative mb-4"
                style={{ width: 76, height: 76 }}
              >
                <IconFill scale={1.12}>
                  <Image src={image} alt="" width={76} height={76} className="object-contain" />
                </IconFill>
              </span>

              <div className="relative mb-3">
                <p className="font-display font-bold text-[20px] leading-tight" style={{ color: "var(--ink)" }}>
                  {head}
                </p>
                <p className="text-[11px] uppercase tracking-[1.2px] mt-1" style={{ color: "var(--ghost)" }}>
                  {sub}
                </p>
              </div>

              <p className="text-[13.5px] leading-[1.75] flex-1 relative" style={{ color: "var(--dim)" }}>
                {body}
              </p>

              <div className="flex flex-wrap gap-1.5 relative mt-4">
                {chips.map((c) => (
                  <span
                    key={c}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border"
                    style={{
                      color: accent,
                      background: `color-mix(in srgb, ${accent} 12%, var(--raised))`,
                      borderColor: `color-mix(in srgb, ${accent} 30%, transparent)`,
                    }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Signature quote */}
        <div
          className="reveal fill-trigger flex flex-col sm:flex-row items-start sm:items-center gap-6 p-7 sm:p-8 rounded-[22px] relative overflow-hidden"
          style={{
            background: "linear-gradient(155deg, color-mix(in srgb, var(--indigo) 12%, var(--glass-bg-strong)) 0%, var(--glass-bg-strong) 65%)",
            border: "1px solid var(--glass-border)",
            backdropFilter: "var(--glass-blur)",
            WebkitBackdropFilter: "var(--glass-blur)",
            boxShadow: "inset 0 1px 0 0 var(--glass-highlight)",
          }}
        >
          <IconFill scale={1.15}>
            <Image src="/file_00000000545481f49a59d8200ea95172.png" alt="" width={92} height={92} className="object-contain" />
          </IconFill>
          <div className="flex-1 min-w-60">
            <p className="font-display font-bold text-[18px] leading-[1.35] mb-3" style={{ color: "var(--ink)" }}>
              "I build the way I design garments — with intention, precision, and craft."
            </p>
            <p className="text-[13.5px] leading-[1.75]" style={{ color: "var(--dim)" }}>
              From Kano, northern Nigeria. The same city where the{" "}
              <span style={{ color: "var(--indigo)", fontWeight: 600 }}>Kofar Mata dye pits</span> have
              operated continuously for 500 years, producing indigo in the same wells.
              I build with that kind of care — not "done," but <em>constructed</em>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
