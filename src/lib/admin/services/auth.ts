import {
	getAuth,
	signInWithPopup,
	GoogleAuthProvider,
	onAuthStateChanged as firebaseOnAuthStateChanged,
	signOut as firebaseSignOut,
	type User
} from 'firebase/auth';
import { app } from './firebase';
import { browser } from '$app/environment';

const provider = new GoogleAuthProvider();

function getAuthInstance() {
	if (!browser || !app) return null;
	return getAuth(app);
}

export async function signInWithGoogle(): Promise<User | null> {
	const auth = getAuthInstance();
	if (!auth) return null;
	const result = await signInWithPopup(auth, provider);
	return result.user;
}

export async function signOut(): Promise<void> {
	const auth = getAuthInstance();
	if (!auth) return;
	await firebaseSignOut(auth);
}

export function onAuthStateChanged(callback: (user: User | null) => void): () => void {
	const auth = getAuthInstance();
	if (!auth) {
		callback(null);
		return () => {};
	}
	return firebaseOnAuthStateChanged(auth, callback);
}

export function getCurrentUser(): User | null {
	const auth = getAuthInstance();
	return auth?.currentUser ?? null;
}
