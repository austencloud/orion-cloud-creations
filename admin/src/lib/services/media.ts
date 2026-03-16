// src/lib/services/media.ts
//
// Firestore CRUD services for media tags, items, and library state.
// Adapted from Cirque Aflame — simplified for OCC (no hierarchy, collections, or chunked loading).

import {
	doc,
	addDoc,
	updateDoc,
	deleteDoc,
	getDocs,
	getDoc,
	setDoc,
	query,
	where,
	orderBy,
	Timestamp,
	serverTimestamp,
	collection,
	type DocumentData
} from 'firebase/firestore';
import { browser } from '$app/environment';
import {
	getDbInstance,
	TAGS_COLLECTION,
	ITEMS_COLLECTION,
	STATE_COLLECTION,
	STATE_DOC_ID
} from './firebase';
import type { MediaTag, MediaItem, MediaLibraryState } from '$lib/types/media';
import { DEFAULT_LIBRARY_STATE } from '$lib/types/media';

// --- Firestore data conversion ---

function prepareForFirestore<T>(data: T): any {
	if (data === null || data === undefined) return data;
	if (data instanceof Date) return Timestamp.fromDate(data);
	if (Array.isArray(data)) return data.map((item) => prepareForFirestore(item));
	if (typeof data === 'object' && data!.constructor === Object) {
		const prepared: any = {};
		for (const key in data) {
			if (Object.prototype.hasOwnProperty.call(data, key)) {
				const value = (data as any)[key];
				if (value === undefined) continue; // Firestore rejects undefined
				prepared[key] = prepareForFirestore(value);
			}
		}
		return prepared;
	}
	return data;
}

function convertFromFirestore<T>(data: DocumentData | undefined | null): T | null {
	if (!data) return null;
	const converted = { ...data } as any;
	for (const key in converted) {
		if (Object.prototype.hasOwnProperty.call(converted, key)) {
			const value = converted[key];
			if (value instanceof Timestamp) {
				converted[key] = value.toDate();
			} else if (Array.isArray(value)) {
				converted[key] = value.map((item) =>
					item instanceof Timestamp
						? item.toDate()
						: item && typeof item === 'object'
							? convertFromFirestore(item)
							: item
				);
			} else if (value && typeof value === 'object' && !(value instanceof Date)) {
				if (value.constructor === Object) {
					converted[key] = convertFromFirestore(value);
				}
			}
		}
	}
	return converted as T;
}

// --- Guard helpers ---

function requireBrowser(): void {
	if (!browser) throw new Error('Operation only available on client');
}

function requireDb() {
	const db = getDbInstance();
	if (!db) throw new Error('Database not available');
	return db;
}

// --- Media Tag Service ---

