import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

// Public client (read-only)
export const client = createClient({
	projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
	dataset: import.meta.env.PUBLIC_SANITY_DATASET,
	apiVersion: import.meta.env.PUBLIC_SANITY_API_VERSION || '2023-06-25',
	useCdn: import.meta.env.PUBLIC_SANITY_USE_CDN === 'true',
});

// Server-side client (write access)
export const serverClient = createClient({
	projectId: import.meta.env.SANITY_PROJECT_ID,
	dataset: import.meta.env.SANITY_DATASET,
	apiVersion: import.meta.env.SANITY_API_VERSION || '2023-06-25',
	useCdn: false,
	token: import.meta.env.SANITY_API_TOKEN, // ✅ secure token
});

// Image URL builder
export const urlBuilder = imageUrlBuilder(client);
