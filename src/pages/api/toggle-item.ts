import type { APIRoute } from 'astro';
import { serverSanityClient } from '../../lib/sanity';
import { requireAuth } from '../../shared/services/auth/requireAuth';
import { requireSanityUserByUid } from '../../shared/services/sanity/users';

export const POST: APIRoute = async ({ request }) => {
	const auth = await requireAuth(request);
	if (!auth.ok) return auth.response;

	const { itemKey } = await request.json();

	if (!itemKey) {
		return new Response(null, { status: 400 });
	}

	const user = await requireSanityUserByUid(auth.uid);
	if (!user) {
		return new Response(null, { status: 404 });
	}

	const result = await serverSanityClient.fetch(
		`*[_type == "groceryList" && user._ref == $userId][0]{ _id, items }`,
		{ userId: user._id }
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
