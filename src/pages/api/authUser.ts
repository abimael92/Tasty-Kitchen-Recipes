import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseConfig } from '../../lib/firebase';
import { serverSanityClient } from '../../lib/sanity';
import { RateLimiter } from '../../utils/rateLimiter';
import { buildSessionCookie } from '../../shared/services/auth/sessionCookie';

const rateLimiter = new RateLimiter();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000;

async function syncUserToSanity(firebaseUser) {
	const docId = `user_${firebaseUser.uid}`;
	const userDoc = {
		_id: docId,
		_type: 'user',
		uid: firebaseUser.uid,
		email: firebaseUser.email,
		name: firebaseUser.displayName || '',
	};
	await serverSanityClient.createOrReplace(userDoc);
}

export const POST = async ({ request }) => {
	if (!getApps().length) initializeApp(firebaseConfig);

	const { email, password } = await request.json();
	if (!email || !password) {
		return new Response(
			JSON.stringify({ error: 'Email and password required' }),
			{ status: 400 }
		);
	}

	try {
		const rateKey = request.headers.get('x-forwarded-for') || 'anonymous';
		if (rateLimiter.isRateLimited(rateKey, 'login', MAX_ATTEMPTS, WINDOW_MS)) {
			return new Response(JSON.stringify({ error: 'Too many attempts' }), {
				status: 429,
			});
		}

		const auth = getAuth();
		const userCredential = await signInWithEmailAndPassword(
			auth,
			email,
			password
		);
		const token = await userCredential.user.getIdToken();

		// Sync user to Sanity here
		await syncUserToSanity(userCredential.user);

		return new Response(
			JSON.stringify({
				uid: userCredential.user.uid,
				email: userCredential.user.email,
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
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), {
			status: 401,
		});
	}
};
