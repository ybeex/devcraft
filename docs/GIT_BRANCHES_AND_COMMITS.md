# Git Branches & Commit History

Full simulated development history for the DevCraft monorepo — **97 branches**, **305 commits**, every branch merged into `dev` with `--no-ff` so the feature boundary stays visible in `git log --graph`. Every file referenced is a real path in the project; every commit message follows Conventional Commits (`feat`, `fix`, `security`, `refactor`, `docs`, `chore`, `test`, `style`).

> Run once before the first branch below: `git checkout -b dev && git push -u origin dev` — every branch in this document is cut from `dev` and merged back into it.

---

## Index

| # | Branch | Milestone | Commits |
|---|--------|-----------|---------|
| 1 | `chore/monorepo-scaffold` | 0.1.0 — Scaffold | 3 |
| 2 | `chore/env-template` | 0.1.0 — Scaffold | 3 |
| 3 | `docs/prd-v1` | 0.1.0 — Scaffold | 3 |
| 4 | `feat/prisma-schema-init` | 0.2.0 — Core Product | 3 |
| 5 | `feat/db-package-client` | 0.2.0 — Core Product | 3 |
| 6 | `feat/shared-types-package` | 0.2.0 — Core Product | 3 |
| 7 | `feat/fastify-server-bootstrap` | 0.2.0 — Core Product | 3 |
| 8 | `feat/auth-routes-jwt` | 0.2.0 — Core Product | 3 |
| 9 | `feat/auth-middleware` | 0.2.0 — Core Product | 3 |
| 10 | `feat/projects-api-crud` | 0.2.0 — Core Product | 4 |
| 11 | `feat/blog-api-crud` | 0.2.0 — Core Product | 3 |
| 12 | `feat/subscribers-api` | 0.2.0 — Core Product | 4 |
| 13 | `feat/analytics-api` | 0.2.0 — Core Product | 3 |
| 14 | `feat/notify-api` | 0.2.0 — Core Product | 3 |
| 15 | `feat/hausa-svg-components` | 0.2.0 — Core Product | 3 |
| 16 | `feat/design-tokens-desert-monarch` | 0.2.0 — Core Product | 3 |
| 17 | `feat/global-css-theme` | 0.2.0 — Core Product | 3 |
| 18 | `feat/web-app-scaffold` | 0.2.0 — Core Product | 3 |
| 19 | `feat/portfolio-nav` | 0.2.0 — Core Product | 3 |
| 20 | `feat/hero-section` | 0.2.0 — Core Product | 3 |
| 21 | `feat/about-section` | 0.2.0 — Core Product | 3 |
| 22 | `feat/projects-section` | 0.2.0 — Core Product | 3 |
| 23 | `feat/skills-contact-footer-sections` | 0.2.0 — Core Product | 3 |
| 24 | `feat/scroll-reveal-hook` | 0.2.0 — Core Product | 3 |
| 25 | `feat/ui-primitives` | 0.2.0 — Core Product | 3 |
| 26 | `feat/portfolio-homepage-assembly` | 0.2.0 — Core Product | 3 |
| 27 | `feat/dashboard-layout-auth-guard` | 0.2.0 — Core Product | 3 |
| 28 | `feat/dashboard-overview-page` | 0.2.0 — Core Product | 3 |
| 29 | `feat/dashboard-projects-crud-ui` | 0.2.0 — Core Product | 3 |
| 30 | `feat/dashboard-blog-editor-ui` | 0.2.0 — Core Product | 3 |
| 31 | `feat/dashboard-subscribers-ui` | 0.2.0 — Core Product | 3 |
| 32 | `feat/blog-public-pages` | 0.2.0 — Core Product | 3 |
| 33 | `feat/unsubscribe-page` | 0.2.0 — Core Product | 3 |
| 34 | `feat/openrouter-service` | 0.3.0 — AI Layer | 3 |
| 35 | `feat/ai-routes` | 0.3.0 — AI Layer | 4 |
| 36 | `feat/models-client-lib` | 0.3.0 — AI Layer | 3 |
| 37 | `feat/ai-chat-widget` | 0.3.0 — AI Layer | 3 |
| 38 | `feat/model-selector-component` | 0.3.0 — AI Layer | 3 |
| 39 | `feat/ai-blog-writer` | 0.3.0 — AI Layer | 3 |
| 40 | `feat/ai-project-enhancer` | 0.3.0 — AI Layer | 3 |
| 41 | `feat/ai-insights-panel` | 0.3.0 — AI Layer | 3 |
| 42 | `feat/threejs-hero-particles` | 0.3.0 — AI Layer | 4 |
| 43 | `feat/d3-charts-suite` | 0.3.0 — AI Layer | 4 |
| 44 | `feat/dashboard-analytics-page` | 0.3.0 — AI Layer | 3 |
| 45 | `feat/dashboard-settings-page` | 0.3.0 — AI Layer | 3 |
| 46 | `docs/gap-analysis` | 0.4.0 — Hardening | 3 |
| 47 | `fix/blog-route-double-prefix` | 0.4.0 — Hardening | 3 |
| 48 | `fix/nav-backdrop-css` | 0.4.0 — Hardening | 3 |
| 49 | `fix/scroll-reveal-memory-leak` | 0.4.0 — Hardening | 3 |
| 50 | `fix/d3-dark-mode-colors` | 0.4.0 — Hardening | 3 |
| 51 | `fix/hero-use-client-directive` | 0.4.0 — Hardening | 3 |
| 52 | `fix/token-persistence-refresh` | 0.4.0 — Hardening | 3 |
| 53 | `security/api-hardening-helmet-bodylimit` | 0.4.0 — Hardening | 3 |
| 54 | `security/ai-prompt-injection-guard` | 0.4.0 — Hardening | 3 |
| 55 | `security/startup-env-validation` | 0.4.0 — Hardening | 3 |
| 56 | `security/analytics-referrer-validation` | 0.4.0 — Hardening | 3 |
| 57 | `security/subscriber-disposable-domains` | 0.4.0 — Hardening | 3 |
| 58 | `security/ai-token-ceiling` | 0.4.0 — Hardening | 3 |
| 59 | `security/cors-origin-validation` | 0.4.0 — Hardening | 3 |
| 60 | `fix/postcss-config-missing` | 0.4.0 — Hardening | 3 |
| 61 | `feat/dashboard-route-middleware` | 0.4.0 — Hardening | 3 |
| 62 | `feat/email-history-tab` | 0.4.0 — Hardening | 3 |
| 63 | `feat/terminal-easter-egg` | 0.5.0 — Interactive Features | 4 |
| 64 | `feat/testimonials-section` | 0.5.0 — Interactive Features | 3 |
| 65 | `feat/d3-journey-map` | 0.5.0 — Interactive Features | 3 |
| 66 | `feat/project-demo-embed` | 0.5.0 — Interactive Features | 3 |
| 67 | `feat/reading-mode-highlight-share` | 0.5.0 — Interactive Features | 3 |
| 68 | `feat/wire-new-sections-into-pages` | 0.5.0 — Interactive Features | 3 |
| 69 | `feat/projects-archive-page` | 0.5.0 — Interactive Features | 3 |
| 70 | `feat/project-blog-detail-pages` | 0.5.0 — Interactive Features | 3 |
| 71 | `feat/contact-message-schema` | 0.6.0 — Module Resolution & Types | 3 |
| 72 | `feat/contact-form-system` | 0.6.0 — Module Resolution & Types | 4 |
| 73 | `feat/dashboard-contacts-inbox` | 0.6.0 — Module Resolution & Types | 3 |
| 74 | `fix/module-resolution-workspace` | 0.6.0 — Module Resolution & Types | 4 |
| 75 | `refactor/tsconfig-extends-chain` | 0.6.0 — Module Resolution & Types | 4 |
| 76 | `fix/fetch-next-revalidate-typing` | 0.6.0 — Module Resolution & Types | 4 |
| 77 | `refactor/typescript-strict-sweep-components` | 0.6.0 — Module Resolution & Types | 4 |
| 78 | `refactor/typescript-strict-sweep-dashboard` | 0.6.0 — Module Resolution & Types | 4 |
| 79 | `refactor/typescript-strict-sweep-pages` | 0.6.0 — Module Resolution & Types | 4 |
| 80 | `refactor/api-client-error-handling` | 0.6.0 — Module Resolution & Types | 3 |
| 81 | `fix/device-enum-cast-shared-util` | 0.6.0 — Module Resolution & Types | 3 |
| 82 | `fix/ai-routes-statuscode-and-unknown-parsing` | 0.6.0 — Module Resolution & Types | 3 |
| 83 | `fix/shared-types-drift` | 0.6.0 — Module Resolution & Types | 3 |
| 84 | `chore/remove-recharts-dependency` | 0.6.0 — Module Resolution & Types | 3 |
| 85 | `docs/type-safety-sweep-report` | 0.6.0 — Module Resolution & Types | 3 |
| 86 | `fix/packages-build-output` | 0.7.0 — Build Pipeline | 4 |
| 87 | `fix/api-rootdir-violation` | 0.7.0 — Build Pipeline | 3 |
| 88 | `fix/turbo-dev-task-dependency` | 0.7.0 — Build Pipeline | 3 |
| 89 | `fix/zod-v4-record-signature` | 0.7.0 — Build Pipeline | 3 |
| 90 | `fix/prisma-json-null-sentinel` | 0.7.0 — Build Pipeline | 3 |
| 91 | `docs/build-pipeline-fix-report` | 0.7.0 — Build Pipeline | 3 |
| 92 | `docs/readme-comprehensive` | Docs | 3 |
| 93 | `docs/changelog-all-milestones` | Docs | 3 |
| 94 | `docs/prd-refined` | Docs | 3 |
| 95 | `docs/design-decisions` | Docs | 3 |
| 96 | `docs/landing-page-replica` | Docs | 3 |
| 97 | `docs/git-history-record` | Docs | 3 |

---

## Milestone 0.1.0 — Scaffold

### `chore/monorepo-scaffold`
*Initialize pnpm workspace + Turborepo skeleton*

```bash
git checkout dev
git pull origin dev
git checkout -b chore/monorepo-scaffold

git add package.json pnpm-workspace.yaml
git commit -m "chore: initialize pnpm workspace root"

git add turbo.json
git commit -m "chore: add turborepo pipeline config"

git add tsconfig.base.json
git commit -m "chore: add shared strict TypeScript base config"

git push -u origin chore/monorepo-scaffold

# --- merged after review ---
git checkout dev
git pull origin dev
git merge chore/monorepo-scaffold --no-ff -m "Merge branch 'chore/monorepo-scaffold' into dev"
git push origin dev
git branch -d chore/monorepo-scaffold
git push origin --delete chore/monorepo-scaffold
```

### `chore/env-template`
*Add environment variable template and repo hygiene files*

```bash
git checkout dev
git pull origin dev
git checkout -b chore/env-template

git add .env.example
git commit -m "chore: add .env.example with all required variables"

git add README.md
git commit -m "docs: add initial README with quick start section"

git add .gitignore
git commit -m "chore: add gitignore for node_modules, .env, dist, .next"

git push -u origin chore/env-template

# --- merged after review ---
git checkout dev
git pull origin dev
git merge chore/env-template --no-ff -m "Merge branch 'chore/env-template' into dev"
git push origin dev
git branch -d chore/env-template
git push origin --delete chore/env-template
```

