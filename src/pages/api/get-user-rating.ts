import { serverSanityClient } from '../../lib/sanity';
import { requireAuth } from '../../shared/services/auth/requireAuth';
import { requireSanityUserByUid } from '../../shared/services/sanity/users';

export async function GET({ request, url }) {
	const auth = await requireAuth(request);
	if (!auth.ok) return auth.response;

	const recipeId = url.searchParams.get('recipeId');

	if (!recipeId) {
		return new Response(
			JSON.stringify({ error: 'Missing recipeId' }),
			{ status: 400 }
		);
	}

	const user = await requireSanityUserByUid(auth.uid);
	if (!user) {
		return new Response(JSON.stringify({ error: 'User not found' }), {
			status: 404,
		});
	}

	const cleanId = recipeId.replace(/^drafts\./, '');

	// Find rating by user for recipe
	const result = await serverSanityClient.fetch(
		`*[_type == "recipeRating" && user._ref == $userId && (recipe._ref == $cleanId || recipe._ref == $draftId)][0]{
      rating
    }`,
		{
			userId: user._id,
			cleanId,
			draftId: `drafts.${cleanId}`,
		}
	);

	return new Response(JSON.stringify(result || {}), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	});
}
