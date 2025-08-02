# Generic Multi-Language Routing System

## Overview

This project uses a comprehensive routing system that automatically handles all language and page combinations through two main components:

1. **Page Redirector** (`[page].astro`) - Catches page-only URLs and redirects to language-specific versions
2. **Generic Router** (`[...slug].astro`) - Handles all language-specific URLs

## Routing Structure

### URL Patterns

#### Page-Only URLs (Auto-Redirect)
These URLs automatically redirect to the user's preferred language:
- `/b2b` → `/en/b2b` (or `/de/b2b`, `/it/b2b` based on preference)
- `/wfm` → `/en/wfm` (or `/de/wfm`, `/it/wfm` based on preference)
- `/elysia` → `/en/elysia` (or `/de/elysia`, `/it/elysia` based on preference)
- `/courses` → `/en/courses` (or `/de/courses`, `/it/courses` based on preference)

#### Language-Specific URLs (Direct Access)
These URLs serve content directly:
- `/en`, `/de`, `/it` → Language-specific homepages
- `/en/b2b`, `/de/b2b`, `/it/b2b` → B2B pages in each language
- `/en/wfm`, `/de/wfm`, `/it/wfm` → WFM pages in each language
- `/en/elysia`, `/de/elysia`, `/it/elysia` → Elysia pages in each language
- `/en/courses`, `/de/courses`, `/it/courses` → Courses pages in each language

### Language Detection & Preferences

The page redirector uses the following priority:
1. **User Preference**: Stored in `localStorage.userLanguagePreference`
2. **Browser Language**: Detected from `navigator.language`
3. **Default Fallback**: English (`en`)

### Supported Languages
- `en` - English
- `de` - German (Deutsch)
- `it` - Italian (Italiano)

### Supported Pages
- `index` - Homepage (accessible via `/{lang}`)
- `b2b` - B2B solutions page
- `wfm` - Workforce Management page
- `elysia` - Elysia platform page  
- `courses` - Training courses page

## How It Works

### 1. Page Redirector (`[page].astro`)
Catches page-only URLs and redirects them to language-specific versions:
```javascript
// Catches: /b2b, /wfm, /elysia, /courses
export async function getStaticPaths() {
    const AVAILABLE_PAGES = ["b2b", "wfm", "elysia", "courses"];
    // Generates redirect pages for each
}
```

**Redirect Logic:**
1. Check `localStorage.userLanguagePreference`
2. If not found, detect browser language from `navigator.language`
3. Fallback to English if language not supported
4. Redirect to `/{detectedLanguage}/{pageName}`

### 2. Generic Router (`[...slug].astro`)
Handles all language-specific URLs and serves actual content:
```javascript
// Handles: /en, /de, /it, /en/b2b, /de/wfm, etc.
AVAILABLE_LANGUAGES.forEach(lang => {
    AVAILABLE_PAGES.forEach(page => {
        // Generate all combinations
    });
});
```

### 3. Static Path Generation
Both routers pre-generate all possible paths at build time:

**Page Redirector generates:**
- `/b2b/index.html` (redirect page)
- `/wfm/index.html` (redirect page)  
- `/elysia/index.html` (redirect page)
- `/courses/index.html` (redirect page)

**Generic Router generates:**
- `/en/index.html`, `/de/index.html`, `/it/index.html` (homepages)
- `/en/b2b/index.html`, `/de/b2b/index.html`, `/it/b2b/index.html` (content pages)
- All other language/page combinations

### 4. Language File Mapping
- Homepage: `{lang}.yaml` (e.g., `en.yaml`, `de.yaml`, `it.yaml`)
- Other pages: `{page}-{lang}.yaml` (e.g., `b2b-en.yaml`, `wfm-de.yaml`)

### 5. Fallback Mechanism
If a requested language file doesn't exist, the system falls back to English:
```javascript
try {
    const langData = await getEntry("languages", languageFile);
    // ... load content
} catch (error) {
    // Fallback to English
    const fallbackFile = page === "index" ? "en" : `${page}-en`;
    const fallbackData = await getEntry("languages", fallbackFile);
    // ... load fallback content
}
```

## Header Navigation Updates

The Header component now generates language-aware URLs:
```astro
<a href={`/${currentLanguage}/b2b`}>B2B</a>
<a href={`/${currentLanguage}/courses`}>Courses</a>
```

## Language Switcher Updates

The LanguageSwitcher component automatically preserves the current page when switching languages using the `generateLanguageUrl()` function.

## Benefits

1. **User-Friendly URLs**: Users can type `/b2b` and get redirected to their preferred language
2. **SEO Friendly**: Each language version gets its own URL for proper indexing
3. **Language Persistence**: User preferences are remembered across sessions
4. **Simplified Structure**: Two router files handle all routing logic
5. **Automatic Generation**: All routes are generated automatically at build time
6. **Graceful Fallbacks**: Missing content falls back to English
7. **Performance**: Static pre-generation means fast page loads

## User Experience Flow

### First Visit to `/b2b`
1. User visits `/b2b`
2. Browser language detected (e.g., German)
3. Preference saved to localStorage
4. Redirect to `/de/b2b`
5. German B2B content displayed

### Subsequent Visits
1. User visits `/b2b` again
2. System reads saved preference (German)
3. Immediate redirect to `/de/b2b`
4. Fast loading with user's preferred language

### Direct Language Access
1. User visits `/it/b2b` directly
2. Italian content served immediately
3. No redirects needed

## Adding New Languages

To add a new language (e.g., French):

1. Add the language code to both router files:
   ```javascript
   // In [page].astro
   const supportedLanguages = ["en", "de", "it", "fr"];
   
   // In [...slug].astro  
   const AVAILABLE_LANGUAGES = ["en", "de", "it", "fr"];
   ```

2. Create language files in `src/content/languages/`:
   - `fr.yaml` (homepage content)
   - `b2b-fr.yaml` (B2B page content)
   - `wfm-fr.yaml` (WFM page content)
   - etc.

3. Update metadata objects in `[...slug].astro` to include French titles/descriptions

## Adding New Pages

To add a new page (e.g., "about"):

1. Add the page to both router files:
   ```javascript
   // In [page].astro
   const AVAILABLE_PAGES = ["b2b", "wfm", "elysia", "courses", "about"];
   
   // In [...slug].astro
   const AVAILABLE_PAGES = ["index", "b2b", "wfm", "elysia", "courses", "about"];
   ```

2. Create language files:
   - `about-en.yaml`
   - `about-de.yaml` 
   - `about-it.yaml`

3. Add metadata for the new page in the `pageMetadata` object in `[...slug].astro`

The system will automatically generate:
- `/about` (redirect page)
- `/en/about`, `/de/about`, `/it/about` (content pages)

## File Structure

```
src/pages/
├── index.astro              # Root redirect (language detection)
├── [page].astro            # Page redirector (/b2b → /en/b2b)  
└── [...slug].astro         # Content router (/en/b2b → content)
```

Both routers work together to provide a seamless multilingual experience while maintaining clean, SEO-friendly URLs.
