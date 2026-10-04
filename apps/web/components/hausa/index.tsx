"use client";

// ── HAUSA SVG DESIGN LANGUAGE ──────────────────────────────────────────────
// Every component references a real element of Hausa material culture.
// See PRD §2 for cultural context on each icon.

interface SvgProps {
  color?: string;
  size?: number;
  opacity?: number;
  className?: string;
}

// ── 1. ZAURE ARCH ─────────────────────────────────────────────────────────
// The wide, slightly-pointed horseshoe entrance arch of Hausa noblemen's houses.
// Distinct from Islamic and Gothic arches by its wider base and stepped shoulders.

export function ZaureArch({ color = "var(--brand)", size = 220, opacity = 1, className }: SvgProps) {
  const w = size;
  const h = size * 0.68;
  const pw = w * 0.13;  // pillar width
  const cy = h * 0.52;  // pillar top Y
  const px = w * 0.08;  // pillar X offset

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" className={className}>
      {/* Pillars */}
      <rect x={px} y={cy} width={pw} height={h - cy} rx={2} stroke={color} strokeWidth={2.5} opacity={opacity} />
      <rect x={w - px - pw} y={cy} width={pw} height={h - cy} rx={2} stroke={color} strokeWidth={2.5} opacity={opacity} />
      {/* Pillar capitals */}
      <rect x={px - 3} y={cy - 5} width={pw + 6} height={7} rx={1} fill={color} opacity={opacity * 0.4} />
      <rect x={w - px - pw - 3} y={cy - 5} width={pw + 6} height={7} rx={1} fill={color} opacity={opacity * 0.4} />
      {/* Arch curve — wide, not quite pointed */}
      <path
        d={`M ${px + pw} ${cy} Q ${px + pw - 8} ${h * 0.18} ${w / 2} ${h * 0.04} Q ${w - px - pw + 8} ${h * 0.18} ${w - px - pw} ${cy}`}
        stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round"
      />
      {/* Apex notch — Hausa signature detail */}
      <path
        d={`M ${w / 2 - w * 0.07} ${h * 0.12} L ${w / 2} ${h * 0.01} L ${w / 2 + w * 0.07} ${h * 0.12}`}
        stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Zankwaye plasterwork dots */}
      <circle cx={w / 2} cy={h * 0.05} r={w * 0.016} fill={color} opacity={opacity * 0.7} />
      <circle cx={w * 0.27} cy={h * 0.3} r={w * 0.012} fill={color} opacity={opacity * 0.4} />
      <circle cx={w * 0.73} cy={h * 0.3} r={w * 0.012} fill={color} opacity={opacity * 0.4} />
      <circle cx={w * 0.18} cy={h * 0.46} r={w * 0.01} fill={color} opacity={opacity * 0.3} />
      <circle cx={w * 0.82} cy={h * 0.46} r={w * 0.01} fill={color} opacity={opacity * 0.3} />
    </svg>
  );
}

// ── 2. RIGA DIVIDER ────────────────────────────────────────────────────────
// Babban Riga arabesque knotwork as a horizontal section divider.
// Used between the three project eras.

export function RigaDivider({ color = "var(--brand)", className }: { color?: string; className?: string }) {
  return (
    <svg width="100%" height="28" viewBox="0 0 400 28" preserveAspectRatio="xMidYMid meet" fill="none" className={className}>
      <line x1="0" y1="14" x2="142" y2="14" stroke={color} strokeWidth="1" opacity=".5" />
      <line x1="258" y1="14" x2="400" y2="14" stroke={color} strokeWidth="1" opacity=".5" />
      {/* Central knotwork */}
      <circle cx="200" cy="14" r="9" stroke={color} strokeWidth="1.5" opacity=".7" />
      <circle cx="200" cy="14" r="4" stroke={color} strokeWidth="1.2" opacity=".5" />
      <path d="M196 14 Q200 10 204 14 Q200 18 196 14Z" fill={color} opacity=".4" />
      {/* Side nodes */}
      <circle cx="172" cy="14" r="2.5" stroke={color} strokeWidth="1.2" opacity=".5" />
      <circle cx="228" cy="14" r="2.5" stroke={color} strokeWidth="1.2" opacity=".5" />
      {/* Chevrons */}
      <path d="M166 14 L157 9 M166 14 L157 19" stroke={color} strokeWidth="1" opacity=".35" />
      <path d="M234 14 L243 9 M234 14 L243 19" stroke={color} strokeWidth="1" opacity=".35" />
    </svg>
  );
}

