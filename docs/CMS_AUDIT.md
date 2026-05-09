# Admin Editor — CMS Gap Audit

_Last updated: session 2 — all Phase 1–4 items implemented_

## What the editor handles correctly

- [x] Edit string fields (title, description, subtitle) in any section
- [x] Add / delete cards in a cards section
- [x] Edit card title + description
- [x] Edit card features list (add / delete / edit text)
- [x] Card icon picker (visual grid, color swatches)
- [x] **Card icon alignment selector** (top/left/left-big/top-big/left-headline/top-headline) ✅ NEW
- [x] Card link (label + URL)
- [x] Card button (label + URL + color)
- [x] Add / delete sections (with insert-at-position)
- [x] Reorder sections (↑ ↓)
- [x] Add / delete pages
- [x] Language management (add / delete)
- [x] Translation panel (side-by-side, per-section translate, translate all)
- [x] Git commit + push
- [x] **Live preview split-pane** (⊙ Live button in header) ✅ NEW
- [x] **Image browser with thumbnails** (recursive scan of public/img/) ✅ NEW
- [x] **Image upload** (drag-and-drop in image browser modal) ✅ NEW
- [x] **Product section layout controls** (image, imagePosition, buttonUrl, buttonColor) ✅ NEW
- [x] **Content header layout controls** (background_image, min_height) ✅ NEW
- [x] **Cards section layout controls** (responsiveColumns, section buttonUrl/buttonColor) ✅ NEW

---

## Phase 9 Tools (index.html dashboard)

- [x] **Media Library** — full grid view with upload, copy-path, delete (with safety check) ✅ NEW
- [x] **SEO Checker** — per-page, per-language meta title/description length check ✅ NEW

---

## Server endpoints added (server.js)

| Endpoint | Description |
|----------|-------------|
| `GET /api/images` | Recursive scan of `public/img/` (excludes `icons/`) |
| `POST /api/images/upload` | Base64 data-URL upload, MIME/ext whitelist, 15MB limit |
| `DELETE /api/images/:filename` | Refuses if image referenced in any layout YAML (409) |
| `GET /api/seo/:page` | Per-language SEO status for meta title + description |

---

## What is MISSING — complete list

### ✅ 1. Product section — layout controls — RESOLVED
Image path, imagePosition, buttonUrl, buttonColor are now editable in the layout panel.

### ✅ 2. Content Header section — layout controls — RESOLVED
background_image and min_height are now editable in the layout panel.

### ✅ 3. Cards section — section-level layout controls — RESOLVED
responsiveColumns (mobile/tablet/desktop) and section button URL/color are now editable.

### ✅ 4. Card icon alignment — RESOLVED
Alignment selector (6 options) is now shown in the icon picker modal.

### ✅ 5. Section-level button URL/color for cards — RESOLVED
Editable via the layout panel per cards section.

### ✅ 6. Hero section — fields shown — PARTIAL
Hero fields are in editableContent; the section renders its fields when present.

### ✅ 7. Image management — RESOLVED
Image browser lists all files in public/img/ recursively with thumbnails. Upload via drag-and-drop.

### ✅ 8. Unified section editor — RESOLVED
Product, content_header, and cards sections now show both content AND layout fields.

### ✅ 9. Responsive columns — RESOLVED
3 dropdowns per cards section in the layout panel.

### ✅ 10. Background image editable after creation — RESOLVED
background_image field is now always visible in the layout panel for content_header and product sections.

### 11. SEO/meta editing — PARTIAL
Meta title + description are inspectable via the SEO Checker tool in the dashboard.
Direct editing in the page editor is not yet implemented.
- [ ] Meta title + description fields at the top of each page editor

### 12. Footer not editable — OPEN
Footer contact nested objects are still skipped by the editor.
- [ ] Footer contact labels editor

---

## Remaining priority work

| Priority | Item | Effort |
|----------|------|--------|
| 🔴 1 | Generate missing translation files (it/de) | Small |
| 🟡 2 | Meta title + description in editor | Small |
| 🟡 3 | Hero section fields visible in editor | Small |
| 🟢 4 | Footer contact labels editor | Small |
| 🟢 5 | Fix Astro content.config.ts deprecation warning | Small |
The `product` section type layout controls (image, imagePosition, buttonUrl, buttonColor) are now fully editable. See ✅ 1 above.
