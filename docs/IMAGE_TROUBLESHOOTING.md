# Image Path Troubleshooting Guide

## Overview

This guide helps resolve image loading issues in the Astro landing page project.

## Quick Fix Summary

✅ **All your image paths are working correctly!** The image checker confirms that all referenced images exist and are properly located.

## How Images Work in Astro

### File Structure
```
public/
├── img/
│   ├── evolverai-web-company-bg.jpg
│   ├── evolverai-web-brainstorming-bg.jpg
│   ├── evolverai-web-contact-bg.jpg
│   └── InfiniteWorkforceLogo.png
├── favicon.ico
└── ...
```

### Correct Image Paths
- ✅ `/img/evolverai-web-company-bg.jpg` (absolute from public)
- ✅ `img/evolverai-web-company-bg.jpg` (relative, will be resolved)
- ❌ `src/img/...` (wrong, src is not served statically)
- ❌ `public/img/...` (wrong, public is the root)

## Tools and Scripts

### 1. Image Path Checker
```bash
npm run check-images
```
This script:
- Scans all components for image references
- Verifies that referenced images exist
- Lists all available images in `/public/img`

### 2. Development Server Options
```bash
# Standard development
npm run dev

# Development with external access
npm run dev:local

# Production preview
npm run preview:production
```

### 3. Environment Configuration
The project supports different base URLs via environment variables:

```bash
# .env file
PUBLIC_BASE_URL=/
PUBLIC_SITE_URL=https://your-domain.com
```

## Image Utility Functions

The `src/utils/images.js` file provides helper functions:

```javascript
import { resolveImage } from '../../utils/images.js';

// Automatically resolves image paths
const imagePath = resolveImage('/img/background.jpg');
```

## Configuration Files

### 1. astro.config.mjs
```javascript
export default defineConfig({
    site: process.env.PUBLIC_SITE_URL || 'https://evolverai.com',
    base: process.env.PUBLIC_BASE_URL || '/',
    // ... other config
});
```

### 2. Package.json Scripts
- `npm run dev` - Standard development server
- `npm run dev:local` - Development with external network access
- `npm run check-images` - Verify all image paths
- `npm run build:production` - Production build

## Common Issues and Solutions

### Issue 1: Images not loading in development
**Solution**: Ensure the dev server is running and images are in `/public/img/`

### Issue 2: Images not loading in production
**Solution**: Check the base URL configuration in `astro.config.mjs`

### Issue 3: Wrong image paths
**Solution**: Use the image checker script to find and fix broken paths

### Issue 4: Subdirectory deployment
**Solution**: Set `PUBLIC_BASE_URL` environment variable

```bash
# For GitHub Pages with repo name
PUBLIC_BASE_URL=/my-repo-name/

# For subdirectory deployment
PUBLIC_BASE_URL=/subdirectory/
```

## Deployment Scenarios

### 1. Root Domain (default)
```bash
# .env
PUBLIC_BASE_URL=/
PUBLIC_SITE_URL=https://evolverai.com
```

### 2. Subdirectory Deployment
```bash
# .env
PUBLIC_BASE_URL=/landing-page/
PUBLIC_SITE_URL=https://company.com
```

### 3. GitHub Pages
```bash
# .env
PUBLIC_BASE_URL=/repository-name/
PUBLIC_SITE_URL=https://username.github.io
```

## Verification Steps

1. **Check image existence**:
   ```bash
   npm run check-images
   ```

2. **Test development server**:
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3001` and check browser developer tools for 404 errors

3. **Test production build**:
   ```bash
   npm run preview:production
   ```

4. **Verify paths in browser**:
   - Open browser developer tools
   - Check Network tab for failed image requests
   - Verify image URLs are correct

## Current Status

✅ **All image paths are working correctly**  
✅ **Development server configured properly**  
✅ **Image utility functions implemented**  
✅ **Environment configuration ready**  
✅ **Troubleshooting tools available**  

Your image loading should work perfectly in both development and production environments!
