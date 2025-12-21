// src/pages/api/submit-rating.ts
import { serverSanityClient } from '../../lib/sanity';

export async function POST({ request }) {
	const { recipeId, rating, userId } = await request.json();

	if (!recipeId || !rating || !userId) {
		return new Response(JSON.stringify({ message: 'Missing data' }), {
			status: 400,
		});
	}

	try {
		// Check if rating by this user for this recipe already exists
		const existing = await serverSanityClient.fetch(
			`*[_type == "recipeRating" && user._ref == $userId && recipe._ref == $recipeId][0]`,
			{ userId, recipeId }
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
				user: { _type: 'reference', _ref: userId },
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
