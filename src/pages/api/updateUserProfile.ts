import type { APIRoute } from 'astro';
import { createClient } from '@sanity/client';

const sanity = createClient({
	projectId: import.meta.env.SANITY_PROJECT_ID,
	dataset: 'production',
	apiVersion: '2023-07-01',
	token: import.meta.env.SANITY_API_TOKEN,
	useCdn: false,
});

export const POST: APIRoute = async ({ request }) => {
	try {
		const { uid, name, lastname, bio, phone, location } = await request.json();
		if (!uid) throw new Error('Missing uid');

		const user = await sanity.fetch(`*[_type=="user" && uid==$uid][0]`, {
			uid,
		});
		if (!user) throw new Error('User not found');

		const updated = await sanity
			.patch(user._id)
			.set({ name, lastname, bio, phone, location })
			.commit();

		return new Response(JSON.stringify(updated), { status: 200 });
	} catch (e) {
		return new Response(JSON.stringify({ error: e.message }), { status: 500 });
	}
};