### `docs/prd-v1`
*Draft initial product requirements document*

```bash
git checkout dev
git pull origin dev
git checkout -b docs/prd-v1

git add devcraft-portfolio-prd-v1.html
git commit -m "docs: draft PRD v1 — P0/P1/P2 feature list"

git add devcraft-portfolio-prd-v1.html
git commit -m "docs: add success metrics and non-goals to PRD"

git add devcraft-portfolio-prd-v1.html
git commit -m "docs: finalize PRD v1 for review"

git push -u origin docs/prd-v1

# --- merged after review ---
git checkout dev
git pull origin dev
git merge docs/prd-v1 --no-ff -m "Merge branch 'docs/prd-v1' into dev"
git push origin dev
git branch -d docs/prd-v1
git push origin --delete docs/prd-v1
```

## Milestone 0.2.0 — Core Product

### `feat/prisma-schema-init`
*Define initial Prisma schema*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/prisma-schema-init

git add packages/db/schema.prisma
git commit -m "feat(db): add User, Project, BlogPost models"

git add packages/db/schema.prisma
git commit -m "feat(db): add Subscriber and EmailNotification models"

git add packages/db/schema.prisma
git commit -m "feat(db): add PageView model with device enum"

git push -u origin feat/prisma-schema-init

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/prisma-schema-init --no-ff -m "Merge branch 'feat/prisma-schema-init' into dev"
git push origin dev
git branch -d feat/prisma-schema-init
git push origin --delete feat/prisma-schema-init
```

### `feat/db-package-client`
*Create shared Prisma client package*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/db-package-client

git add packages/db/index.ts
git commit -m "feat(db): add PrismaClient singleton with dev hot-reload guard"

git add packages/db/package.json
git commit -m "chore(db): add package.json with prisma scripts"

git add packages/db/tsconfig.json
git commit -m "chore(db): add composite tsconfig for project references"

git push -u origin feat/db-package-client

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/db-package-client --no-ff -m "Merge branch 'feat/db-package-client' into dev"
git push origin dev
git branch -d feat/db-package-client
git push origin --delete feat/db-package-client
```

### `feat/shared-types-package`
*Create shared TypeScript interfaces package*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/shared-types-package

git add packages/types/src/index.ts
git commit -m "feat(types): add Project, BlogPost, Subscriber interfaces"

git add packages/types/src/index.ts
git commit -m "feat(types): add ApiResponse<T> discriminated union"

git add packages/types/package.json packages/types/tsconfig.json
git commit -m "chore(types): add package config"

git push -u origin feat/shared-types-package

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/shared-types-package --no-ff -m "Merge branch 'feat/shared-types-package' into dev"
git push origin dev
git branch -d feat/shared-types-package
git push origin --delete feat/shared-types-package
```

### `feat/fastify-server-bootstrap`
*Bootstrap the Fastify API server*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/fastify-server-bootstrap

git add apps/api/package.json apps/api/tsconfig.json
git commit -m "chore(api): scaffold Fastify app package"

git add apps/api/src/server.ts
git commit -m "feat(api): bootstrap Fastify with cors, cookie, jwt plugins"

git add apps/api/src/plugins/prisma.plugin.ts
git commit -m "feat(api): add Prisma Fastify plugin"

git push -u origin feat/fastify-server-bootstrap

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/fastify-server-bootstrap --no-ff -m "Merge branch 'feat/fastify-server-bootstrap' into dev"
git push origin dev
git branch -d feat/fastify-server-bootstrap
git push origin --delete feat/fastify-server-bootstrap
```

### `feat/auth-routes-jwt`
*Implement JWT authentication routes*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/auth-routes-jwt

git add apps/api/src/routes/auth.routes.ts
git commit -m "feat(api): add POST /auth/login with bcrypt compare"

git add apps/api/src/routes/auth.routes.ts
git commit -m "feat(api): add refresh token rotation via httpOnly cookie"

git add apps/api/src/routes/auth.routes.ts
git commit -m "feat(api): add logout route clearing refresh cookie"

git push -u origin feat/auth-routes-jwt

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/auth-routes-jwt --no-ff -m "Merge branch 'feat/auth-routes-jwt' into dev"
git push origin dev
git branch -d feat/auth-routes-jwt
git push origin --delete feat/auth-routes-jwt
```

### `feat/auth-middleware`
*Add reusable auth guard middleware*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/auth-middleware

git add apps/api/src/middleware/auth.middleware.ts
git commit -m "feat(api): add requireAuth preHandler for protected routes"

git add apps/api/src/routes/auth.routes.ts
git commit -m "fix(api): rate-limit login to 5 attempts per 15 minutes"

git add apps/api/src/server.ts
git commit -m "feat(api): register auth routes under /auth prefix"

git push -u origin feat/auth-middleware

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/auth-middleware --no-ff -m "Merge branch 'feat/auth-middleware' into dev"
git push origin dev
git branch -d feat/auth-middleware
git push origin --delete feat/auth-middleware
```

### `feat/projects-api-crud`
*Build the projects API*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/projects-api-crud

git add apps/api/src/routes/projects.routes.ts
git commit -m "feat(api): add public GET /projects with era filter"

git add apps/api/src/routes/projects.routes.ts
git commit -m "feat(api): add admin CRUD routes for projects"

git add apps/api/src/routes/projects.routes.ts
git commit -m "feat(api): add PATCH /admin/reorder for display order"

git add apps/api/src/server.ts
git commit -m "feat(api): register project routes under /projects prefix"

git push -u origin feat/projects-api-crud

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/projects-api-crud --no-ff -m "Merge branch 'feat/projects-api-crud' into dev"
git push origin dev
git branch -d feat/projects-api-crud
git push origin --delete feat/projects-api-crud
```

### `feat/blog-api-crud`
*Build the blog API*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/blog-api-crud

git add apps/api/src/routes/blog.routes.ts
git commit -m "feat(api): add public GET /blog with tag filter"

git add apps/api/src/routes/blog.routes.ts
git commit -m "feat(api): add admin CRUD routes for blog posts"

git add apps/api/src/routes/blog.routes.ts
git commit -m "feat(api): add related-posts lookup by shared tags"

git push -u origin feat/blog-api-crud

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/blog-api-crud --no-ff -m "Merge branch 'feat/blog-api-crud' into dev"
git push origin dev
git branch -d feat/blog-api-crud
git push origin --delete feat/blog-api-crud
```

### `feat/subscribers-api`
*Build direct-subscribe email capture API*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/subscribers-api

git add apps/api/src/routes/subscribers.routes.ts
git commit -m "feat(api): add POST /subscribe with immediate opt-in"

git add apps/api/src/services/email.service.ts
git commit -m "feat(api): add Resend welcome email template"

git add apps/api/src/routes/subscribers.routes.ts
git commit -m "feat(api): add unsubscribe-by-token route"

git add apps/api/src/routes/subscribers.routes.ts
git commit -m "feat(api): add admin subscriber list + CSV export"

git push -u origin feat/subscribers-api

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/subscribers-api --no-ff -m "Merge branch 'feat/subscribers-api' into dev"
git push origin dev
git branch -d feat/subscribers-api
git push origin --delete feat/subscribers-api
```

### `feat/analytics-api`
*Build the pageview analytics API*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/analytics-api

git add apps/api/src/routes/analytics.routes.ts
git commit -m "feat(api): add POST /analytics/pageview ingestion"

git add apps/api/src/routes/analytics.routes.ts
git commit -m "feat(api): add GET /analytics/overview 30-day aggregate"

git add apps/api/src/routes/analytics.routes.ts
git commit -m "feat(api): add GET /analytics/subscribers growth series"

git push -u origin feat/analytics-api

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/analytics-api --no-ff -m "Merge branch 'feat/analytics-api' into dev"
git push origin dev
git branch -d feat/analytics-api
git push origin --delete feat/analytics-api
```

### `feat/notify-api`
*Build subscriber notification blast API*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/notify-api

git add apps/api/src/routes/notify.routes.ts
git commit -m "feat(api): add POST /admin/notify email blast route"

git add apps/api/src/services/email.service.ts
git commit -m "feat(api): add chunked send (50/batch) for blog/project notify"

git add apps/api/src/routes/notify.routes.ts
git commit -m "feat(api): add GET /admin/notifications send history"

git push -u origin feat/notify-api

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/notify-api --no-ff -m "Merge branch 'feat/notify-api' into dev"
git push origin dev
git branch -d feat/notify-api
git push origin --delete feat/notify-api
```

### `feat/hausa-svg-components`
*Build the Hausa cultural SVG component library*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/hausa-svg-components

git add apps/web/components/hausa/index.tsx
git commit -m "feat(web): add ZaureArch and RigaDivider components"

git add apps/web/components/hausa/index.tsx
git commit -m "feat(web): add LaujeSpinner and KofarIcon components"

git add apps/web/components/hausa/index.tsx
git commit -m "feat(web): add TukulMarker, KwalbaFrame, GindiColumn, SawakiBg"

git push -u origin feat/hausa-svg-components

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/hausa-svg-components --no-ff -m "Merge branch 'feat/hausa-svg-components' into dev"
git push origin dev
git branch -d feat/hausa-svg-components
git push origin --delete feat/hausa-svg-components
```

### `feat/design-tokens-desert-monarch`
*Establish the Desert Monarch design token system*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/design-tokens-desert-monarch

git add apps/web/lib/tokens.ts
git commit -m "feat(web): define Desert Monarch color token object"

git add apps/web/app/globals.css
git commit -m "feat(web): add light/dark CSS custom property pairs"

git add apps/web/tailwind.config.ts
git commit -m "feat(web): wire Tailwind config to CSS custom properties"

git push -u origin feat/design-tokens-desert-monarch

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/design-tokens-desert-monarch --no-ff -m "Merge branch 'feat/design-tokens-desert-monarch' into dev"
git push origin dev
git branch -d feat/design-tokens-desert-monarch
git push origin --delete feat/design-tokens-desert-monarch
```

### `feat/global-css-theme`
*Build global stylesheet and animation primitives*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/global-css-theme

git add apps/web/app/globals.css
git commit -m "feat(web): add reveal animation keyframes"

git add apps/web/app/globals.css
git commit -m "feat(web): add sawaki-bg pattern and pulse-dot utility classes"

git add apps/web/postcss.config.js
git commit -m "fix(web): add missing postcss config — tailwind was not compiling"

git push -u origin feat/global-css-theme

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/global-css-theme --no-ff -m "Merge branch 'feat/global-css-theme' into dev"
git push origin dev
git branch -d feat/global-css-theme
git push origin --delete feat/global-css-theme
```

### `feat/web-app-scaffold`
*Scaffold the Next.js 14 App Router structure*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/web-app-scaffold

git add apps/web/package.json
git commit -m "chore(web): scaffold Next.js 14 app package"

git add apps/web/tsconfig.json
git commit -m "chore(web): add tsconfig with bundler module resolution"