export const mediaTagService = {
	async add(
		tagData: Omit<MediaTag, 'id' | 'createdAt' | 'updatedAt'>
	): Promise<string> {
		requireBrowser();
		const db = requireDb();
		const preparedData = prepareForFirestore({
			...tagData,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp()
		});
		const docRef = await addDoc(collection(db, TAGS_COLLECTION), preparedData);
		return docRef.id;
	},

	async update(
		id: string,
		updates: Partial<Omit<MediaTag, 'id' | 'createdAt'>>
	): Promise<void> {
		requireBrowser();
		const db = requireDb();
		const docRef = doc(db, TAGS_COLLECTION, id);
		const preparedData = prepareForFirestore({
			...updates,
			updatedAt: serverTimestamp()
		});
		await updateDoc(docRef, preparedData);
	},

	async delete(id: string): Promise<void> {
		requireBrowser();
		const db = requireDb();

		// Remove this tag from all items that reference it
		const itemsWithTag = await mediaItemService.getByTags([id], 'or');
		await Promise.allSettled(
			itemsWithTag.map((item) =>
				mediaItemService.update(item.id, {
					tags: item.tags.filter((t) => t !== id)
				})
			)
		);

		const docRef = doc(db, TAGS_COLLECTION, id);
		await deleteDoc(docRef);
	},

	async get(id: string): Promise<MediaTag | null> {
		const db = getDbInstance();
		if (!db) return null;
		try {
			const docRef = doc(db, TAGS_COLLECTION, id);
			const docSnap = await getDoc(docRef);
			if (!docSnap.exists()) return null;
			const data = convertFromFirestore<Omit<MediaTag, 'id'>>(docSnap.data());
			return data ? ({ ...data, id: docSnap.id } as MediaTag) : null;
		} catch (e) {
			console.error('mediaTagService.get failed:', e);
			return null;
		}
	},

	async getAll(): Promise<MediaTag[]> {
		const db = getDbInstance();
		if (!db) return [];
		try {
			const q = query(collection(db, TAGS_COLLECTION), orderBy('name', 'asc'));
			const snapshot = await getDocs(q);
			return snapshot.docs
				.map((docSnap) => {
					const data = convertFromFirestore<Omit<MediaTag, 'id'>>(docSnap.data());
					return data ? ({ ...data, id: docSnap.id } as MediaTag) : null;
				})
				.filter((t): t is MediaTag => t !== null);
		} catch (e) {
			console.error('mediaTagService.getAll failed:', e);
			return [];
		}
	},

	async search(term: string): Promise<MediaTag[]> {
		const all = await this.getAll();
		if (!term) return all;
		const lower = term.toLowerCase();
		return all.filter((t) => t.name.toLowerCase().includes(lower));
	},

	async findByName(name: string): Promise<MediaTag | null> {
		const all = await this.getAll();
		const normalized = name.trim().toLowerCase();
		return all.find((t) => t.name.toLowerCase() === normalized) ?? null;
	},

	async merge(sourceId: string, targetId: string): Promise<void> {
		requireBrowser();
		if (sourceId === targetId) throw new Error('Cannot merge a tag into itself');

		const itemsWithSource = await mediaItemService.getByTags([sourceId], 'or');
		for (const item of itemsWithSource) {
			const newTags = item.tags.filter((t) => t !== sourceId);
			if (!newTags.includes(targetId)) newTags.push(targetId);
			await mediaItemService.update(item.id, { tags: newTags });
		}
		await this.delete(sourceId);
	}
};

// --- Media Item Service ---

