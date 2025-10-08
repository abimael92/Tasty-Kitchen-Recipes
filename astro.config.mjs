import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';
import react from '@astrojs/react';

export default defineConfig({
    site: 'http://localhost:4321',
    output: 'server',
    adapter: vercel({

        functions: {
            includeFiles: [
                'src/lib/**/*.ts'
            ]
        }
    }),

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
                'firebase/app',
                'firebase/auth'
            ]
        },

        ssr: {
            noExternal: ['firebase']
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