git add apps/web/app/layout.tsx
git commit -m "feat(web): add root layout with font loading"

git push -u origin feat/web-app-scaffold

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/web-app-scaffold --no-ff -m "Merge branch 'feat/web-app-scaffold' into dev"
git push origin dev
git branch -d feat/web-app-scaffold
git push origin --delete feat/web-app-scaffold
```

### `feat/portfolio-nav`
*Build the portfolio navigation bar*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/portfolio-nav

git add apps/web/components/portfolio/Nav.tsx
git commit -m "feat(web): add sticky nav with scroll-aware backdrop"

git add apps/web/components/portfolio/Nav.tsx
git commit -m "feat(web): add active-section tracking via IntersectionObserver"

git add apps/web/components/portfolio/Nav.tsx
git commit -m "feat(web): add mobile hamburger menu"

git push -u origin feat/portfolio-nav

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/portfolio-nav --no-ff -m "Merge branch 'feat/portfolio-nav' into dev"
git push origin dev
git branch -d feat/portfolio-nav
git push origin --delete feat/portfolio-nav
```

### `feat/hero-section`
*Build the hero section*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/hero-section

git add apps/web/components/portfolio/Hero.tsx
git commit -m "feat(web): add hero headline, availability badge, CTAs"

git add apps/web/components/portfolio/Hero.tsx
git commit -m "feat(web): add social links row"

git add apps/web/components/portfolio/Hero.tsx
git commit -m "feat(web): wire Sawaki background pattern into hero"

git push -u origin feat/hero-section

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/hero-section --no-ff -m "Merge branch 'feat/hero-section' into dev"
git push origin dev
git branch -d feat/hero-section
git push origin --delete feat/hero-section
```

### `feat/about-section`
*Build the about section*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/about-section

git add apps/web/components/portfolio/About.tsx
git commit -m "feat(web): add three-pillar layout (maths, tailoring, self-taught)"

git add apps/web/components/portfolio/About.tsx
git commit -m "feat(web): add KwalbaFrame quote block"

git add apps/web/components/portfolio/About.tsx
git commit -m "style(web): tune pillar spacing and chip styling"

git push -u origin feat/about-section

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/about-section --no-ff -m "Merge branch 'feat/about-section' into dev"
git push origin dev
git branch -d feat/about-section
git push origin --delete feat/about-section
```

### `feat/projects-section`
*Build the era-organized projects section*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/projects-section

git add apps/web/components/portfolio/Projects.tsx
git commit -m "feat(web): add ProjectCard component with era-based styling"

git add apps/web/components/portfolio/Projects.tsx
git commit -m "feat(web): add era grouping with RigaDivider transitions"

git add apps/web/components/portfolio/Projects.tsx
git commit -m "feat(web): add live-status pulse indicator for SaaS projects"

git push -u origin feat/projects-section

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/projects-section --no-ff -m "Merge branch 'feat/projects-section' into dev"
git push origin dev
git branch -d feat/projects-section
git push origin --delete feat/projects-section
```

### `feat/skills-contact-footer-sections`
*Build skills, contact, and footer sections*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/skills-contact-footer-sections

git add apps/web/components/portfolio/Sections.tsx
git commit -m "feat(web): add SkillsSection with GindiColumn accents"

git add apps/web/components/portfolio/Sections.tsx
git commit -m "feat(web): add ContactSection with copy-email pattern"

git add apps/web/components/portfolio/Sections.tsx
git commit -m "feat(web): add FooterSection with Hausa proverb"

git push -u origin feat/skills-contact-footer-sections

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/skills-contact-footer-sections --no-ff -m "Merge branch 'feat/skills-contact-footer-sections' into dev"
git push origin dev
git branch -d feat/skills-contact-footer-sections
git push origin --delete feat/skills-contact-footer-sections
```

### `feat/scroll-reveal-hook`
*Add scroll-triggered reveal animation hook*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/scroll-reveal-hook

git add apps/web/hooks/useScrollReveal.ts
git commit -m "feat(web): add useScrollReveal with IntersectionObserver"

git add apps/web/hooks/useScrollReveal.ts
git commit -m "feat(web): add bidirectional reveal (in on scroll up and down)"

git add apps/web/hooks/useScrollReveal.ts
git commit -m "feat(web): add useActiveSection helper for nav tracking"

git push -u origin feat/scroll-reveal-hook

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/scroll-reveal-hook --no-ff -m "Merge branch 'feat/scroll-reveal-hook' into dev"
git push origin dev
git branch -d feat/scroll-reveal-hook
git push origin --delete feat/scroll-reveal-hook
```

### `feat/ui-primitives`
*Build shared UI primitive components*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/ui-primitives

git add apps/web/components/ui/Cursor.tsx
git commit -m "feat(web): add custom cursor with lerp-smoothed ring"

git add apps/web/components/ui/ThemeToggle.tsx
git commit -m "feat(web): add dark mode toggle synced to html class"

git add apps/web/components/ui/SubscribeWidget.tsx
git commit -m "feat(web): add subscribe widget wired to POST /subscribe"

git push -u origin feat/ui-primitives

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/ui-primitives --no-ff -m "Merge branch 'feat/ui-primitives' into dev"
git push origin dev
git branch -d feat/ui-primitives
git push origin --delete feat/ui-primitives
```

### `feat/portfolio-homepage-assembly`
*Assemble the full portfolio homepage*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/portfolio-homepage-assembly

git add apps/web/app/(portfolio)/page.tsx
git commit -m "feat(web): assemble homepage from all portfolio sections"

git add apps/web/app/(portfolio)/ScrollInit.tsx
git commit -m "feat(web): add client-side scroll reveal + pageview tracking init"

git add apps/web/lib/api.ts
git commit -m "feat(web): add typed API client wrapper"

git push -u origin feat/portfolio-homepage-assembly

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/portfolio-homepage-assembly --no-ff -m "Merge branch 'feat/portfolio-homepage-assembly' into dev"
git push origin dev
git branch -d feat/portfolio-homepage-assembly
git push origin --delete feat/portfolio-homepage-assembly
```

### `feat/dashboard-layout-auth-guard`
*Build the protected dashboard shell*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/dashboard-layout-auth-guard

git add apps/web/app/(dashboard)/layout.tsx
git commit -m "feat(web): add dashboard sidebar layout"

git add apps/web/app/(dashboard)/layout.tsx
git commit -m "feat(web): add client-side auth guard with silent token refresh"

git add apps/web/app/auth/login/page.tsx
git commit -m "feat(web): add admin login page"

git push -u origin feat/dashboard-layout-auth-guard

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/dashboard-layout-auth-guard --no-ff -m "Merge branch 'feat/dashboard-layout-auth-guard' into dev"
git push origin dev
git branch -d feat/dashboard-layout-auth-guard
git push origin --delete feat/dashboard-layout-auth-guard
```

### `feat/dashboard-overview-page`
*Build the dashboard overview page*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/dashboard-overview-page

git add apps/web/app/(dashboard)/dashboard/page.tsx
git commit -m "feat(web): add overview page with stat cards"

git add apps/web/app/(dashboard)/dashboard/page.tsx
git commit -m "feat(web): wire overview charts to analytics API (Recharts)"

git add apps/web/app/(dashboard)/dashboard/page.tsx
git commit -m "style(web): add loading skeleton states for stat cards"

git push -u origin feat/dashboard-overview-page

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/dashboard-overview-page --no-ff -m "Merge branch 'feat/dashboard-overview-page' into dev"
git push origin dev
git branch -d feat/dashboard-overview-page
git push origin --delete feat/dashboard-overview-page
```

### `feat/dashboard-projects-crud-ui`
*Build the dashboard projects management UI*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/dashboard-projects-crud-ui

git add apps/web/app/(dashboard)/dashboard/projects/page.tsx
git commit -m "feat(web): add projects list with era filter"

git add apps/web/app/(dashboard)/dashboard/projects/page.tsx
git commit -m "feat(web): add project create/edit form"

git add apps/web/app/(dashboard)/dashboard/projects/page.tsx
git commit -m "feat(web): add publish/feature toggle buttons"

git push -u origin feat/dashboard-projects-crud-ui

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/dashboard-projects-crud-ui --no-ff -m "Merge branch 'feat/dashboard-projects-crud-ui' into dev"
git push origin dev
git branch -d feat/dashboard-projects-crud-ui
git push origin --delete feat/dashboard-projects-crud-ui
```

### `feat/dashboard-blog-editor-ui`
*Build the dashboard blog editor UI*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/dashboard-blog-editor-ui

git add apps/web/app/(dashboard)/dashboard/blog/page.tsx
git commit -m "feat(web): add blog post list with status badges"

git add apps/web/app/(dashboard)/dashboard/blog/page.tsx
git commit -m "feat(web): add MDX content textarea editor"

git add apps/web/app/(dashboard)/dashboard/blog/page.tsx
git commit -m "feat(web): add publish + notify subscribers action"

git push -u origin feat/dashboard-blog-editor-ui

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/dashboard-blog-editor-ui --no-ff -m "Merge branch 'feat/dashboard-blog-editor-ui' into dev"
git push origin dev
git branch -d feat/dashboard-blog-editor-ui
git push origin --delete feat/dashboard-blog-editor-ui
```

### `feat/dashboard-subscribers-ui`
*Build the dashboard subscribers UI*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/dashboard-subscribers-ui

git add apps/web/app/(dashboard)/dashboard/subscribers/page.tsx
git commit -m "feat(web): add subscriber list with status filter"

git add apps/web/app/(dashboard)/dashboard/subscribers/page.tsx
git commit -m "feat(web): add CSV export action"

git add apps/web/app/(dashboard)/dashboard/subscribers/page.tsx
git commit -m "feat(web): add GDPR delete action with confirmation"

git push -u origin feat/dashboard-subscribers-ui

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/dashboard-subscribers-ui --no-ff -m "Merge branch 'feat/dashboard-subscribers-ui' into dev"
git push origin dev
git branch -d feat/dashboard-subscribers-ui
git push origin --delete feat/dashboard-subscribers-ui
```

### `feat/blog-public-pages`
*Build public-facing blog pages*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/blog-public-pages

git add apps/web/app/(portfolio)/blog/page.tsx
git commit -m "feat(web): add public blog list page"

git add apps/web/app/(portfolio)/blog/page.tsx
git commit -m "feat(web): add tag filter query param support"

git add apps/web/app/(portfolio)/blog/[slug]/page.tsx
git commit -m "feat(web): add blog post detail page with MDX rendering"

git push -u origin feat/blog-public-pages

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/blog-public-pages --no-ff -m "Merge branch 'feat/blog-public-pages' into dev"
git push origin dev
git branch -d feat/blog-public-pages
git push origin --delete feat/blog-public-pages
```

### `feat/unsubscribe-page`
*Build the public unsubscribe landing page*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/unsubscribe-page

git add apps/web/app/unsubscribe/page.tsx
git commit -m "feat(web): add unsubscribe confirmation page"

git add apps/web/app/unsubscribe/page.tsx
git commit -m "feat(web): add LaujeSpinner and re-subscribe link"

git add apps/api/src/routes/subscribers.routes.ts
git commit -m "feat(api): wire unsubscribe token verification to the page"

git push -u origin feat/unsubscribe-page

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/unsubscribe-page --no-ff -m "Merge branch 'feat/unsubscribe-page' into dev"
git push origin dev
git branch -d feat/unsubscribe-page
git push origin --delete feat/unsubscribe-page
```

