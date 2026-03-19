import { initializeApp, cert, getApps, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

function getServiceAccount(): ServiceAccount | null {
	// Mode 1: inline JSON string (for deployment)
	const inlineJson = process.env.FIREBASE_SERVICE_ACCOUNT;
	if (inlineJson) {
		try {
			return JSON.parse(inlineJson) as ServiceAccount;
		} catch (e) {
			console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', e);
			return null;
		}
	}

	// Mode 2: file path (for local dev)
	// Try multiple sources since Vite doesn't always populate process.env for non-VITE_ vars
	const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
	if (credPath) {
		try {
			return JSON.parse(readFileSync(credPath, 'utf-8')) as ServiceAccount;
		} catch (e) {
			console.error('Failed to read service account file:', e);
			return null;
		}
	}

	// Mode 3: hardcoded fallback path for local dev
	try {
		return JSON.parse(readFileSync('./firebase-service-account.json', 'utf-8')) as ServiceAccount;
	} catch {
		// File doesn't exist, that's fine
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
