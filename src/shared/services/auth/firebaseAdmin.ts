import { initializeApp, getApps, cert, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

type ServiceAccount = {
	project_id?: string;
	client_email?: string;
	private_key?: string;
};

const getServiceAccount = (): ServiceAccount | null => {
	const raw = import.meta.env.FIREBASE_SERVICE_ACCOUNT;
	if (!raw) return null;

	try {
		return JSON.parse(raw);
	} catch (error) {
		throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT JSON');
	}
};

const getFirebaseAdminApp = () => {
	if (!getApps().length) {
		const serviceAccount = getServiceAccount();
		const isProd = import.meta.env.PROD;

		if (serviceAccount) {
			initializeApp({
				credential: cert(serviceAccount),
				projectId:
					import.meta.env.FIREBASE_PROJECT_ID ?? serviceAccount.project_id,
			});
		} else if (isProd) {
			// In production, require explicit service account - never use applicationDefault
			throw new Error(
				'FIREBASE_SERVICE_ACCOUNT is required in production. Set it in your environment variables.'
			);
		} else {
			// Development: fall back to applicationDefault (e.g. GOOGLE_APPLICATION_CREDENTIALS)
			initializeApp({
				credential: applicationDefault(),
				projectId: import.meta.env.FIREBASE_PROJECT_ID,
			});
		}
	}

	return getApps()[0];
};

export const getAdminAuth = () => getAuth(getFirebaseAdminApp());
