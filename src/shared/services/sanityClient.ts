import { createClient, type SanityClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

type SanityConfig = {
	projectId?: string;
	dataset?: string;
	apiVersion: string;
	useCdn: boolean;
	token?: string;
};

const publicConfig: SanityConfig = {
	projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
	dataset: import.meta.env.PUBLIC_SANITY_DATASET,
	apiVersion: import.meta.env.PUBLIC_SANITY_API_VERSION ?? '2023-06-25',
	useCdn: import.meta.env.PUBLIC_SANITY_USE_CDN === 'true',
};

const serverConfig: SanityConfig = {
	projectId: import.meta.env.SANITY_PROJECT_ID,
	dataset: import.meta.env.SANITY_DATASET,
	apiVersion: import.meta.env.SANITY_API_VERSION ?? '2023-06-25',
	useCdn: false,
	token: import.meta.env.SANITY_API_TOKEN,
};

const createSafeClient = (config: SanityConfig): SanityClient => {
	if (!config.projectId || !config.dataset) {
		throw new Error('Missing Sanity projectId or dataset');
	}

	if ('token' in config && !config.token) {
		throw new Error('Missing Sanity API token');
	}

	return createClient(config);
};

export const publicSanityClient = createSafeClient(publicConfig);
export const serverSanityClient = createSafeClient(serverConfig);

export const buildImageUrl = (source: unknown) => {
	if (!publicSanityClient) return null;
	return imageUrlBuilder(publicSanityClient).image(source);
};
