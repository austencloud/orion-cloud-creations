import {
	collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs,
	query, where, orderBy, Timestamp, increment
} from 'firebase/firestore';
import { getDbInstance, PRODUCTS_COLLECTION } from './firebase';
import type { Product } from '$lib/types/product';
import { generateSlug } from '$lib/types/product';

function requireDb() {
	const db = getDbInstance();
	if (!db) throw new Error('Firestore not available');
	return db;
}

function productsRef() {
	return collection(requireDb(), PRODUCTS_COLLECTION);
}

function toFirestore(product: Partial<Product>): Record<string, unknown> {
	const data: Record<string, unknown> = { ...product };
	if (data.createdAt instanceof Date) data.createdAt = Timestamp.fromDate(data.createdAt);
	if (data.updatedAt instanceof Date) data.updatedAt = Timestamp.fromDate(data.updatedAt);
	delete data.id;
	return data;
}

function fromFirestore(id: string, data: Record<string, unknown>): Product {
	return {
		...data,
		id,
		createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
		updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date()
	} as Product;
}

export const productService = {
	async add(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
		const now = new Date();
		const slug = product.slug || generateSlug(product.title);
		const ref = await addDoc(productsRef(), toFirestore({
			...product,
			slug,
			createdAt: now,
			updatedAt: now
		}));
		return ref.id;
	},

	async update(id: string, updates: Partial<Product>): Promise<void> {
		const ref = doc(requireDb(), PRODUCTS_COLLECTION, id);
		await updateDoc(ref, toFirestore({ ...updates, updatedAt: new Date() }));
	},

	async delete(id: string): Promise<void> {
		const ref = doc(requireDb(), PRODUCTS_COLLECTION, id);
		await deleteDoc(ref);
	},

	async get(id: string): Promise<Product | null> {
		const ref = doc(requireDb(), PRODUCTS_COLLECTION, id);
		const snap = await getDoc(ref);
		if (!snap.exists()) return null;
		return fromFirestore(snap.id, snap.data());
	},

	async getBySlug(slug: string): Promise<Product | null> {
		const q = query(productsRef(), where('slug', '==', slug));
		const snap = await getDocs(q);
		if (snap.empty) return null;
		const d = snap.docs[0];
		return fromFirestore(d.id, d.data());
	},

	async getAll(): Promise<Product[]> {
		const q = query(productsRef(), orderBy('createdAt', 'desc'));
		const snap = await getDocs(q);
		return snap.docs.map(d => fromFirestore(d.id, d.data()));
	},

	async getAvailable(): Promise<Product[]> {
		const q = query(productsRef(), where('availability', '==', 'available'), orderBy('createdAt', 'desc'));
		const snap = await getDocs(q);
		return snap.docs.map(d => fromFirestore(d.id, d.data()));
	},

	async getDrafts(): Promise<Product[]> {
		const q = query(productsRef(), where('availability', '==', 'draft'), orderBy('createdAt', 'desc'));
		const snap = await getDocs(q);
		return snap.docs.map(d => fromFirestore(d.id, d.data()));
	},

	async getFeatured(): Promise<Product[]> {
		const q = query(productsRef(), where('featured', '==', true), where('availability', '==', 'available'));
		const snap = await getDocs(q);
		return snap.docs.map(d => fromFirestore(d.id, d.data()));
	},

	async decrementStock(productId: string, size: string, quantity: number = 1): Promise<void> {
		const ref = doc(requireDb(), PRODUCTS_COLLECTION, productId);
		await updateDoc(ref, {
			[`sizes.${size}.stock`]: increment(-quantity),
			updatedAt: Timestamp.fromDate(new Date())
		});
	}
};
