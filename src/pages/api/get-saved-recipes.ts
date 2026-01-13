import { serverSanityClient } from '../../lib/sanity';

export async function GET({ url }) {
	const userId = url.searchParams.get('userId');

	try {
		const savedDoc = await serverSanityClient.fetch(
			// Use serverSanityClient
			`*[_type == "savedRecipe" && user._ref == $userId][0]{
        recipes[]{
          recipe->{
            _id,
            title,
            "image": image.asset->url,
            chef->{name},
            tags,
            rating,
            slug
          },
          savedAt
        }
      }`,
			{ userId }
		);

		const recipes = savedDoc?.recipes || [];

		return new Response(JSON.stringify(recipes), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		console.error('Error:', error);
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}