## Milestone 0.3.0 — AI Layer

### `feat/openrouter-service`
*Build the shared OpenRouter service layer*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/openrouter-service

git add apps/api/src/services/openrouter.service.ts
git commit -m "feat(api): add 7-model registry with token ceilings"

git add apps/api/src/services/openrouter.service.ts
git commit -m "feat(api): add SSE stream-to-response helper"

git add apps/api/src/services/openrouter.service.ts
git commit -m "feat(api): add system prompts for chat, blog, project, insights"

git push -u origin feat/openrouter-service

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/openrouter-service --no-ff -m "Merge branch 'feat/openrouter-service' into dev"
git push origin dev
git branch -d feat/openrouter-service
git push origin --delete feat/openrouter-service
```

### `feat/ai-routes`
*Build the AI API endpoints*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/ai-routes

git add apps/api/src/routes/ai.routes.ts
git commit -m "feat(api): add POST /ai/chat/stream public portfolio chat"

git add apps/api/src/routes/ai.routes.ts
git commit -m "feat(api): add POST /ai/generate/blog/stream admin endpoint"

git add apps/api/src/routes/ai.routes.ts
git commit -m "feat(api): add POST /ai/generate/project and /ai/insights"

git add apps/api/src/routes/ai.routes.ts
git commit -m "feat(api): add POST /ai/complete generic completion endpoint"

git push -u origin feat/ai-routes

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/ai-routes --no-ff -m "Merge branch 'feat/ai-routes' into dev"
git push origin dev
git branch -d feat/ai-routes
git push origin --delete feat/ai-routes
```

### `feat/models-client-lib`
*Add web-side model registry and SSE client*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/models-client-lib

git add apps/web/lib/models.ts
git commit -m "feat(web): mirror model registry on the client"

git add apps/web/lib/models.ts
git commit -m "feat(web): add streamSSE() consumer for SSE endpoints"

git add apps/web/lib/models.ts
git commit -m "feat(web): add callAI() for non-streaming endpoints"

git push -u origin feat/models-client-lib

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/models-client-lib --no-ff -m "Merge branch 'feat/models-client-lib' into dev"
git push origin dev
git branch -d feat/models-client-lib
git push origin --delete feat/models-client-lib
```

### `feat/ai-chat-widget`
*Build the floating AI chat widget*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/ai-chat-widget

git add apps/web/components/portfolio/AiChat.tsx
git commit -m "feat(web): add floating chat trigger and panel"

git add apps/web/components/portfolio/AiChat.tsx
git commit -m "feat(web): wire streaming response into message bubbles"

git add apps/web/components/portfolio/AiChat.tsx
git commit -m "feat(web): add quick-question suggestion buttons"

git push -u origin feat/ai-chat-widget

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/ai-chat-widget --no-ff -m "Merge branch 'feat/ai-chat-widget' into dev"
git push origin dev
git branch -d feat/ai-chat-widget
git push origin --delete feat/ai-chat-widget
```

### `feat/model-selector-component`
*Build shared model selector UI*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/model-selector-component

git add apps/web/components/dashboard/ModelSelector.tsx
git commit -m "feat(web): add ModelSelector card grid"

git add apps/web/components/dashboard/ModelSelector.tsx
git commit -m "feat(web): add compact ModelDropdown variant"

git add apps/web/components/dashboard/ModelSelector.tsx
git commit -m "style(web): add speed badge and token-limit display"

git push -u origin feat/model-selector-component

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/model-selector-component --no-ff -m "Merge branch 'feat/model-selector-component' into dev"
git push origin dev
git branch -d feat/model-selector-component
git push origin --delete feat/model-selector-component
```

### `feat/ai-blog-writer`
*Build the AI blog draft generator UI*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/ai-blog-writer

git add apps/web/components/dashboard/AiBlogWriter.tsx
git commit -m "feat(web): add topic/outline/tone input form"

git add apps/web/components/dashboard/AiBlogWriter.tsx
git commit -m "feat(web): stream draft into live preview pane"

git add apps/web/components/dashboard/AiBlogWriter.tsx
git commit -m "feat(web): add insert-into-editor action"

git push -u origin feat/ai-blog-writer

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/ai-blog-writer --no-ff -m "Merge branch 'feat/ai-blog-writer' into dev"
git push origin dev
git branch -d feat/ai-blog-writer
git push origin --delete feat/ai-blog-writer
```

### `feat/ai-project-enhancer`
*Build the AI project copy enhancer UI*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/ai-project-enhancer

git add apps/web/components/dashboard/AiProjectEnhancer.tsx
git commit -m "feat(web): add raw-notes input and era selector"

git add apps/web/components/dashboard/AiProjectEnhancer.tsx
git commit -m "feat(web): render structured JSON enhancement fields"

git add apps/web/components/dashboard/AiProjectEnhancer.tsx
git commit -m "feat(web): add per-field and apply-all actions"

git push -u origin feat/ai-project-enhancer

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/ai-project-enhancer --no-ff -m "Merge branch 'feat/ai-project-enhancer' into dev"
git push origin dev
git branch -d feat/ai-project-enhancer
git push origin --delete feat/ai-project-enhancer
```

### `feat/ai-insights-panel`
*Build the AI analytics insights panel*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/ai-insights-panel

git add apps/web/components/dashboard/AiInsights.tsx
git commit -m "feat(web): add run-analysis trigger and loading state"

git add apps/web/components/dashboard/AiInsights.tsx
git commit -m "feat(web): render prioritized insight cards"

git add apps/web/components/dashboard/AiInsights.tsx
git commit -m "feat(web): add empty state and model selector integration"

git push -u origin feat/ai-insights-panel

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/ai-insights-panel --no-ff -m "Merge branch 'feat/ai-insights-panel' into dev"
git push origin dev
git branch -d feat/ai-insights-panel
git push origin --delete feat/ai-insights-panel
```

### `feat/threejs-hero-particles`
*Replace CSS hero background with Three.js particle field*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/threejs-hero-particles

git add apps/web/components/portfolio/HeroThreeJS.tsx
git commit -m "feat(web): add Sawaki diamond lattice particle geometry"

git add apps/web/components/portfolio/HeroThreeJS.tsx
git commit -m "feat(web): add custom ShaderMaterial for soft-circle points"

git add apps/web/components/portfolio/HeroThreeJS.tsx
git commit -m "feat(web): add mouse-reactive displacement field"

git add apps/web/components/portfolio/Hero.tsx
git commit -m "feat(web): load HeroThreeJS via next/dynamic with ssr:false"

git push -u origin feat/threejs-hero-particles

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/threejs-hero-particles --no-ff -m "Merge branch 'feat/threejs-hero-particles' into dev"
git push origin dev
git branch -d feat/threejs-hero-particles
git push origin --delete feat/threejs-hero-particles
```

### `feat/d3-charts-suite`
*Build the full D3.js chart component suite*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/d3-charts-suite

git add apps/web/components/dashboard/D3Charts.tsx
git commit -m "feat(web): add D3AreaChart with animated line draw"

git add apps/web/components/dashboard/D3Charts.tsx
git commit -m "feat(web): add D3Donut with arc entrance transition"

git add apps/web/components/dashboard/D3Charts.tsx
git commit -m "feat(web): add D3HBarChart with staggered bar entrance"

git add apps/web/components/dashboard/D3Charts.tsx
git commit -m "feat(web): add D3RadialSkills and D3Sparkline"

git push -u origin feat/d3-charts-suite

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/d3-charts-suite --no-ff -m "Merge branch 'feat/d3-charts-suite' into dev"
git push origin dev
git branch -d feat/d3-charts-suite
git push origin --delete feat/d3-charts-suite
```

### `feat/dashboard-analytics-page`
*Build the full dashboard analytics page*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/dashboard-analytics-page

git add apps/web/app/(dashboard)/dashboard/analytics/page.tsx
git commit -m "feat(web): add analytics page with period selector"

git add apps/web/app/(dashboard)/dashboard/analytics/page.tsx
git commit -m "feat(web): wire D3 charts to analytics API data"

git add apps/web/app/(dashboard)/dashboard/analytics/page.tsx
git commit -m "feat(web): embed AiInsights panel at page bottom"

git push -u origin feat/dashboard-analytics-page

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/dashboard-analytics-page --no-ff -m "Merge branch 'feat/dashboard-analytics-page' into dev"
git push origin dev
git branch -d feat/dashboard-analytics-page
git push origin --delete feat/dashboard-analytics-page
```

### `feat/dashboard-settings-page`
*Build the dashboard settings page*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/dashboard-settings-page

git add apps/web/app/(dashboard)/dashboard/settings/page.tsx
git commit -m "feat(web): add CV upload and site config fields"

git add apps/web/app/(dashboard)/dashboard/settings/page.tsx
git commit -m "feat(web): add AI bio generator section"

git add apps/web/app/(dashboard)/dashboard/settings/page.tsx
git commit -m "feat(web): add password-hash generator helper snippet"

git push -u origin feat/dashboard-settings-page

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/dashboard-settings-page --no-ff -m "Merge branch 'feat/dashboard-settings-page' into dev"
git push origin dev
git branch -d feat/dashboard-settings-page
git push origin --delete feat/dashboard-settings-page
```

## Milestone 0.4.0 — Hardening

### `docs/gap-analysis`
*Document PRD coverage gap analysis*

```bash
git checkout dev
git pull origin dev
git checkout -b docs/gap-analysis

git add GAP_ANALYSIS.html
git commit -m "docs: audit built features against PRD v2 feature list"

git add GAP_ANALYSIS.html
git commit -m "docs: document 6 confirmed bugs with severity ratings"

git add GAP_ANALYSIS.html
git commit -m "docs: document 9 security vulnerabilities with severity ratings"

git push -u origin docs/gap-analysis

# --- merged after review ---
git checkout dev
git pull origin dev
git merge docs/gap-analysis --no-ff -m "Merge branch 'docs/gap-analysis' into dev"
git push origin dev
git branch -d docs/gap-analysis
git push origin --delete docs/gap-analysis
```

### `fix/blog-route-double-prefix`
*Fix BUG-01 — blog create route 404*

```bash
git checkout dev
git pull origin dev
git checkout -b fix/blog-route-double-prefix

git add apps/api/src/routes/blog.routes.ts
git commit -m "fix(api): correct double-prefixed POST /blog/admin route"

git add apps/api/src/routes/blog.routes.ts
git commit -m "test(api): verify POST /blog/admin resolves correctly with prefix"

git add GAP_ANALYSIS.html
git commit -m "docs: mark BUG-01 as fixed in gap analysis"

git push -u origin fix/blog-route-double-prefix

# --- merged after review ---
git checkout dev
git pull origin dev
git merge fix/blog-route-double-prefix --no-ff -m "Merge branch 'fix/blog-route-double-prefix' into dev"
git push origin dev
git branch -d fix/blog-route-double-prefix
git push origin --delete fix/blog-route-double-prefix
```

