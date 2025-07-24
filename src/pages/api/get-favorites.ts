import { client } from '../../lib/sanity.js';

export async function POST({ request }) {
	const { userId } = await request.json();

	if (!userId) {
		return new Response(JSON.stringify({ error: 'Missing userId' }), {
			status: 400,
		});
	}

	try {
		console.log('Fetching collection for userId:', userId);

		const collection = await client.fetch(
			`*[_type == "collection" && user._ref == $userId][0]{
        _id,
        title,
        recipes[]->{
          _id,
          title,
          "image": image.asset->url,
          slug
        }
      }`,
			{ userId }
		);

		console.log('Collection fetched:', collection);

		if (!collection) {
			return new Response(JSON.stringify({ recipes: [], title: null }), {
				status: 200,
			});
		}

		return new Response(
			JSON.stringify({
				recipes: collection.recipes || [],
				title: collection.title,
			}),
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error fetching favorites:', error);
		return new Response(
			JSON.stringify({ error: 'Failed to fetch favorites' }),
			{ status: 500 }
		);
	}
}
