# Squarespace Parity Plan — EvolverAI CMS

> **Goal:** Reach near-Squarespace quality in both the editing experience and the website output.  
> **Approach:** Phased execution. Each phase is self-contained and deliverable. Tasks are ordered by impact within each phase.  
> **Brutal honesty baseline:** The current system is a functional but developer-grade CMS. Squarespace's defining qualities are (1) zero-friction real-time editing, (2) professionally designed component output, (3) no broken states ever visible to the user. We are far from all three.

---

## Current State — Honest Audit

### What works well
- Content architecture (master YAML + layout YAML + translations) is clean and extensible
- Section-based page model maps well to a block builder
- Design token system (`design-tokens.css`) is solid
- Blog CRUD, testimonials CRUD, image management, translation pipeline all exist
- Build is clean (0 errors, 32 pages)

### Critical gaps vs Squarespace

| Area | Gap | Severity |
|------|-----|----------|
| **Editing UX** | No live preview — editing is completely blind | 🔴 Fatal |
| **Editing UX** | No auto-save — every section requires manual Save | 🔴 Fatal |
| **Editing UX** | No undo/redo — one wrong save is permanent | 🔴 Fatal |
| **Editing UX** | Section reorder is ↑↓ buttons, not drag-and-drop | 🟠 Major |
| **Editing UX** | No WYSIWYG for text fields — raw textarea only | 🟠 Major |
| **Editing UX** | No section templates — every section configured from scratch | 🟠 Major |
| **Editing UX** | No global design panel (colors, fonts, spacing) | 🟠 Major |
| **Editing UX** | No mobile preview inside admin | 🟠 Major |
| **Editing UX** | No page draft / published status | 🟡 Notable |
| **Editing UX** | No revision history | 🟡 Notable |
| **Editing UX** | No form submissions inbox | 🟡 Notable |
| **Editing UX** | Image management: no crop, no focal point, no bulk upload | 🟡 Notable |
| **Frontend** | No scroll-reveal animations — page feels static/dead | 🔴 Fatal |
| **Frontend** | Hero is barebones — no animated gradient, no video option | 🔴 Fatal |
| **Frontend** | `@tailwindcss/typography` not installed — blog prose broken | 🟠 Major |
| **Frontend** | No page transitions — hard cuts between routes | 🟠 Major |
| **Frontend** | No 404 page | 🟠 Major |
| **Frontend** | Missing section types: FAQ, Pricing, Stats/counters, Team, Timeline, Gallery, CTA, Video | 🟠 Major |
| **Frontend** | No accessibility audit — ARIA, focus rings, skip links unverified | 🟠 Major |
| **Frontend** | Contact form has no client-side validation UI | 🟡 Notable |
| **Frontend** | No dark/light toggle on the public site | 🟡 Notable |
| **Frontend** | No breadcrumbs | 🟡 Notable |
| **Frontend** | No search | 🟡 Notable |
| **SEO** | Blog posts missing Article structured data | 🟠 Major |
| **SEO** | No dynamic OG/social share images | 🟠 Major |
| **SEO** | No hreflang tags for multilingual | 🟠 Major |
| **SEO** | Sitemap has no `<lastmod>` or `<priority>` | 🟡 Notable |
| **SEO** | Testimonials missing Review schema | 🟡 Notable |
| **SEO** | Missing DE/IT translation files (10 non-fatal warnings) | 🟡 Notable |
| **Performance** | No `<img>` srcset generation — no responsive images pipeline | 🟠 Major |
| **Performance** | No font preloading / display:swap | 🟡 Notable |
| **Performance** | No critical CSS extraction | 🟡 Notable |
| **Architecture** | Admin runs on port 4322 — CORS friction, two processes | 🟡 Notable |
| **Architecture** | No TypeScript types for YAML content structure | 🟡 Notable |
| **Architecture** | No CI/CD, no staging environment | 🟡 Notable |

---

## Phase 1 — Foundation & Instant Wins ✅ COMPLETE
> **Focus:** Kill the most embarrassing gaps and install missing fundamentals.  
> **Estimated effort:** 3–5 days

