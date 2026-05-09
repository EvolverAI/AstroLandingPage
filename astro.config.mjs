import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
    integrations: [tailwind()],
    output: 'static',

    site: 'https://evolverai.ch',
    base: '/',
    trailingSlash: 'ignore',

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