### `fix/nav-backdrop-css`
*Fix BUG-02 — invalid CSS in nav scroll background*

```bash
git checkout dev
git pull origin dev
git checkout -b fix/nav-backdrop-css

git add apps/web/components/portfolio/Nav.tsx
git commit -m "fix(web): replace invalid rgba(var()) with solid bg + backdrop-filter"

git add apps/web/components/portfolio/Nav.tsx
git commit -m "fix(web): add WebkitBackdropFilter for Safari support"

git add GAP_ANALYSIS.html
git commit -m "docs: mark BUG-02 as fixed in gap analysis"

git push -u origin fix/nav-backdrop-css

# --- merged after review ---
git checkout dev
git pull origin dev
git merge fix/nav-backdrop-css --no-ff -m "Merge branch 'fix/nav-backdrop-css' into dev"
git push origin dev
git branch -d fix/nav-backdrop-css
git push origin --delete fix/nav-backdrop-css
```

### `fix/scroll-reveal-memory-leak`
*Fix BUG-03 — scroll reveal observer churn*

```bash
git checkout dev
git pull origin dev
git checkout -b fix/scroll-reveal-memory-leak

git add apps/web/hooks/useScrollReveal.ts
git commit -m "fix(web): stabilize IntersectionObserver with empty deps array"

git add apps/web/hooks/useScrollReveal.ts
git commit -m "fix(web): add MutationObserver for dynamically-added .reveal elements"

git add apps/web/hooks/useScrollReveal.ts
git commit -m "fix(web): add data-rv marker to prevent duplicate observation"

git push -u origin fix/scroll-reveal-memory-leak

# --- merged after review ---
git checkout dev
git pull origin dev
git merge fix/scroll-reveal-memory-leak --no-ff -m "Merge branch 'fix/scroll-reveal-memory-leak' into dev"
git push origin dev
git branch -d fix/scroll-reveal-memory-leak
git push origin --delete fix/scroll-reveal-memory-leak
```

### `fix/d3-dark-mode-colors`
*Fix BUG-04 — D3 charts frozen palette after theme toggle*

```bash
git checkout dev
git pull origin dev
git checkout -b fix/d3-dark-mode-colors

git add apps/web/components/dashboard/D3Charts.tsx
git commit -m "fix(web): add useDarkMode() MutationObserver hook"

git add apps/web/components/dashboard/D3Charts.tsx
git commit -m "fix(web): add dark to every chart's effect dependency array"

git add apps/web/components/dashboard/D3Charts.tsx
git commit -m "fix(web): apply fix across all five chart components"

git push -u origin fix/d3-dark-mode-colors

# --- merged after review ---
git checkout dev
git pull origin dev
git merge fix/d3-dark-mode-colors --no-ff -m "Merge branch 'fix/d3-dark-mode-colors' into dev"
git push origin dev
git branch -d fix/d3-dark-mode-colors
git push origin --delete fix/d3-dark-mode-colors
```

### `fix/hero-use-client-directive`
*Fix BUG-05 — missing use client on Hero.tsx*

```bash
git checkout dev
git pull origin dev
git checkout -b fix/hero-use-client-directive

git add apps/web/components/portfolio/Hero.tsx
git commit -m "fix(web): add missing "use client" directive"

git add apps/web/components/portfolio/Hero.tsx
git commit -m "test(web): verify no SSR/hydration mismatch warnings"

git add GAP_ANALYSIS.html
git commit -m "docs: mark BUG-05 as fixed in gap analysis"

git push -u origin fix/hero-use-client-directive

# --- merged after review ---
git checkout dev
git pull origin dev
git merge fix/hero-use-client-directive --no-ff -m "Merge branch 'fix/hero-use-client-directive' into dev"
git push origin dev
git branch -d fix/hero-use-client-directive
git push origin --delete fix/hero-use-client-directive
```

### `fix/token-persistence-refresh`
*Fix BUG-06 — admin session lost on page refresh*

```bash
git checkout dev
git pull origin dev
git checkout -b fix/token-persistence-refresh

git add apps/web/lib/api.ts
git commit -m "fix(web): add sessionStorage cache layer for access token"

git add apps/web/lib/api.ts
git commit -m "fix(web): load cached token before triggering refresh flow"

git add apps/web/lib/api.ts
git commit -m "fix(web): clear cached token on failed refresh"

git push -u origin fix/token-persistence-refresh

# --- merged after review ---
git checkout dev
git pull origin dev
git merge fix/token-persistence-refresh --no-ff -m "Merge branch 'fix/token-persistence-refresh' into dev"
git push origin dev
git branch -d fix/token-persistence-refresh
git push origin --delete fix/token-persistence-refresh
```

### `security/api-hardening-helmet-bodylimit`
*SEC-01 / SEC-02 — body limits and security headers*

```bash
git checkout dev
git pull origin dev
git checkout -b security/api-hardening-helmet-bodylimit

git add apps/api/src/server.ts
git commit -m "security(api): add 512KB global body size limit"

git add apps/api/src/server.ts
git commit -m "security(api): register @fastify/helmet with strict CSP"

git add apps/web/next.config.ts
git commit -m "security(web): mirror security headers via next.config headers()"

git push -u origin security/api-hardening-helmet-bodylimit

# --- merged after review ---
git checkout dev
git pull origin dev
git merge security/api-hardening-helmet-bodylimit --no-ff -m "Merge branch 'security/api-hardening-helmet-bodylimit' into dev"
git push origin dev
git branch -d security/api-hardening-helmet-bodylimit
git push origin --delete security/api-hardening-helmet-bodylimit
```

### `security/ai-prompt-injection-guard`
*SEC-03 — prompt injection defense on public chat*

```bash
git checkout dev
git pull origin dev
git checkout -b security/ai-prompt-injection-guard

git add apps/api/src/routes/ai.routes.ts
git commit -m "security(api): add sanitizeUserMessage() pattern filter"

git add apps/api/src/routes/ai.routes.ts
git commit -m "security(api): append trailing system guard message"

git add apps/api/src/routes/ai.routes.ts
git commit -m "security(api): tighten public chat body limit to 5KB"

git push -u origin security/ai-prompt-injection-guard

# --- merged after review ---
git checkout dev
git pull origin dev
git merge security/ai-prompt-injection-guard --no-ff -m "Merge branch 'security/ai-prompt-injection-guard' into dev"
git push origin dev
git branch -d security/ai-prompt-injection-guard
git push origin --delete security/ai-prompt-injection-guard
```

### `security/startup-env-validation`
*SEC-04 / SEC-06 — startup env validation*

```bash
git checkout dev
git pull origin dev
git checkout -b security/startup-env-validation

git add apps/api/src/server.ts
git commit -m "security(api): add requireEnv() helper, enforce 32-char JWT_SECRET"

git add apps/api/src/server.ts
git commit -m "security(api): warn at boot if OPENROUTER_API_KEY is missing"

git add apps/api/src/server.ts
git commit -m "security(api): throw at startup instead of allowing an empty JWT secret"

git push -u origin security/startup-env-validation

# --- merged after review ---
git checkout dev
git pull origin dev
git merge security/startup-env-validation --no-ff -m "Merge branch 'security/startup-env-validation' into dev"
git push origin dev
git branch -d security/startup-env-validation
git push origin --delete security/startup-env-validation
```

### `security/analytics-referrer-validation`
*SEC-05 — sanitize analytics referrer field*

```bash
git checkout dev
git pull origin dev
git checkout -b security/analytics-referrer-validation

git add apps/api/src/routes/analytics.routes.ts
git commit -m "security(api): validate referrer as real URL before storing"

git add apps/api/src/routes/analytics.routes.ts
git commit -m "security(api): cap referrer length at 500 characters"

git add apps/api/src/routes/blog.routes.ts
git commit -m "security(api): apply same referrer validation to blog pageview logging"

git push -u origin security/analytics-referrer-validation

# --- merged after review ---
git checkout dev
git pull origin dev
git merge security/analytics-referrer-validation --no-ff -m "Merge branch 'security/analytics-referrer-validation' into dev"
git push origin dev
git branch -d security/analytics-referrer-validation
git push origin --delete security/analytics-referrer-validation
```

### `security/subscriber-disposable-domains`
*SEC-07 — block disposable email domains*

```bash
git checkout dev
git pull origin dev
git checkout -b security/subscriber-disposable-domains

git add apps/api/src/routes/subscribers.routes.ts
git commit -m "security(api): add 22-domain disposable email blocklist"

git add apps/api/src/routes/subscribers.routes.ts
git commit -m "security(api): reject subscribe requests from blocklisted domains"

git add GAP_ANALYSIS.html
git commit -m "docs: mark SEC-07 as fixed in gap analysis"

git push -u origin security/subscriber-disposable-domains

# --- merged after review ---
git checkout dev
git pull origin dev
git merge security/subscriber-disposable-domains --no-ff -m "Merge branch 'security/subscriber-disposable-domains' into dev"
git push origin dev
git branch -d security/subscriber-disposable-domains
git push origin --delete security/subscriber-disposable-domains
```

### `security/ai-token-ceiling`
*SEC-08 — hard cap AI completion token limits*

```bash
git checkout dev
git pull origin dev
git checkout -b security/ai-token-ceiling

git add apps/api/src/routes/ai.routes.ts
git commit -m "security(api): cap /ai/complete max_tokens regardless of client input"

git add apps/api/src/routes/ai.routes.ts
git commit -m "security(api): apply Math.min ceiling against model's own registry limit"

git add GAP_ANALYSIS.html
git commit -m "docs: mark SEC-08 as fixed in gap analysis"

git push -u origin security/ai-token-ceiling

# --- merged after review ---
git checkout dev
git pull origin dev
git merge security/ai-token-ceiling --no-ff -m "Merge branch 'security/ai-token-ceiling' into dev"
git push origin dev
git branch -d security/ai-token-ceiling
git push origin --delete security/ai-token-ceiling
```

### `security/cors-origin-validation`
*SEC-09 — validate CORS_ORIGIN as real URLs*

```bash
git checkout dev
git pull origin dev
git checkout -b security/cors-origin-validation

git add apps/api/src/server.ts
git commit -m "security(api): parse and validate CORS_ORIGIN at startup"

git add apps/api/src/server.ts
git commit -m "security(api): support comma-separated multi-origin CORS_ORIGIN"

git add GAP_ANALYSIS.html
git commit -m "docs: mark SEC-09 as fixed in gap analysis"

git push -u origin security/cors-origin-validation

# --- merged after review ---
git checkout dev
git pull origin dev
git merge security/cors-origin-validation --no-ff -m "Merge branch 'security/cors-origin-validation' into dev"
git push origin dev
git branch -d security/cors-origin-validation
git push origin --delete security/cors-origin-validation
```

### `fix/postcss-config-missing`
*INF-01 — Tailwind not compiling*

