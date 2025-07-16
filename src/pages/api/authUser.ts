import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { createClient } from '@sanity/client';

const sanity = createClient({
	projectId: import.meta.env.SANITY_PROJECT_ID,
	dataset: import.meta.env.SANITY_DATASET,
	apiVersion: import.meta.env.SANITY_API_VERSION,
	token: import.meta.env.SANITY_API_TOKEN,
	useCdn: false,
});

async function syncUserToSanity(firebaseUser) {
	const docId = `user_${firebaseUser.uid}`;
	const userDoc = {
		_id: docId,
		_type: 'user',
		uid: firebaseUser.uid,
		email: firebaseUser.email,
		name: firebaseUser.displayName || '',
	};
	await sanity.createOrReplace(userDoc);
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
			{ status: 200 }
		);
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), {
			status: 401,
		});
	}
};
