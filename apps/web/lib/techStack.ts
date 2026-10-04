import type { Project } from "@devcraft/types";

export interface StackFrequencyItem {
  label: string;
  count: number;
  share: number;
}

/**
 * Known technology aliases are keyed after lower-casing and removing
 * punctuation/spacing. Stored project values stay untouched; this catalog only
 * controls the labels and aggregation used by the portfolio UI.
 */
const TECH_ALIASES: Record<string, string> = {
  angular: "Angular",
  css: "CSS",
  d3: "D3.js",
  d3js: "D3.js",
  docker: "Docker",
  express: "Express",
  expressjs: "Express",
  fastify: "Fastify",
  firebase: "Firebase",
  firestore: "Firestore",
  framer: "Framer Motion",
  framermotion: "Framer Motion",
  graphql: "GraphQL",
  html: "HTML",
  htmlandcss: "HTML & CSS",
  htmlcss: "HTML & CSS",
  javascript: "JavaScript",
  js: "JavaScript",
  jwt: "JWT",
  jsonwebtoken: "JWT",
  mongo: "MongoDB",
  mongodb: "MongoDB",
  next: "Next.js",
  nextjs: "Next.js",
  node: "Node.js",
  nodejs: "Node.js",
  pg: "PostgreSQL",
  postgres: "PostgreSQL",
  postgresql: "PostgreSQL",
  prisma: "Prisma",
  prismaorm: "Prisma",
  python: "Python",
  react: "React",
  reactjs: "React",
  reactnative: "React Native",
  redis: "Redis",
  redux: "Redux",
  rest: "REST API",
  restapi: "REST API",
  restfulapi: "REST API",
  sass: "Sass",
  scss: "Sass",
  supabase: "Supabase",
  tailwind: "Tailwind CSS",
  tailwindcss: "Tailwind CSS",
  three: "Three.js",
  threejs: "Three.js",
  ts: "TypeScript",
  typescript: "TypeScript",
  vue: "Vue",
  vuejs: "Vue",
  websocket: "WebSockets",
  websockets: "WebSockets",
  ws: "WebSockets",
  drizzle: "Drizzle ORM",
  drizzleorm: "Drizzle ORM",
};

function aliasKey(value: string): string {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "");
}

/** Return one stable display label while preserving unknown technology names. */
export function canonicalizeTechLabel(value: string): string {
  const cleaned: string = value.trim().replace(/\s+/g, " ");
  if (!cleaned) return "";
  const key: string = aliasKey(cleaned);
  const knownLabel: string | undefined = TECH_ALIASES[key];
  if (knownLabel) return knownLabel;

  // Unknown tags still get one label across case, spacing, and punctuation
  // variants (for example, AstroJS / astro.js / Astro JS).
  if (key.endsWith("js") && key.length > 2) {
    return `${key.slice(0, -2).replace(/^./, (letter: string) => letter.toUpperCase())}.js`;
  }
  return key.replace(/^./, (letter: string) => letter.toUpperCase());
}

/** Canonicalize and deduplicate one project's stack without mutating its data. */
export function canonicalizeTechStack(stack: string[]): string[] {
  const labels: Set<string> = new Set<string>();

  stack.forEach((value: string): void => {
    const label: string = canonicalizeTechLabel(value);
    if (label) labels.add(label);
  });

  return Array.from(labels);
}

/** Aggregate one count per canonical technology per project. */
export function buildStackFrequency(
  projects: ReadonlyArray<Pick<Project, "techStack">>,
): StackFrequencyItem[] {
  const counts: Record<string, number> = {};
  const denominator: number = Math.max(projects.length, 1);

  projects.forEach((project: Pick<Project, "techStack">): void => {
    canonicalizeTechStack(project.techStack).forEach((label: string): void => {
      counts[label] = (counts[label] ?? 0) + 1;
    });
  });

  return Object.entries(counts)
    .sort(([labelA, countA], [labelB, countB]): number =>
      countB - countA || labelA.localeCompare(labelB),
    )
    .map(([label, count]: [string, number]): StackFrequencyItem => ({
      label,
      count,
      share: Math.round((count / denominator) * 100),
    }));
}

export function formatProjectCount(count: number): string {
  return `${count} project${count === 1 ? "" : "s"}`;
}

export function formatShare(share: number): string {
  return `${share}%`;
}
