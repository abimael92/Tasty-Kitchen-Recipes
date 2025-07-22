import type { APIRoute } from 'astro';
import { client } from '../../lib/sanity';

export const POST: APIRoute = async ({ request }) => {
	try {
		const { items, recipeId, userId } = await request.json();

		// Validate inputs
		if (!items || !Array.isArray(items)) {
			return new Response(JSON.stringify({ error: 'Invalid items format' }), {
				status: 400,
			});
		}

		if (!recipeId || !userId) {
			return new Response(
				JSON.stringify({ error: 'Recipe ID and User ID are required' }),
				{ status: 400 }
			);
		}

		// Verify user exists
		const userExists = await client.fetch(
			`count(*[_type == "user" && _id == $userId])`,
			{ userId }
		);

		if (!userExists) {
			return new Response(JSON.stringify({ error: 'User not found' }), {
				status: 404,
			});
		}

		// Check if recipe already exists in grocery list
		const recipeExists = await client.fetch(
			`count(*[_type == "groceryList" && user._ref == $userId && references($recipeId)]) > 0`,
			{ userId, recipeId }
		);

		if (recipeExists) {
			return new Response(
				JSON.stringify({ error: 'Recipe already in grocery list' }),
				{ status: 400 }
			);
		}

		// Get or create grocery list
		let groceryList = await client.fetch(
			`*[_type == "groceryList" && user._ref == $userId][0]{
        _id,
        items,
        recipes
      }`,
			{ userId }
		);

		if (!groceryList) {
			groceryList = await client.create({
				_type: 'groceryList',
				user: {
					_type: 'reference',
					_ref: userId,
				},
				items: [],
				recipes: [],
			});
		}

		// Merge existing and new items (combine quantities for duplicates)
		const existingItems = groceryList.items || [];
		const newItems = items.map((item) => ({
			...item,
			_type: 'groceryItem',
			_key: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
		}));

		const mergedItems = [...existingItems];
		newItems.forEach((newItem) => {
			const existingIndex = mergedItems.findIndex(
				(item) => item.name === newItem.name && item.unit === newItem.unit
			);

			if (existingIndex >= 0) {
				// Try to combine quantities
				try {
					const existingQty =
						parseFloat(mergedItems[existingIndex].quantity) || 0;
					const newQty = parseFloat(newItem.quantity) || 0;
					mergedItems[existingIndex].quantity = (
						existingQty + newQty
					).toString();
				} catch {
					// If parsing fails, keep as separate items
					mergedItems.push(newItem);
				}
			} else {
				mergedItems.push(newItem);
			}
		});

		// Update the grocery list
		const result = await client
			.patch(groceryList._id)
			.set({
				items: mergedItems,
				recipes: [
					...(groceryList.recipes || []),
					{
						_type: 'reference',
						_ref: recipeId,
					},
				],
			})
			.commit();

		return new Response(JSON.stringify({ success: true, data: result }), {
			status: 200,
		});
	} catch (e) {
		console.error('Grocery list error:', e);
		return new Response(JSON.stringify({ error: e.message }), { status: 500 });
	}
};
