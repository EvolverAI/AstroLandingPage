import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';

// Keystatic is the local, schema-driven content editor (run with `npm run dev`,
// open /keystatic). Its admin routes render on demand, so they are only wired in
// outside production — the deployed site stays a pure static build with no
// adapter, exactly as before.
const enableKeystatic = process.env.NODE_ENV !== 'production';

export default defineConfig({
    integrations: [tailwind(), ...(enableKeystatic ? [react(), keystatic()] : [])],
    output: 'static',

    site: 'https://evolverai.ch',
    base: '/',
    trailingSlash: 'ignore',

    i18n: {
        defaultLocale: 'en',
        locales: ['en', 'it', 'de'],
        routing: {
            prefixDefaultLocale: true,
            // Root ("/") and bare paths are redirected server-side by the
            // Netlify `lang-redirect` edge function, so Astro should not try to
            // generate its own root index redirect (which requires an index page).
            redirectToDefaultLocale: false,
        },
    },

    build: {
        assets: 'assets',
        inlineStylesheets: 'auto',
    },

    compressHTML: true,

    vite: {
        envPrefix: 'PUBLIC_',
        build: {
            // Raise the chunk warning threshold — our bundles are intentionally small
            chunkSizeWarningLimit: 600,
            rollupOptions: {
                output: {
                    // Stable asset filenames for better CDN caching
                    assetFileNames: 'assets/[name].[hash][extname]',
                    chunkFileNames: 'assets/[name].[hash].js',
                    entryFileNames: 'assets/[name].[hash].js',
                    // Keep vendor chunks separate for better cache reuse
                    manualChunks(id) {
                        if (id.includes('node_modules')) return 'vendor';
                    },
                },
            },
        },
        server: {
            fs: { strict: false },
        },
    },

    server: {
        port: 4321,
        host: true,
    },
});
