import { nanoid } from 'nanoid';
import { serverSanityClient } from '../../lib/sanity.js';
import { requireAuth } from '../../shared/services/auth/requireAuth';
import { requireSanityUserByUid } from '../../shared/services/sanity/users';

export async function POST({ request }) {
	const auth = await requireAuth(request);
	if (!auth.ok) return auth.response;

	const { recipeId } = await request.json();

	if (!recipeId) {
		return new Response(
			JSON.stringify({ error: 'Missing recipeId' }),
			{ status: 400 }
		);
	}

	try {
		const user = await requireSanityUserByUid(auth.uid);
		if (!user) {
			return new Response(JSON.stringify({ error: 'User not found' }), {
				status: 404,
			});
		}

		const existingCollection = await serverSanityClient.fetch(
			`*[_type == "collection" && user._ref == $userId][0]{ _id, recipes[] }`,
			{ userId: user._id }
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
			const userName = user?.name || 'User';

			await serverSanityClient.create({
				_type: 'collection',
				title: `${userName}'s Favorites List`,
				user: { _type: 'reference', _ref: user._id },
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
