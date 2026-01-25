import { serverSanityClient as client } from '../../lib/sanity.js';
import { requireAuth } from '../../shared/services/auth/requireAuth';
import { requireSanityUserByUid } from '../../shared/services/sanity/users';

export async function POST({ request }) {
	const auth = await requireAuth(request);
	if (!auth.ok) return auth.response;

	const { recipeId } = await request.json();

	if (!recipeId) {
		return new Response(JSON.stringify({ error: 'Missing recipeId' }), {
			status: 400,
		});
	}

	const user = await requireSanityUserByUid(auth.uid);
	if (!user) {
		return new Response(JSON.stringify({ error: 'User not found' }), {
			status: 404,
		});
	}

	const existing = await client.fetch(
		`*[_type == "savedRecipe" && user._ref == $userId && recipe._ref == $recipeId][0]`,
		{ userId: user._id, recipeId }
	);

	if (!existing) {
		await client.create({
			_type: 'savedRecipe',
			user: { _type: 'reference', _ref: user._id },
			recipe: { _type: 'reference', _ref: recipeId },
			savedAt: new Date().toISOString(),
		});
	}

	return new Response(JSON.stringify({ saved: true }));
}
