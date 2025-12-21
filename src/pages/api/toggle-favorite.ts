import { nanoid } from 'nanoid';
import { serverSanityClient } from '../../lib/sanity.js';

export async function POST({ request }) {
	const { userId, recipeId } = await request.json();

	if (!userId || !recipeId) {
		return new Response(
			JSON.stringify({ error: 'Missing userId or recipeId' }),
			{ status: 400 }
		);
	}

	try {
		const existingCollection = await serverSanityClient.fetch(
			`*[_type == "collection" && user._ref == $userId][0]{ _id, recipes[] }`,
			{ userId }
		);

		let updatedRecipes = existingCollection?.recipes || [];
		const collectionId = existingCollection?._id;

		const index = updatedRecipes.findIndex((item) => item._ref === recipeId);

		if (index >= 0) {
			updatedRecipes.splice(index, 1);
		} else {
			updatedRecipes.push({
				_type: 'reference',
				_ref: recipeId,
				_key: nanoid(),
			});
		}

		if (collectionId) {
			await serverSanityClient
				.patch(collectionId)
				.set({ recipes: updatedRecipes })
				.commit();
		} else {
			const user = await serverSanityClient.fetch(
				`*[_type == "user" && _id == $userId][0]{ name }`,
				{ userId }
			);
			const userName = user?.name || 'User';

			await serverSanityClient.create({
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
