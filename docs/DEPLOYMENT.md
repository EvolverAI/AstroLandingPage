# 🚀 Deployment Guide for EvolverAI Astro Site

## ✅ Migration Complete!

Your Astro structure is ready for deployment. Here's what has been set up:

### 📁 Project Structure

```
/Users/franc/lab/landingpage/astro/
├── 📄 package.json          # Dependencies and build scripts
├── ⚙️ astro.config.mjs      # Astro configuration 
├── 🎨 tailwind.config.mjs   # Tailwind CSS config
├── 🌐 netlify.toml          # Netlify deployment settings
├── 📖 README.md             # Documentation
├── 📁 public/               # Static assets (images, favicon)
├── 📁 src/
│   ├── 📁 components/       # Reusable components
│   │   ├── 🏠 home/         # Homepage sections (14 components)
│   │   ├── 🎓 courses/      # Course pages (2 components)
│   │   ├── Header.astro     # Navigation
│   │   └── Footer.astro     # Footer
│   ├── 📁 layouts/
│   │   └── Layout.astro     # Main page layout
│   ├── 📁 pages/            # Pages (auto-routing)
│   │   ├── index.astro      # Homepage
│   │   ├── courses.astro    # Courses page
│   │   ├── b2b.astro        # B2B page
│   │   ├── elysia.astro     # Elysia page
│   │   └── wfm.astro        # WFM page
│   └── 📁 styles/
│       └── global.css       # Global styles
└── 📁 dist/                 # Built site (auto-generated)
```

## 🚀 Deploy to Netlify

### Option 1: Automatic GitHub Deployment (Recommended)

1. **Commit to GitHub:**
   ```bash
   cd /Users/franc/lab/landingpage/astro
   git add .
   git commit -m "Complete Astro migration with component-based architecture"
   git push origin main
   ```

2. **Connect to Netlify:**
   - Go to [Netlify Dashboard](https://app.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub and select your repository
   - **Build settings are automatically detected:**
     - Build command: `npm run build`
     - Publish directory: `dist`
     - Base directory: `astro`

3. **Deploy:** Netlify will build and deploy automatically!

### Option 2: Manual Deployment

```bash
cd /Users/franc/lab/landingpage/astro
npm run build
# Then drag and drop the 'dist' folder to Netlify
```

## ✨ Key Benefits of Your New Setup

### 🔧 Easy Maintenance
- **Single source of truth:** Update content in one component file
- **Reusable components:** Use the same component across multiple pages
- **No more HTML duplication:** Changes propagate automatically

### ⚡ Performance
- **Static site generation:** Ultra-fast loading times
- **Optimized builds:** Astro optimizes everything automatically
- **SEO-friendly:** Server-side rendering with proper meta tags

### 🎨 Developer Experience
- **Hot reload:** See changes instantly during development
- **Component-based:** Organize code logically
- **TypeScript support:** Built-in type checking (optional)

## 📝 How to Update Content Now

### ✏️ Text Changes
```astro
<!-- Before: Edit multiple HTML files -->
<!-- After: Edit one component file -->

<!-- Example: Update hero text -->
<!-- File: src/components/home/HeroSection.astro -->
<h1 class="font-bold text-white text-[20vw]">
  <span>Evolver</span><span class="text-blue-800">AI</span>
</h1>
```

### 🖼️ Image Updates
```bash
# Add new images to:
/Users/franc/lab/landingpage/astro/public/img/

# Reference in components as:
<img src="/img/your-new-image.jpg" alt="Description">
```

### 🎨 Style Changes
```astro
<!-- Update styles directly in components -->
<section class="py-16 bg-gradient-to-b from-slate-900 to-slate-800">
  <!-- Your content -->
</section>
```

## 🔄 Development Workflow

```bash
# Start development server
cd /Users/franc/lab/landingpage/astro
npm run dev
# → http://localhost:4321

# Make your changes to components...

# Test build
npm run build

# Preview built site
npm run preview

# Commit and push (auto-deploys)
git add .
git commit -m "Update homepage hero section"
git push origin main
```

## 🎯 Next Steps

1. **Test the site:** Visit http://localhost:4321 to see your new Astro site
2. **Make customizations:** Update any content in the component files
3. **Deploy:** Commit to GitHub for automatic deployment
4. **Add more features:** 
   - Convert remaining components from your `/www/components/` folder
   - Add dynamic content with props
   - Implement contact forms
   - Add blog functionality

## 📞 Support

- **Astro Docs:** https://docs.astro.build/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Netlify Docs:** https://docs.netlify.com/

Your site is now ready for modern, maintainable development! 🎉
