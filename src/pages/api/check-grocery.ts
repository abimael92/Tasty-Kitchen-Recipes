import type { APIRoute } from 'astro';
import { serverSanityClient } from '../../lib/sanity';
import { requireAuth } from '../../shared/services/auth/requireAuth';
import { requireSanityUserByUid } from '../../shared/services/sanity/users';
import { toSafeErrorResponse } from '../../shared/utils/apiError';

export const POST: APIRoute = async ({ request }) => {
	try {
		const auth = await requireAuth(request);
		if (!auth.ok) return auth.response;

		const { recipeId } = await request.json();

		const user = await requireSanityUserByUid(auth.uid);
		if (!user) {
			return new Response(JSON.stringify({ error: 'User not found' }), {
				status: 404,
			});
		}

		// Check if recipe exists in user's grocery list
		const groceryList = await serverSanityClient.fetch(
			`*[_type == "groceryList" && user._ref == $userId][0]{
        recipes[]->{_id}
      }`,
			{ userId: user._id }
		);

		const recipes = groceryList?.recipes || [];
		const recipeExists = recipes.some((r) => r._id === recipeId);

		return new Response(
			JSON.stringify({
				success: true,
				recipes: recipes,
				recipeExists: recipeExists,
			}),
			{ status: 200 }
		);
	} catch (e) {
		return toSafeErrorResponse(e, {
			status: 500,
			context: 'check-grocery',
			defaultMessage: 'Failed to check grocery list',
		});
	}
};