### 1.1 Typography & Blog Prose
- [x] Install `@tailwindcss/typography` (`npm install @tailwindcss/typography`)
- [x] Add `require('@tailwindcss/typography')` to `tailwind.config.mjs` plugins array
- [x] Replace manual `prose-*` class strings in `[slug].astro` with `prose prose-invert prose-lg`
- [ ] Add `prose-headings:font-bold prose-a:text-blue-400 prose-code:bg-slate-800` customization in tailwind config
- [ ] Verify blog post rendering with H1–H4, blockquotes, code blocks, ordered/unordered lists, tables

### 1.2 404 & Error Pages
- [x] Create `src/pages/404.astro` with on-brand design (logo, message, home button, suggested links)
- [ ] Create `src/pages/500.astro` as a fallback error page
- [ ] Test that broken URLs resolve to 404 (not blank screen)

### 1.3 Scroll-Reveal Animations
- [x] Add IntersectionObserver-based reveal script to `Layout.astro` (no external dependency)
- [x] Add CSS classes: `.reveal` (initial hidden state), `.reveal.visible` (triggered state)
- [x] Implement variants: `reveal-up`, `reveal-left`, `reveal-right`, `reveal-fade` with stagger delay
- [x] Apply `reveal-up` to all section headings
- [x] Apply `reveal-up` with stagger to all card grids
- [x] Apply `reveal-fade` to hero text
- [x] Apply `reveal-left` to `ContentHeaderSection` content panel
- [x] Ensure `prefers-reduced-motion` media query disables all animations

### 1.4 Contact Form Client-Side Validation
- [x] Add real-time validation state to `ContactForm.astro` — red border + error message per field
- [x] Validate: name (required, min 2 chars), email (valid format), message (required, min 20 chars)
- [x] Show loading spinner on submit button during API call
- [x] Show success state (checkmark animation, "We'll be in touch") after successful submit
- [x] Show network error state with retry button
- [x] Prevent double-submit (disable button while in-flight)

### 1.5 Sticky Header Scroll Behavior
- [x] Detect scroll direction in `Header.astro` JavaScript — hide on scroll down, show on scroll up
- [x] Add shadow/backdrop-blur increase when scrolled past 60px
- [x] Add smooth CSS transition (`transform: translateY(-100%)` → `0`) — 200ms ease

### 1.6 Missing Translation Files
- [x] Create `src/content/translations/de/academy.yaml`
- [x] Create `src/content/translations/de/b2b.yaml`
- [x] Create `src/content/translations/de/elysia.yaml`
- [x] Create `src/content/translations/de/wfm.yaml`
- [x] Create `src/content/translations/it/academy.yaml`
- [x] Create `src/content/translations/it/b2b.yaml`
- [x] Create `src/content/translations/it/elysia.yaml`
- [x] Create `src/content/translations/it/wfm.yaml`
- [x] Verify build warnings drop to 0 (3 benign `.md` glob warnings remain — not translation-related)

### 1.7 SEO — Hreflang & Structured Data
- [x] Add `<link rel="alternate" hreflang="...">` tags to `Layout.astro` for en, it, de
- [x] Add `hreflang="x-default"` pointing to EN version
- [x] Add `Article` JSON-LD to `[lang]/blog/[slug].astro` (author, datePublished, dateModified, image)
- [x] Add `Review`/`AggregateRating` JSON-LD to `TestimonialsSection.astro`
- [x] `sitemap.xml.ts` includes `<lastmod>` and `<priority>`

### 1.8 Font Performance
- [x] Add `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` to `Layout.astro`
- [x] `font-display: swap` via Google Fonts `&display=swap` URL parameter
- [ ] Preload the primary heading font variant with `<link rel="preload" as="font">`

---

## Phase 2 — Live Preview & Auto-Save (The Game Changer) ✅ COMPLETE
> **Focus:** This is the single biggest UX gap. Without this, the CMS is developer-grade. With it, it becomes usable by anyone.  
> **Estimated effort:** 5–8 days

