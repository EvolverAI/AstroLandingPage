import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
    integrations: [tailwind()],
    output: 'static',

    // Site configuration for different environments
    site: process.env.PUBLIC_SITE_URL || 'https://evolverai.com',
    base: process.env.PUBLIC_BASE_URL || '/',

    // Ensure proper trailing slash handling
    trailingSlash: 'ignore',

    build: {
        assets: 'assets',
        // Ensure assets are properly linked
        assetsPrefix: process.env.PUBLIC_ASSETS_PREFIX || undefined
    },

    vite: {
        // Environment variables configuration
        envPrefix: 'PUBLIC_',

        build: {
            rollupOptions: {
                output: {
                    assetFileNames: 'assets/[name].[hash][extname]'
                }
            }
        },

        // Development server configuration
        server: {
            // Ensure dev server serves static files correctly
            fs: {
                strict: false
            }
        }
    },

    // Server configuration for different environments
    server: {
        port: 3000,
        host: true // Allow external connections
    }
});
