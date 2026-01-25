// src/pages/api/submit-rating.ts
import { serverSanityClient } from '../../lib/sanity';
import { requireAuth } from '../../shared/services/auth/requireAuth';
import { requireSanityUserByUid } from '../../shared/services/sanity/users';

export async function POST({ request }) {
	const auth = await requireAuth(request);
	if (!auth.ok) return auth.response;

	const { recipeId, rating } = await request.json();

	if (!recipeId || !rating) {
		return new Response(JSON.stringify({ message: 'Missing data' }), {
			status: 400,
		});
	}

	try {
		const user = await requireSanityUserByUid(auth.uid);
		if (!user) {
			return new Response(JSON.stringify({ message: 'User not found' }), {
				status: 404,
			});
		}

		// Check if rating by this user for this recipe already exists
		const existing = await serverSanityClient.fetch(
			`*[_type == "recipeRating" && user._ref == $userId && recipe._ref == $recipeId][0]`,
			{ userId: user._id, recipeId }
		);

		if (existing) {
			// Update existing rating
			await serverSanityClient
				.patch(existing._id)
				.set({
					rating,
					ratedAt: new Date().toISOString(),
				})
				.commit();
		} else {
			// Create new rating
			await serverSanityClient.create({
				_type: 'recipeRating',
				rating,
				ratedAt: new Date().toISOString(),
				user: { _type: 'reference', _ref: user._id },
				recipe: { _type: 'reference', _ref: recipeId },
			});
		}

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		console.error('Sanity create/update rating failed:', error);
		return new Response(
			JSON.stringify({
				message: 'Failed to submit rating',
				error: error.message,
			}),
			{ status: 500 }
		);
	}
}