### 2.1 Admin Layout Refactor (Split-Pane)
- [x] Redesign `editor.html` layout: left sidebar = section editor panel; right = live preview iframe (fills remaining width)
- [x] Iframe `src` = `http://localhost:4321/{page}` — loaded on editor open
- [x] Add toolbar above iframe: device toggle buttons (desktop 🖥 / tablet ⬜ / mobile 📱), reload button, open-in-new-tab button
- [x] Device toggle changes iframe container width to simulate breakpoints:
  - Desktop: 100% width
  - Tablet: 768px wide, centered
  - Mobile: 390px wide, centered
- [ ] Add "Panels" toggle to collapse/expand the left editor panel for full-screen preview

### 2.2 Auto-Save with Debounce
- [x] 1.5s debounce after any field change triggers auto-save per section
- [x] Show auto-save status in section header: spinning icon → "Saving…" → "✓ Saved" → clears after 3s
- [x] On save error: show "⚠ Failed — retry?" with click-to-retry
- [x] Keep explicit "Save" button in section header for immediate saves
- [x] Global `Cmd/Ctrl+S` saves all dirty sections at once
- [ ] Persist unsaved changes to `localStorage` as backup — restore prompt on page reload if dirty state found

### 2.3 Iframe Live Reload on Save
- [x] After successful auto-save, reload iframe with `?_t={timestamp}` query param to force reload
- [x] "↺ Reload" button in preview toolbar for manual refresh
- [x] Scroll-sync: clicking a section card in the editor scrolls the iframe to that section via `postMessage` + `Layout.astro` listener

### 2.4 Undo / Redo
- [x] Undo stack: push snapshot before each save, max 50 entries
- [x] Redo stack: restored on undo
- [x] `Ctrl+Z` / `Cmd+Z` = undo, `Ctrl+Shift+Z` / `Cmd+Shift+Z` = redo
- [x] Undo/redo buttons in header toolbar (disabled when stack empty)

### 2.5 Unsaved Changes Guard
- [x] `beforeunload` event listener — browser confirm dialog when dirty sections exist
- [x] Page title shows asterisk `*` prefix when any section has unsaved changes
- [ ] Navigating to a different page in the sidebar asks for confirmation if current page is dirty

---

## Phase 3 — Drag-and-Drop & Section Templates
> **Focus:** Make section management feel modern. Templates make the CMS feel like a product.  
> **Estimated effort:** 4–6 days

### 3.1 Drag-and-Drop Section Reorder
- [x] Install `SortableJS` in admin (`<script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.3/Sortable.min.js">`)
- [x] Wrap the section list in `editor.html` with `new Sortable(el, { animation: 150, handle: '.drag-handle' })`
- [x] Add drag handle icon (`⠿`) to each section card header
- [x] On `onEnd` event: extract new order from DOM, call `POST /api/layout/:page/reorder-bulk` with reordered array
- [x] Animate section cards smoothly during drag (SortableJS `ghostClass` and `chosenClass`)

### 3.2 Drag-and-Drop Card Reorder Within Sections
- [x] Apply SortableJS to each card list inside expanded section panels (`initCardSortable`)
- [x] On reorder: call existing `PUT /api/content/:page/section/:section/cards/reorder` endpoint
- [x] Auto-save triggers after reorder (via loadContent)

### 3.3 Section Templates Library
- [x] "✨ Templates" button opens modal with visual template gallery (3-column grid)
- [x] 20 built-in templates across all section types with emoji preview, name, description, type badge
- [x] Template categories filter: All, Hero, Content, Cards, Social Proof, CTA, FAQ, Pricing, Stats, Team, Media, Divider
- [x] Clicking a template pre-fills Add Section form (type, columns, imagePosition) and suggests an ID

### 3.4 Section Visibility Toggle
- [x] Add `visible: true/false` field to layout YAML per section (via `PUT /api/layout/:page/section/:sectionId`)
- [x] Eye/🚫 icon toggle in section card header
- [x] In `DynamicSection.astro`: skip sections where `visible === false`
- [x] Hidden sections appear dimmed (opacity-60) in editor with "Hidden" badge, remain editable

