import type { APIRoute } from 'astro';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
	measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Add this config to ensure proper route handling
export const config = {
	runtime: 'nodejs', // Required for Firebase admin
};

export const POST: APIRoute = async ({ request }) => {
	try {
		// Initialize Firebase if not already initialized
		if (!getApps().length) {
			initializeApp(firebaseConfig);
		}

		// Parse request body
		const { email, password } = await request.json();
		if (!email || !password) {
			throw new Error('Email and password are required');
		}

		const auth = getAuth();
		const userCredential = await signInWithEmailAndPassword(
			auth,
			email,
			password
		);
		const token = await userCredential.user.getIdToken();

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
					'Cache-Control': 'no-store', // Important for auth responses
				},
			}
		);
	} catch (error) {
		return new Response(
			JSON.stringify({
				error: error.message,
				code: error.code || 'auth/unknown-error',
			}),
			{
				status: error.code?.startsWith('auth/') ? 401 : 500,
				headers: { 'Content-Type': 'application/json' },
			}
		);
	}
};
