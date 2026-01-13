// pages/api/unsave-recipe.js
import { serverSanityClient } from '../../lib/sanity';

export const POST = async ({ request }) => {
	try {
		const { userId, recipeId } = await request.json();

		if (!userId || !recipeId) {
			return new Response(
				JSON.stringify({ error: 'Missing userId or recipeId' }),
				{ status: 400 }
			);
		}

		console.log('🗑️ Un-saving recipe:', { userId, recipeId });

		// 1. Find the user's savedRecipe document
		const savedDoc = await sanityClient.fetch(
			`*[_type == "savedRecipe" && user._ref == $userId][0]{
        _id,
        recipes
      }`,
			{ userId }
		);

		if (!savedDoc) {
			return new Response(
				JSON.stringify({ error: 'No saved recipes found for user' }),
				{ status: 404 }
			);
		}

		// 2. Remove the specific recipe from the array
		await sanityClient
			.patch(savedDoc._id)
			.unset([`recipes[recipe._ref == "${recipeId}"]`])
			.set({ lastUpdated: new Date().toISOString() })
			.commit();

		console.log('✅ Recipe removed from saved recipes array');

		return new Response(
			JSON.stringify({
				success: true,
				message: 'Recipe removed from saved recipes',
			}),
			{ status: 200 }
		);
	} catch (error) {
		console.error('❌ Error unsaving recipe:', error);
		return new Response(
			JSON.stringify({
				error: error.message || 'Failed to unsave recipe',
			}),
			{ status: 500 }
		);
	}
};
