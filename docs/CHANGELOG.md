# Changelog

All notable changes to the DevCraft Portfolio project are documented in this file, grouped by build milestone. Format loosely follows [Keep a Changelog](https://keepachangelog.com/); versions are milestone-based rather than strict semver, since this is a single deployed product rather than a published package.

---

## [0.7.0] — Build Pipeline & Runtime Correctness

The first build against a real Prisma 7 / Zod 4 environment surfaced a class of issue the earlier milestones hadn't hit: a monorepo package that type-checks locally can still fail to *build* or *run* once its shared packages are asked to compile for real, on a different machine, against different resolved dependency versions.

### Fixed
- **Build fails at `tsc -p tsconfig.json`: `TS6059 — file is not under rootDir`.** `apps/api/tsconfig.json` pointed its `@devcraft/db` / `@devcraft/types` path aliases directly at raw `.ts` source in sibling packages. Once anything under `apps/api/src` imported them, TypeScript pulled those external files into the same compilation unit, which violated `rootDir: "src"`.
- **Latent runtime crash that the above fix would have exposed.** Even papering over the `rootDir` error wouldn't have produced a working build — `packages/db` and `packages/types` had no compiled output; their `package.json` `main`/`exports` fields pointed straight at `.ts` source, which plain `node` cannot execute. Fixed by giving both packages a real `build` script, compiled `dist/` output, and `package.json` exports that point at the compiled files.
- **`z.record()` two-argument signature (Zod v4).** `metrics: z.record(z.union([...]))` used Zod v3's single-argument form; v4 requires an explicit key schema: `z.record(z.string(), z.union([...]))`.
- **Prisma nullable-Json write rejected bare `null`.** `prisma.project.create()` / `.update()` received `metrics: null` directly from the parsed Zod output; Prisma's generated types require the `Prisma.JsonNull` sentinel to disambiguate JSON null from SQL null. Added a `toPrismaMetrics()` conversion helper used at both call sites.
- **Declared dependency ranges didn't match what was actually resolved.** `zod` was pinned to `^3.23.8` while the environment had resolved `4.4.3`; `@prisma/client`/`prisma` were pinned to `^5.20.0` while the environment had resolved `7.8.0`. Both fixes above depend on v4/v7 APIs specifically, so the ranges were corrected to match, keeping a fresh `pnpm install` reproducible.
- **`pnpm dev` would have hit the same "dist doesn't exist" problem as the build.** `turbo.json`'s `dev` task had no `dependsOn`, so `apps/api`/`apps/web` could start before `packages/db`/`packages/types` had ever been compiled. Added `"dependsOn": ["^build"]` to the `dev` task, matching the existing `build` task, so Turborepo builds shared packages first automatically (and caches the result).

### Changed
- `packages/types` and `packages/db` now compile as ESM (`module`/`moduleResolution: NodeNext`, `"type": "module"`), matching the rest of the stack instead of mixing a CommonJS package into an ESM app via interop.
- `apps/api/tsconfig.json` and `apps/web/tsconfig.json` no longer override `@devcraft/db` / `@devcraft/types` resolution via `paths` — both now resolve through the packages' own `package.json` exports, the same way any other `workspace:*` dependency does. This removes the risk of type-checking against source that's drifted from what's actually built.

---

## [0.6.0] — Contact System, Module Resolution & Full Type-Safety Sweep

A second, more invasive audit pass: this milestone replaced the placeholder "copy email" contact pattern with a real system, fixed the root cause of a `pnpm` workspace resolution failure, and eliminated every remaining `any` type across both apps and the API.

### Added
- `ContactMessage` Prisma model — name, email, subject, message, read flag, IP/UA metadata.
- `POST /contact` — public endpoint, honeypot field, 3 requests/hour rate limit, 8KB body cap.
- `/admin/contacts` route group — list (with pagination + read/unread filter), mark read/unread, delete, unread-count.
- `ContactForm.tsx` — replaces the old "copy email to clipboard" button with client + server validated fields.
- `/dashboard/contacts` — inbox page: list/detail pane, mark read, delete, reply via `mailto:`.
- "Inbox" nav item in the dashboard sidebar with a live unread-count badge, polling every 30 seconds.
- `pnpm-workspace.yaml` at the repo root.
- `apps/web/tsconfig.json`, `packages/types/tsconfig.json`, `packages/db/tsconfig.json` — none of the three existed before this milestone.
- `apps/web/lib/fetch.ts` — `NextFetchInit` type + `fetchJSON<T>()` / `fetchList<T>()` helpers, so `fetch(url, { next: { revalidate } })` type-checks without a scattered `as RequestInit` cast at every call site.
- `apps/api/src/utils/device.ts` — shared `detectDevice()` returning the real Prisma `DeviceType` enum, replacing duplicated inline regex + `as any` casts in two route files.

### Fixed
- **`Cannot find module '@devcraft/types'` / `'@devcraft/db'`.** Root cause: `pnpm-workspace.yaml` didn't exist. `pnpm` ignores the `workspaces` field in `package.json` — that's an npm/Yarn convention — so `pnpm install` was never linking the internal packages at all.
- `blog/[slug]/page.tsx`, `projects/[slug]/page.tsx`: `post` / `related` (and equivalent) didn't exist on type `{...} | null`. Fixed with an explicit response interface plus the `if (!data) return notFound();` pattern — the explicit `return` is what lets TypeScript narrow the rest of the function body.
- Five server-component pages: `fetch(url, { next: { revalidate: 300 } })` failed to type-check because Next.js's `next` cache option isn't part of the standard `RequestInit` type. Fixed via the new `lib/fetch.ts` wrapper.
- `Terminal.tsx`, `ReadingMode.tsx`, `ContactForm.tsx`, `AiChat.tsx`, `auth/login/page.tsx`: used `React.ReactNode` / `React.FormEvent` / `React.KeyboardEvent` without importing `React`. Switched to named type imports.
- `analytics.routes.ts`, `blog.routes.ts`: `device: device as any` — casting a plain string to Prisma's `DeviceType` enum. Replaced with the shared, properly-typed `detectDevice()`.
- `ai.routes.ts`: 8 error responses were missing the `statusCode` field required by the shared `ApiError` type; `let result: any` in the insights-parsing fallback replaced with `unknown` plus runtime narrowing.
- `AiProjectEnhancer.tsx`: locally redefined `type Era` instead of importing the shared one from `@devcraft/types` — a silent duplication bug where the two could drift.
- Dashboard `page.tsx` (overview): `Promise.all([...]).then(([a, s]: any[])` replaced with an explicit tuple type.
- `AnalyticsOverview` / `SubscriberAnalytics` shared types didn't match the real API response shape (declared `viewsThisMonth`/`viewsLastMonth`, actual API returned `viewsLastPeriod`). Corrected field-for-field.
- `lib/api.ts`: three separate `URLSearchParams(params as any)` casts, and no handling for network failures — a dropped connection would throw instead of resolving to a typed error. Added a `toQueryString()` helper and a top-level `try/catch` so `apiFetch()` always resolves to `ApiResponse<T>`.

### Changed
- Removed the `recharts` dependency — the dashboard overview page now uses the same D3 components as the analytics page instead of maintaining two charting approaches.
- Removed a duplicate `AuthTokens` interface definition in `@devcraft/types`.

### Result
Zero `any` usage remains anywhere in the codebase (verified by a full-repository grep sweep, excluding two explanatory code comments that contain the string as prose).

---

## [0.5.0] — Interactive Feature Completion (FR-016, FR-018–021)

Closed out every remaining PRD feature, including three that had been deferred to a "P2 — backlog" bucket in the 0.4.0 gap analysis.

### Added
- **FR-016 — Terminal CLI easter egg.** Press `/` anywhere on the portfolio to open a themed terminal (`kano@devcraft:~$`). Commands: `help`, `ls`, `whoami`, `cat about`, `open [section]`, `projects` (live-fetched), `skills`, `contact`, `hausa` (ASCII art), `ai [question]` (streams a real model response), plus `sudo`/`vim`/`git` easter eggs. Command history via `↑`/`↓`, tab-completion on section names.
- **FR-018 — Testimonials section.** Three cards with `KwalbaFrame` avatar borders, era badges (team / client / colleague), and LinkedIn verification links.
- **FR-019 — Hausa Journey Map.** D3 geo projection centered on Kano; simplified northern-Nigeria outline; seven life/career stops with an animated dashed-path draw-on; click-to-select detail panel; horizontal timeline strip.
- **FR-020 — Embedded live project demos.** Sandboxed `<iframe>` with browser-chrome UI, lazy load, `X-Frame-Options` block detection (8-second timeout with graceful fallback), fullscreen expand modal. Rendered only for SaaS-era projects with a live URL.
- **FR-021 — Collaborative reading mode.** Wraps blog post content; `Selection` API detects a 20–600 character highlight; popup offers "copy quote" or "share as image" — the latter renders a branded 1600×840 PNG via the Canvas API (Hausa diamond motif, Lauje mark, quote, post title, site URL) for download.

### Notes
At the time of the previous milestone's gap analysis, FR-019/020/021 had been marked P2 and deferred. This milestone promotes and ships all three, bringing PRD completion to 21/21 features.

---

## [0.4.0] — Gap Analysis & Hardening Sweep

The first full audit pass against the PRD: what was actually built vs. specified, plus a dedicated bug and security review.

### Added
- `middleware.ts` — server-side dashboard route protection via `refresh_token` cookie presence check (previously, protection was client-side only, which left a render flash before redirect).
- `postcss.config.js` — had been missing entirely; without it, every `@tailwind` directive in `globals.css` compiled to nothing, and the whole design system was silently absent from the shipped CSS.
- Email notification history tab on the Subscribers dashboard page (the API already logged every send; there was no UI to view it).
- `@fastify/helmet` with a strict CSP; matching security headers added to `next.config.ts`.
- Disposable-email domain blocklist (22 domains) on the subscribe endpoint.
- Prompt-injection sanitization (`sanitizeUserMessage()`) plus a system-message guard on the public AI chat endpoint.
- Startup env validation — the API now refuses to boot if `JWT_SECRET` is missing or under 32 characters, or if `CORS_ORIGIN` isn't a parseable URL list.

### Fixed
- **BUG-01:** Blog post creation route was double-prefixed (`POST /blog/blog/admin` after the Fastify prefix was applied), so every new post save 404'd. Route path corrected from `/blog/admin` to `/admin`.
- **BUG-02:** Nav scroll background used `rgba(var(--canvas-rgb, ...), 0.94)` — not valid CSS; you cannot pass a custom property as `rgba()`'s r/g/b arguments. Replaced with a solid background plus a `backdrop-filter` transition.
- **BUG-03:** `useScrollReveal`'s `useEffect` had no dependency array, so it disconnected and recreated its `IntersectionObserver` on every single render (including on unrelated state changes like a form keystroke). Rewritten with a stable, empty-deps effect plus a `MutationObserver` to catch dynamically-added `.reveal` elements.
- **BUG-04:** D3 charts read CSS custom properties once, at mount, and baked the resulting colors into SVG attributes. Toggling dark mode left every chart showing the wrong palette until a full page reload. Added a `useDarkMode()` hook (watches the `<html>` class via `MutationObserver`) to every chart component's effect dependencies.
- **BUG-05:** `Hero.tsx` used `next/dynamic` and interactive elements without a `"use client"` directive.
- **BUG-06:** The admin access token lived only in a module-level JS variable, so any hard page refresh silently logged the admin out mid-session. Added a `sessionStorage` cache layer on top of the existing httpOnly-cookie-based refresh flow.

### Security
- **SEC-01:** No explicit request body size limit; added a 512KB global cap and a tighter 5KB cap on the public AI chat endpoint.
- **SEC-02:** No security headers at all on either the API or the frontend. Added via Helmet + Next.js `headers()`.
- **SEC-03:** The public AI chat endpoint passed user messages straight to the model with no defense against prompt injection (e.g., "ignore all previous instructions"). Added pattern-based sanitization and a trailing system-message guard.
- **SEC-04:** `OPENROUTER_API_KEY` wasn't validated at startup — a missing key only surfaced as an opaque failure at first AI request. Startup now logs a clear warning.
- **SEC-05:** The analytics `referrer` field was stored without validation — a crafted value could contain arbitrary strings. Now validated as a real URL and capped at 500 characters before insert.
- **SEC-06:** `JWT_SECRET` used a non-null assertion (`process.env.JWT_SECRET!`) that silenced the type checker but did nothing at runtime — a missing secret could result in tokens signed with `undefined`. Now validated for presence and minimum length at startup, throwing if invalid.
- **SEC-07:** No defense against disposable-email signups on the subscribe endpoint. Added a blocklist.
- **SEC-08:** The admin-only `/ai/complete` endpoint accepted an unbounded `maxTokens` value from the request body, letting a compromised admin session trigger an arbitrarily expensive model call. Hard-capped server-side regardless of what's requested.
- **SEC-09:** `CORS_ORIGIN` was used directly with no validation — a misconfiguration (e.g., accidentally set to `*`) would silently make the API's CORS policy fully permissive. Now parsed and validated as one or more real URLs at startup.

---

## [0.3.0] — AI Feature Layer

Introduced the full OpenRouter integration across both the public site and the admin dashboard.

### Added
- `openrouter.service.ts` — 7-model registry (`openai/gpt-4o-mini`, `deepseek/deepseek-r1-0528`, `qwen/qwen3-coder-480b-a35b-07-25`, `google/gemma-3-27b-it`, `deepseek/deepseek-r1`, `deepseek/deepseek-chat-v3-0324`, `openai/gpt-4o`), SSE streaming helper, and four purpose-specific system prompts.
- `POST /ai/chat/stream` — public portfolio chat, streams via Server-Sent Events, injects live project data from the database as context, rate-limited.
- `POST /ai/generate/blog/stream` — admin-only streaming MDX draft generator (topic, optional outline, tone).
- `POST /ai/generate/project` — admin-only structured JSON project-copy enhancer.
- `POST /ai/insights` — admin-only analytics-to-insights endpoint, returns 5 prioritized, typed recommendations.
- `POST /ai/complete` — generic single-shot completion, used by the Settings-page bio generator.
- `AiChat.tsx` (floating widget), `AiBlogWriter.tsx`, `AiProjectEnhancer.tsx`, `AiInsights.tsx`, `ModelSelector.tsx` / `ModelDropdown` — full UI layer for every endpoint above.
- Three.js hero background (`HeroThreeJS.tsx`) — vanilla Three.js particle field arranged in a Sawaki diamond lattice, custom `ShaderMaterial`, mouse-reactive displacement, loaded via `next/dynamic` with `ssr: false`.
- Full D3.js chart suite (`D3Charts.tsx`): area chart, donut, horizontal bar, radial skills chart, sparkline — used across the dashboard analytics page and the public projects archive page.

---

## [0.2.0] — Core Product (P0 Features)

The first fully working version of the product: design system, API, portfolio pages, and admin dashboard.

### Added
- Monorepo scaffold — `pnpm` workspaces, Turborepo, `apps/web` (Next.js 14 App Router), `apps/api` (Fastify), `packages/db` (Prisma), `packages/types` (shared interfaces).
- Prisma schema — `User`, `Project`, `BlogPost`, `Subscriber`, `EmailNotification`, `PageView` models.
- Desert Monarch design system — full light/dark CSS custom-property token set, Playfair Display / DM Sans / Bricolage Grotesque / JetBrains Mono type stack.
- 8 Hausa cultural SVG components (`ZaureArch`, `RigaDivider`, `LaujeSpinner`, `KofarIcon`, `TukulMarker`, `KwalbaFrame`, `GindiColumn`, `SawakiBg`).
- Fastify server with JWT auth (access token + httpOnly refresh cookie), rate limiting, CORS, cookie plugin.
- Full CRUD routes: `auth`, `projects`, `blog`, `subscribers`, `analytics`, `notify`.
- Public portfolio pages: hero, about, 3-era projects section, skills, contact (email-copy pattern at this stage), footer.
- Admin dashboard: layout with client-side auth guard, overview page (Recharts at this stage), projects CRUD UI, blog editor, subscribers list.
- Bidirectional scroll-reveal hook, custom cursor, dark-mode toggle, direct-subscribe email widget (no confirmation step).
- Resend-based transactional email service (welcome, blog notification, project notification).

---

## [0.1.0] — PRD & Project Scaffold

Initial planning milestone. Product requirements document drafted (21 functional requirements across P0/P1/P2 priority), Desert Monarch visual direction established, monorepo architecture decided (Next.js 14 + Fastify + PostgreSQL over a single-framework alternative, to keep the portfolio and the API cleanly separable for future reuse).
