# CLI Commands Reference

All commands run from the project root.

## Development

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Astro dev server at `localhost:4321` |
| `npm run dev:local` | Start dev server accessible on local network |
| `npm run admin` | Start content editor at `localhost:4322` |
| `npm run dev:translate` | Watch master content and auto-translate on change |
| `npm run preview` | Preview production build locally |

## Building

| Command | Description |
|---------|-------------|
| `npm run build` | Validate content then build production site to `dist/` |
| `npm run build:skip-validate` | Build without validation (CI use only) |
| `npm run build:production` | Build with `NODE_ENV=production` |

## Content Validation

| Command | Description |
|---------|-------------|
| `npm run validate` | Check all content files — errors block, warnings inform |
| `npm run validate:strict` | Same but missing translations are errors (not warnings) |

## Translations

| Command | Description |
|---------|-------------|
| `npm run translate` | Translate all outdated/missing content via gpt-4o-mini |
| `npm run translate:status` | Show translation freshness per page/language |
| `npm run translate -- --lang=it` | Translate only Italian |
| `npm run translate -- --lang=de` | Translate only German |
| `npm run translate -- --page=home` | Translate only the home page |
| `npm run translate -- --page=b2b --lang=it` | Translate B2B page to Italian only |
| `npm run translate -- --force` | Re-translate even if already current |

## Content Files

```
src/content/
├── master/          ← Edit these (English source of truth)
│   ├── home.yaml
│   ├── b2b.yaml
│   ├── wfm.yaml
│   ├── elysia.yaml
│   └── academy.yaml
├── layout/          ← Edit these for structure changes (icons, columns, section order)
│   └── *.yaml
└── translations/    ← Auto-generated, do not edit manually
    ├── it/
    ├── de/
    └── .meta.json   ← Translation metadata (timestamps, hashes)
```

## Adding a New Language

1. Open the admin editor: `npm run admin`
2. Click **+ Add Language** in the sidebar
3. Enter the language code (e.g. `es`), name (`Español`), and flag emoji (`🇪🇸`)
4. Click **Add Language** — the directory is scaffolded
5. Go to the **Translate** panel for each page and click **✦ Translate All**
6. Review translations in the side-by-side view
7. Commit and push

Or via CLI:
```bash
# Add to .meta.json manually, then:
npm run translate -- --lang=es
```

## Adding a New Page

1. Create `src/content/master/<page>.yaml` with your content
2. Create `src/content/layout/<page>.yaml` with section structure
3. Add the page to `getStaticPaths()` in `src/pages/[...slug].astro`
4. Run `npm run translate` to generate translations
5. Run `npm run validate` to confirm everything is correct

## Adding a New Section to an Existing Page

1. Add the section content to `src/content/master/<page>.yaml`
2. Add the section config to `src/content/layout/<page>.yaml` under `page_sections`
3. Run `npm run translate -- --page=<page>` to translate the new section
4. Run `npm run validate` to confirm

## Manually Overriding a Translation

Add `_manual: true` to any field in a translation file to prevent it from being overwritten by `npm run translate`:

```yaml
# translations/it/home.yaml
hero:
  title: "My custom Italian title"
  _manual: true   # ← this field will never be auto-translated
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | For translations | Your OpenAI API key |

Set in `.env.local` (gitignored):
```
OPENAI_API_KEY=sk-your-key-here
```