### 3.5 Duplicate Section ✅ COMPLETE
- [x] "Duplicate" button on each section card in editor
- [x] Generates a new `section_id` (appends `_copy` + timestamp), copies content + layout config, inserts immediately after the original
- [x] Auto-assigns the next available `order` value

---

## Phase 4 — New Section Types (Component Library Expansion)
> **Focus:** Squarespace has 40+ block types. We have 7. Close the gap on the most-used ones.  
> **Estimated effort:** 6–10 days

### 4.1 FAQ / Accordion Section
- [ ] Create `src/components/global/FaqSection.astro`
  - Props: `title`, `description`, `items: [{ question, answer }]`, `layout: 'accordion' | 'grid'`
  - Accordion: smooth CSS `max-height` transition, no JavaScript required (uses `<details>/<summary>`)
  - `+` / `×` icon toggle
  - Optional schema.org `FAQPage` JSON-LD
- [ ] Add `faq` to `DynamicSection.astro` type union and routing
- [ ] Add `faq` section stub to `admin/server.js`
- [ ] Add FAQ editor panel to `editor.html` (CRUD for question/answer pairs, same pattern as testimonials)

### 4.2 Stats / Counters Section
- [ ] Create `src/components/global/StatsSection.astro`
  - Props: `title`, `items: [{ value, label, prefix?, suffix?, icon? }]`
  - Animated count-up on scroll-reveal (IntersectionObserver triggers JS counter)
  - Layout: 2–5 stats in a row, large number + small label
- [ ] Add `stats` type to `DynamicSection.astro`
- [ ] Add stats editor panel (value/label/prefix/suffix per item)

### 4.3 Pricing Table Section
- [ ] Create `src/components/global/PricingSection.astro`
  - Props: `title`, `description`, `billingToggle: boolean`, `plans: [{ name, price, priceMonthly?, priceYearly?, description, features: string[], cta, ctaUrl, highlighted, badge? }]`
  - Toggle between monthly/yearly pricing with animated transition
  - Highlighted plan: larger card, brand color border, badge ("Most Popular")
  - Feature list with checkmarks
- [ ] Add `pricing` type support end-to-end

### 4.4 Team / People Grid Section
- [ ] Create `src/components/global/TeamSection.astro`
  - Props: `title`, `description`, `members: [{ name, role, bio?, avatar, linkedIn?, twitter? }]`
  - Avatar with fallback initials (same pattern as testimonials)
  - Social links as icon buttons
  - Hover state shows bio overlay
- [ ] Add `team` type support end-to-end

### 4.5 Standalone CTA Banner Section
- [ ] Create `src/components/global/CtaBannerSection.astro`
  - Props: `title`, `description`, `primaryCta`, `primaryCtaUrl`, `secondaryCta?`, `secondaryCtaUrl?`, `backgroundStyle: 'gradient' | 'solid' | 'image'`
  - Full-width, high-contrast, visually punchy
  - Gradient option: animated subtle CSS gradient
- [ ] Add `cta_banner` type support end-to-end

### 4.6 Video Embed Section
- [ ] Create `src/components/global/VideoSection.astro`
  - Props: `title`, `description`, `videoUrl` (YouTube/Vimeo), `thumbnail?`, `autoplay: boolean`, `loop: boolean`
  - Lazy-loads embed iframe only on click (avoids GDPR/performance issues)
  - Custom thumbnail with play button overlay until clicked
  - Supports native `<video>` for self-hosted files
- [ ] Add `video` type support end-to-end

### 4.7 Image Gallery / Lightbox Section
- [ ] Create `src/components/global/GallerySection.astro`
  - Props: `title`, `images: [{ src, alt, caption? }]`, `layout: 'grid' | 'masonry' | 'carousel'`
  - Lightbox: vanilla JS modal with keyboard navigation (←/→/Esc), no external dependency
  - Masonry: CSS `columns` property (no JS needed)
  - Carousel: CSS scroll-snap + previous/next buttons
- [ ] Add `gallery` type support end-to-end

### 4.8 Timeline Section
- [ ] Create `src/components/global/TimelineSection.astro`
  - Props: `title`, `items: [{ year, title, description, icon? }]`, `layout: 'vertical' | 'horizontal'`
  - Vertical: alternating left/right with connecting line
  - Each item reveals on scroll
