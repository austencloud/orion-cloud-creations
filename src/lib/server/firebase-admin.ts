import { initializeApp, cert, getApps, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

function getServiceAccount(): ServiceAccount | null {
	const inlineJson = process.env.FIREBASE_SERVICE_ACCOUNT;
	if (inlineJson) {
		try {
			return JSON.parse(inlineJson) as ServiceAccount;
		} catch (e) {
			console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', e);
			return null;
		}
	}

	const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
	if (credPath) {
		try {
			return JSON.parse(readFileSync(credPath, 'utf-8')) as ServiceAccount;
		} catch (e) {
			console.error('Failed to read service account file:', e);
			return null;
		}
	}

	return null;
}

function initAdmin() {
	if (getApps().length > 0) {
		return getFirestore();
	}

	const serviceAccount = getServiceAccount();
	if (!serviceAccount) {
		console.warn('No Firebase service account configured — server-side operations will be unavailable');
		return null;
	}

	try {
		initializeApp({ credential: cert(serviceAccount) });
		return getFirestore();
	} catch (e) {
		console.error('Firebase Admin init failed:', e);
		return null;
	}
}

export const adminDb = initAdmin();
