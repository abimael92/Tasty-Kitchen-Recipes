import type { APIRoute } from 'astro';
import { initializeApp, getApps } from 'firebase/app';
import {
	getAuth,
	createUserWithEmailAndPassword,
	updateProfile,
} from 'firebase/auth';
import { firebaseConfig } from '../../lib/firebase';
import { serverSanityClient } from '../../lib/sanity';
import { RateLimiter } from '../../utils/rateLimiter';
import { buildSessionCookie } from '../../shared/services/auth/sessionCookie';

export const config = { runtime: 'nodejs' };

const rateLimiter = new RateLimiter();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000;

export const POST: APIRoute = async ({ request }) => {
	try {
		if (!getApps().length) initializeApp(firebaseConfig);
		const auth = getAuth();

		const {
			email,
			password,
			name,
			lastname,
			role,
			bio = '',
			location = '',
			phone = '',
			dietPreference = '',
			allergies = [],
			preferredCuisine = [],
			profileImage = '',
		} = await request.json();

		if (!email || !password || !name || !lastname || !role) {
			throw new Error('Missing required registration fields');
		}

		const rateKey = request.headers.get('x-forwarded-for') || 'anonymous';
		if (rateLimiter.isRateLimited(rateKey, 'register', MAX_ATTEMPTS, WINDOW_MS)) {
			return new Response(JSON.stringify({ error: 'Too many attempts' }), {
				status: 429,
			});
		}

		const userCred = await createUserWithEmailAndPassword(
			auth,
			email,
			password
		);
		await updateProfile(userCred.user, { displayName: name });

		const uid = userCred.user.uid;

		await serverSanityClient.create({
			_type: 'user',
			uid,
			name,
			lastname,
			email,
			role,
			bio,
			location,
			phone,
			dietPreference,
			allergies,
			preferredCuisine,
			joinedAt: new Date().toISOString(),
		});

		const token = await userCred.user.getIdToken();

		return new Response(
			JSON.stringify({
				uid,
				email,
				name,
				role,
				token,
			}),
			{
				status: 200,
				headers: {
					'Content-Type': 'application/json',
					'Set-Cookie': buildSessionCookie(token),
				},
			}
		);
	} catch (err) {
		return new Response(
			JSON.stringify({
				error: err.message,
				code: err.code || 'register/failed',
			}),
			{ status: 500 }
		);
	}
};