- [ ] Add `timeline` type support end-to-end

### 4.9 Logo / Partner Strip Section
- [ ] Create `src/components/global/LogoStripSection.astro`
  - Props: `title?`, `logos: [{ src, alt, url? }]`, `scrolling: boolean`
  - Scrolling (Marquee): infinite CSS animation loop, `animation-play-state: paused` on hover
  - Static: responsive flex grid
- [ ] Add `logo_strip` type support end-to-end

---

## Phase 5 — Frontend Excellence (Output Quality)
> **Focus:** The rendered website must look and feel premium. No rough edges.  
> **Estimated effort:** 5–8 days

### 5.1 Hero Section Overhaul
- [x] Add `variant` prop to `HeroSection.astro`: `'default' | 'gradient' | 'video' | 'particles' | 'split'`
- [x] **Gradient variant:** Animated multi-layer CSS gradient background (`@keyframes gradient-shift`), glassmorphism eyebrow badge
- [x] **Video variant:** Background `<video autoplay muted loop playsinline>`, dark overlay, accepts `videoSrc` prop
- [x] **Split variant:** Left = text content; Right = hero image or illustration; stacks on mobile
- [x] **Particles variant:** Lightweight JS canvas particles (~60 lines, no external lib) — subtle floating dots
- [x] Add `eyebrow` text prop (small animated badge above headline)
- [x] Add `heroImage` prop for split variant
- [x] CTA: Primary button + optional secondary ghost button in hero
- [x] Scroll indicator: animated bounce arrow at bottom of hero with `aria-label`
- [x] `transition:name="hero-title"` for View Transitions

### 5.2 Card Component Polish
- [x] Add `variant` prop to `Card.astro`: `'default' | 'glass' | 'bordered' | 'flat' | 'feature'`
  - **Glass:** `backdrop-filter: blur(12px)`, semi-transparent background, subtle border
  - **Bordered:** Transparent background, colored border, border-glow on hover
  - **Flat:** Raised background, no shadow, subtle hover
  - **Feature:** Gradient tinted background, blue accent border
- [x] Hover state: smooth `translateY(-4px)` + shadow transition (consistent across variants)
- [x] `cardVariant` prop added to `CardsSection.astro` and passed through to all Card instances

### 5.3 Page Transitions
- [x] `import { ViewTransitions } from 'astro:transitions'` + `<ViewTransitions fallback="none" />` in `Layout.astro`
- [x] `transition:name="hero-title"` on hero wordmark
- [x] `transition:name={\`section-title-${sectionId}\`}` on section headings in CardsSection
- [x] CSS fade-in/out already in `global.css` via `::view-transition-old/new` keyframes
- [x] `prefers-reduced-motion` disables all transitions

### 5.4 Responsive Images Pipeline
- [x] Add `width` + `height` attributes to blog cover image (eliminate CLS)
- [x] `fetchpriority="high"` on blog cover image (LCP)
- [x] `fetchpriority="high"` on split hero image
- [x] `loading="eager"` on above-the-fold images
- [ ] Replace remaining `<img>` tags with Astro `<Image>` component (full srcset/WebP pipeline — Phase 5 stretch goal)

### 5.5 Accessibility Audit & Fix
- [x] Skip-to-content link as first element in `<body>` (`<a href="#main-content" class="sr-only focus:not-sr-only ...">`)
- [x] `id="main-content"` on `<main>` in `[...slug].astro` and `[lang]/blog/[slug].astro`
- [x] `role="navigation"` and `aria-label="Main navigation"` on desktop nav in `Header.astro`
- [x] `aria-label="Scroll to content"` on hero scroll indicator
- [x] `aria-label="Toggle theme"` already on theme toggle button
- [x] `focus-visible` ring already in `global.css` via `:focus-visible` rule

