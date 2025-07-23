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
	import { client } from '../../lib/sanity.js';

	export async function POST({ request }) {
		const { userId } = await request.json();

		if (!userId) {
			return new Response(JSON.stringify({ error: 'Missing userId' }), {
				status: 400,
			});
		}

		try {
			// Fetch collection with expanded recipes and dynamic title for the given userId
			const collection = await client.fetch(
				`*[_type == "collection" && user._ref == $userId][0]{
			_id,
			title,
			recipes[]->{
			  _id,
			  title,
			  "image": image.asset->url,
			  slug
			}
		  }`,
				{ userId }
			);

			if (!collection) {
				return new Response(JSON.stringify({ recipes: [], title: null }), {
					status: 200,
				});
			}

			return new Response(
				JSON.stringify({
					recipes: collection.recipes || [],
					title: collection.title,
				}),
				{ status: 200 }
			);
		} catch (error) {
			console.error('Error fetching favorites:', error);
			return new Response(
				JSON.stringify({ error: 'Failed to fetch favorites' }),
				{ status: 500 }
			);
		}
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
			// Fetch user's name by userId
			const user = await client.fetch(
				`*[_type == "user" && _id == $userId][0]{ name }`,
				{ userId }
			);

			const userName = user?.name || 'User';

			// Create collection doc for user with first favorite recipe
			await client.create({
				_type: 'collection',
				title: `${userName}'s Favorites List`,
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
