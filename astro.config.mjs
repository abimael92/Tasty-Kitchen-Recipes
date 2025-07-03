import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';
import react from '@astrojs/react';

// Remove the firebaseConfig from here - it should be in environment variables only

export default defineConfig({
    output: 'server',
    adapter: vercel({
        // Remove edgeMiddleware if not using Edge Functions
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
        // Remove the process.env.FIREBASE_CONFIG definition
        // It should come from your actual environment variables

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