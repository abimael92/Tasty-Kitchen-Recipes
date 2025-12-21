import type { APIRoute } from 'astro';
import { serverSanityClient as client } from '../../lib/sanity';

export const GET: APIRoute = async ({ request }) => {
	const url = new URL(request.url);
	const userId = url.searchParams.get('uid');

	if (!userId) {
		// console.log('No userId provided');
		return new Response(JSON.stringify([]), { status: 400 });
	}

	const result = await client.fetch(
		`*[_type == "groceryList" && user._ref == $userId][0]{ items }`,
		{ userId }
	);

	return new Response(JSON.stringify(result?.items || []), {
		headers: { 'Content-Type': 'application/json' },
	});
};
