import type { APIRoute } from 'astro';
import { createClient } from '@sanity/client';

const sanity = createClient({
	projectId: import.meta.env.SANITY_PROJECT_ID,
	dataset: import.meta.env.SANITY_DATASET,
	apiVersion: import.meta.env.SANITY_API_VERSION,
	token: import.meta.env.SANITY_API_TOKEN,
	useCdn: false,
});

export const GET: APIRoute = async ({ request }) => {
	try {
		const url = new URL(request.url);
		const uid = url.searchParams.get('uid');
		if (!uid) {
			return new Response(JSON.stringify({ error: 'Missing uid parameter' }), {
				status: 400,
			});
		}

		const query = `*[_type == "user" && uid == $uid][0]{
      name,
      lastname,
      email,
      role,
      bio,
      location,
      phone,
      dietPreference,
      allergies,
      preferredCuisine
    }`;

		const user = await sanity.fetch(query, { uid });

		if (!user) {
			return new Response(JSON.stringify({ error: 'User not found' }), {
				status: 404,
			});
		}

		return new Response(JSON.stringify(user), { status: 200 });
	} catch (err) {
		return new Response(
			JSON.stringify({ error: err.message || 'Internal Server Error' }),
			{ status: 500 }
		);
	}
};
