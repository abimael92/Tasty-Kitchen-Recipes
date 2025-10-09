import { client } from '../../lib/sanity';

export async function GET({ url }) {
	const userId = url.searchParams.get('userId');
	// console.log('Received userId:', userId);

	if (!userId) {
		return new Response(JSON.stringify({ error: 'Missing userId' }), {
			status: 400,
		});
	}

	try {
		const query = `*[_type == "savedRecipe" && user._ref == $userId]{ 
      recipe->{ title, slug, image }
    }`;

		const recipes = await client.fetch(query, { userId });

		return new Response(JSON.stringify(recipes), {
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		console.error('Sanity fetch error:', error);
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
		});
	}
}
