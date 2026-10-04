# Implementation Plan — DevCraft App Fixes & Enhancements

This plan outlines technical solutions for the 8 activities requested across the DevCraft codebase (`apps/api` & `apps/web`).

---

## User Review Required

> [!IMPORTANT]
> - **Cloudinary CV Upload**: PDF uploads will be handled via Cloudinary using `CLOUDINARY_UPLOAD_PRESET` and credentials already configured in `.env`. Uploaded files will be named `Yusuf_Bashir_Nayaya_CV.pdf` (`public_id: Yusuf_Bashir_Nayaya_CV`), with real-time loading feedback in the settings UI.
> - **Responsive UI Redesign**: Dashboard grid layouts currently using hardcoded CSS inline styles (`gridTemplateColumns: "2fr 1fr"`, `"1fr 1.4fr"`) will be updated to mobile-first responsive Tailwind grids (`grid-cols-1 lg:grid-cols-2`, `grid-cols-1 lg:grid-cols-[1fr_1.4fr]`).

---

## Proposed Changes

### 1. API Endpoints & Auth Header Fixes
Fix missing authentication headers in AI utility functions and align response types across API routes and frontend client wrappers.

#### [MODIFY] [apps/web/lib/models.ts](file:///c:/Users/Lenovo/Downloads/SAAS/devcraft/apps/web/lib/models.ts)
- Update `streamSSE` and `callAI` to attach `Authorization: Bearer ${getToken()}` headers so authenticated admin AI calls (`/insights`, `/complete`, `/generate/project`, `/generate/blog/stream`) do not fail with `401 Unauthorized`.

#### [MODIFY] [apps/web/lib/api.ts](file:///c:/Users/Lenovo/Downloads/SAAS/devcraft/apps/web/lib/api.ts)
- Verify and standardize data unwrapping across `adminApi.contacts.list`, `adminApi.settings.update`, and subscriber endpoints to handle query params and payload structures reliably.

---

### 2. Contact Form & Inbox Integration
Ensure submitted messages from the public contact form appear immediately in the admin inbox page (`/dashboard/contacts`).

#### [MODIFY] [apps/web/app/(dashboard)/dashboard/contacts/page.tsx](file:///c:/Users/Lenovo/Downloads/SAAS/devcraft/apps/web/app/(dashboard)/dashboard/contacts/page.tsx)
- Fix initial loading state and filter params (`unread` vs `read` vs `all`).
- Update message fetch and unread badge count synchronization logic.
- Convert hardcoded 2-column inline grid to a responsive mobile/tablet friendly layout.

#### [MODIFY] [apps/api/src/routes/contact.routes.ts](file:///c:/Users/Lenovo/Downloads/SAAS/devcraft/apps/api/src/routes/contact.routes.ts)
- Ensure `/admin/contacts` filtering handles boolean boolean/string queries cleanly and returns predictable message data objects.

---

### 3. Settings Controlled Inputs & Cloudinary CV Upload
Fix key mismatches in settings inputs and implement PDF upload to Cloudinary.

#### [MODIFY] [apps/web/app/(dashboard)/dashboard/settings/page.tsx](file:///c:/Users/Lenovo/Downloads/SAAS/devcraft/apps/web/app/(dashboard)/dashboard/settings/page.tsx)
- Fix field key mapping (`githubUrl`, `linkedinUrl`, `twitterUrl` instead of `github`, `linkedin`, `twitter`).
- Ensure all input fields maintain fallbacks (`""`) for strict controlled React input state without warnings.
- Implement file input component for CV PDF upload using Cloudinary API preset (`CLOUDINARY_UPLOAD_PRESET: portfolio_unsigned`) with target filename `Yusuf_Bashir_Nayaya_CV.pdf`.
- Add an animated loading spinner/state while uploading to Cloudinary, automatically assigning the resulting URL to `cvUrl`.

---

### 4. D3 Charts Fixes & Auto-Resizing
Fix chart layout breakage and unmeasured container dimensions.

