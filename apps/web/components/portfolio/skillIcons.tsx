"use client";

import { useId, type ReactElement } from "react";

interface SkillIconProps {
  color?: string;
  size?: number;
}

// Shared "premium 3D" recipe used by every icon below: a linear
// gradient running light-to-dark (simulating a light source from the
// top-left), a soft drop-shadow to lift the shape off the card, and a
// thin bright highlight stroke along the top-left edge for a beveled,
// dimensional look — built entirely from flat SVG (gradients + shadow +
// highlight), not an actual 3D render, but reads as "premium 3D" the way
// modern SaaS marketing icon sets do.
//
// Two families live here:
// - Skill icons (Frontend/Backend/Database/Infra): tech-concept shapes.
// - Journey + About icons: the SAME recipe applied to the site's own
//   silhouettes — the Origin/Education/Work/SaaS icons keep the exact
//   arch/column/gate/tower shapes from components/hausa (just filled and
//   beveled instead of thin-stroke), and the About icons keep Math/
//   Scissors/Keyboard's meaning. The flat components in components/hausa
//   are unchanged and still used elsewhere (nav, buttons, backgrounds) —
//   these are dedicated, separate shapes, not the shared ones re-skinned.

function useGradientId(prefix: string): string {
  const id = useId();
  return `${prefix}-${id.replace(/:/g, "")}`;
}

export function FrontendIcon3D({ color = "var(--brand)", size = 40 }: SkillIconProps): ReactElement {
  const gid = useGradientId("fe");
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.25))" }}>
      <defs>
        <linearGradient id={gid} x1="6" y1="6" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={color} stopOpacity="0.55" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
      </defs>
      <rect x="4" y="7" width="32" height="26" rx="5" fill={`url(#${gid})`} />
      <rect x="4" y="7" width="32" height="8" rx="5" fill="#fff" fillOpacity="0.18" />
      <circle cx="9" cy="11" r="1.3" fill="#fff" fillOpacity="0.85" />
      <circle cx="13.5" cy="11" r="1.3" fill="#fff" fillOpacity="0.6" />
      <path d="M11 24l4-4-4-4" stroke="#fff" strokeOpacity="0.9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M18 24h10" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="4" y="7" width="32" height="26" rx="5" stroke="#fff" strokeOpacity="0.25" strokeWidth="1" />
    </svg>
  );
}

export function BackendIcon3D({ color = "var(--indigo)", size = 40 }: SkillIconProps): ReactElement {
  const gid = useGradientId("be");
  const bars = [8, 18, 28];
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.25))" }}>
      <defs>
        <linearGradient id={gid} x1="6" y1="6" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={color} stopOpacity="0.55" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
      </defs>
      {bars.map((y) => (
        <g key={y}>
          <rect x="5" y={y} width="30" height="7.5" rx="2.5" fill={`url(#${gid})`} />
          <rect x="5" y={y} width="30" height="2.6" rx="2.5" fill="#fff" fillOpacity="0.2" />
          <circle cx="10" cy={y + 3.75} r="1.2" fill="#fff" fillOpacity="0.9" />
          <rect x="5" y={y} width="30" height="7.5" rx="2.5" stroke="#fff" strokeOpacity="0.2" strokeWidth="1" />
        </g>
      ))}
    </svg>
  );
}

export function DatabaseIcon3D({ color = "var(--brand)", size = 40 }: SkillIconProps): ReactElement {
  const gid = useGradientId("db");
  const gidTop = useGradientId("dbtop");
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.25))" }}>
      <defs>
        <linearGradient id={gid} x1="6" y1="10" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={color} stopOpacity="0.55" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
        <linearGradient id={gidTop} x1="6" y1="6" x2="34" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="100%" stopColor={color} stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <path d="M6 12v16c0 2.76 6.27 5 14 5s14-2.24 14-5V12" fill={`url(#${gid})`} />
      <path d="M6 12v6c0 2.76 6.27 5 14 5s14-2.24 14-5v-6" fill="#000" fillOpacity="0.08" />
      <ellipse cx="20" cy="12" rx="14" ry="5" fill={`url(#${gidTop})`} />
      <ellipse cx="20" cy="12" rx="14" ry="5" stroke="#fff" strokeOpacity="0.3" strokeWidth="1" />
    </svg>
  );
}

