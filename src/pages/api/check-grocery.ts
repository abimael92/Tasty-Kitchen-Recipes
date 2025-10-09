import type { APIRoute } from 'astro';
import { client } from '../../lib/sanity';

export const POST: APIRoute = async ({ request }) => {
	try {
		const { userId, recipeId } = await request.json();

		// Check if recipe exists in user's grocery list
		const groceryList = await client.fetch(
			`*[_type == "groceryList" && user._ref == $userId][0]{
        recipes[]->{_id}
      }`,
			{ userId }
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
		return new Response(JSON.stringify({ error: e.message }), { status: 500 });
	}
};