```bash
git checkout dev
git pull origin dev
git checkout -b fix/postcss-config-missing

git add apps/web/postcss.config.js
git commit -m "fix(web): add missing postcss.config.js — tailwind directives were no-ops"

git add apps/web/postcss.config.js
git commit -m "test(web): verify tailwind classes compile into shipped CSS"

git add GAP_ANALYSIS.html
git commit -m "docs: mark INF-01 as fixed in gap analysis"

git push -u origin fix/postcss-config-missing

# --- merged after review ---
git checkout dev
git pull origin dev
git merge fix/postcss-config-missing --no-ff -m "Merge branch 'fix/postcss-config-missing' into dev"
git push origin dev
git branch -d fix/postcss-config-missing
git push origin --delete fix/postcss-config-missing
```

### `feat/dashboard-route-middleware`
*INF-02 — server-side dashboard protection*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/dashboard-route-middleware

git add apps/web/middleware.ts
git commit -m "feat(web): add middleware.ts for server-side dashboard route protection"

git add apps/web/middleware.ts
git commit -m "feat(web): add security headers to middleware response"

git add apps/web/middleware.ts
git commit -m "feat(web): redirect authenticated users away from /auth/login"

git push -u origin feat/dashboard-route-middleware

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/dashboard-route-middleware --no-ff -m "Merge branch 'feat/dashboard-route-middleware' into dev"
git push origin dev
git branch -d feat/dashboard-route-middleware
git push origin --delete feat/dashboard-route-middleware
```

### `feat/email-history-tab`
*INF-03 — notification history UI*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/email-history-tab

git add apps/web/app/(dashboard)/dashboard/subscribers/page.tsx
git commit -m "feat(web): add Email History tab to subscribers page"

git add apps/web/app/(dashboard)/dashboard/subscribers/page.tsx
git commit -m "feat(web): render send-history table with recipient counts"

git add apps/web/app/(dashboard)/dashboard/subscribers/page.tsx
git commit -m "feat(web): add summary stat chips above history table"

git push -u origin feat/email-history-tab

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/email-history-tab --no-ff -m "Merge branch 'feat/email-history-tab' into dev"
git push origin dev
git branch -d feat/email-history-tab
git push origin --delete feat/email-history-tab
```

## Milestone 0.5.0 — Interactive Features

### `feat/terminal-easter-egg`
*FR-016 — build the terminal CLI easter egg*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/terminal-easter-egg

git add apps/web/components/portfolio/Terminal.tsx
git commit -m "feat(web): add terminal overlay with slash-key trigger"

git add apps/web/components/portfolio/Terminal.tsx
git commit -m "feat(web): add help/whoami/ls/cat/open/skills/contact commands"

git add apps/web/components/portfolio/Terminal.tsx
git commit -m "feat(web): add live projects fetch and streaming ai command"

git add apps/web/components/portfolio/Terminal.tsx
git commit -m "feat(web): add command history navigation and tab completion"

git push -u origin feat/terminal-easter-egg

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/terminal-easter-egg --no-ff -m "Merge branch 'feat/terminal-easter-egg' into dev"
git push origin dev
git branch -d feat/terminal-easter-egg
git push origin --delete feat/terminal-easter-egg
```

### `feat/testimonials-section`
*FR-018 — build the testimonials section*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/testimonials-section

git add apps/web/components/portfolio/Testimonials.tsx
git commit -m "feat(web): add testimonial card with KwalbaFrame avatar"

git add apps/web/components/portfolio/Testimonials.tsx
git commit -m "feat(web): add era badges and LinkedIn verification links"

git add apps/web/components/portfolio/Testimonials.tsx
git commit -m "style(web): tune card border accents per testimonial era"

git push -u origin feat/testimonials-section

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/testimonials-section --no-ff -m "Merge branch 'feat/testimonials-section' into dev"
git push origin dev
git branch -d feat/testimonials-section
git push origin --delete feat/testimonials-section
```

### `feat/d3-journey-map`
*FR-019 — build the interactive Hausa journey map*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/d3-journey-map

git add apps/web/components/portfolio/JourneyMap.tsx
git commit -m "feat(web): add D3 geo projection centered on Kano"

git add apps/web/components/portfolio/JourneyMap.tsx
git commit -m "feat(web): add seven-stop journey path with animated draw-on"

git add apps/web/components/portfolio/JourneyMap.tsx
git commit -m "feat(web): add click-to-select detail panel and timeline strip"

git push -u origin feat/d3-journey-map

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/d3-journey-map --no-ff -m "Merge branch 'feat/d3-journey-map' into dev"
git push origin dev
git branch -d feat/d3-journey-map
git push origin --delete feat/d3-journey-map
```

### `feat/project-demo-embed`
*FR-020 — build embedded live project demos*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/project-demo-embed

git add apps/web/components/portfolio/ProjectDemo.tsx
git commit -m "feat(web): add sandboxed iframe with browser-chrome UI"

git add apps/web/components/portfolio/ProjectDemo.tsx
git commit -m "feat(web): add X-Frame-Options block detection with timeout"

git add apps/web/components/portfolio/ProjectDemo.tsx
git commit -m "feat(web): add fullscreen expand modal"

git push -u origin feat/project-demo-embed

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/project-demo-embed --no-ff -m "Merge branch 'feat/project-demo-embed' into dev"
git push origin dev
git branch -d feat/project-demo-embed
git push origin --delete feat/project-demo-embed
```

### `feat/reading-mode-highlight-share`
*FR-021 — build collaborative reading mode*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/reading-mode-highlight-share

git add apps/web/components/portfolio/ReadingMode.tsx
git commit -m "feat(web): add text-selection detection and popup"

git add apps/web/components/portfolio/ReadingMode.tsx
git commit -m "feat(web): add Canvas-based highlight card renderer"

git add apps/web/components/portfolio/ReadingMode.tsx
git commit -m "feat(web): add copy-quote and download-PNG actions"

git push -u origin feat/reading-mode-highlight-share

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/reading-mode-highlight-share --no-ff -m "Merge branch 'feat/reading-mode-highlight-share' into dev"
git push origin dev
git branch -d feat/reading-mode-highlight-share
git push origin --delete feat/reading-mode-highlight-share
```

### `feat/wire-new-sections-into-pages`
*Wire FR-016/018/019/020/021 into live pages*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/wire-new-sections-into-pages

git add apps/web/app/(portfolio)/page.tsx
git commit -m "feat(web): add Terminal, JourneyMap, Testimonials to homepage"

git add apps/web/app/(portfolio)/blog/[slug]/page.tsx
git commit -m "feat(web): wrap blog content in ReadingMode"

git add apps/web/app/(portfolio)/projects/[slug]/page.tsx
git commit -m "feat(web): embed ProjectDemo for SaaS-era projects"

git push -u origin feat/wire-new-sections-into-pages

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/wire-new-sections-into-pages --no-ff -m "Merge branch 'feat/wire-new-sections-into-pages' into dev"
git push origin dev
git branch -d feat/wire-new-sections-into-pages
git push origin --delete feat/wire-new-sections-into-pages
```

### `feat/projects-archive-page`
*Build the public projects archive page*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/projects-archive-page

git add apps/web/app/(portfolio)/projects/page.tsx
git commit -m "feat(web): add full projects archive grouped by era"

git add apps/web/app/(portfolio)/projects/SkillsRadar.tsx
git commit -m "feat(web): add stack-frequency D3 radar chart"

git add apps/web/app/(portfolio)/projects/page.tsx
git commit -m "feat(web): add stat cards for total projects per era"

git push -u origin feat/projects-archive-page

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/projects-archive-page --no-ff -m "Merge branch 'feat/projects-archive-page' into dev"
git push origin dev
git branch -d feat/projects-archive-page
git push origin --delete feat/projects-archive-page
```

### `feat/project-blog-detail-pages`
*Build individual project and blog detail pages*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/project-blog-detail-pages

git add apps/web/app/(portfolio)/projects/[slug]/page.tsx
git commit -m "feat(web): add project case-study detail page"

git add apps/web/app/(portfolio)/blog/[slug]/page.tsx
git commit -m "feat(web): add blog post detail page with related posts"

git add apps/web/app/(portfolio)/projects/[slug]/page.tsx
git commit -m "feat(web): add metrics grid rendering from JSON field"

git push -u origin feat/project-blog-detail-pages

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/project-blog-detail-pages --no-ff -m "Merge branch 'feat/project-blog-detail-pages' into dev"
git push origin dev
git branch -d feat/project-blog-detail-pages
git push origin --delete feat/project-blog-detail-pages
```

## Milestone 0.6.0 — Module Resolution & Types

### `feat/contact-message-schema`
*Add ContactMessage model to schema*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/contact-message-schema

git add packages/db/schema.prisma
git commit -m "feat(db): add ContactMessage model with read flag and IP/UA metadata"

git add packages/types/src/index.ts
git commit -m "feat(types): add ContactMessage and ContactCreateInput types"

git add packages/db/schema.prisma
git commit -m "feat(db): add index on read + createdAt for inbox query performance"

git push -u origin feat/contact-message-schema

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/contact-message-schema --no-ff -m "Merge branch 'feat/contact-message-schema' into dev"
git push origin dev
git branch -d feat/contact-message-schema
git push origin --delete feat/contact-message-schema
```

### `feat/contact-form-system`
*Build the full contact form system*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/contact-form-system

git add apps/api/src/routes/contact.routes.ts
git commit -m "feat(api): add POST /contact with honeypot and rate limit"

git add apps/api/src/routes/contact.routes.ts
git commit -m "feat(api): add admin contacts CRUD + unread-count routes"

git add apps/api/src/server.ts
git commit -m "feat(api): register contact routes"

git add apps/web/components/portfolio/ContactForm.tsx
git commit -m "feat(web): replace copy-email pattern with real contact form"

git push -u origin feat/contact-form-system

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/contact-form-system --no-ff -m "Merge branch 'feat/contact-form-system' into dev"
git push origin dev
git branch -d feat/contact-form-system
git push origin --delete feat/contact-form-system
```

### `feat/dashboard-contacts-inbox`
*Build the dashboard contact inbox*

```bash
git checkout dev
git pull origin dev
git checkout -b feat/dashboard-contacts-inbox

git add apps/web/app/(dashboard)/dashboard/contacts/page.tsx
git commit -m "feat(web): add inbox list/detail pane"

git add apps/web/app/(dashboard)/dashboard/contacts/page.tsx
git commit -m "feat(web): add mark read/unread and delete actions"

git add apps/web/app/(dashboard)/layout.tsx
git commit -m "feat(web): add Inbox nav item with live unread badge polling"

git push -u origin feat/dashboard-contacts-inbox

# --- merged after review ---
git checkout dev
git pull origin dev
git merge feat/dashboard-contacts-inbox --no-ff -m "Merge branch 'feat/dashboard-contacts-inbox' into dev"
git push origin dev
git branch -d feat/dashboard-contacts-inbox
git push origin --delete feat/dashboard-contacts-inbox
```

### `fix/module-resolution-workspace`
*Fix Cannot find module '@devcraft/types'*