// ── 2b. MINI RIGA DIVIDER ───────────────────────────────────────────────────
// A compact rendition of RigaDivider's knotwork — two flanking lines and a
// small center knot — sized to sit under a nav/footer link as a hover
// accent rather than as a full section divider. preserveAspectRatio="none"
// plus vectorEffect="non-scaling-stroke" let it stretch cleanly to fit
// links of very different widths without the strokes looking uneven.

export function MiniRigaDivider({ color = "currentColor" }: { color?: string }) {
  return (
    <svg viewBox="0 0 120 14" preserveAspectRatio="none" className="riga-underline-svg" aria-hidden="true">
      <line x1="0" y1="7" x2="44" y2="7" stroke={color} strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
      <line x1="76" y1="7" x2="120" y2="7" stroke={color} strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
      <circle cx="60" cy="7" r="3.8" stroke={color} strokeWidth="1.6" fill="none" vectorEffect="non-scaling-stroke" />
      <circle cx="60" cy="7" r="1.5" fill={color} />
    </svg>
  );
}

// ── 3. LAUJE SPINNER ────────────────────────────────────────────────────────
// Royal ceremonial parasol (Lauje) viewed from above — concentric pointed rings.
// Used as loading indicator and brand mark.

interface LaujeProps extends SvgProps { spin?: boolean; }

export function LaujeSpinner({ color = "var(--brand)", size = 44, spin = false, className }: LaujeProps) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 48 48" fill="none"
      className={className}
      style={spin ? { animation: "spin 3s linear infinite" } : {}}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="24" cy="24" r="4" fill={color} opacity=".7" />
      <path d="M24 20 Q31 16 34 24 Q31 32 24 28 Q17 32 14 24 Q17 16 24 20Z" stroke={color} strokeWidth="1.8" fill="none" />
      <path d="M24 14 Q36 8 40 24 Q36 40 24 34 Q12 40 8 24 Q12 8 24 14Z" stroke={color} strokeWidth="1.5" fill="none" opacity=".65" />
      <path d="M24 8 Q42 2 46 24 Q42 46 24 40 Q6 46 2 24 Q6 2 24 8Z" stroke={color} strokeWidth="1" fill="none" opacity=".35" />
    </svg>
  );
}

// ── 4. KOFAR ICON ─────────────────────────────────────────────────────────
// Crenellated Hausa city gate — used on project CTAs and archive page.

export function KofarIcon({ color = "var(--brand)", size = 24, className }: SvgProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      {/* City wall */}
      <rect x="1" y="11" width="22" height="12" stroke={color} strokeWidth="1.4" />
      {/* Crenellations */}
      <rect x="1" y="6.5" width="4" height="6" stroke={color} strokeWidth="1.2" />
      <rect x="7" y="6.5" width="4" height="6" stroke={color} strokeWidth="1.2" />
      <rect x="13" y="6.5" width="4" height="6" stroke={color} strokeWidth="1.2" />
      <rect x="19" y="6.5" width="4" height="6" stroke={color} strokeWidth="1.2" />
      {/* Gate arch passage */}
      <path d="M8 23 L8 15.5 Q8 11 12 11 Q16 11 16 15.5 L16 23" stroke={color} strokeWidth="1.4" fill="none" />
    </svg>
  );
}

// ── 5. TUKUL MARKER ───────────────────────────────────────────────────────
// Conical tower of a Hausa palace — used as nav section markers.