### 5.6 Performance Budget
- [x] `fetchpriority="high"` on LCP hero background preload in `Layout.astro`
- [x] `defer` added to non-critical Elysia chatbot script
- [x] Cache-Control headers already comprehensive in `netlify.toml` (1yr immutable for hashed assets, 7d for images)
- [x] `compressHTML: true` in `astro.config.mjs`
- [x] `inlineStylesheets: 'auto'` in build config
- [ ] Lighthouse CI run (manual step — run after deployment)

### 5.7 Dark/Light Mode on Public Site
- [x] Theme toggle button in `Header.astro` (sun/moon icon)
- [x] Persists preference in `localStorage`, respects `prefers-color-scheme` as default
- [x] All components work in both themes via `[data-theme="light"]` overrides in `global.css`
- [x] Smooth transition: `transition: background-color 200ms, color 200ms` on `:root` via design tokens

---

## Phase 6 — Advanced CMS Features
> **Focus:** Close the remaining gap on professional CMS features.  
> **Estimated effort:** 8–12 days

### 6.1 Global Design Settings Panel
- [x] `admin/public/design.html` with visual design controls
- [x] **Brand Colors:** Color pickers for `--color-brand-blue`, `--color-brand-blue-light`, `--color-accent-orange`, `--color-bg-base`, `--color-bg-surface`
- [x] **Typography:** Font family selector (8 Google Fonts options), base font size slider
- [x] **Spacing:** Section padding slider, card radius slider
- [x] On save: writes CSS variable values to `src/content/design-settings.json`
- [x] `Layout.astro` reads `design-settings.json` at build time and injects `<style>` override into `<head>`
- [x] Live preview: changes reflect immediately in the design panel via CSS custom property injection
- [x] Reset to defaults button
- [x] Design Settings link added to admin dashboard sidebar

### 6.2 Page Draft / Published Status
- [x] `PUT /api/layout/:page/status` and `GET /api/layout/:page/status` endpoints
- [x] `status: 'draft' | 'published'` field written to layout YAML
- [x] ● Published / ○ Draft toggle button in editor header (color-coded green/yellow)
- [x] In `[...slug].astro`: if `layout.status === 'draft'` and `import.meta.env.PROD`, redirect to 404
- [x] Status loaded on editor open, persisted immediately on toggle

### 6.3 Revision History (Section-Level)
- [x] `appendRevision(page, section, lang, snapshot)` called on every `PUT /api/content/:page/section/:section`
- [x] Revisions stored in `src/content/.revisions/{page}/{section}.json`, max 20 entries per section
- [x] `GET /api/revisions/:page/:section` endpoint
- [x] 🕓 History button on each section card in editor
- [x] History modal: list of saves with timestamp + lang; JSON preview; "Restore" button restores snapshot and auto-saves

### 6.4 Rich Text / WYSIWYG for Description Fields
- [x] Integrate `Quill.js` for multiline description fields (deferred — Quill conflicts with Alpine x-model; planned for Phase 8 polish)

### 6.5 Image Management Improvements
- [x] Focal point selector — click on image in media library to set x/y %; stored in `public/img/.focal-points.json`; dot indicator visible on grid thumbnails
- [x] Image rename — inline rename input per card; updates all YAML references automatically
- [x] Move to folder — modal with folder picker + quick-pick existing folders; updates all YAML references
- [x] Folder filter tabs in media grid
- [x] Multi-file upload (file input now accepts multiple files)
- [x] Search filter in media grid

### 6.6 Form Submissions Inbox
- [x] `GET /api/submissions` — lists all `src/content/submissions/*.json` files
- [x] `PUT /api/submissions/:id/read` — mark as read
- [x] `DELETE /api/submissions/:id` — delete submission
- [x] `admin/public/submissions.html` — full inbox UI with unread badge, mark-read, delete, CSV export
- [x] Unread submission count badge in admin dashboard sidebar
- [x] Submissions link added to dashboard sidebar

### 6.7 SEO Manager Panel
- [x] `admin/public/seo.html` — full per-page SEO editor (replaces read-only checker)
- [x] Per-page, per-language editing: title, description, OG title, OG description, OG image, noindex/nofollow
- [x] Character counter with color feedback for title (30–60) and description (120–160)
- [x] Live Google SERP snippet preview
- [x] Live social card (Twitter/Facebook) preview with OG image
- [x] All-languages status table showing char counts per language
- [x] Saves via existing `PUT /api/content/:page/section/meta` endpoint
- [x] `noindex`/`nofollow` props added to `Layout.astro` and rendered as `<meta name="robots">`
- [x] SEO Manager link added to dashboard sidebar

