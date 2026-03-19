import {
	collection, doc, addDoc, updateDoc, getDoc, getDocs,
	query, where, orderBy, limit, Timestamp
} from 'firebase/firestore';
import { getDbInstance, ORDERS_COLLECTION } from './firebase';
import type { Order, OrderStatus } from '$lib/types/order';

function requireDb() {
	const db = getDbInstance();
	if (!db) throw new Error('Firestore not available');
	return db;
}

function ordersRef() {
	return collection(requireDb(), ORDERS_COLLECTION);
}

function toFirestore(order: Partial<Order>): Record<string, unknown> {
	const data: Record<string, unknown> = { ...order };
	if (data.createdAt instanceof Date) data.createdAt = Timestamp.fromDate(data.createdAt);
	if (data.updatedAt instanceof Date) data.updatedAt = Timestamp.fromDate(data.updatedAt);
	delete data.id;
	return data;
}

function fromFirestore(id: string, data: Record<string, unknown>): Order {
	return {
		...data,
		id,
		createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
		updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date()
	} as Order;
}

export const orderService = {
	async add(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
		const now = new Date();
		const ref = await addDoc(ordersRef(), toFirestore({ ...order, createdAt: now, updatedAt: now }));
		return ref.id;
	},

	async update(id: string, updates: Partial<Order>): Promise<void> {
		const ref = doc(requireDb(), ORDERS_COLLECTION, id);
		await updateDoc(ref, toFirestore({ ...updates, updatedAt: new Date() }));
	},

	async get(id: string): Promise<Order | null> {
		const ref = doc(requireDb(), ORDERS_COLLECTION, id);
		const snap = await getDoc(ref);
		if (!snap.exists()) return null;
		return fromFirestore(snap.id, snap.data());
	},

	async getAll(): Promise<Order[]> {
		const q = query(ordersRef(), orderBy('createdAt', 'desc'));
		const snap = await getDocs(q);
		return snap.docs.map(d => fromFirestore(d.id, d.data()));
	},

	async getByStatus(status: OrderStatus): Promise<Order[]> {
		const q = query(ordersRef(), where('status', '==', status), orderBy('createdAt', 'desc'));
		const snap = await getDocs(q);
		return snap.docs.map(d => fromFirestore(d.id, d.data()));
	},

	async getRecent(count: number = 5): Promise<Order[]> {
		const q = query(ordersRef(), orderBy('createdAt', 'desc'), limit(count));
		const snap = await getDocs(q);
		return snap.docs.map(d => fromFirestore(d.id, d.data()));
	}
};
