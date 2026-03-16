// src/lib/services/firebase.ts
//
// Firebase initialization for OCC Admin.
// Uses VITE_ prefixed env vars via import.meta.env.

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { collection, type CollectionReference } from 'firebase/firestore';
import { browser } from '$app/environment';

let app: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;

if (browser) {
	const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
	const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

	if (!apiKey || !projectId) {
		console.error(
			'Firebase env vars not set (VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID). Firebase will not initialize.'
		);
	} else {
		const firebaseConfig = {
			apiKey,
			authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
			projectId,
			storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
			messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
			appId: import.meta.env.VITE_FIREBASE_APP_ID
		};

		if (!getApps().length) {
			try {
				app = initializeApp(firebaseConfig);
			} catch (e) {
				console.error('Firebase init failed:', e);
				app = null;
			}
		} else {
			app = getApp();
		}
	}
}

/** Get the Firestore instance. Returns null during SSR or if init failed. */
export function getDbInstance(): Firestore | null {
	if (browser && app && !dbInstance) {
		try {
			dbInstance = getFirestore(app);
		} catch (e) {
			console.error('Firestore init failed:', e);
			dbInstance = null;
		}
	}
	return dbInstance;
}

// Firestore collection names
export const TAGS_COLLECTION = 'mediaTags';
export const ITEMS_COLLECTION = 'mediaItems';
export const STATE_COLLECTION = 'mediaLibraryState';
export const STATE_DOC_ID = 'current';

/** Get a typed collection reference. Returns null if db is unavailable. */
export function getCollection(name: string): CollectionReference | null {
	const db = getDbInstance();
	if (!db) return null;
	return collection(db, name);
}

export { app };
