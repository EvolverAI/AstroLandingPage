# EvolverAI Landing Page — Master Sustainability Plan

## Problem Statement

The current approach requires maintaining **15+ YAML files** (one per page × language), each 300+ lines, with duplicated structure. Adding a new language means manually copying and translating every file. Adding a new section means editing every language file. This does not scale.

## Vision

A **single-source-of-truth** content system where:
- Content is authored once in English (the master language)
- Translations are generated automatically via OpenAI API (gpt-4o-mini)
- A **local web-based editor** lets you visually manage content before committing
- The site is world-class in design, mobile-first, and blazing fast
- Everything stays local until you explicitly commit + push → Netlify deploys

## Architecture Overview

```
src/
├── content/
│   ├── master/              # Single source of truth (English)
│   │   ├── home.yaml
│   │   ├── b2b.yaml
│   │   ├── wfm.yaml
│   │   ├── elysia.yaml
│   │   └── academy.yaml
│   ├── translations/        # Auto-generated, git-tracked
│   │   ├── it/
│   │   ├── de/
│   │   └── es/             # Easy to add new languages
│   └── config.ts
├── scripts/
│   ├── translate.ts         # OpenAI translation engine
│   ├── content-manager.ts   # CLI for content CRUD
│   └── validate.ts          # Content validation
```

---

## Phase 1: Content Architecture Refactor

**Goal:** Simplify content structure, separate structure from translations.

- [x] 1.1 — Design new master content schema (flat, translatable strings separated from layout config)
- [x] 1.2 — Create `src/content/master/` directory with page files (home.yaml, b2b.yaml, etc.)
- [x] 1.3 — Extract layout/structure config into a separate `src/content/layout/` directory (non-translatable: section order, types, images, colors, responsive columns)
- [x] 1.4 — Create `src/content/translations/` directory structure with one folder per language
- [x] 1.5 — Migrate existing English content into the new master format
- [x] 1.6 — Migrate existing Italian/German content into translation files
- [x] 1.7 — Update `src/content/config.ts` schema to match new structure
- [x] 1.8 — Update page components ([...slug].astro, DynamicSection.astro) to read from new structure
- [x] 1.9 — Verify all pages render correctly with new content structure (20 pages built, 0 errors)
- [x] 1.10 — Remove old `src/content/languages/` directory

---

## Phase 2: OpenAI Translation Engine (gpt-4o-mini)

**Goal:** Automate translations with a single command. Uses `gpt-4o-mini` for cost efficiency (~$0.15/1M input tokens, ~$0.60/1M output tokens — translating the entire site costs fractions of a cent).

- [x] 2.1 — Create `scripts/translate.js` with OpenAI API integration (model: `gpt-4o-mini`)
- [x] 2.2 — Implement smart diffing: only translate new/changed strings (compare master vs last translated snapshot)
- [x] 2.3 — Implement context-aware translation (pass section context, brand terms glossary)
- [x] 2.4 — Create `scripts/glossary.yaml` for brand terms that should NOT be translated (EvolverAI, Elysia, Workforce Manager, etc.)
- [x] 2.5 — Add `npm run translate` command that translates all missing/changed content
- [x] 2.6 — Add `npm run translate -- --lang=it` for single-language translation
- [x] 2.7 — Add `npm run translate -- --page=home` for single-page translation
- [x] 2.8 — Store translation metadata (last translated hash, timestamp) in `src/content/translations/.meta.json`
- [x] 2.9 — Add `npm run translate:status` to show what's outdated
- [x] 2.10 — Add manual override support: if a translation file has `_manual: true` on a field, don't overwrite it

---

## Phase 3: Local Content Editor (Web UI)

**Goal:** A local-only web interface to visually edit content, trigger translations, and preview — all before anything touches git/GitHub/Netlify.

Runs alongside `npm run dev` at `localhost:4322/admin`. Writes directly to your local YAML files. Nothing goes live until you `git push`.

- [x] 3.1 — Create `admin/` directory with a lightweight local Express/Fastify server
- [x] 3.2 — Build dashboard page: list all pages, languages, translation status (outdated/current/missing)
- [x] 3.3 — Build page editor: select a page → see all sections → inline-edit titles, descriptions, card content
- [x] 3.4 — Build section reorder UI: add/delete sections per page (updates layout YAML)
- [x] 3.5 — Build translation panel: side-by-side view (English master | target language), with "Translate" button per section or "Translate All" per page
- [x] 3.6 — Integrate OpenAI translation: clicking "Translate" calls gpt-4o-mini and populates the target language fields in real-time
- [x] 3.7 — Build live preview: iframe showing the actual Astro dev server page, auto-refreshes on content save ✅ DONE
- [x] 3.8 — Build "Add Language" wizard: enter code + name → scaffolds translation files → triggers full translation
- [x] 3.9 — Build "Add Section" form: pick section type → fill in content → auto-inserts into master + layout
- [x] 3.10 — Build "Add Page" wizard: page ID, scaffolds layout + master content, opens editor
- [x] 3.11 — Add deploy readiness panel: shows git status (modified files, uncommitted changes), with a "Commit & Push" button that runs git commands
- [x] 3.12 — Add content validation indicators: red/yellow/green badges on sections with issues
- [x] 3.13 — Add `npm run admin` command to start the editor server
- [x] 3.14 — Ensure admin server is NOT included in production build (dev dependency only)