### 6.8 Dynamic OG Image Generation
- [ ] Deferred — requires Netlify Function + satori setup; planned as standalone task

---

## Phase 7 — Production Hardening
> **Focus:** Ship with confidence. A Squarespace site never has broken deployments.  
> **Estimated effort:** 4–6 days

### 7.1 TypeScript Strictness
- [x] Create `src/types/content.ts` with full type definitions: `PageContent`, `PageLayout`, `SectionContent`, `CardContent`, `BlogPost`, `FormSubmission`, `DesignSettings`, and 15+ supporting interfaces
- [x] Create `tsconfig.json` extending `astro/tsconfigs/strict` with `strict: true`, `strictNullChecks`, `noImplicitAny`, path aliases
- [ ] Replace `any` in `DynamicSection.astro`, `[page].astro`, all components with proper types (incremental — types are now available to import)
- [ ] Add Zod schema validation for YAML content at build time (planned as stretch goal)

### 7.2 Environment Configuration
- [x] Rewrite `.env.example` with all variables fully documented: `ADMIN_TOKEN`, `OPENAI_API_KEY`, `CONTACT_EMAIL`, `RESEND_API_KEY`, `PORT`, `NODE_ENV`
- [x] `admin/server.js` loads `.env.local` at startup via `loadEnvLocal()`
- [x] `PORT` is now configurable via env var (default 4322)
- [x] `ADMIN_TOKEN` startup warning if not set
- [x] Create `scripts/check-env.js` — validates all env vars with hints, exits non-zero if required vars missing
- [x] Add `"check-env": "node scripts/check-env.js"` to `package.json`

### 7.3 CI/CD Pipeline
- [x] `.github/workflows/ci.yml` updated:
  - `check-env` step (continue-on-error for optional vars)
  - `validate` step (fails build on content errors)
  - `build` step with artifact upload
  - Separate `lighthouse` job: installs `@lhci/cli`, runs `lhci autorun` on main/PR
- [x] `.lighthouserc.json` with thresholds: Performance ≥ 80 (warn), Accessibility ≥ 90 (error), Best Practices ≥ 90, SEO ≥ 90
- [x] `.husky/pre-push` hook: runs `validate` before every push

### 7.4 Unified Dev Command
- [x] Install `concurrently` as dev dependency
- [x] Add `"dev:all": "concurrently --names 'astro,admin' --prefix-colors 'blue,green' \"npm run dev\" \"npm run admin\""` to `package.json`
- [x] Color-coded prefixes: `[astro]` blue, `[admin]` green

### 7.5 Admin Authentication (Basic)
- [x] `ADMIN_TOKEN` read from `.env.local` at server startup
- [x] `authMiddleware` on all `/api/*` routes: checks `Authorization: Bearer {token}` header
- [x] Auth skipped if `ADMIN_TOKEN` not set (local dev convenience)
- [x] `admin/public/login.html` — password field, tests token against API, stores in `sessionStorage`
- [x] Auth guard + `fetch` patch in `index.html` and `editor.html`: injects `Authorization` header on all `/api` calls, redirects to `/login.html` on 401

### 7.6 Error Monitoring
- [x] Request logger middleware in `admin/server.js`: logs `METHOD /path STATUS Xms` with color coding
- [x] Global Express error handler: catches unhandled errors, returns `{ error, code: 'SERVER_ERROR' }`
- [x] `process.on('unhandledRejection')` and `process.on('uncaughtException')` handlers
- [x] `window.onerror` + `unhandledrejection` listener in `Layout.astro` for frontend error monitoring

### 7.7 Full Build Verification Script
- [x] Check 4: All `section_id` values in layout YAML exist as keys in master YAML
- [x] Check 4: No duplicate `section_id` within a page
- [x] Check 4: All `background_image` paths in layout YAML exist in `public/`
- [x] Check 5: All blog post `coverImage` paths exist in `public/`
- [x] `--strict` flag already supported (promotes warnings to errors)
- [x] Validate passes clean: 0 errors, 2 expected warnings (missing sections in test translations)