export function TukulMarker({ color = "var(--brand)", size = 14, className }: SvgProps) {
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 14 20" fill="none" className={className}>
      <rect x="4" y="12" width="6" height="8" stroke={color} strokeWidth="1.3" />
      {/* Cone — wider base ratio than Gothic spire */}
      <path d="M2 12 L7 2 L12 12Z" stroke={color} strokeWidth="1.3" fill="none" />
      {/* Horizontal rings on tower */}
      <line x1="4" y1="16" x2="10" y2="16" stroke={color} strokeWidth=".8" opacity=".4" />
      {/* Finial */}
      <circle cx="7" cy="1.5" r="1.1" fill={color} opacity=".65" />
    </svg>
  );
}

// ── 6. KWALBA FRAME ────────────────────────────────────────────────────────
// Decorated calabash cross-section — radial mandala frame for avatars.

interface KwalbaProps {
  size?: number;
  color?: string;
  children?: React.ReactNode;
  className?: string;
}

export function KwalbaFrame({ size = 96, color = "var(--brand)", children, className }: KwalbaProps) {
  const cx = size / 2;
  const r1 = size * 0.46;  // outer ring
  const r2 = size * 0.375; // inner ring
  const innerSize = size * 0.72;

  const radialLines = [0, 45, 90, 135, 180, 225, 270, 315].map((angleDeg) => {
    const rad = (Math.PI * angleDeg) / 180;
    return {
      x1: cx + r2 * Math.cos(rad),
      y1: cx + r2 * Math.sin(rad),
      x2: cx + r1 * Math.cos(rad),
      y2: cx + r1 * Math.sin(rad),
    };
  });

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className ?? ""}`}
      style={{ width: size, height: size }}>
      <svg style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
        <circle cx={cx} cy={cx} r={r1} stroke={color} strokeWidth="2" opacity=".6" />
        <circle cx={cx} cy={cx} r={r2} stroke={color} strokeWidth="1.2" opacity=".35" />
        {radialLines.map((l, i) => (
          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke={color} strokeWidth="1" opacity=".4" />
        ))}
      </svg>
      <div style={{ width: innerSize, height: innerSize, borderRadius: "50%", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "var(--raised)" }}>
        {children}
      </div>
    </div>
  );
}

// ── 7. GINDI COLUMN ────────────────────────────────────────────────────────
// Spiral-decorated interior column from Hausa palace halls.
// Used as a decorative motif in the skills section.

export function GindiColumn({ color = "var(--brand)", height = 80, className }: { color?: string; height?: number; className?: string }) {
  const w = height * 0.35;
  const cx = w / 2;
  return (
    <svg width={w} height={height} viewBox={`0 0 ${w} ${height}`} fill="none" className={className}>
      {/* Capital */}
      <rect x={0} y={0} width={w} height={height * 0.08} rx="2" fill={color} opacity=".4" />
      {/* Shaft */}
      <rect x={w * 0.2} y={height * 0.08} width={w * 0.6} height={height * 0.84} stroke={color} strokeWidth="1.5" />
      {/* Spiral helix bands */}
      {[0.2, 0.35, 0.5, 0.65, 0.8].map((t, i) => (
        <path key={i}
          d={`M ${w * 0.2} ${height * t} Q ${cx} ${height * (t - 0.06)} ${w * 0.8} ${height * t} Q ${cx} ${height * (t + 0.06)} ${w * 0.2} ${height * (t + 0.12)}`}
          stroke={color} strokeWidth="1.1" fill="none" opacity=".45"
        />
      ))}
      {/* Base */}
      <rect x={0} y={height * 0.92} width={w} height={height * 0.08} rx="2" fill={color} opacity=".4" />
    </svg>
  );
}

// ── 8. SAWAKI BACKGROUND ───────────────────────────────────────────────────
// The geometric diamond lattice from Hausa zankwaye plasterwork.
// Applied as a CSS background pattern.

export function SawakiBg({ className }: { className?: string }) {
  return <div className={`sawaki-bg absolute inset-0 pointer-events-none ${className ?? ""}`} />;
}

// ── 8b. RIGA LINE DIVIDER (full-bleed section seam) ────────────────────────
// The exact RigaDivider centerpiece (knot, side nodes, chevrons), unchanged —
// just with its two flanking straight lines stretched via flexbox to cover
// whatever width remains out to the true edges of the viewport, instead of
// stopping a fixed distance from center. Meant to be placed directly between
// <section> elements (outside their max-width containers). Still exported as
// SawakiLineDivider so existing call sites (homepage, blog) don't need to change.

export function SawakiLineDivider({ className, color = "var(--brand)" }: { className?: string; color?: string }) {
  return (
    <div className={`riga-line-divider ${className ?? ""}`} aria-hidden="true">
      <span className="riga-line-divider-edge" style={{ background: color }} />
      <svg width="140" height="28" viewBox="0 0 140 28" fill="none" className="riga-line-divider-knot">
        {/* Central knotwork — same shapes/proportions as RigaDivider's center */}
        <circle cx="70" cy="14" r="9" stroke={color} strokeWidth="1.5" opacity=".7" />
        <circle cx="70" cy="14" r="4" stroke={color} strokeWidth="1.2" opacity=".5" />
        <path d="M66 14 Q70 10 74 14 Q70 18 66 14Z" fill={color} opacity=".4" />
        {/* Side nodes */}
        <circle cx="42" cy="14" r="2.5" stroke={color} strokeWidth="1.2" opacity=".5" />
        <circle cx="98" cy="14" r="2.5" stroke={color} strokeWidth="1.2" opacity=".5" />
        {/* Chevrons */}
        <path d="M36 14 L27 9 M36 14 L27 19" stroke={color} strokeWidth="1" opacity=".35" />
        <path d="M104 14 L113 9 M104 14 L113 19" stroke={color} strokeWidth="1" opacity=".35" />
      </svg>
      <span className="riga-line-divider-edge" style={{ background: color }} />
    </div>
  );
}

// ── 9. ASKA TAKWAS ────────────────────────────────────────────────────────
// "Eight knives" — the radiating hand-embroidery pattern stitched at the
// neckline (wuya) of a babban riga gown, worked one blade at a time from a
// central point. The site's signature motif: engineering's own graph-and-
// node language, traced along a pattern the user has actually threaded a
// needle through. Each blade is one continuous stroke, meant to draw itself
// on like a running stitch — see .aska-group / .aska-blade in globals.css.

export function AskaTakwas({ color = "var(--brand)", size = 480, className }: SvgProps) {
  const BLADES = 8;
  const cx = 200;
  const cy = 200;

  // One blade, pointing up from the center; every other blade is this
  // same path rotated by a multiple of 360°/8.
  const outerBlade = "M 200 170 Q 183 148 185 105 Q 190 55 200 22 Q 210 55 215 105 Q 217 148 200 170 Z";
  const innerContour = "M 200 162 Q 189 145 191 108 Q 195 65 200 35 Q 205 65 209 108 Q 211 145 200 162";

  const angles = Array.from({ length: BLADES }, (_, i) => (360 / BLADES) * i);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      fill="none"
      className={`aska-group ${className ?? ""}`}
    >
      {/* Outer blades — animated, one continuous stroke each */}
      {angles.map((deg) => (
        <path
          key={`outer-${deg}`}
          className="aska-blade"
          d={outerBlade}
          transform={`rotate(${deg} ${cx} ${cy})`}
          stroke={color}
          strokeWidth={2}
          strokeLinejoin="round"
          pathLength={1}
        />
      ))}

      {/* Inner channel-stitch echo — animated: dashes flow outward along
          each blade's spine, echoing the running-stitch look of Hausa
          embroidery instead of sitting as static texture. */}
      {angles.map((deg) => (
        <path
          key={`inner-${deg}`}
          className="aska-inner-dash"
          d={innerContour}
          transform={`rotate(${deg} ${cx} ${cy})`}
          stroke={color}
          strokeWidth={1}
          strokeDasharray="2 5"
          opacity={0.32}
        />
      ))}

      {/* Center knot where all eight blades converge */}
      <circle cx={cx} cy={cy} r={14} stroke={color} strokeWidth={1.4} opacity={0.5} />
      <circle cx={cx} cy={cy} r={8} fill={color} opacity={0.18} />
      <circle className="aska-medallion" cx={cx} cy={cy} r={2.5} fill={color} opacity={0.85} />
    </svg>
  );
}
