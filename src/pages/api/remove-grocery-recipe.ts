import type { APIRoute } from 'astro';
import { client } from '../../lib/sanity';

export const POST: APIRoute = async ({ request }) => {
	try {
		const { userId, recipeId } = await request.json();

		// Get grocery list for user
		const groceryList = await client.fetch(
			`*[_type == "groceryList" && user._ref == $userId][0]{
        _id,
        items,
        recipes
      }`,
			{ userId }
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
	} catch (e: any) {
		console.error('Error removing recipe from grocery list:', e);
		return new Response(JSON.stringify({ error: e.message }), { status: 500 });
	}
};
