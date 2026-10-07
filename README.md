# DevCraft Portfolio

A full-product developer portfolio monorepo — Next.js 14 frontend, Fastify API, PostgreSQL, and an AI layer powered by seven OpenRouter models. Built for a self-taught full-stack engineer from Kano, northern Nigeria, with a design system rooted in Hausa architectural motifs.

> **Live sections:** Public portfolio (hero, about, journey, projects, skills, testimonials, contact, blog) + a protected admin dashboard (analytics, project/blog CRUD, subscriber management, contact inbox, AI tools).

---

## Table of Contents

1. [Stack](#stack)
2. [Monorepo Structure](#monorepo-structure)
3. [Quick Start](#quick-start)
4. [Environment Variables](#environment-variables)
5. [Database](#database)
6. [Feature Overview](#feature-overview)
7. [AI Features](#ai-features)
8. [Design System — Desert Monarch](#design-system--desert-monarch)
9. [Hausa Cultural Component Library](#hausa-cultural-component-library)
10. [Admin Dashboard](#admin-dashboard)
11. [API Reference](#api-reference)
12. [Security Model](#security-model)
13. [Deployment](#deployment)
14. [Development Scripts](#development-scripts)
15. [Troubleshooting](#troubleshooting)
16. [Project Documents](#project-documents)
17. [License](#license)

---

## Stack

| Layer | Technology |
|---|---|
| Frontend framework | Next.js 14 (App Router), React 18, TypeScript (strict) |
| Styling | Tailwind CSS, CSS custom properties (design tokens), Framer Motion |
| 3D / Visualization | Three.js (vanilla, hero particle field), D3.js (all dashboard + portfolio charts) |
| Backend | Fastify 4, Node.js 20+, TypeScript (strict) |
| Database | PostgreSQL via Prisma ORM |
| AI | OpenRouter (7-model registry), Server-Sent Events streaming |
| Email | Nodemailer (SMTP) + HTML templates |
| Media | Cloudinary |
| Auth | JWT (access + httpOnly refresh cookie), bcrypt |
| Package management | pnpm workspaces, Turborepo |
| Deployment | Vercel (web) · Railway (api) · Neon (Postgres) |

---

## Monorepo Structure

```
devcraft/
├── apps/
│   ├── web/                      Next.js 14 — portfolio + admin dashboard
│   │   ├── app/
│   │   │   ├── (portfolio)/      Public routes: /, /blog, /blog/[slug], /projects, /projects/[slug]
│   │   │   ├── (dashboard)/      Protected routes: /dashboard/*
│   │   │   ├── auth/login/       Admin login
│   │   │   └── unsubscribe/      Public unsubscribe landing
│   │   ├── components/
│   │   │   ├── hausa/            8 cultural SVG components
│   │   │   ├── portfolio/        Hero, Nav, About, Projects, Terminal, AiChat, etc.
│   │   │   ├── dashboard/        D3Charts, AiInsights, AiBlogWriter, AiProjectEnhancer
│   │   │   └── ui/                Cursor, ThemeToggle, SubscribeWidget
│   │   ├── hooks/                 useScrollReveal
│   │   ├── lib/                   api.ts, fetch.ts, models.ts, tokens.ts
│   │   ├── middleware.ts          Server-side dashboard route protection
│   │   ├── next.config.ts         Security headers, image domains
│   │   ├── postcss.config.js
│   │   └── tsconfig.json
│   └── api/                      Fastify REST API
│       ├── src/
│       │   ├── routes/            auth, projects, blog, subscribers, analytics, notify, ai, contact
│       │   ├── services/          email.service.ts, openrouter.service.ts
│       │   ├── middleware/        auth.middleware.ts
│       │   ├── plugins/           prisma.plugin.ts
│       │   ├── utils/             device.ts
│       │   └── server.ts
│       └── tsconfig.json
├── packages/
│   ├── db/                        Prisma schema + client singleton
│   │   ├── schema.prisma
│   │   ├── index.ts
│   │   └── tsconfig.json
│   └── types/                     Shared TypeScript interfaces (single source of truth)
│       ├── src/index.ts
│       └── tsconfig.json
├── tsconfig.base.json              Root strict TS config, extended by every package
├── pnpm-workspace.yaml             REQUIRED for pnpm to link @devcraft/* packages
├── turbo.json
├── package.json
└── .env.example
```

---

## Quick Start

### Prerequisites

```bash
node >= 20
pnpm >= 9
```

### 1. Clone & install

```bash
git clone <your-repo-url> devcraft
cd devcraft
pnpm install
```

`pnpm install` reads `pnpm-workspace.yaml` to link `@devcraft/types` and `@devcraft/db` into both apps. If you see `Cannot find module '@devcraft/types'`, this file is either missing or `pnpm install` wasn't re-run after adding it.

### 2. Configure environment

```bash
cp .env.example apps/api/.env
cp .env.example apps/web/.env.local
```

Fill in every value — see [Environment Variables](#environment-variables) below.

### 3. Generate the admin password hash

```bash
node -e "require('bcryptjs').hash('yourpassword', 12).then(console.log)"
```

Paste the output into `ADMIN_PASSWORD_HASH` in `apps/api/.env`.

### 4. Push the database schema

```bash
pnpm db:push
```

Use `pnpm db:migrate` instead if you want versioned migrations for a production deployment.

### 5. Run the dev servers

```bash
pnpm dev
```

| Service | URL |
|---|---|
| Portfolio + Dashboard | http://localhost:3000 |
| API | http://localhost:4000 |
| Admin login | http://localhost:3000/auth/login |

---

## Environment Variables

All variables live in `.env.example` at the repo root and must be copied into both `apps/api/.env` and `apps/web/.env.local` (some are only read by one side, but keeping both files in sync avoids surprises).

| Variable | Used by | Description |
|---|---|---|
| `DATABASE_URL` | api | PostgreSQL connection string (Neon recommended) |
| `JWT_SECRET` | api | ≥ 32 characters. Signs access tokens and httpOnly cookies. Validated at startup — the server refuses to boot if this is missing or too short. |
| `ADMIN_EMAIL` | api | The single admin account's email |
| `ADMIN_PASSWORD_HASH` | api | bcrypt hash — never store the plaintext password |
| `CORS_ORIGIN` | api | Comma-separated list of allowed origins. Validated as real URLs at startup. |
| `API_PORT` / `API_HOST` | api | Defaults to `4000` / `0.0.0.0` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | api | SMTP delivery for welcome and blog/project notification emails |
| `EMAIL_FROM`, `EMAIL_REPLY_TO` | api | Optional sender and reply-to addresses for SMTP email |
| `CLOUDINARY_*` | api | Media uploads (CV PDF, project thumbnails, blog covers) |
| `OPENROUTER_API_KEY` | api | Powers all AI features. If missing, the API still boots but logs a warning and AI endpoints return a friendly error. |
| `NEXT_PUBLIC_API_URL` | web | Base URL the frontend calls, e.g. `http://localhost:4000` in dev |
| `NEXT_PUBLIC_SITE_URL` | web | Used for OpenGraph metadata and the OpenRouter `HTTP-Referer` header |

---

## Database

Seven Prisma models back the whole product:

| Model | Purpose |
|---|---|
| `User` | Single admin account (email + bcrypt hash) |
| `Project` | Portfolio projects, tagged by era (`FOUNDATION` / `INTERNSHIP` / `SAAS`) |
| `BlogPost` | MDX blog content |
| `Subscriber` | Email list — direct opt-in, no confirmation step |
| `EmailNotification` | Log of every blast sent to subscribers |
| `ContactMessage` | Inbox for the public contact form |
| `PageView` | Analytics events (path, referrer, device) |

```bash
pnpm db:push      # sync schema to database (dev)
pnpm db:migrate    # create + apply a versioned migration (recommended for prod)
pnpm db:studio     # open Prisma Studio GUI
```

---

## Feature Overview

All 21 PRD features are complete. Full detail in `PRD_REFINED.html`.

| Priority | Features |
|---|---|
| **P0** (12) | Hero identity + availability badge, Three.js Sawaki hero background, 8 Hausa SVG components, 3-era project sections, bidirectional scroll reveal, Fastify + PostgreSQL API, dashboard auth + CRUD, direct-subscribe email capture, Desert Monarch design system, one-click CV download, mobile-first responsive layout, Lauje loading spinner |
| **P1** (5) | MDX blog system, D3 analytics dashboard, subscriber notification blast + history, Terminal CLI easter egg, magnetic hover CTAs |
| **P2** (3, later promoted and shipped) | Testimonials section, interactive Hausa Journey Map (D3 geo), embedded live project demos (sandboxed iframe), collaborative reading mode (highlight → shareable Canvas image) |
| **Post-PRD addition** | Full contact form system (replaces the original "copy email" pattern) with a dashboard inbox |

---

## AI Features

Every AI feature runs through a single OpenRouter service (`apps/api/src/services/openrouter.service.ts`) with a shared 7-model registry.

| Model ID | Max Tokens | Used for |
|---|---|---|
| `openai/gpt-4o-mini` | none | Portfolio chat widget, quick completions |
| `deepseek/deepseek-r1-0528` | 10,000 | Reasoning-heavy analysis |
| `qwen/qwen3-coder-480b-a35b-07-25` | 8,000 | Project description enhancement |
| `google/gemma-3-27b-it` | 8,000 | Creative writing |
| `deepseek/deepseek-r1` | none | Deep-reasoning tasks |
| `deepseek/deepseek-chat-v3-0324` | 8,000 | Blog draft generation |
| `openai/gpt-4o` | 10,000 | Analytics insights |

### Public

- **AI Chat Widget** (`components/portfolio/AiChat.tsx`) — floating assistant, streams via SSE, auto-loads live project data as context, rate-limited to 15 requests/min per IP, sanitizes every user message against prompt-injection patterns before it reaches the model.

### Admin-only

- **AI Blog Writer** — topic + optional outline + tone → full MDX draft, streamed live into the editor.
- **AI Project Enhancer** — paste rough notes → tagline, description, problem, solution, impact, suggested metrics as structured JSON.
- **AI Analytics Insights** — feeds 30-day analytics into a model, returns 5 prioritized, actionable insights.
- **AI Bio Generator** (Settings page) — rough notes → polished 3-paragraph About Me copy.

All admin AI endpoints require `requireAuth`, hard-cap `max_tokens` server-side regardless of what the client requests, and validate every request body with Zod.

---

## Design System — Desert Monarch

All tokens live in `apps/web/app/globals.css` as CSS custom properties, with a full light/dark pair.

| Token | Light | Dark | Role |
|---|---|---|---|
| `--canvas` | `#fdfbfa` | `#110f0c` | Page background |
| `--card` | `#f5eee6` | `#1c1712` | Card surfaces |
| `--raised` | `#ebdccb` | `#241d16` | Inputs, elevated chips |
| `--rim` | `#dec5ad` | `#443b2e` | Borders |
| `--ink` | `#221e17` | `#fdfbf7` | Primary text |
| `--dim` | `#6b5647` | `#c4b5a5` | Secondary text |
| `--ghost` | `#b19785` | `#83705d` | Tertiary / muted text |
| `--brand` | `#b27343` | `#e7a977` | Clay accent — primary CTA color |
| `--indigo` | `#1a3f6f` | `#5b8fd4` | Kofar Mata indigo — reserved for the SaaS era and data visualization accents |

**Typography:** Playfair Display (display serif, headings) · DM Sans (body) · Bricolage Grotesque (numerals/stat displays) · JetBrains Mono (code, terminal).

---

## Hausa Cultural Component Library

Eight hand-built SVG components in `apps/web/components/hausa/index.tsx`, each tied to a specific architectural or textile reference from northern Nigeria — used as functional UI elements, not decoration.

| Component | Reference | Where it's used |
|---|---|---|
| `ZaureArch` | Traditional entrance arch | Hero background, About frame, login page |
| `RigaDivider` | Babban Riga embroidery pattern | Section dividers between project eras |
| `LaujeSpinner` | Royal parasol, viewed from above | Loading states, brand mark, footer |
| `KofarIcon` | Crenellated Kano city gate | External-link / "Live" CTAs |
| `TukulMarker` | Conical tower | Nav active-state indicator |
| `KwalbaFrame` | Calabash cross-section | Avatar / testimonial frames |
| `GindiColumn` | Spiral palace column | Skills section category accent |
| `SawakiBg` | Zankwaye geometric plasterwork | Hero and contact section backgrounds |

---

## Admin Dashboard

Route group: `apps/web/app/(dashboard)/`. Protected by `middleware.ts` (server-side cookie check) plus a client-side auth guard in `layout.tsx` that silently refreshes the access token on load.

| Page | Path | Purpose |
|---|---|---|
| Overview | `/dashboard` | D3 area/donut charts — 30-day views, subscribers, device split |
| Projects | `/dashboard/projects` | Full CRUD, era tagging, AI enhancer panel |
| Blog | `/dashboard/blog` | MDX editor with AI writer, publish + notify subscribers |
| Inbox | `/dashboard/contacts` | Contact form submissions — list/detail, mark read, mailto reply |
| Subscribers | `/dashboard/subscribers` | List, filter, CSV export, GDPR delete, email-history tab |
| Analytics | `/dashboard/analytics` | Full 30/90-day charts + AI insights panel |
| Settings | `/dashboard/settings` | CV upload, AI bio generator, site config, password-hash helper |

---

## API Reference

Base URL in dev: `http://localhost:4000`. All admin routes require `Authorization: Bearer <accessToken>` (auto-attached and auto-refreshed by `lib/api.ts`).

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/login` | — | Returns access token, sets refresh cookie |
| `POST` | `/auth/refresh` | cookie | Rotates access token |
| `POST` | `/auth/logout` | cookie | Clears refresh cookie |
| `GET` | `/projects` | — | Published projects |
| `GET` | `/projects/:slug` | — | Single project |
| `GET`/`POST`/`PUT`/`PATCH`/`DELETE` | `/projects/admin/*` | ✓ | Full CRUD + reorder |
| `GET` | `/blog` | — | Published posts, optional `?tag=` |
| `GET` | `/blog/:slug` | — | Single post + related |
| `GET`/`POST`/`PUT`/`DELETE` | `/blog/admin/*` | ✓ | Full CRUD |
| `POST` | `/subscribe` | — | Direct subscribe, welcome email fires immediately |
| `GET` | `/admin/subscribers` | ✓ | List + filter |
| `DELETE` | `/admin/subscribers/:id` | ✓ | GDPR removal |
| `GET` | `/admin/subscribers/export` | ✓ | CSV download |
| `POST` | `/contact` | — | Public form submit (honeypot, 3/hr rate limit) |
| `GET`/`PATCH`/`DELETE` | `/admin/contacts/*` | ✓ | Inbox management |
| `POST` | `/analytics/pageview` | — | Fired by `middleware.ts` on every route |
| `GET` | `/analytics/overview` | ✓ | 30-day summary |
| `GET` | `/analytics/subscribers` | ✓ | Growth chart data |
| `POST` | `/admin/notify` | ✓ | Blast email to active subscribers |
| `GET` | `/admin/notifications` | ✓ | Send history |
| `POST` | `/ai/chat/stream` | — (rate-limited) | Public portfolio chat, SSE |
| `POST` | `/ai/generate/blog/stream` | ✓ | SSE blog draft |
| `POST` | `/ai/generate/project` | ✓ | JSON project enhancement |
| `POST` | `/ai/insights` | ✓ | JSON analytics insights |
| `POST` | `/ai/complete` | ✓ | Generic single-shot completion |

Every response follows `{ ok: true, data }` or `{ ok: false, error, statusCode }` — the shared `ApiResponse<T>` type in `@devcraft/types`.

---

## Security Model

- **Transport:** `@fastify/helmet` with a strict CSP; Next.js `headers()` mirrors the same policy on the frontend.
- **Body limits:** 512KB global, 5KB on the public AI chat endpoint, 8KB on the contact endpoint.
- **Rate limiting:** 200 req/min global default; 15/min on AI chat; 3/hr on contact submit and auth login.
- **Auth:** short-lived JWT access tokens (15 min) + httpOnly refresh cookie; silent refresh on 401.
- **Prompt injection:** every public AI chat message is scanned against known injection patterns and stripped of control-sequence artifacts before reaching the model.
- **Env validation:** the API refuses to start if `JWT_SECRET` is missing or under 32 characters, or if `CORS_ORIGIN` isn't a valid URL list.
- **Spam controls:** honeypot field on the contact form; disposable-email domain blocklist on subscribe.
- **GDPR:** one-click subscriber deletion that removes the row entirely, not a soft-delete.

Full before/after detail for every fix: `BUGS_AND_SECURITY_REPORT.html`.

---

## Deployment

### Web → Vercel
Set the project root to `apps/web`. Add every `NEXT_PUBLIC_*` variable plus a build command of `pnpm build --filter=@devcraft/web`.

### API → Railway
Set the project root to `apps/api`. Add all API env vars. Start command: `pnpm start`.

### Database → Neon
Create a project, copy the pooled connection string into `DATABASE_URL`, then run `pnpm db:migrate` once from a machine with access.

---

## Development Scripts

```bash
pnpm dev              # run web + api concurrently (Turborepo)
pnpm build             # build all apps
pnpm lint               # lint all workspaces
pnpm db:push            # sync Prisma schema (dev)
pnpm db:migrate         # versioned migration
pnpm db:studio          # Prisma Studio
```

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `Cannot find module '@devcraft/types'` | `pnpm-workspace.yaml` missing, or `pnpm install` not re-run after adding it | Confirm the file exists at repo root, then `pnpm install` again |
| Tailwind classes render as no-ops | `postcss.config.js` missing from `apps/web`, or still on the v3 `{ tailwindcss: {}, autoprefixer: {} }` plugin shape | Project is on **Tailwind v4** — confirm `postcss.config.js` uses `{ "@tailwindcss/postcss": {} }` and `globals.css` starts with `@import "tailwindcss";` (not `@tailwind base/components/utilities;`) |
| Hausa arch/decorative SVGs invisible against the hero | A motif's `color` prop matches a nearby element's color at very low opacity — camouflage, not a rendering bug | Give decorative motifs a color with real tonal contrast against what's behind them (e.g. `var(--ink)` against a warm-toned background), not just a lower opacity of the same hue |
| Hero background shows scattered dots with no visible pattern | Three.js particle field's edge-fade attribute computed but never attached to the shader, and/or perspective camera frustum sized differently than the particle lattice | `HeroThreeJS.tsx` uses an orthographic camera sized to the container's real aspect ratio, with the fade attribute wired directly into the fragment shader |
| A D3 map/geo visualization renders as a near-empty box with a tiny dot cluster | Projection scale tuned for a tight local zoom while a country/region-scale outline needs a much wider zoom — geometrically incompatible through one projection | If every data point is hyper-local, don't force it through a real geographic projection — use a viewBox-based abstract layout instead, which scales correctly at any size with no projection math to get wrong |
| Dashboard reachable while logged out | `middleware.ts` missing or matcher misconfigured | Check `apps/web/middleware.ts` exists and its `config.matcher` includes `/dashboard` |
| Admin session drops on every refresh | Access token has no persistence layer | `lib/api.ts` caches it in `sessionStorage`; confirm `setToken()`/`getToken()` are wired into the login flow |
| D3 charts show stale colors after dark-mode toggle | Chart captured CSS vars once at mount | All chart components use the `useDarkMode()` MutationObserver hook — confirm it's in each component's `useEffect` deps |
| AI endpoints return "service unavailable" | `OPENROUTER_API_KEY` missing or invalid | Check the API startup log for the warning; set the key in `apps/api/.env` |

---

## Project Documents

| File | Contents |
|---|---|
| `README.md` | This file |
| `PRD_REFINED.html` | Full refined product requirements, feature status, and scope |
| `CHANGELOG.md` | Every build milestone, chronologically |
| `BUGS_AND_SECURITY_REPORT.html` | Every bug and vulnerability found and fixed, with before/after code |
| `DESIGN_DECISIONS.html` | UI and system architecture rationale, edge cases, and code patterns |
| `GIT_BRANCHES_AND_COMMITS.md` | Full simulated git history — branches, commits, merges to `dev` |
| `devcraft-landing-replica.html` | Standalone static HTML replica of the live landing page |

---

## License

MIT — build freely, ship with care.
