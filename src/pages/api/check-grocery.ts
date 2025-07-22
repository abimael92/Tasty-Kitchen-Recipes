import type { APIRoute } from 'astro';
import { client } from '../../lib/sanity';

export const POST: APIRoute = async ({ request }) => {
	try {
		const { userId } = await request.json();

		const groceryList = await client.fetch(
			`*[_type == "groceryList" && user._ref == $userId][0]{
        recipes[]->{
          _id
        }
      }`,
			{ userId }
		);

		return new Response(
			JSON.stringify({
				recipes: groceryList?.recipes || [],
			}),
			{ status: 200 }
		);
	} catch (e) {
		return new Response(JSON.stringify({ error: e.message }), { status: 500 });
	}
};
