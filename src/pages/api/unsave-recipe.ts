// pages/api/unsave-recipe.ts
import { serverSanityClient } from '../../lib/sanity';
import { requireAuth } from '../../shared/services/auth/requireAuth';
import { requireSanityUserByUid } from '../../shared/services/sanity/users';
import { toSafeErrorResponse } from '../../shared/utils/apiError';

export const POST = async ({ request }) => {
	try {
		const auth = await requireAuth(request);
		if (!auth.ok) return auth.response;

		const { recipeId } = await request.json();

		if (!recipeId) {
			return new Response(
				JSON.stringify({ error: 'Missing recipeId' }),
				{ status: 400 }
			);
		}

		const user = await requireSanityUserByUid(auth.uid);
		if (!user) {
			return new Response(JSON.stringify({ error: 'User not found' }), {
				status: 404,
			});
		}

		// 1. Find the user's savedRecipe document
		const savedDoc = await serverSanityClient.fetch(
			`*[_type == "savedRecipe" && user._ref == $userId][0]{
        _id,
        recipes
      }`,
			{ userId: user._id }
		);

		if (!savedDoc) {
			return new Response(
				JSON.stringify({ error: 'No saved recipes found for user' }),
				{ status: 404 }
			);
		}

		// 2. Remove the specific recipe from the array
		await serverSanityClient
			.patch(savedDoc._id)
			.unset([`recipes[recipe._ref == "${recipeId}"]`])
			.set({ lastUpdated: new Date().toISOString() })
			.commit();

		return new Response(
			JSON.stringify({
				success: true,
				message: 'Recipe removed from saved recipes',
			}),
			{ status: 200 }
		);
	} catch (error) {
		return toSafeErrorResponse(error, {
			status: 500,
			context: 'unsave-recipe',
			defaultMessage: 'Failed to unsave recipe',
		});
	}
};
