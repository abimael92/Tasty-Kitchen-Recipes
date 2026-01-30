import type { APIRoute } from 'astro';
import { serverSanityClient as client } from '../../lib/sanity';
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

		// Get grocery list for user
		const groceryList = await client.fetch(
			`*[_type == "groceryList" && user._ref == $userId][0]{
        _id,
        items,
        recipes
      }`,
			{ userId: user._id }
		);

		if (!groceryList) {
			return new Response(
				JSON.stringify({ success: false, message: 'No grocery list found' }),
				{ status: 404 }
			);
		}

		// Check if recipe is in the list
		const recipeExists = groceryList.recipes?.some((r) => r._ref === recipeId);
		if (!recipeExists) {
			return new Response(
				JSON.stringify({
					success: false,
					message: 'Recipe not in grocery list',
				}),
				{ status: 400 }
			);
		}

		// Remove the recipe reference
		await client
			.patch(groceryList._id)
			.set({
				recipes: groceryList.recipes.filter((r) => r._ref !== recipeId),
				items: groceryList.items.filter((item) => item.recipeId !== recipeId),
			})
			.commit();

		return new Response(JSON.stringify({ success: true }), { status: 200 });
	} catch (e) {
		return toSafeErrorResponse(e, {
			status: 500,
			context: 'remove-grocery-recipe',
			defaultMessage: 'Failed to remove recipe from grocery list',
		});
	}
};
