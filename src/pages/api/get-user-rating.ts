import { client } from '../../lib/sanity';

export async function GET({ url }) {
	const recipeId = url.searchParams.get('recipeId');
	const userId = url.searchParams.get('userId');

	if (!recipeId || !userId) {
		return new Response(
			JSON.stringify({ error: 'Missing recipeId or userId' }),
			{ status: 400 }
		);
	}

	const cleanId = recipeId.replace(/^drafts\./, '');

	// Find rating by user for recipe
	const result = await client.fetch(
		`*[_type == "recipeRating" && user._ref == $userId && (recipe._ref == $cleanId || recipe._ref == $draftId)][0]{
      rating
    }`,
		{
			userId,
			cleanId,
			draftId: `drafts.${cleanId}`,
		}
	);

	return new Response(JSON.stringify(result || {}), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	});
}
