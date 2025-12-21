import { serverSanityClient as client } from '../../lib/sanity.js';

export async function POST({ request }) {
	const { userId, recipeId } = await request.json();

	const existing = await client.fetch(
		`*[_type == "savedRecipe" && user._ref == $userId && recipe._ref == $recipeId][0]`,
		{ userId, recipeId }
	);

	if (!existing) {
		await client.create({
			_type: 'savedRecipe',
			user: { _type: 'reference', _ref: userId },
			recipe: { _type: 'reference', _ref: recipeId },
			savedAt: new Date().toISOString(),
		});
	}

	return new Response(JSON.stringify({ saved: true }));
}
