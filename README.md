# EvolverAI Landing Page - Astro Version

This is the modern Astro-based version of the EvolverAI landing page, designed for easy maintenance and deployment to Netlify.

## 🚀 Project Structure

```
astro/
├── public/          # Static assets (images, favicon, etc.)
├── src/
│   ├── components/  # Reusable Astro components
│   │   ├── home/    # Homepage-specific components
│   │   ├── courses/ # Course page components
│   │   ├── b2b/     # B2B page components
│   │   ├── elysia/  # Elysia page components
│   │   └── wfm/     # WFM page components
│   ├── layouts/     # Page layouts
│   ├── pages/       # Pages (file-based routing)
│   └── styles/      # Global styles
├── astro.config.mjs # Astro configuration
├── tailwind.config.mjs # Tailwind CSS configuration
├── netlify.toml     # Netlify deployment configuration
└── package.json     # Dependencies and scripts
```

## 🛠️ Commands

All commands are run from the root of the project, from the terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`     |
| `npm run build`           | Build your production site to `./dist/`         |
| `npm run preview`         | Preview your build locally, before deploying    |

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

### Adding New Components

1. Create a new `.astro` file in the appropriate component directory
2. Import and use it in your pages
3. Example:
   ```astro
   ---
   // New component
   ---
   <section class="py-16">
     <h2>New Section</h2>
   </section>
   ```

### Updating Content

- **Text Content**: Edit directly in the component files
- **Images**: Add to `public/img/` and reference as `/img/filename.jpg`
- **Styles**: Update in component files or `src/styles/global.css`

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
