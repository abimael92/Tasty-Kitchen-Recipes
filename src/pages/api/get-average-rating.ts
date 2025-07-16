// /src/pages/api/average-rating.ts
import { client } from '../../lib/sanity';

export async function GET({ url }) {
	const recipeId = url.searchParams.get('recipeId');

	if (!recipeId) {
		return new Response(JSON.stringify({ error: 'Missing recipeId' }), {
			status: 400,
		});
	}

	const ratings = await client.fetch(
		`*[
			_type == "recipeRating" &&
			(recipe._ref == $recipeId || recipe._ref == $draftId)
		].rating`,
		{
			recipeId,
			draftId: `drafts.${recipeId}`,
		}
	);

	const total = ratings.reduce((sum, r) => sum + r, 0);
	const average = ratings.length ? total / ratings.length : 0;

	return new Response(JSON.stringify({ average, count: ratings.length }));
}