```bash
git checkout dev
git pull origin dev
git checkout -b fix/module-resolution-workspace

git add pnpm-workspace.yaml
git commit -m "fix(chore): add missing pnpm-workspace.yaml — pnpm ignores package.json workspaces field"

git add apps/web/tsconfig.json
git commit -m "fix(web): add missing tsconfig.json with bundler module resolution"

git add packages/types/tsconfig.json
git commit -m "fix(types): add missing composite tsconfig.json"

git add packages/db/tsconfig.json
git commit -m "fix(db): add missing composite tsconfig.json"

git push -u origin fix/module-resolution-workspace

# --- merged after review ---
git checkout dev
git pull origin dev
git merge fix/module-resolution-workspace --no-ff -m "Merge branch 'fix/module-resolution-workspace' into dev"
git push origin dev
git branch -d fix/module-resolution-workspace
git push origin --delete fix/module-resolution-workspace
```

### `refactor/tsconfig-extends-chain`
*Wire proper tsconfig extends chain*

```bash
git checkout dev
git pull origin dev
git checkout -b refactor/tsconfig-extends-chain

git add apps/web/tsconfig.json
git commit -m "refactor(web): extend root tsconfig.base.json"

git add apps/api/tsconfig.json
git commit -m "refactor(api): extend root tsconfig.base.json"

git add packages/types/tsconfig.json
git commit -m "refactor(types): extend root tsconfig.base.json"

git add packages/db/tsconfig.json
git commit -m "refactor(db): extend root tsconfig.base.json"

git push -u origin refactor/tsconfig-extends-chain

# --- merged after review ---
git checkout dev
git pull origin dev
git merge refactor/tsconfig-extends-chain --no-ff -m "Merge branch 'refactor/tsconfig-extends-chain' into dev"
git push origin dev
git branch -d refactor/tsconfig-extends-chain
git push origin --delete refactor/tsconfig-extends-chain
```

### `fix/fetch-next-revalidate-typing`
*Fix fetch + next.revalidate type error*

```bash
git checkout dev
git pull origin dev
git checkout -b fix/fetch-next-revalidate-typing

git add apps/web/lib/fetch.ts
git commit -m "fix(web): add NextFetchInit type and fetchJSON/fetchList helpers"

git add apps/web/app/(portfolio)/page.tsx
git commit -m "fix(web): use fetchList() instead of raw fetch with next option"

git add apps/web/app/(portfolio)/blog/[slug]/page.tsx
git commit -m "fix(web): use fetchJSON() and return notFound() narrowing pattern"

git add apps/web/app/(portfolio)/projects/[slug]/page.tsx
git commit -m "fix(web): apply same fetchJSON() and notFound() narrowing fix"

git push -u origin fix/fetch-next-revalidate-typing

# --- merged after review ---
git checkout dev
git pull origin dev
git merge fix/fetch-next-revalidate-typing --no-ff -m "Merge branch 'fix/fetch-next-revalidate-typing' into dev"
git push origin dev
git branch -d fix/fetch-next-revalidate-typing
git push origin --delete fix/fetch-next-revalidate-typing
```

### `refactor/typescript-strict-sweep-components`
*Eliminate any types across portfolio components*

```bash
git checkout dev
git pull origin dev
git checkout -b refactor/typescript-strict-sweep-components

git add apps/web/components/portfolio/Terminal.tsx
git commit -m "refactor(web): replace React.KeyboardEvent namespace with named import"

git add apps/web/components/portfolio/ReadingMode.tsx
git commit -m "refactor(web): type resolve, line/i, r/i params — remove implicit any"

git add apps/web/components/portfolio/ContactForm.tsx
git commit -m "refactor(web): add ReactNode named import, typed Field component"

git add apps/web/components/portfolio/AiChat.tsx
git commit -m "refactor(web): type delta, m callbacks with Message interface"

git push -u origin refactor/typescript-strict-sweep-components

# --- merged after review ---
git checkout dev
git pull origin dev
git merge refactor/typescript-strict-sweep-components --no-ff -m "Merge branch 'refactor/typescript-strict-sweep-components' into dev"
git push origin dev
git branch -d refactor/typescript-strict-sweep-components
git push origin --delete refactor/typescript-strict-sweep-components
```

### `refactor/typescript-strict-sweep-dashboard`
*Eliminate any types across dashboard components*

```bash
git checkout dev
git pull origin dev
git checkout -b refactor/typescript-strict-sweep-dashboard

git add apps/web/components/dashboard/D3Charts.tsx
git commit -m "refactor(web): type every D3 callback param — d, i, this, event, g"

git add apps/web/components/dashboard/ModelSelector.tsx
git commit -m "refactor(web): add typed MODEL_ENTRIES array, ChangeEvent import"

git add apps/web/components/dashboard/AiInsights.tsx
git commit -m "refactor(web): add InsightPriority/InsightType unions, typed props"

git add apps/web/components/dashboard/AiProjectEnhancer.tsx
git commit -m "refactor(web): import shared Era type instead of local redefinition"

git push -u origin refactor/typescript-strict-sweep-dashboard

# --- merged after review ---
git checkout dev
git pull origin dev
git merge refactor/typescript-strict-sweep-dashboard --no-ff -m "Merge branch 'refactor/typescript-strict-sweep-dashboard' into dev"
git push origin dev
git branch -d refactor/typescript-strict-sweep-dashboard
git push origin --delete refactor/typescript-strict-sweep-dashboard
```

### `refactor/typescript-strict-sweep-pages`
*Eliminate any types across dashboard pages*

```bash
git checkout dev
git pull origin dev
git checkout -b refactor/typescript-strict-sweep-pages

git add apps/web/app/(dashboard)/dashboard/projects/page.tsx
git commit -m "refactor(web): add generic setField() helper, remove (form as any)[key]"

git add apps/web/app/(dashboard)/dashboard/blog/page.tsx
git commit -m "refactor(web): type PostMeta/PostDetail, remove all any casts"

git add apps/web/app/(dashboard)/dashboard/page.tsx
git commit -m "refactor(web): type Promise.all tuple, replace any[] destructure"

git add apps/web/app/(dashboard)/dashboard/subscribers/page.tsx
git commit -m "refactor(web): type EmailNotificationLog, remove any from history tab"

git push -u origin refactor/typescript-strict-sweep-pages

# --- merged after review ---
git checkout dev
git pull origin dev
git merge refactor/typescript-strict-sweep-pages --no-ff -m "Merge branch 'refactor/typescript-strict-sweep-pages' into dev"
git push origin dev
git branch -d refactor/typescript-strict-sweep-pages
git push origin --delete refactor/typescript-strict-sweep-pages
```

### `refactor/api-client-error-handling`
*Rework lib/api.ts for full type safety and network resilience*

```bash
git checkout dev
git pull origin dev
git checkout -b refactor/api-client-error-handling

git add apps/web/lib/api.ts
git commit -m "refactor(web): add toQueryString() helper, remove URLSearchParams(as any)"

git add apps/web/lib/api.ts
git commit -m "fix(web): add top-level try/catch — network failures now return ApiError"

git add apps/web/lib/api.ts
git commit -m "refactor(web): fully type every admin/public API method"

git push -u origin refactor/api-client-error-handling

# --- merged after review ---
git checkout dev
git pull origin dev
git merge refactor/api-client-error-handling --no-ff -m "Merge branch 'refactor/api-client-error-handling' into dev"
git push origin dev
git branch -d refactor/api-client-error-handling
git push origin --delete refactor/api-client-error-handling
```

### `fix/device-enum-cast-shared-util`
*Remove device-cast any across route files*

```bash
git checkout dev
git pull origin dev
git checkout -b fix/device-enum-cast-shared-util

git add apps/api/src/utils/device.ts
git commit -m "feat(api): add shared detectDevice() returning real Prisma DeviceType"

git add apps/api/src/routes/analytics.routes.ts
git commit -m "refactor(api): use detectDevice() instead of device as any"

git add apps/api/src/routes/blog.routes.ts
git commit -m "refactor(api): use shared detectDevice() utility"

git push -u origin fix/device-enum-cast-shared-util

# --- merged after review ---
git checkout dev
git pull origin dev
git merge fix/device-enum-cast-shared-util --no-ff -m "Merge branch 'fix/device-enum-cast-shared-util' into dev"
git push origin dev
git branch -d fix/device-enum-cast-shared-util
git push origin --delete fix/device-enum-cast-shared-util
```

### `fix/ai-routes-statuscode-and-unknown-parsing`
*Fix ApiError contract violations in ai.routes.ts*

```bash
git checkout dev
git pull origin dev
git checkout -b fix/ai-routes-statuscode-and-unknown-parsing

git add apps/api/src/routes/ai.routes.ts
git commit -m "fix(api): add missing statusCode to 8 error responses"

git add apps/api/src/routes/ai.routes.ts
git commit -m "refactor(api): replace let result: any with unknown + runtime narrowing"

git add apps/api/src/routes/ai.routes.ts
git commit -m "fix(api): type JSON.parse result as unknown in project enhancer route"

git push -u origin fix/ai-routes-statuscode-and-unknown-parsing

# --- merged after review ---
git checkout dev
git pull origin dev
git merge fix/ai-routes-statuscode-and-unknown-parsing --no-ff -m "Merge branch 'fix/ai-routes-statuscode-and-unknown-parsing' into dev"
git push origin dev
git branch -d fix/ai-routes-statuscode-and-unknown-parsing
git push origin --delete fix/ai-routes-statuscode-and-unknown-parsing
```

### `fix/shared-types-drift`
*Fix shared types that didn't match real API shapes*

```bash
git checkout dev
git pull origin dev
git checkout -b fix/shared-types-drift

git add packages/types/src/index.ts
git commit -m "fix(types): correct AnalyticsOverview fields to match real API response"

git add packages/types/src/index.ts
git commit -m "fix(types): correct SubscriberAnalytics fields to match real API response"

git add packages/types/src/index.ts
git commit -m "fix(types): remove duplicate AuthTokens interface definition"

git push -u origin fix/shared-types-drift

# --- merged after review ---
git checkout dev
git pull origin dev
git merge fix/shared-types-drift --no-ff -m "Merge branch 'fix/shared-types-drift' into dev"
git push origin dev
git branch -d fix/shared-types-drift
git push origin --delete fix/shared-types-drift
```

### `chore/remove-recharts-dependency`
*Consolidate charting on D3, drop Recharts*

```bash
git checkout dev
git pull origin dev
git checkout -b chore/remove-recharts-dependency

git add apps/web/app/(dashboard)/dashboard/page.tsx
git commit -m "refactor(web): migrate overview page from Recharts to D3Charts"

git add apps/web/package.json
git commit -m "chore(web): remove unused recharts dependency"

git add apps/web/app/(dashboard)/dashboard/page.tsx
git commit -m "test(web): verify overview page charts render identically post-migration"

git push -u origin chore/remove-recharts-dependency

# --- merged after review ---
git checkout dev
git pull origin dev
git merge chore/remove-recharts-dependency --no-ff -m "Merge branch 'chore/remove-recharts-dependency' into dev"
git push origin dev
git branch -d chore/remove-recharts-dependency
git push origin --delete chore/remove-recharts-dependency
```

### `docs/type-safety-sweep-report`
*Document the full type-safety and module-resolution sweep*

