import { defineConfig } from 'astro/config';

export default defineConfig({
    vite: {
        server: {
            hmr: {
                overlay: false // Disable error overlay
            }
        }
    }
});