import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getDbInstance, SETTINGS_COLLECTION, SETTINGS_DOC_ID } from './firebase';
import type { StoreSettings } from '$lib/types/settings';
import { DEFAULT_STORE_SETTINGS } from '$lib/types/settings';

function requireDb() {
	const db = getDbInstance();
	if (!db) throw new Error('Firestore not available');
	return db;
}

export const settingsService = {
	async get(): Promise<StoreSettings> {
		const ref = doc(requireDb(), SETTINGS_COLLECTION, SETTINGS_DOC_ID);
		const snap = await getDoc(ref);
		if (!snap.exists()) return { ...DEFAULT_STORE_SETTINGS };
		return { ...DEFAULT_STORE_SETTINGS, ...snap.data() } as StoreSettings;
	},

	async update(settings: Partial<StoreSettings>): Promise<void> {
		const ref = doc(requireDb(), SETTINGS_COLLECTION, SETTINGS_DOC_ID);
		await setDoc(ref, settings, { merge: true });
	}
};
