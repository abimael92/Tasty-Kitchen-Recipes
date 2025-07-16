import { nanoid } from 'nanoid';
import { client } from '../../lib/sanity.js';

export async function POST({ request }) {
	const { userId, recipeId } = await request.json();

	if (!userId || !recipeId) {
		return new Response(
			JSON.stringify({ error: 'Missing userId or recipeId' }),
			{ status: 400 }
		);
	}

	try {
		const existingCollection = await client.fetch(
			`*[_type == "collection" && user._ref == $userId][0]{ _id, recipes[] }`,
			{ userId }
		);

		let updatedRecipes = existingCollection?.recipes || [];
		const collectionId = existingCollection?._id;

		// Find if recipe already in favorites
		const index = updatedRecipes.findIndex((item) => item._ref === recipeId);

		if (index >= 0) {
			// Remove recipe from favorites
			updatedRecipes.splice(index, 1);
		} else {
			// Add new favorite recipe with unique _key
			updatedRecipes.push({
				_type: 'reference',
				_ref: recipeId,
				_key: nanoid(),
			});
		}

		if (collectionId) {
			// Update existing collection document
			await client
				.patch(collectionId)
				.set({ recipes: updatedRecipes })
				.commit();
		} else {
			// Create collection doc for user with first favorite recipe
			await client.create({
				_type: 'collection',
				title: 'Favorites',
				user: { _type: 'reference', _ref: userId },
				recipes: [
					{
						_type: 'reference',
						_ref: recipeId,
						_key: nanoid(),
					},
				],
			});
		}

		return new Response(JSON.stringify({ success: true }), { status: 200 });
	} catch (error) {
		console.error('Toggle favorite error:', error);
		return new Response(
			JSON.stringify({ error: 'Failed to toggle favorite' }),
			{ status: 500 }
		);
	}
}
