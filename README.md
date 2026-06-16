# EvolverAI Landing Page - Astro Version

This is the modern Astro-based version of the EvolverAI landing page, designed for easy maintenance and deployment to Netlify.

## 🚀 Project Structure

```
├── public/                     # Static assets (images, favicon, etc.)
├── src/
│   ├── content.config.ts       # ⭐ Single Zod schema — source of truth
│   ├── content/
│   │   ├── pages/<lang>/*.yaml  # Page content, one file per locale × page
│   │   ├── page-defaults/*.yaml # Per-page design tokens (not content)
│   │   └── blog/*.md            # Blog posts
│   ├── components/             # Astro components (global/ section components)
│   ├── layouts/ · pages/ · styles/ · i18n.ts
├── keystatic.config.ts         # Local content editor schema (mirrors Zod)
├── netlify/edge-functions/     # Server-side language redirect
├── astro.config.mjs · netlify.toml · tailwind.config.mjs
```

## 🛠️ Commands

| Command            | Action                                                     |
| :----------------- | :--------------------------------------------------------- |
| `npm install`      | Install dependencies                                       |
| `npm run dev`      | Dev server at `localhost:4321` (editor at `/keystatic`)    |
| `npm run build`    | Build the production static site to `./dist/`              |
| `npm run preview`  | Preview the production build locally                       |
| `npm run check`    | Type-check + validate content against the schema           |
| `npm run translate`| AI-translate EN pages to other locales (needs OpenAI key)  |

## 🚀 Deployment to Netlify

### Automatic Deployment (Recommended)

1. **Push to GitHub**: Commit all your changes to the main branch
   ```bash
   git add .
   git commit -m "Astro migration complete"
   git push origin main
   ```

2. **Configure Netlify**:
   - Connect your GitHub repository to Netlify
   - Netlify will automatically detect the Astro project
   - Build settings are already configured in `netlify.toml`:
     - Build command: `npm run build`
     - Publish directory: `dist`
     - Node version: 18

3. **Deploy**: Netlify will automatically build and deploy on every push to main

### Manual Deployment

```bash
# Build the project
npm run build

# Deploy the dist/ folder to Netlify
# (You can drag and drop the dist folder to Netlify's deploy interface)
```

## 🎨 Key Features

- **Component-Based Architecture**: Easy to maintain and update
- **Static Site Generation**: Fast loading times and SEO-friendly
- **Tailwind CSS**: Utility-first styling with custom design system
- **Responsive Design**: Mobile-first approach
- **Optimized Images**: Automatic image optimization by Astro
- **Fast Builds**: Quick development and deployment cycles

## 📝 Content Management

All page content lives in typed YAML, with one Zod schema
([src/content.config.ts](src/content.config.ts)) as the single source of truth that drives
rendering, validation, and the editor.

### Editing content (Keystatic)

1. `npm run dev` and open `http://localhost:4321/keystatic`.
2. Edit a page (locale × page) — sections, cards, footer, SEO meta — with live, schema-driven
   forms. No YAML by hand.
3. Changes are written to `src/content/pages/<lang>/<page>.yaml`. Commit them; Netlify
   rebuilds. The editor runs locally only and is never deployed.

You can also edit the YAML files directly — they are validated on `npm run check` / `build`.

### Adding a new section type

1. Add a variant to the `section` discriminated union in
   [src/content.config.ts](src/content.config.ts).
2. Add a matching branch in [src/components/DynamicSection.astro](src/components/DynamicSection.astro).
3. Mirror the fields in [keystatic.config.ts](keystatic.config.ts) so it's editable.

### Translations

Run `npm run translate` (needs `OPENAI_API_KEY`) to translate the English pages into the
other locales; only human-text fields are translated, structure/classes/URLs are preserved.

- **Images**: add to `public/img/` and reference as `/img/filename.jpg`.
- **Design tokens**: per-page card styling lives in `src/content/page-defaults/<page>.yaml`.

## 🔧 Configuration

### Tailwind CSS

Custom configuration in `tailwind.config.mjs`:
- Custom colors (custom-slate)
- Font families (Roboto, Noto Sans)
- Extended utilities

### Astro

Configuration in `astro.config.mjs`:
- Tailwind integration
- Static output for Netlify
- Asset optimization

## 📱 Mobile Responsiveness

All components are built with mobile-first responsive design:
- Breakpoints: `sm`, `md`, `lg`, `xl`
- Flexible grid layouts
- Touch-friendly navigation

## 🎯 SEO Optimization

- Meta tags in Layout component
- Semantic HTML structure
- Fast loading times
- Static site generation

## 🤝 Contributing

1. Make changes to components in `src/components/`
2. Test locally with `npm run dev`
3. Build and test with `npm run build && npm run preview`
4. Commit and push to deploy automatically

## 📞 Support

For questions about the technical implementation, refer to:
- [Astro Documentation](https://docs.astro.build/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
