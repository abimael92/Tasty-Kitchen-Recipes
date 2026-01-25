import type { APIRoute } from 'astro';
import { serverSanityClient } from '../../lib/sanity';
import { requireAuth } from '../../shared/services/auth/requireAuth';
import { requireSanityUserByUid } from '../../shared/services/sanity/users';

export const POST: APIRoute = async ({ request }) => {
	try {
		const auth = await requireAuth(request);
		if (!auth.ok) return auth.response;

		const { recipeId, items } = await request.json();
		const user = await requireSanityUserByUid(auth.uid);
		if (!user) {
			return new Response(JSON.stringify({ error: 'User not found' }), {
				status: 404,
			});
		}

		// Get existing grocery list - DON'T create new one if exists
		let groceryList = await serverSanityClient.fetch(
			`*[_type == "groceryList" && user._ref == $userId][0]{
        _id,
        items,
        recipes
      }`,
			{ userId: user._id }
		);

		const recipeExists = groceryList?.recipes?.some((r) => r._ref === recipeId);

		if (recipeExists) {
			// Remove recipe
			await serverSanityClient
				.patch(groceryList._id)
				.set({
					recipes: groceryList.recipes.filter((r) => r._ref !== recipeId),
				})
				.commit();
		} else {
			// Add to EXISTING grocery list
			if (!groceryList) {
				// Only create if it doesn't exist
				groceryList = await serverSanityClient.create({
					_type: 'groceryList',
					user: { _type: 'reference', _ref: user._id },
					items: [],
					recipes: [],
				});
			}

			// Add to existing items array
			await serverSanityClient
				.patch(groceryList._id)
				.set({
					items: [
						...groceryList.items,
						...items.map((item) => ({
							...item,
							_type: 'groceryItem',
							_key: `item-${Date.now()}-${Math.random()
								.toString(36)
								.substr(2, 9)}`,
						})),
					],
					recipes: [
						...groceryList.recipes,
						{
							_type: 'reference',
							_ref: recipeId,
							_key: `recipe-${Date.now()}-${Math.random()
								.toString(36)
								.substr(2, 9)}`,
						},
					],
				})
				.commit();
		}

		return new Response(JSON.stringify({ success: true }), { status: 200 });
	} catch (e) {
		console.error('Error:', e);
		return new Response(JSON.stringify({ error: e.message }), { status: 500 });
	}
};
