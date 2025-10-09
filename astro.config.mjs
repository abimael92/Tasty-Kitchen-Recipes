// astro.config.mjs
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';
import react from '@astrojs/react';

export default defineConfig({
    site: 'http://localhost:4321',
    output: 'server',
    adapter: vercel(),

    integrations: [react()],

    i18n: {
        defaultLocale: 'es',
        locales: ['es', 'en'],
        routing: {
            prefixDefaultLocale: false,
        },
    },

    vite: {
        optimizeDeps: {
            include: [
                'react',
                'react-dom',
                'react/jsx-runtime',
            ]
        },

        ssr: {
            noExternal: ['@sanity/client']
        },

        server: {
            hmr: {
                overlay: false
            }
        },

        build: {
            sourcemap: true
        }
    }
});