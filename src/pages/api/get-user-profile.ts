import type { APIRoute } from 'astro';
import { requireAuth } from '../../shared/services/auth/requireAuth';
import { fetchSanityUserByUid } from '../../shared/services/sanity/users';
import { toSafeErrorResponse } from '../../shared/utils/apiError';

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
	} catch (error) {
		return toSafeErrorResponse(error, {
			status: 500,
			context: 'get-user-profile',
			defaultMessage: 'Failed to fetch user profile',
		});
	}
};