export function InfraIcon3D({ color = "var(--indigo)", size = 40 }: SkillIconProps): ReactElement {
  const gid = useGradientId("in");
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.25))" }}>
      <defs>
        <linearGradient id={gid} x1="4" y1="12" x2="34" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={color} stopOpacity="0.55" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
      </defs>
      <path
        d="M12 28a7 7 0 0 1-1-13.9A8.5 8.5 0 0 1 27.5 12 6.5 6.5 0 0 1 27 25H12z"
        fill={`url(#${gid})`}
        stroke="#fff"
        strokeOpacity="0.25"
        strokeWidth="1"
      />
      <path
        d="M12 16.5A8.5 8.5 0 0 1 20.5 10"
        stroke="#fff"
        strokeOpacity="0.4"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M16 28v3M20 28v4M24 28v3" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// ── JOURNEY ICONS ────────────────────────────────────────────────────────
// Same silhouettes as ZaureArch/GindiColumn/KofarIcon/TukulMarker in
// components/hausa, redrawn as filled/beveled shapes at a uniform 40x40 so
// the four read as one matched set inside the journey cards' icon badges,
// the way the skill icons do inside theirs.

export function OriginIcon3D({ color = "var(--brand)", size = 40 }: SkillIconProps): ReactElement {
  const gid = useGradientId("origin");
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.25))" }}>
      <defs>
        <linearGradient id={gid} x1="6" y1="6" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={color} stopOpacity="0.55" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
      </defs>
      <path
        d="M7 33V19c0-1.1.9-2 2-2h2V6h4v11h10V6h4v11h2c1.1 0 2 .9 2 2v14H7z"
        fill={`url(#${gid})`}
        stroke="#fff" strokeOpacity="0.25" strokeWidth="1" strokeLinejoin="round"
      />
      <path d="M15 17c0-3 2.2-6 5-6.5 2.8.5 5 3.5 5 6.5" fill="none" stroke="#fff" strokeOpacity="0.4" strokeWidth="1.4" strokeLinecap="round" />
      <rect x="7" y="19" width="26" height="4" fill="#fff" fillOpacity="0.14" />
      <circle cx="20" cy="8.5" r="1.1" fill="#fff" fillOpacity="0.85" />
    </svg>
  );
}

export function EducationIcon3D({ color = "var(--brand)", size = 40 }: SkillIconProps): ReactElement {
  const gid = useGradientId("edu");
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.25))" }}>
      <defs>
        <linearGradient id={gid} x1="12" y1="4" x2="28" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={color} stopOpacity="0.55" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
      </defs>
      <rect x="11" y="4" width="18" height="5" rx="1.5" fill={`url(#${gid})`} />
      <rect x="14" y="9" width="12" height="22" fill={`url(#${gid})`} />
      <rect x="11" y="31" width="18" height="5" rx="1.5" fill={`url(#${gid})`} />
      {[13, 18, 23].map((y) => (
        <path key={y} d={`M14 ${y} Q20 ${y - 3} 26 ${y}`} stroke="#fff" strokeOpacity="0.35" strokeWidth="1.2" fill="none" />
      ))}
      <rect x="11" y="4" width="18" height="5" rx="1.5" fill="#fff" fillOpacity="0.16" />
      <rect x="14" y="9" width="12" height="22" stroke="#fff" strokeOpacity="0.2" strokeWidth="1" />
    </svg>
  );
}

export function WorkIcon3D({ color = "var(--brand)", size = 40 }: SkillIconProps): ReactElement {
  const gid = useGradientId("work");
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.25))" }}>
      <defs>
        <linearGradient id={gid} x1="4" y1="8" x2="36" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={color} stopOpacity="0.55" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
      </defs>
      <path d="M4 18h8v-6h4v6h8v-6h4v6h8v16H4z" fill={`url(#${gid})`} stroke="#fff" strokeOpacity="0.25" strokeWidth="1" strokeLinejoin="round" />
      <path d="M15 34V24c0-2.2 1.8-4 5-4s5 1.8 5 4v10" fill="var(--card)" stroke="#fff" strokeOpacity="0.3" strokeWidth="1.2" />
      <rect x="4" y="18" width="32" height="3.5" fill="#fff" fillOpacity="0.16" />
    </svg>
  );
}

