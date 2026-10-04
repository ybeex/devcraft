# Phase 0 — Intake

## Facts found (from the repo, not asked)
- **Repo shape:** pnpm/Turborepo monorepo. `apps/web` (Next.js 14/16 App Router) owns all UI; `apps/api` (Fastify) has none; `packages/types`, `packages/db` are shared, no UI.
- **Platforms:** web only. No React Native/Expo/Flutter directory anywhere in the tree.
- **UI stack:** Tailwind v4 (`@theme inline`, `@tailwindcss/postcss`), no component library (no shadcn/Radix/MUI) — every primitive is hand-built. Three.js/R3F + D3 for visualization (hero service-graph, dashboard charts).
- **Existing design system:** named and documented in prior sessions — "Desert Monarch": warm gold/amber brand color, northern-Nigerian (Hausa) architectural and textile motifs as custom SVG components (`ZaureArch`, `RigaDivider`, `LaujeSpinner`, `KofarIcon`, `TukulMarker`, `KwalbaFrame`, `GindiColumn`, `SawakiBg`), a custom cursor, scroll-reveal system, icon-fill hover system. This is not a from-scratch project — three prior rounds of audit/fixes already ran against it (type scale, focus rings, elevation tokens, a shared `Button`, empty states, dashboard panel consistency).
- **Brand assets that must stay:** the name DevCraft, the brand gold, the Hausa motif set, the cultural framing ("Mathematics graduate. Self-taught. From Kano.").
- **Audience / job of the product:** a developer portfolio — the audience is recruiters/hiring managers and technical collaborators; the job is to demonstrate both engineering depth (the 3D hero, the AI features, the dashboard) and design judgment, credibly and quickly.

## Freedom level
Given three prior rounds already moved this toward **redesign** (rethinking components/patterns) rather than a ground-up **rebrand**, and given the identity is deliberate and specific (not generic), this run continues as a **refresh + targeted redesign**: keep the Desert Monarch identity, routes, and information architecture; hold every component up against the *new*, more specific mandates in the user-supplied `DESIGN.md` (inset micro-elevation, asymmetric empty states with brand SVG illustrations, explicit motion curves, tabular numerals) and fix what doesn't already meet them. Not a rebrand — the brand already exists and is not generic.

## Assumption being made
`DESIGN.md`'s principle-level rules (§1 anti-patterns, §4 state mandates) apply to DevCraft as general house rules. Its literal example palette/type/radii (§5, branded for the user's other product, Stitchbook) do **not** override Desert Monarch's own tokens — flagged for confirmation, see `GAPS.md`.

## Questions asked
One, in the chat reply accompanying this file: whether `DESIGN.md`'s literal example styling is meant to apply to DevCraft, or whether only its principles should (with DevCraft keeping its own gold/Hausa-motif token values).
