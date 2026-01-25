import type { APIRoute } from 'astro';
import { requireAuth } from '../../shared/services/auth/requireAuth';
import { fetchSanityUserByUid } from '../../shared/services/sanity/users';

export const GET: APIRoute = async ({ request }) => {
	try {
		const auth = await requireAuth(request);
		if (!auth.ok) return auth.response;

		const url = new URL(request.url);
		const uidParam = url.searchParams.get('uid');

		if (uidParam && uidParam !== auth.uid) {
			return new Response(JSON.stringify({ error: 'Forbidden' }), {
				status: 403,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const user = await fetchSanityUserByUid(auth.uid);

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