import type { APIRoute } from 'astro';
import { createClient } from '@sanity/client';

const sanity = createClient({
	projectId: import.meta.env.SANITY_PROJECT_ID,
	dataset: import.meta.env.SANITY_DATASET || 'production',
	apiVersion: import.meta.env.SANITY_API_VERSION || '2023-07-01',
	token: import.meta.env.SANITY_API_TOKEN,
	useCdn: false,
});

export const GET: APIRoute = async ({ request }) => {
	try {
		// Get token from Authorization header
		const authHeader = request.headers.get('Authorization');
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Get UID from query params
		const url = new URL(request.url);
		const uid = url.searchParams.get('uid');

		if (!uid) {
			return new Response(JSON.stringify({ error: 'UID is required' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const query = `*[_type == "user" && uid == $uid][0]{
      _id,
      uid,
      name,
      lastname,
      email,
      role,
      bio,
      location,
      phone,
      dietPreference,
      allergies,
      preferredCuisine,
      profileImage,
      joinedAt,
      bmiHistory,
      latestBMI,
      bmiCategory,
      healthGoals
    }`;

		const user = await sanity.fetch(query, { uid });

		if (!user) {
			return new Response(JSON.stringify({ error: 'User not found' }), {
				status: 404,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const userWithDefaults = {
			...user,
			bmiHistory: user.bmiHistory || [], // ← Si es null/undefined, pon array vacío
			latestBMI: user.latestBMI || null,
			bmiCategory: user.bmiCategory || null,
			healthGoals: user.healthGoals || [],
		};

		console.log('User con defaults:', userWithDefaults); // Para debug

		return new Response(JSON.stringify(userWithDefaults), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error: any) {
		console.error('Error fetching user profile:', error);
		return new Response(
			JSON.stringify({
				error: error.message || 'Failed to fetch user profile',
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			},
		);
	}
};