export function SaasIcon3D({ color = "var(--indigo)", size = 40 }: SkillIconProps): ReactElement {
  const gid = useGradientId("saas");
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.25))" }}>
      <defs>
        <linearGradient id={gid} x1="8" y1="6" x2="32" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={color} stopOpacity="0.55" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
      </defs>
      <rect x="13" y="22" width="14" height="12" fill={`url(#${gid})`} stroke="#fff" strokeOpacity="0.25" strokeWidth="1" />
      <path d="M8 22 L20 6 L32 22Z" fill={`url(#${gid})`} stroke="#fff" strokeOpacity="0.3" strokeWidth="1" strokeLinejoin="round" />
      <path d="M13 26h14" stroke="#fff" strokeOpacity="0.25" strokeWidth="1" />
      <circle cx="20" cy="4.5" r="1.3" fill="#fff" fillOpacity="0.85" />
      <path d="M9.5 21 L20 8" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

// ── ABOUT ICONS ──────────────────────────────────────────────────────────
// Replaces the flat "glyph on a rounded badge" treatment (components/icons)
// with the same object-shaped, beveled recipe as the icons above — kept as
// their own components (not edits to components/icons) since MathIcon/
// ScissorsIcon/KeyboardIcon's flat originals may still be wanted elsewhere.

export function MathIcon3D({ color = "var(--brand)", size = 40 }: SkillIconProps): ReactElement {
  const gid = useGradientId("math");
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.25))" }}>
      <defs>
        <linearGradient id={gid} x1="6" y1="6" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={color} stopOpacity="0.55" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
      </defs>
      <rect x="5" y="5" width="30" height="30" rx="8" fill={`url(#${gid})`} />
      <rect x="5" y="5" width="30" height="9" rx="8" fill="#fff" fillOpacity="0.18" />
      <text x="20" y="27" fontSize="17" fontFamily="Georgia, serif" fontWeight="700" fill="#fff" fillOpacity="0.95" textAnchor="middle">&#931;</text>
      <rect x="5" y="5" width="30" height="30" rx="8" stroke="#fff" strokeOpacity="0.25" strokeWidth="1" />
    </svg>
  );
}

export function ScissorsIcon3D({ color = "var(--indigo)", size = 40 }: SkillIconProps): ReactElement {
  const gid = useGradientId("scissors");
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.25))" }}>
      <defs>
        <linearGradient id={gid} x1="6" y1="6" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={color} stopOpacity="0.55" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
      </defs>
      <rect x="5" y="5" width="30" height="30" rx="8" fill={`url(#${gid})`} />
      <rect x="5" y="5" width="30" height="9" rx="8" fill="#fff" fillOpacity="0.18" />
      <g stroke="#fff" strokeOpacity="0.92" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <circle cx="14" cy="14" r="2.6" />
        <circle cx="14" cy="27" r="2.6" />
        <path d="M16.3 15.6 L28 26" />
        <path d="M16.3 25.4 L28 15" />
      </g>
      <rect x="5" y="5" width="30" height="30" rx="8" stroke="#fff" strokeOpacity="0.25" strokeWidth="1" />
    </svg>
  );
}

export function KeyboardIcon3D({ color = "var(--brand)", size = 40 }: SkillIconProps): ReactElement {
  const gid = useGradientId("kb");
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.25))" }}>
      <defs>
        <linearGradient id={gid} x1="6" y1="6" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={color} stopOpacity="0.55" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
      </defs>
      <rect x="5" y="5" width="30" height="30" rx="8" fill={`url(#${gid})`} />
      <rect x="5" y="5" width="30" height="9" rx="8" fill="#fff" fillOpacity="0.18" />
      <rect x="10" y="15" width="20" height="13" rx="2" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.4" fill="none" />
      <g fill="#fff" fillOpacity="0.85">
        <rect x="12.5" y="18" width="2.6" height="2.2" rx="0.5" />
        <rect x="16.5" y="18" width="2.6" height="2.2" rx="0.5" />
        <rect x="20.5" y="18" width="2.6" height="2.2" rx="0.5" />
        <rect x="24.5" y="18" width="2.6" height="2.2" rx="0.5" />
        <rect x="14.5" y="22.5" width="11" height="2.2" rx="0.5" fillOpacity="0.7" />
      </g>
      <rect x="5" y="5" width="30" height="30" rx="8" stroke="#fff" strokeOpacity="0.25" strokeWidth="1" />
    </svg>
  );
}
