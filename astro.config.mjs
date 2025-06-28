import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
    output: 'server',
    adapter: vercel(),
    vite: {
        server: {
            hmr: {
                overlay: false // Disable error overlay
            }
        }
    }
});
