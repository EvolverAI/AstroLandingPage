# Contributing to EvolverAI Landing Page

## Quick Start

```bash
# 1. Clone and install
git clone <repo-url>
cd evolverai-landipage
npm install

# 2. Add your OpenAI key (for translations)
echo "OPENAI_API_KEY=sk-your-key-here" > .env.local

# 3. Start everything
npm run dev    # Astro at localhost:4321
npm run admin  # Editor at localhost:4322
```

---

## The Golden Rule

**Never edit translation files directly.**

Always edit `src/content/master/*.yaml` (English), then run `npm run translate` to regenerate translations. The only exception is manual overrides (see [CLI.md](./CLI.md#manually-overriding-a-translation)).

---

## Editing Content

### Via the Admin Editor (recommended)

1. `npm run admin` → open `http://localhost:4322`
2. Click a page in the sidebar → **Edit** tab
3. Edit fields inline, click **Save** per section
4. Switch to **Translate** tab to update translations
5. When done → **Commit & Push** button in the header

### Via YAML directly

1. Edit `src/content/master/<page>.yaml`
2. Run `npm run translate -- --page=<page>` to update translations
3. Run `npm run validate` to check everything is correct
4. Commit and push

---

## Content Structure

Each page has two files:

**`src/content/master/<page>.yaml`** — translatable strings only:
```yaml
hero:
  title: "My Page Title"
  subtitle: "A subtitle"

services:
  title: "What we do"
  cards:
    - title: "Card 1"
      description: "Description here"
```

**`src/content/layout/<page>.yaml`** — structure only (icons, section order, responsive columns):
```yaml
page_sections:
  - type: "hero"
    section_id: "hero"
    order: 1
  - type: "cards"
    section_id: "services"
    order: 2

section_config:
  services:
    responsiveColumns:
      mobile: 1
      tablet: 2
      desktop: 4
    cards:
      - icon: { type: "check_circle", alignment: "top" }
```

---

## Workflow for Common Tasks

### Update existing text
1. Edit the string in `src/content/master/<page>.yaml`
2. `npm run translate -- --page=<page>` — updates only changed strings
3. `npm run validate` — confirm no errors
4. Commit

### Add a new card to a section
1. Add the card object to `master/<page>.yaml` under the section's `cards` array
2. Add the corresponding icon config to `layout/<page>.yaml` under `section_config.<section>.cards`
3. `npm run translate -- --page=<page>`
4. Commit

### Add a new language
See [CLI.md — Adding a New Language](./CLI.md#adding-a-new-language)

### Add a new page
See [CLI.md — Adding a New Page](./CLI.md#adding-a-new-page)

---

## Before Committing

The pre-commit hook runs `npm run validate` automatically. If it fails, fix the errors before committing.

You can also run it manually:
```bash
npm run validate          # warnings OK, errors block
npm run validate:strict   # missing translations are also errors
```

---

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production — auto-deploys to Netlify |
| `develop` | Staging — test changes before merging to main |
| `feature/*` | Feature branches — merge to develop |

---

## Deployment

Netlify auto-deploys on every push to `main`. No manual steps needed.

To deploy manually:
```bash
npm run build
# Drag dist/ to Netlify's deploy interface
```

Or use the admin editor's **Commit & Push** button which commits all changes and pushes to `main`.

---

## Project Structure

```
src/
├── components/       # Astro components
│   ├── global/       # Shared: CardsSection, ProductSection, etc.
│   ├── home/         # HeroSection
│   ├── Header.astro
│   ├── Footer.astro
│   └── LanguageSwitcher.astro
├── content/
│   ├── master/       # ← Edit here (English)
│   ├── layout/       # ← Edit here (structure)
│   └── translations/ # ← Auto-generated
├── layouts/
│   └── Layout.astro  # HTML shell, SEO, hreflang
├── pages/
│   ├── index.astro   # Language detection redirect
│   ├── [...slug].astro # Dynamic page renderer
│   └── sitemap.xml.ts
└── styles/
    ├── design-tokens.css
    └── global.css
```

See [CLI.md](./CLI.md) for all available commands.
