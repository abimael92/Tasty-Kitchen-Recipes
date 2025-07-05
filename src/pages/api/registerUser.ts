import type { APIRoute } from 'astro';
import { initializeApp, getApps } from 'firebase/app';
import {
	getAuth,
	createUserWithEmailAndPassword,
	updateProfile,
} from 'firebase/auth';
import { createClient } from '@sanity/client';

const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
	measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const sanity = createClient({
	projectId: import.meta.env.SANITY_PROJECT_ID,
	dataset: 'production',
	apiVersion: '2023-07-01',
	token: import.meta.env.SANITY_API_TOKEN,
	useCdn: false,
});

export const config = { runtime: 'nodejs' };

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

		const userCred = await createUserWithEmailAndPassword(
			auth,
			email,
			password
		);
		await updateProfile(userCred.user, { displayName: name });

		const uid = userCred.user.uid;

		await sanity.create({
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
			{ status: 200 }
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