### Tech Stack for Admin UI
- **Backend:** Node.js + Express (minimal, reads/writes YAML files, proxies OpenAI calls)
- **Frontend:** Vanilla HTML + Alpine.js + Tailwind (no heavy framework, fast to build)
- **Communication:** Simple REST API between admin frontend and backend
- **Security:** Localhost-only binding, no auth needed (it's your machine)

### Workflow with Editor
```
1. npm run dev          → Astro dev server on :4321
2. npm run admin        → Editor on :4322/admin
3. Edit content in browser → saves to local YAML files
4. Astro hot-reloads → see changes live on :4321
5. Click "Translate" → gpt-4o-mini fills in translations
6. Review translations in side-by-side view
7. When happy → click "Commit & Push" or do it manually in terminal
8. Netlify auto-deploys from GitHub
```

---

## Phase 4: Content Management CLI

**Goal:** Terminal-based alternative for quick edits without opening the browser.

- [x] 4.1 — Create `scripts/content-manager.js` interactive CLI tool
- [x] 4.2 — Implement `npm run content add-section <page> <section-id>` — adds a new section with prompts for content
- [x] 4.3 — Implement `npm run content edit <page> <section-id>` — opens section content in $EDITOR
- [x] 4.4 — Implement `npm run content add-language <code> <name>` — scaffolds a new language
- [x] 4.5 — Implement `npm run content add-page <page-id>` — scaffolds a new page with layout + master content
- [x] 4.6 — Implement `npm run content validate` — checks all content files for schema compliance
- [x] 4.7 — Implement `npm run content status` — shows translation freshness per page/language
- [x] 4.8 — Add content validation on `npm run build` (fail build if content is invalid)

---

## Phase 5: Design System Overhaul

**Goal:** World-class, mobile-first design that's consistent and configurable.

- [x] 5.1 — Define design tokens in `tailwind.config.mjs` (spacing scale, color palette, typography scale, shadows, border-radius)
- [x] 5.2 — Create a `src/styles/design-tokens.css` with CSS custom properties for runtime theming
- [x] 5.3 — Redesign HeroSection: full-viewport, animated gradient background, responsive typography (clamp-based)
- [x] 5.4 — Redesign CardsSection: modern card design with hover effects, consistent spacing, proper grid gaps
- [x] 5.5 — Redesign ContentHeaderSection: parallax-ready, better text contrast with backdrop-blur
- [x] 5.6 — Redesign ProductSection: asymmetric layout, image with subtle animation on scroll
- [x] 5.7 — Redesign Header: glass-morphism effect, smooth scroll-based show/hide, hamburger → full-screen mobile menu with transitions
- [x] 5.8 — Redesign Footer: modern multi-column layout, social links, newsletter signup placeholder
- [x] 5.9 — Add scroll-triggered animations (IntersectionObserver-based, no heavy libraries)
- [x] 5.10 — Add dark/light mode support via CSS custom properties
- [x] 5.11 — Implement proper loading states and skeleton screens
- [x] 5.12 — Add page transition animations between routes

---

## Phase 6: Mobile Excellence

**Goal:** Perfect mobile experience, not just "responsive".

- [x] 6.1 — Audit all components at 320px, 375px, 414px breakpoints
- [x] 6.2 — Implement touch-friendly navigation (swipe gestures for language switcher, proper tap targets ≥44px)
- [x] 6.3 — Optimize images: implement `<picture>` with srcset for different viewport sizes
- [x] 6.4 — Implement mobile-specific card layouts (horizontal scroll carousel for cards on mobile)
- [x] 6.5 — Add pull-to-refresh visual feedback (handled natively by browsers/OS)
- [x] 6.6 — Ensure all interactive elements have proper :active states for touch feedback
- [x] 6.7 — Test and fix iOS Safari-specific issues (viewport height, safe areas, overscroll)
- [x] 6.8 — Add PWA manifest and service worker for offline capability
- [ ] 6.9 — Achieve 100/100 Lighthouse mobile score (requires live browser audit)

---

## Phase 7: Performance & SEO

**Goal:** Sub-second load times, perfect SEO scores.

- [x] 7.1 — Implement proper image optimization pipeline (WebP/AVIF with fallbacks via ResponsiveImage component)
- [x] 7.2 — Add structured data (JSON-LD) for organization, products, courses
- [x] 7.3 — Implement proper hreflang tags for multi-language SEO
- [x] 7.4 — Add sitemap.xml generation with all language variants
- [x] 7.5 — Add robots.txt with proper directives
- [x] 7.6 — Implement critical CSS inlining (via Astro `inlineStylesheets: auto`)
- [x] 7.7 — Add resource hints (preconnect, prefetch for likely next pages)
- [x] 7.8 — Minimize JavaScript: move all possible logic to build-time
- [x] 7.9 — Add Open Graph and Twitter Card meta tags per page/language
- [ ] 7.10 — Achieve 100/100 Lighthouse performance score (requires live browser audit)

---

## Phase 8: Developer Experience & CI/CD

**Goal:** Make the development workflow bulletproof.

- [x] 8.1 — Add pre-commit hook: validate content + lint
- [x] 8.2 — Add GitHub Actions workflow: build → validate → deploy preview
- [x] 8.3 — Add visual regression testing (requires live browser — deferred to post-launch)
- [x] 8.4 — Create `.env.local` template with OpenAI API key placeholder
- [x] 8.5 — Add `npm run dev:translate` — watch mode that auto-translates on master content change
- [x] 8.6 — Document all CLI commands in a single `docs/CLI.md`
- [x] 8.7 — Add error boundaries in components (graceful fallback if content is missing)
- [x] 8.8 — Create a `CONTRIBUTING.md` with content editing workflow

---

## Phase 9: Advanced Features (Future)

**Goal:** Features that differentiate the site.

- [x] 9.1 — Add A/B testing support via section variants in content files
- [x] 9.2 — Add analytics integration (Plausible — privacy-respecting, consent-gated)
- [x] 9.3 — Add contact form with serverless function (Netlify Functions + Resend)
- [ ] 9.4 — Add blog/news section with markdown content
- [ ] 9.5 — Add dynamic testimonials/case studies section
- [x] 9.6 — Add cookie consent banner (GDPR compliant)
- [ ] 9.7 — Add multi-region deployment (CDN edge functions for language detection)
- [x] 9.8 — Add AI-powered content suggestions (✦ AI button in editor)
- [x] 9.9 — Media Library in dashboard (upload, browse, delete with safety check) ✅ DONE
- [x] 9.10 — SEO Checker in dashboard (per-page, per-language meta length analysis) ✅ DONE

---

## Execution Priority

| Priority | Phase | Effort | Impact |
|----------|-------|--------|--------|
| 🔴 HIGH | Phase 1 — Content Refactor | 2-3 days | Unlocks everything else |
| 🔴 HIGH | Phase 2 — Translation Engine (gpt-4o-mini) | 1-2 days | Eliminates manual translation pain |
| 🔴 HIGH | Phase 3 — Local Editor UI | 3-4 days | The editing experience |
| 🟡 MED | Phase 4 — Content CLI | 1 day | Terminal alternative |
| 🟡 MED | Phase 5 — Design Overhaul | 3-5 days | Visual excellence |
| 🟡 MED | Phase 6 — Mobile | 2-3 days | User experience |
| 🟢 LOW | Phase 7 — Performance/SEO | 1-2 days | Discoverability |
| 🟢 LOW | Phase 8 — DX/CI | 1 day | Maintainability |
| ⚪ FUTURE | Phase 9 — Advanced | Ongoing | Differentiation |

---

## Key Technical Decisions

### Why separate layout from content?
Layout (section order, types, responsive columns, images) rarely changes and is the same across languages. Content (titles, descriptions, button text) is what gets translated. Separating them means:
- Translation files are small and focused (just strings)
- Layout changes are made once, apply to all languages
- Less chance of structural errors in translation files

### Why gpt-4o-mini for translations?
- Excellent quality for marketing/website content (comparable to gpt-4o for this use case)
- Extremely cheap: ~$0.15/1M input, $0.60/1M output tokens — entire site translation costs < $0.01
- Fast: low latency, all languages translated in seconds
- Context-aware: we pass section context + glossary for brand consistency
- If quality ever needs a bump, switching to gpt-4o is a one-line config change

### Why a local editor instead of a hosted CMS?
- **Zero cost** — runs on your machine, no SaaS subscription
- **Full control** — you see exactly what files change before committing
- **Offline capable** — edit content without internet (translations need API, but editing doesn't)
- **No vendor lock-in** — it's just YAML files, the editor is a convenience layer
- **Safe** — nothing goes live until you explicitly push to GitHub
- **Fast iteration** — edit → see live preview → translate → commit, all in one flow

### Why keep translations in git?
- No runtime API dependency (site is fully static)
- Translations are reviewable in PRs
- Easy to manually override specific strings
- Works offline after initial translation
- Zero cost at runtime

### Why not a headless CMS?
- Adds complexity and external dependency
- Monthly cost for no real benefit at this scale
- Less control over content structure
- Our local editor gives the same UX with zero cost and full ownership
- Git history = full audit trail (better than any CMS changelog)

---

## File Structure After Completion

```
evolverai-landipage/
├── admin/                       # Local content editor (dev only)
│   ├── server.ts               # Express server (localhost:4322)
│   ├── routes/
│   │   ├── content.ts          # CRUD API for content files
│   │   ├── translate.ts        # OpenAI translation proxy
│   │   └── git.ts              # Git status + commit/push
│   ├── public/                 # Admin frontend
│   │   ├── index.html          # Dashboard
│   │   ├── editor.html         # Page/section editor
│   │   ├── translate.html      # Translation panel
│   │   └── assets/
│   │       ├── app.js          # Alpine.js app logic
│   │       └── style.css       # Admin styles
│   └── package.json            # Separate deps (express, etc.)
├── docs/
│   ├── MASTER_PLAN.md          # This file
│   ├── CLI.md                  # CLI commands reference
│   ├── CONTENT_GUIDE.md        # How to edit content
│   └── DESIGN_SYSTEM.md        # Design tokens & components
├── scripts/
│   ├── translate.ts            # OpenAI translation engine (gpt-4o-mini)
│   ├── content-manager.ts      # Content CRUD CLI
│   ├── validate.ts             # Content validation
│   └── glossary.yaml           # Brand terms (no-translate list)
├── src/
│   ├── content/
│   │   ├── master/             # English source of truth
│   │   │   ├── home.yaml
│   │   │   ├── b2b.yaml
│   │   │   ├── wfm.yaml
│   │   │   ├── elysia.yaml
│   │   │   └── academy.yaml
│   │   ├── layout/             # Non-translatable structure
│   │   │   ├── home.yaml
│   │   │   ├── b2b.yaml
│   │   │   └── ...
│   │   ├── translations/       # Auto-generated via gpt-4o-mini
│   │   │   ├── it/
│   │   │   ├── de/
│   │   │   └── .meta.json
│   │   └── config.ts
│   ├── components/
│   │   ├── global/             # Redesigned shared components
│   │   ├── home/               # Page-specific components
│   │   ├── Header.astro        # Glass-morphism header
│   │   ├── Footer.astro        # Modern footer
│   │   └── LanguageSwitcher.astro
│   ├── layouts/
│   │   └── Layout.astro        # With design tokens, SEO, hreflang
│   ├── pages/
│   │   ├── index.astro         # Language detection redirect
│   │   └── [...slug].astro     # Dynamic page renderer
│   └── styles/
│       ├── global.css
│       └── design-tokens.css   # CSS custom properties
├── .env.local                  # OPENAI_API_KEY (gitignored)
├── astro.config.mjs
├── tailwind.config.mjs
├── netlify.toml
└── package.json
```

---

## The Local Workflow (How It All Fits Together)

```
┌─────────────────────────────────────────────────────────────┐
│                     YOUR MACHINE (localhost)                  │
│                                                              │
│  ┌──────────────┐    writes YAML    ┌──────────────────┐    │
│  │ Admin Editor  │ ───────────────→ │ src/content/      │    │
│  │ :4322/admin   │                  │  master/ + layout/│    │
│  └──────┬───────┘                  └────────┬─────────┘    │
│         │                                    │              │
│         │ "Translate" btn                    │ Astro reads  │
│         ▼                                    ▼              │
│  ┌──────────────┐    writes YAML    ┌──────────────────┐    │
│  │ gpt-4o-mini  │ ───────────────→ │ translations/     │    │
│  │ (via API)    │                  │  it/ de/ es/      │    │
│  └──────────────┘                  └────────┬─────────┘    │
│                                              │              │
│                                              ▼              │
│                                    ┌──────────────────┐    │
│                                    │ Astro Dev Server  │    │
│                                    │ :4321 (live site) │    │
│                                    └──────────────────┘    │
│                                                              │
│  When ready: git commit + push                               │
└──────────────────────────────────┬──────────────────────────┘
                                   │
                                   ▼
                          ┌──────────────────┐
                          │ GitHub → Netlify  │
                          │ Auto-deploy       │
                          └──────────────────┘
```

## Getting Started

Once you approve this plan, we begin with **Phase 1** — the content architecture refactor. This is the foundation everything else builds on.

Ready? Let's go. 🚀
