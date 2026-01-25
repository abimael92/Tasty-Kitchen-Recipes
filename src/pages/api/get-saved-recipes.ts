import { serverSanityClient } from '../../lib/sanity';
import { requireAuth } from '../../shared/services/auth/requireAuth';
import { requireSanityUserByUid } from '../../shared/services/sanity/users';

export async function GET({ request, url }) {
	const auth = await requireAuth(request);
	if (!auth.ok) return auth.response;

	try {
		const user = await requireSanityUserByUid(auth.uid);
		if (!user) {
			return new Response(JSON.stringify({ error: 'User not found' }), {
				status: 404,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const userIdParam = url.searchParams.get('userId');
		if (userIdParam && userIdParam !== user._id) {
			return new Response(JSON.stringify({ error: 'Forbidden' }), {
				status: 403,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const savedDoc = await serverSanityClient.fetch(
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
			{ userId: user._id }
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
