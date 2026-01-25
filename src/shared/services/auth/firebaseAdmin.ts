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
		if (serviceAccount) {
			initializeApp({
				credential: cert(serviceAccount),
				projectId:
					import.meta.env.FIREBASE_PROJECT_ID ?? serviceAccount.project_id,
			});
		} else {
			initializeApp({
				credential: applicationDefault(),
				projectId: import.meta.env.FIREBASE_PROJECT_ID,
			});
		}
	}

	return getApps()[0];
};

export const getAdminAuth = () => getAuth(getFirebaseAdminApp());
