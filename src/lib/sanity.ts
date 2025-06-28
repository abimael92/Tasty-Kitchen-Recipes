import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

// Initialize the client
export const client = createClient({
  projectId: import.meta.env.SANITY_PROJECT_ID,
  dataset: import.meta.env.SANITY_DATASET,
  apiVersion: import.meta.env.SANITY_API_VERSION || '2023-06-25',
  useCdn: import.meta.env.SANITY_USE_CDN === 'true',
  token: import.meta.env.SANITY_API_TOKEN,
});

// Image URL builder
export const urlBuilder = imageUrlBuilder(client);