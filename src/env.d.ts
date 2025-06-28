/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SANITY_PROJECT_ID: string;
  readonly SANITY_DATASET: string;
  readonly SANITY_API_VERSION: string;
  readonly SANITY_USE_CDN: string;
  readonly SANITY_API_TOKEN?: string;
  readonly MONGO_URI?: string; // Only if actually needed
}