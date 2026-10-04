import type { Era } from "@devcraft/types";

export interface EraConfig {
  num: string;
  label: string;
  sub: string;
  numBg: string;
  numBorder: string;
  numColor: string;
  cardBorder: string;
  cardTop: string;
  badge: string;
  badgeBg: string;
  badgeColor: string;
  badgeBorder: string;
  dividerColor: string;
  iconSrc?: string;
}

/**
 * Shared by the server-rendered archive and the client-rendered project cards.
 * Keep this module free of React/client-only imports so the full map remains
 * available when a server component reads it.
 */
export const ERA_CONFIG: Record<Era, EraConfig> = {
  FOUNDATION: {
    num: "01",
    label: "Foundation Era",
    sub: "Learning in public · First real builds",
    numBg: "var(--raised)",
    numBorder: "2px solid var(--rim)",
    numColor: "var(--dim)",
    cardBorder: "var(--rim-sub)",
    cardTop: "var(--rim-sub)",
    badge: "Foundation",
    badgeBg: "var(--raised)",
    badgeColor: "var(--ghost)",
    badgeBorder: "var(--rim)",
    dividerColor: "var(--brand)",
    iconSrc: "/file_00000000dab881f4aa3faf287625e2e6.png",
  },
  INTERNSHIP: {
    num: "02",
    label: "HNG Internship Era",
    sub: "Team projects · Sprint delivery · Professional codebase",
    numBg: "var(--brand)",
    numBorder: "none",
    numColor: "var(--on-brand)",
    cardBorder: "var(--rim)",
    cardTop: "var(--brand)",
    badge: "HNG Internship",
    badgeBg: "var(--brand-muted)",
    badgeColor: "var(--brand)",
    badgeBorder: "var(--rim)",
    dividerColor: "var(--brand)",
    iconSrc: "/hng-internship.png",
  },
  SAAS: {
    num: "03",
    label: "SaaS Era — Current",
    sub: "Own products · Real users · Production systems",
    numBg: "var(--indigo)",
    numBorder: "none",
    numColor: "var(--on-brand)",
    cardBorder: "var(--indigo)",
    cardTop: "var(--indigo)",
    badge: "SaaS · Live",
    badgeBg: "var(--indigo-bg)",
    badgeColor: "var(--indigo)",
    badgeBorder: "color-mix(in srgb, var(--indigo) 40%, transparent)",
    dividerColor: "var(--indigo)",
    iconSrc: "/era-saas-hula.png",
  },
};