#### [MODIFY] [apps/web/components/dashboard/D3Charts.tsx](file:///c:/Users/Lenovo/Downloads/SAAS/devcraft/apps/web/components/dashboard/D3Charts.tsx)
- Add `ResizeObserver` hooks to `D3AreaChart`, `D3Donut`, `D3HBarChart`, and `D3RadialSkills` to dynamically recalculate chart SVG dimensions on window or container resize.
- Fix body-level tooltip orphan elements by guaranteeing clean unmount removal.
- Prevent negative SVG dimensions when containers are narrow or rendering initially.

---

### 5. Magnetic Hover Speeds & Motion Tuning
Make magnetic hovers feel smoother, luxury, and a bit slower as requested.

#### [MODIFY] [apps/web/components/ui/Magnetic.tsx](file:///c:/Users/Lenovo/Downloads/SAAS/devcraft/apps/web/components/ui/Magnetic.tsx)
- Adjust hover movement transition duration from `0.15s` to `0.35s` ease-out for a gentler, premium feel.

#### [MODIFY] [apps/web/app/globals.css](file:///c:/Users/Lenovo/Downloads/SAAS/devcraft/apps/web/app/globals.css)
- Update `.mag-btn` hover transitions from `0.2s` to `0.35s cubic-bezier(0.22, 1, 0.36, 1)`.

---

### 6. AI Implementations Audit & Fixes
Ensure AI features stream and function seamlessly across public chat and admin tools.

#### [MODIFY] [apps/web/components/portfolio/AiChat.tsx](file:///c:/Users/Lenovo/Downloads/SAAS/devcraft/apps/web/components/portfolio/AiChat.tsx)
- Improve error handling feedback when SSE stream encounters connection or API errors.

#### [MODIFY] [apps/web/components/dashboard/AiInsights.tsx](file:///c:/Users/Lenovo/Downloads/SAAS/devcraft/apps/web/components/dashboard/AiInsights.tsx)
- Ensure payload structure passed to `/insights` matches API expectations and handles loading/error states cleanly.

---

### 7. App-Wide Responsive Design Fixes
Fix component and card layouts across mobile, tablet, and desktop viewports.

#### [MODIFY] [apps/web/app/(dashboard)/dashboard/page.tsx](file:///c:/Users/Lenovo/Downloads/SAAS/devcraft/apps/web/app/(dashboard)/dashboard/page.tsx)
- Replace static grid styles with responsive Tailwind classes (`grid-cols-1 lg:grid-cols-3`, `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`).

#### [MODIFY] [apps/web/app/(dashboard)/dashboard/analytics/page.tsx](file:///c:/Users/Lenovo/Downloads/SAAS/devcraft/apps/web/app/(dashboard)/dashboard/analytics/page.tsx)
- Make analytics charts and stat cards stack on small screens and expand cleanly on larger viewports.

#### [MODIFY] [apps/web/components/portfolio/Nav.tsx](file:///c:/Users/Lenovo/Downloads/SAAS/devcraft/apps/web/components/portfolio/Nav.tsx) & Portfolio Components
- Audit mobile navigation drawer, hero, journey map, project cards, and contact form for 320px–768px viewport responsiveness.

---

## Verification Plan

### Automated Tests
- Run `pnpm build` or `pnpm check` (or TypeScript compiler check `tsc --noEmit` across `apps/api` and `apps/web`) to verify zero type errors.

### Manual Verification
- **Contact & Inbox**: Submit a test message via public contact form and verify it immediately displays under `unread` messages on `/dashboard/contacts`.
- **CV Upload**: Upload a PDF file in Settings and verify it uploads to Cloudinary with filename `Yusuf_Bashir_Nayaya_CV.pdf`, shows loading indicator during upload, and sets `cvUrl`.
- **Controlled Settings**: Change all input values in settings and verify no React warnings occur in developer console.
- **Charts**: View `/dashboard` and `/dashboard/analytics` in desktop and mobile viewport sizes to verify D3 charts render smoothly without collapsing or overflowing.
- **AI Features**: Test AI chat, AI Bio generator, and AI Insights to confirm authentication token is passed and responses stream/render properly.
- **Magnetic Hovers**: Hover over magnetic buttons on portfolio page to verify smoother, slower transition speed.
