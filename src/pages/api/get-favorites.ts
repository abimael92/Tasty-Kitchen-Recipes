import { client } from '../../lib/sanity.js';

export async function POST({ request }) {
	const { userId } = await request.json();

	if (!userId) {
		return new Response(JSON.stringify({ error: 'Missing userId' }), {
			status: 400,
		});
	}

	try {
		// Get the user's collection doc with recipe refs
		const collection = await client.fetch(
			`*[_type == "collection" && user._ref == $userId][0]{
        recipes[]->{ 
          _id, title, "image": image.asset->url, slug 
        }
      }`,
			{ userId }
		);

		if (!collection || !collection.recipes) {
			return new Response(JSON.stringify({ recipes: [] }), { status: 200 });
		}

		return new Response(JSON.stringify({ recipes: collection.recipes }), {
			status: 200,
		});
	} catch (error) {
		console.error('Error fetching favorites:', error);
		return new Response(
			JSON.stringify({ error: 'Failed to fetch favorites' }),
			{ status: 500 }
		);
	}
}
