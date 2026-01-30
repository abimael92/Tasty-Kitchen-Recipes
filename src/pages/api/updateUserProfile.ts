import type { APIRoute } from 'astro';
import { serverSanityClient } from '../../lib/sanity';
import { requireAuth } from '../../shared/services/auth/requireAuth';
import { requireSanityUserByUid } from '../../shared/services/sanity/users';
import { toSafeErrorResponse } from '../../shared/utils/apiError';

export const POST: APIRoute = async ({ request }) => {
	try {
		const auth = await requireAuth(request);
		if (!auth.ok) return auth.response;

		const { name, lastname, bio, phone, location } = await request.json();
		const user = await requireSanityUserByUid(auth.uid);
		if (!user) throw new Error('User not found');

		const updated = await serverSanityClient
			.patch(user._id)
			.set({ name, lastname, bio, phone, location })
			.commit();

		return new Response(JSON.stringify(updated), { status: 200 });
	} catch (e) {
		return toSafeErrorResponse(e, {
			status: 500,
			context: 'updateUserProfile',
			defaultMessage: 'Failed to update profile',
		});
	}
};
