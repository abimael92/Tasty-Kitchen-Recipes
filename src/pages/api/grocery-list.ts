import type { APIRoute } from 'astro';
import { serverSanityClient as client } from '../../lib/sanity';
import { requireAuth } from '../../shared/services/auth/requireAuth';
import { requireSanityUserByUid } from '../../shared/services/sanity/users';

export const GET: APIRoute = async ({ request, url }) => {
	const auth = await requireAuth(request);
	if (!auth.ok) return auth.response;

	const user = await requireSanityUserByUid(auth.uid);
	if (!user) {
		return new Response(JSON.stringify([]), { status: 404 });
	}

	const userIdParam = url.searchParams.get('uid');
	if (userIdParam && userIdParam !== user._id) {
		return new Response(JSON.stringify([]), { status: 403 });
	}

	const result = await client.fetch(
		`*[_type == "groceryList" && user._ref == $userId][0]{ items }`,
		{ userId: user._id }
	);

	return new Response(JSON.stringify(result?.items || []), {
		headers: { 'Content-Type': 'application/json' },
	});
};