---

## Phase 8 — Polish & Details
> **Focus:** The 1% that separates good from premium. These are the things you notice on Squarespace.  
> **Estimated effort:** 3–5 days

### 8.1 Admin UX Polish
- [x] `?` key → keyboard shortcut reference modal (Cmd+S, Cmd+Z, Cmd+Shift+Z, Esc)
- [x] `?` help button in editor header
- [x] Section search/filter input (shown when page has 6+ sections)
- [x] Toast notification stack: `addToast(message, type, duration)` — max 3, auto-dismiss, stacks bottom-right
- [x] Empty state: when no sections, show helpful prompt with icon and instructions
- [x] Cmd+S / Ctrl+S already triggers `saveAll()` (Phase 2)

### 8.2 Frontend Micro-Interactions
- [x] Button hover: `scale(1.02) translateY(-1px)` + active press `scale(0.98)` on `.btn`
- [x] Link underline animation: `.link-underline` class with CSS `width` transition on `::after`
- [x] Card icon float: `.card-base:hover .material-icons` → `translateY(-3px)`
- [x] Navigation active indicator: `nav-link-active` class applied via JS on page load
- [x] Mobile menu: backdrop-filter blur added to slide-in menu
- [x] Cookie banner: slide-up animation already implemented (Phase 1)
- [x] All animations respect `prefers-reduced-motion`

### 8.3 Blog UX
- [x] Reading progress bar: thin blue line at top of viewport, fills as you scroll through post body
- [x] Social share buttons: X/Twitter, LinkedIn, Copy Link (with “Copied!” feedback) — no external scripts
- [x] Previous/Next post navigation at bottom of each post
- [x] Related Posts section (same tag match, max 3, with cover image)
- [x] Blog listing: tag filter UI — client-side filter buttons, no page reload, `data-tags` on each card

### 8.4 Multilingual Polish
- [x] Language switcher already shows flag + name (implemented in Phase 1)
- [x] Language switcher preserves current page path when switching languages
- [x] `dir="rtl"` support hook in `Layout.astro` — auto-applied for `ar`/`he` language codes

### 8.5 Footer Enhancement
- [x] Newsletter signup column added to footer grid (3-column layout: Brand, Contact, Newsletter)
- [x] Email input + Subscribe button with success/error feedback
- [x] `POST /api/subscribe` → stores emails in `src/content/subscribers.json`
- [x] `GET /api/subscribers` → returns subscriber list + count
- [x] Social icons already present (LinkedIn, X, Instagram, Facebook via Font Awesome)

---

## Priority Execution Order

If you can only do one phase at a time, this is the sequence that maximizes visible impact:

1. **Phase 2** (Live Preview + Auto-Save) — this alone transforms the editing experience
2. **Phase 1** (Typography, 404, Scroll Animations) — makes the output look finished
3. **Phase 4** (New Section Types) — unlocks building real pages
4. **Phase 5** (Frontend Excellence) — makes the output look premium
5. **Phase 3** (Drag-and-Drop, Templates) — makes the CMS feel like a product
6. **Phase 6** (Advanced CMS) — closes the gap on professional features
7. **Phase 7** (Production Hardening) — required before any real user traffic
8. **Phase 8** (Polish) — the last 1% that matters

---

## Definition of Done

The system reaches Squarespace parity when:
- A non-technical user can build and publish a complete landing page in under 30 minutes without reading any documentation
- The Lighthouse score is ≥ 90 on all four axes for every page
- Every editing action has immediate visual feedback (auto-save indicator or live preview update)
- Zero broken states are possible from the admin UI — all inputs are validated, all errors are surfaced gracefully
- A content change takes < 3 seconds to be visible in the preview iframe
- The output site scores 95+ on Google PageSpeed Insights on mobile

---

*Last updated: May 2026 | Total estimated tasks: 130+ | Total estimated effort: 6–8 weeks full-time*
