# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

| Command | Action |
| :-- | :-- |
| `npm run dev` | Astro dev server at `localhost:4321`. The Keystatic editor is at `/keystatic`. |
| `npm run cms` | Alias for `dev` — open `/keystatic` to edit content. |
| `npm run build` | Production static build to `./dist/` (the Zod content schema is validated here). |
| `npm run preview` | Serve the production build locally. |
| `npm run check` | `astro check` — TypeScript + content-schema validation (the pre-commit + CI gate). |
| `npm run translate` | AI-translate EN pages → other locales (`-- --lang=it`, `-- --page=home`). Needs `OPENAI_API_KEY`. |
| `npm run translate:status` | Show which locale files exist per page. |

There is no unit-test suite; `astro check` is the quality gate (enforced by the Husky
`pre-commit` hook and CI). Content validity is enforced by the schema during `astro build`.

## Architecture

A **content-driven static Astro site** (output: `static`, deployed to Netlify). One Zod
schema is the single source of truth; rendering, validation, and the editing UI all derive
from it.

### Single content schema

[src/content.config.ts](src/content.config.ts) defines the collections and is the source of
truth:

- **`pages`** — one entry per locale at `src/content/pages/<locale>/<page>.yaml`
  (`en`/`it`/`de` × `home`/`b2b`/`wfm`/`elysia`/`academy`). Each entry has `meta`, optional
  `status` (`draft` pages 404 in prod), a `footer`, and a `sections` array.
- **Sections** are a Zod `discriminatedUnion` on `type` (`hero`, `cards`, `product`,
  `content_header`, `testimonials`, `pricing`, `blog`, … 16 types total). The exported
  `Section` type drives the typed render switch.
- Sections are stored in Keystatic's polymorphic `{ discriminant, value }` shape and
  flattened to the flat `{ type, … }` union by a `z.preprocess` in the schema — so the
  renderer always sees a clean, typed `Section`.
- **`pageDefaults`** — per-page design tokens (card styling, responsive columns) at
  `src/content/page-defaults/<page>.yaml`. Presentation, not content; locale-agnostic; not
  exposed in Keystatic.
- **`blog`** — Markdown collection in `src/content/blog/` (Content Layer glob loader; entries
  use `.id`, rendered with `render(entry)`).

### Rendering

- [src/pages/\[...slug\].astro](src/pages/[...slug].astro) generates a static page per
  `pages` entry (`getStaticPaths` from `getCollection('pages')`; `home` → `/en`, others →
  `/en/b2b`). It loads matching `pageDefaults` and maps each section through DynamicSection.
- [src/components/DynamicSection.astro](src/components/DynamicSection.astro) is a **pure
  typed switch** on `section.type` — there is **no runtime layout/content merge** (data is
  pre-merged). To add a section type: add it to the Zod union, the Keystatic config, and a
  branch here.
- Section components live in [src/components/global/](src/components/global/) (+ `home/`) and
  consume schema-derived types (e.g. `SectionCard`, `ResponsiveColumns`).

### Editing (Keystatic)

[keystatic.config.ts](keystatic.config.ts) is the local, Git-based editor — 15 singletons
(locale × page) sharing one schema that **mirrors** the Zod schema (sections as
`fields.conditional`). Run `npm run dev`, open `/keystatic`, edit, commit. Keystatic is wired
in only outside production (see [astro.config.mjs](astro.config.mjs)
`enableKeystatic`), so the deployed build stays pure-static with no adapter.

**Invariant:** [keystatic.config.ts](keystatic.config.ts) and the Zod schema must stay in
sync — every field present in the YAML must be modeled in both, or Keystatic's strict reader
rejects the file. Run a `createReader` smoke check after schema changes.

### i18n & routing (Netlify)

- Native Astro i18n (`defaultLocale: en`, locales `en/it/de`, `prefixDefaultLocale: true`,
  `redirectToDefaultLocale: false`). Central config in [src/i18n.ts](src/i18n.ts).
- Unprefixed paths (`/`, `/b2b`, …) are redirected server-side by
  [netlify/edge-functions/lang-redirect.js](netlify/edge-functions/lang-redirect.js)
  (`lang` cookie → `Accept-Language` → `en`). There is **no** SPA catch-all; unknown URLs
  serve the real 404. Per-locale hreflang/canonical live in
  [src/layouts/Layout.astro](src/layouts/Layout.astro).

## Gotchas

- Editing a page in Keystatic and saving will normalize the file (empty optional fields,
  nested `{ discriminant, value }` shapes) — expected; the schema strips/handles them at read.
- Translation only rewrites a whitelist of human-text keys (see
  [scripts/translate.js](scripts/translate.js)); ids, classes, URLs, icon names are preserved.
- The legacy bespoke admin (Express + a 3,000-line editor) and the old three-file content
  model (`layout/` + `master/` + `translations/`) have been removed — don't reintroduce them.
