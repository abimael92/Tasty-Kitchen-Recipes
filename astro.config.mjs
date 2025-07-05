import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';
import react from '@astrojs/react';

// Remove the firebaseConfig from here - it should be in environment variables only

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
            noExternal: ['firebase'] // Important for SSR
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