# Content Management Workflow for EvolverAI

This document outlines how to manage content using Astro Content Collections.

## Content Structure

```
src/content/
├── config.ts              # Schema definitions and validation
├── pages/                 # Full page content
│   └── home.yaml         # Homepage content
├── sections/             # Individual section content
│   ├── about.yaml        # About section
│   ├── hero.yaml         # Hero section
│   └── services.yaml     # Services section
├── languages/            # Multi-language content
│   ├── en.yaml          # English translations
│   ├── it.yaml          # Italian translations
│   └── de.yaml          # German translations
└── templates/           # Page templates
    └── corporate-landing.yaml
```

## How to Update Content

### 1. Update Text Content

Edit the relevant YAML file in `/src/content/sections/`:

```yaml
# src/content/sections/about.yaml
content:
  description: "NEW: Updated company description here"
  companyName: "Evolver"
  companyNameHighlight: "AI"
```

### 2. Add New Languages

Create new language file in `/src/content/languages/`:

```yaml
# src/content/languages/fr.yaml
code: "fr"
name: "Français"
flag: "🇫🇷"
sections:
  about:
    description: "Description en français..."
```

### 3. Control Section Visibility

Use metadata to show/hide sections:

```yaml
metadata:
  visible: false    # Hide section
  order: 1         # Change display order
  environment: ["production"]  # Show only in production
```

### 4. Environment-Specific Content

Override content for different environments:

```yaml
content:
  description: "Production description"
environments:
  development:
    content:
      description: "Development test content"
  staging:
    content:
      description: "Staging preview content"
```

## Component Integration

### Basic Usage

```astro
---
import { getSection } from '../utils/content.js';
const section = await getSection('about', 'en', 'production');
---

<h1>{section.content.title}</h1>
<p>{section.content.description}</p>
```

### Multi-language Support

```astro
---
const language = Astro.url.searchParams.get('lang') || 'en';
const section = await getSection('about', language);
---
```

### Environment-Specific

```astro
---
const environment = import.meta.env.MODE || 'production';
const section = await getSection('about', 'en', environment);
---
```

## Development Features

### Content Validation

All content is validated against TypeScript schemas in `config.ts`. Invalid content will show errors during build.

### Debug Information

In development mode, components show debug information with:
- Current content data
- Language settings
- Environment configuration

### Hot Reloading

Content changes are automatically reflected in the browser during development.

## URL Parameters

- `?lang=it` - Switch to Italian
- `?lang=de` - Switch to German
- `?lang=en` - Switch to English (default)

## Best Practices

### 1. Content Organization
- Keep related content in the same section file
- Use descriptive IDs for sections
- Maintain consistent metadata structure

### 2. Multi-language Content
- Always provide English as fallback
- Keep translations in sync with source content
- Use professional translation services for accuracy

### 3. Environment Management
- Use development environment for testing
- Staging for client previews
- Production for live content

### 4. Performance
- Content is statically generated at build time
- No runtime content fetching
- Optimized for SEO and performance

## Troubleshooting

### Content Not Showing
1. Check section `visible: true` in metadata
2. Verify environment matches current mode
3. Check schema validation errors

### Translation Missing
1. Ensure language file exists in `/src/content/languages/`
2. Check language code matches URL parameter
3. Verify section exists in language file

### Build Errors
1. Validate YAML syntax
2. Check schema compliance in `config.ts`
3. Ensure all required fields are present
