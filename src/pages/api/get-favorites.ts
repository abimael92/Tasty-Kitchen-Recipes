import { serverSanityClient } from '../../lib/sanity.js';
import { requireAuth } from '../../shared/services/auth/requireAuth';
import { requireSanityUserByUid } from '../../shared/services/sanity/users';

export async function POST({ request }) {
	const auth = await requireAuth(request);
	if (!auth.ok) return auth.response;

	try {
		const user = await requireSanityUserByUid(auth.uid);
		if (!user) {
			return new Response(JSON.stringify({ error: 'User not found' }), {
				status: 404,
			});
		}

		const collection = await serverSanityClient.fetch(
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
			{ userId: user._id }
		);

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
