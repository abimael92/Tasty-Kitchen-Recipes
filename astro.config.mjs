import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';
import solid from '@astrojs/solid-js';
import react from '@astrojs/react';

export default defineConfig({
    output: 'server',
    adapter: vercel(),
    integrations: [solid(), react()],
    i18n: {
        defaultLocale: 'es',
        locales: ['es', 'en'],
        routing: {
            prefixDefaultLocale: false, // / = Spanish, /en = English
        },
    },
    vite: {
        server: { hmr: { overlay: false } },
    },
});