export const mediaItemService = {
	async add(
		itemData: Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'>
	): Promise<string> {
		requireBrowser();
		const db = requireDb();
		const preparedData = prepareForFirestore({
			...itemData,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp()
		});
		const docRef = await addDoc(collection(db, ITEMS_COLLECTION), preparedData);
		return docRef.id;
	},

	async update(
		id: string,
		updates: Partial<Omit<MediaItem, 'id' | 'createdAt'>>
	): Promise<void> {
		requireBrowser();
		const db = requireDb();
		const docRef = doc(db, ITEMS_COLLECTION, id);
		const preparedData = prepareForFirestore({
			...updates,
			updatedAt: serverTimestamp()
		});
		await updateDoc(docRef, preparedData);
	},

	async delete(id: string): Promise<void> {
		requireBrowser();
		const db = requireDb();
		const docRef = doc(db, ITEMS_COLLECTION, id);
		await deleteDoc(docRef);
	},

	async get(id: string): Promise<MediaItem | null> {
		const db = getDbInstance();
		if (!db) return null;
		try {
			const docRef = doc(db, ITEMS_COLLECTION, id);
			const docSnap = await getDoc(docRef);
			if (!docSnap.exists()) return null;
			const data = convertFromFirestore<Omit<MediaItem, 'id'>>(docSnap.data());
			return data ? ({ ...data, id: docSnap.id } as MediaItem) : null;
		} catch (e) {
			console.error('mediaItemService.get failed:', e);
			return null;
		}
	},

	async getAll(): Promise<MediaItem[]> {
		const db = getDbInstance();
		if (!db) return [];
		try {
			const q = query(
				collection(db, ITEMS_COLLECTION),
				orderBy('createdAt', 'desc')
			);
			const snapshot = await getDocs(q);
			return snapshot.docs
				.map((docSnap) => {
					const data = convertFromFirestore<Omit<MediaItem, 'id'>>(docSnap.data());
					return data ? ({ ...data, id: docSnap.id } as MediaItem) : null;
				})
				.filter((item): item is MediaItem => item !== null);
		} catch (e) {
			console.error('mediaItemService.getAll failed:', e);
			return [];
		}
	},

	async getByTags(
		tagIds: string[],
		mode: 'and' | 'or'
	): Promise<MediaItem[]> {
		if (tagIds.length === 0) return this.getAll();

		const db = getDbInstance();
		if (!db) return [];

		try {
			if (mode === 'or') {
				// Firestore array-contains only supports a single value,
				// so query for each tag and deduplicate.
				const seen = new Set<string>();
				const results: MediaItem[] = [];
				for (const tagId of tagIds) {
					const q = query(
						collection(db, ITEMS_COLLECTION),
						where('tags', 'array-contains', tagId)
					);
					const snapshot = await getDocs(q);
					for (const docSnap of snapshot.docs) {
						if (seen.has(docSnap.id)) continue;
						seen.add(docSnap.id);
						const data = convertFromFirestore<Omit<MediaItem, 'id'>>(
							docSnap.data()
						);
						if (data) results.push({ ...data, id: docSnap.id } as MediaItem);
					}
				}
				return results.sort(
					(a, b) => b.createdAt.getTime() - a.createdAt.getTime()
				);
			}

			// AND mode: query first tag, then filter client-side for remaining
			const q = query(
				collection(db, ITEMS_COLLECTION),
				where('tags', 'array-contains', tagIds[0])
			);
			const snapshot = await getDocs(q);
			return snapshot.docs
				.map((docSnap) => {
					const data = convertFromFirestore<Omit<MediaItem, 'id'>>(
						docSnap.data()
					);
					return data ? ({ ...data, id: docSnap.id } as MediaItem) : null;
				})
				.filter((item): item is MediaItem => {
					if (!item) return false;
					return tagIds.every((id) => item.tags.includes(id));
				})
				.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
		} catch (e) {
			console.error('mediaItemService.getByTags failed:', e);
			return [];
		}
	},

	async batchUpdate(
		ids: string[],
		updates: Partial<Omit<MediaItem, 'id' | 'createdAt'>>
	): Promise<void> {
		requireBrowser();
		const db = requireDb();
		const preparedData = prepareForFirestore({
			...updates,
			updatedAt: serverTimestamp()
		});
		await Promise.allSettled(
			ids.map((id) => updateDoc(doc(db, ITEMS_COLLECTION, id), preparedData))
		);
	}
};

// --- Media Library State Service ---

export const mediaLibraryStateService = {
	async get(): Promise<MediaLibraryState> {
		const db = getDbInstance();
		if (!db) return { ...DEFAULT_LIBRARY_STATE };
		try {
			const docRef = doc(db, STATE_COLLECTION, STATE_DOC_ID);
			const docSnap = await getDoc(docRef);
			if (!docSnap.exists()) return { ...DEFAULT_LIBRARY_STATE };
			const data = convertFromFirestore<MediaLibraryState>(docSnap.data());
			return data ?? { ...DEFAULT_LIBRARY_STATE };
		} catch (e) {
			console.error('mediaLibraryStateService.get failed:', e);
			return { ...DEFAULT_LIBRARY_STATE };
		}
	},

	async update(
		updates: Partial<MediaLibraryState>
	): Promise<void> {
		if (!browser) return;
		const db = getDbInstance();
		if (!db) return;
		try {
			const docRef = doc(db, STATE_COLLECTION, STATE_DOC_ID);
			const preparedData = prepareForFirestore(updates);
			await setDoc(docRef, preparedData, { merge: true });
		} catch (e) {
			console.error('mediaLibraryStateService.update failed:', e);
		}
	}
};

// --- Consolidated export ---

export const mediaService = {
	tags: mediaTagService,
	items: mediaItemService,
	state: mediaLibraryStateService
};