```bash
git checkout dev
git pull origin dev
git checkout -b docs/type-safety-sweep-report

git add TYPE_SAFETY_SWEEP.html
git commit -m "docs: document module resolution root cause and all fixes"

git add TYPE_SAFETY_SWEEP.html
git commit -m "docs: document every any-type removal with before/after"

git add TYPE_SAFETY_SWEEP.html
git commit -m "docs: add summary table of files touched and issues resolved"

git push -u origin docs/type-safety-sweep-report

# --- merged after review ---
git checkout dev
git pull origin dev
git merge docs/type-safety-sweep-report --no-ff -m "Merge branch 'docs/type-safety-sweep-report' into dev"
git push origin dev
git branch -d docs/type-safety-sweep-report
git push origin --delete docs/type-safety-sweep-report
```

## Milestone 0.7.0 — Build Pipeline

### `fix/packages-build-output`
*Give shared packages real compiled dist output*

```bash
git checkout dev
git pull origin dev
git checkout -b fix/packages-build-output

git add packages/types/tsconfig.json
git commit -m "fix(types): switch module/moduleResolution to NodeNext"

git add packages/types/package.json
git commit -m "fix(types): point exports at compiled dist/, add build script"

git add packages/db/tsconfig.json
git commit -m "fix(db): switch module/moduleResolution to NodeNext"

git add packages/db/package.json
git commit -m "fix(db): point exports at compiled dist/, add build script"

git push -u origin fix/packages-build-output

# --- merged after review ---
git checkout dev
git pull origin dev
git merge fix/packages-build-output --no-ff -m "Merge branch 'fix/packages-build-output' into dev"
git push origin dev
git branch -d fix/packages-build-output
git push origin --delete fix/packages-build-output
```

### `fix/api-rootdir-violation`
*Fix TS6059 rootDir violation in apps/api*

```bash
git checkout dev
git pull origin dev
git checkout -b fix/api-rootdir-violation

git add apps/api/tsconfig.json
git commit -m "fix(api): remove paths override pulling raw .ts across rootDir boundary"

git add apps/web/tsconfig.json
git commit -m "fix(web): remove matching @devcraft/types paths override for consistency"

git add apps/api/tsconfig.json
git commit -m "test(api): verify tsc -p tsconfig.json builds clean with no TS6059"

git push -u origin fix/api-rootdir-violation

# --- merged after review ---
git checkout dev
git pull origin dev
git merge fix/api-rootdir-violation --no-ff -m "Merge branch 'fix/api-rootdir-violation' into dev"
git push origin dev
git branch -d fix/api-rootdir-violation
git push origin --delete fix/api-rootdir-violation
```

### `fix/turbo-dev-task-dependency`
*Ensure packages build before dev servers start*

```bash
git checkout dev
git pull origin dev
git checkout -b fix/turbo-dev-task-dependency

git add turbo.json
git commit -m "fix(chore): add dependsOn ^build to the dev task"

git add turbo.json
git commit -m "test(chore): verify pnpm dev builds packages/db and packages/types first"

git add README.md
git commit -m "docs: note that pnpm dev now builds shared packages automatically"

git push -u origin fix/turbo-dev-task-dependency

# --- merged after review ---
git checkout dev
git pull origin dev
git merge fix/turbo-dev-task-dependency --no-ff -m "Merge branch 'fix/turbo-dev-task-dependency' into dev"
git push origin dev
git branch -d fix/turbo-dev-task-dependency
git push origin --delete fix/turbo-dev-task-dependency
```

### `fix/zod-v4-record-signature`
*Fix Zod v4 z.record() breaking change*

```bash
git checkout dev
git pull origin dev
git checkout -b fix/zod-v4-record-signature

git add apps/api/src/routes/projects.routes.ts
git commit -m "fix(api): add explicit key schema to z.record() call"

git add apps/api/package.json
git commit -m "fix(api): pin zod to ^4.4.3 matching the resolved version"

git add apps/api/src/routes/projects.routes.ts
git commit -m "test(api): verify ProjectSchema parses metrics object correctly"

git push -u origin fix/zod-v4-record-signature

# --- merged after review ---
git checkout dev
git pull origin dev
git merge fix/zod-v4-record-signature --no-ff -m "Merge branch 'fix/zod-v4-record-signature' into dev"
git push origin dev
git branch -d fix/zod-v4-record-signature
git push origin --delete fix/zod-v4-record-signature
```

### `fix/prisma-json-null-sentinel`
*Fix Prisma nullable Json write type errors*

```bash
git checkout dev
git pull origin dev
git checkout -b fix/prisma-json-null-sentinel

git add apps/api/src/routes/projects.routes.ts
git commit -m "fix(api): add toPrismaMetrics() helper converting null to Prisma.JsonNull"

git add apps/api/src/routes/projects.routes.ts
git commit -m "fix(api): apply helper at both create and update call sites"

git add packages/db/package.json
git commit -m "fix(db): pin @prisma/client and prisma to ^7.8.0 matching resolved version"

git push -u origin fix/prisma-json-null-sentinel

# --- merged after review ---
git checkout dev
git pull origin dev
git merge fix/prisma-json-null-sentinel --no-ff -m "Merge branch 'fix/prisma-json-null-sentinel' into dev"
git push origin dev
git branch -d fix/prisma-json-null-sentinel
git push origin --delete fix/prisma-json-null-sentinel
```

### `docs/build-pipeline-fix-report`
*Document the build pipeline fix*

```bash
git checkout dev
git pull origin dev
git checkout -b docs/build-pipeline-fix-report

git add BUGS_AND_SECURITY_REPORT.html
git commit -m "docs: add v0.7.0 build pipeline section with before/after code"

git add CHANGELOG.md
git commit -m "docs: add v0.7.0 changelog entry"

git add README.md
git commit -m "docs: update troubleshooting table with rootDir and Zod v4 entries"

git push -u origin docs/build-pipeline-fix-report

# --- merged after review ---
git checkout dev
git pull origin dev
git merge docs/build-pipeline-fix-report --no-ff -m "Merge branch 'docs/build-pipeline-fix-report' into dev"
git push origin dev
git branch -d docs/build-pipeline-fix-report
git push origin --delete docs/build-pipeline-fix-report
```

## Milestone Docs

### `docs/readme-comprehensive`
*Write the comprehensive project README*

```bash
git checkout dev
git pull origin dev
git checkout -b docs/readme-comprehensive

git add README.md
git commit -m "docs: rewrite README with full architecture and feature overview"

git add README.md
git commit -m "docs: add AI features, design system, and API reference tables"

git add README.md
git commit -m "docs: add troubleshooting section and project documents index"

git push -u origin docs/readme-comprehensive

# --- merged after review ---
git checkout dev
git pull origin dev
git merge docs/readme-comprehensive --no-ff -m "Merge branch 'docs/readme-comprehensive' into dev"
git push origin dev
git branch -d docs/readme-comprehensive
git push origin --delete docs/readme-comprehensive
```

### `docs/changelog-all-milestones`
*Write the full project changelog*

```bash
git checkout dev
git pull origin dev
git checkout -b docs/changelog-all-milestones

git add CHANGELOG.md
git commit -m "docs: document milestones 0.1.0 through 0.5.0"

git add CHANGELOG.md
git commit -m "docs: document milestone 0.6.0 module resolution and type sweep"

git add CHANGELOG.md
git commit -m "docs: document milestone 0.7.0 build pipeline fix"

git push -u origin docs/changelog-all-milestones

# --- merged after review ---
git checkout dev
git pull origin dev
git merge docs/changelog-all-milestones --no-ff -m "Merge branch 'docs/changelog-all-milestones' into dev"
git push origin dev
git branch -d docs/changelog-all-milestones
git push origin --delete docs/changelog-all-milestones
```

### `docs/prd-refined`
*Write the refined product requirements document*

```bash
git checkout dev
git pull origin dev
git checkout -b docs/prd-refined

git add PRD_REFINED.html
git commit -m "docs: refine PRD to reflect final 21/21 shipped feature status"

git add PRD_REFINED.html
git commit -m "docs: add AI feature specification table"

git add PRD_REFINED.html
git commit -m "docs: add risks and mitigations section"

git push -u origin docs/prd-refined

# --- merged after review ---
git checkout dev
git pull origin dev
git merge docs/prd-refined --no-ff -m "Merge branch 'docs/prd-refined' into dev"
git push origin dev
git branch -d docs/prd-refined
git push origin --delete docs/prd-refined
```

### `docs/design-decisions`
*Write the UI and system design decisions document*

```bash
git checkout dev
git pull origin dev
git checkout -b docs/design-decisions

git add DESIGN_DECISIONS.html
git commit -m "docs: document visual design system rationale"

git add DESIGN_DECISIONS.html
git commit -m "docs: document architecture decisions with trade-off tables"

git add DESIGN_DECISIONS.html
git commit -m "docs: document edge cases with code syntax"

git push -u origin docs/design-decisions

# --- merged after review ---
git checkout dev
git pull origin dev
git merge docs/design-decisions --no-ff -m "Merge branch 'docs/design-decisions' into dev"
git push origin dev
git branch -d docs/design-decisions
git push origin --delete docs/design-decisions
```

### `docs/landing-page-replica`
*Build a static HTML replica of the landing page*

```bash
git checkout dev
git pull origin dev
git checkout -b docs/landing-page-replica

git add devcraft-landing-replica.html
git commit -m "docs: build self-contained static replica of the live landing page"

git add devcraft-landing-replica.html
git commit -m "docs: add canvas particle field approximating the Three.js hero"

git add devcraft-landing-replica.html
git commit -m "docs: wire terminal easter egg and AI chat demo interactions"

git push -u origin docs/landing-page-replica

# --- merged after review ---
git checkout dev
git pull origin dev
git merge docs/landing-page-replica --no-ff -m "Merge branch 'docs/landing-page-replica' into dev"
git push origin dev
git branch -d docs/landing-page-replica
git push origin --delete docs/landing-page-replica
```

### `docs/git-history-record`
*Document the full git branch and commit history*

```bash
git checkout dev
git pull origin dev
git checkout -b docs/git-history-record

git add GIT_BRANCHES_AND_COMMITS.md
git commit -m "docs: generate full branch and commit history record"

git add GIT_BRANCHES_AND_COMMITS.md
git commit -m "docs: verify every branch references real project file paths"

git add GIT_BRANCHES_AND_COMMITS.md
git commit -m "docs: add summary statistics section"

git push -u origin docs/git-history-record

# --- merged after review ---
git checkout dev
git pull origin dev
git merge docs/git-history-record --no-ff -m "Merge branch 'docs/git-history-record' into dev"
git push origin dev
git branch -d docs/git-history-record
git push origin --delete docs/git-history-record
```

---

## Summary

- **Total branches:** 97
- **Total commits:** 305
- **Minimum commits per branch:** 3
- **Maximum commits per branch:** 4
- **Merge strategy:** every branch merged into `dev` with `--no-ff`, then deleted locally and remotely after merge
- **Commit convention:** [Conventional Commits](https://www.conventionalcommits.org/) — `feat`, `fix`, `security`, `refactor`, `docs`, `chore`, `test`, `style`, each scoped to `(web)`, `(api)`, `(db)`, `(types)`, or `(chore)`