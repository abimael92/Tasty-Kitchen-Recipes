import type { APIRoute } from 'astro';
import { serverSanityClient as client } from '../../lib/sanity';
import { requireAuth } from '../../shared/services/auth/requireAuth';
import { requireSanityUserByUid } from '../../shared/services/sanity/users';

export const POST: APIRoute = async ({ request }) => {
	try {
		const auth = await requireAuth(request);
		if (!auth.ok) return auth.response;

		const { items, recipeId } = await request.json();

		if (!items || !Array.isArray(items) || !recipeId) {
			return new Response(JSON.stringify({ error: 'Invalid input' }), {
				status: 400,
			});
		}

		const user = await requireSanityUserByUid(auth.uid);

		if (!user) {
			return new Response(JSON.stringify({ error: 'User not found' }), {
				status: 404,
			});
		}

		let groceryList = await client.fetch(
			`*[_type == "groceryList" && user._ref == $userId][0]{ _id, items, recipes }`,
			{ userId: user._id }
		);

		if (!groceryList) {
			groceryList = await client.create({
				_type: 'groceryList',
				user: { _type: 'reference', _ref: user._id },
				items: [],
				recipes: [],
			});
		}

		const newItems = items.map((item) => ({
			...item,
			_type: 'groceryItem',
			_key: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
		}));

		const mergedItems = [...(groceryList.items || [])];

		newItems.forEach((newItem) => {
			const match = mergedItems.find(
				(existing) =>
					existing.name === newItem.name && existing.unit === newItem.unit
			);

			if (match) {
				const existingQty = parseFloat(match.quantity) || 0;
				const newQty = parseFloat(newItem.quantity) || 0;
				match.quantity = (existingQty + newQty).toString();
			} else {
				mergedItems.push(newItem);
			}
		});

		await client
			.patch(groceryList._id)
			.set({
				items: mergedItems,
				recipes: [
					...(groceryList.recipes || []),
					{ _type: 'reference', _ref: recipeId },
				],
			})
			.commit();

		return new Response(JSON.stringify({ success: true }), { status: 200 });
	} catch (e) {
		console.error('Grocery list error:', e);
		return new Response(JSON.stringify({ error: e.message }), { status: 500 });
	}
};
