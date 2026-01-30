import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

/**
 * Firebase Client Configuration
 *
 * SECURITY NOTICE - Client-Exposed Environment Variables:
 * These VITE_* variables are intentionally exposed to the client bundle.
 * Firebase Client SDK requires them for browser authentication.
 *
 * What gets exposed:
 * - VITE_FIREBASE_API_KEY: Safe to expose - it identifies your Firebase project, not secret
 * - VITE_FIREBASE_AUTH_DOMAIN, PROJECT_ID, etc.: Public Firebase config
 *
 * What must NEVER be exposed to client:
 * - FIREBASE_SERVICE_ACCOUNT: Server-only, contains private key
 * - SANITY_API_TOKEN: Server-only
 * - Any secrets or API keys not prefixed with VITE_ or PUBLIC_
 *
 * See .env.example for full documentation.
 */
export const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
	measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp;
let auth: Auth;

if (!getApps().length) {
	app = initializeApp(firebaseConfig);
	auth = getAuth(app);
}

export function getFirebaseAuth() {
	return auth;
}

export { auth };
