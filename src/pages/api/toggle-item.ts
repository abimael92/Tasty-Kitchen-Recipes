import type { APIRoute } from 'astro';
import { serverSanityClient } from '../../lib/sanity';

export const POST: APIRoute = async ({ request }) => {
	const { userId, itemKey } = await request.json();

	if (!userId || !itemKey) {
		return new Response(null, { status: 400 });
	}

	const result = await serverSanityClient.fetch(
		`*[_type == "groceryList" && user._ref == $userId][0]{ _id, items }`,
		{ userId }
	);

	if (!result) {
		return new Response(null, { status: 404 });
	}

	const updatedItems = result.items.map((item: any) =>
		item._key === itemKey ? { ...item, completed: !item.completed } : item
	);

	await serverSanityClient
		.patch(result._id)
		.set({ items: updatedItems })
		.commit();

	return new Response(JSON.stringify(updatedItems), {
		headers: { 'Content-Type': 'application/json' },
	});
};
