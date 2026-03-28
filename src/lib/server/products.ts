import { adminDb } from './firebase-admin';
import type { StorefrontProduct, ProductImage } from '$lib/types/product';
import { Timestamp } from 'firebase-admin/firestore';

// --- In-memory cache (5-minute TTL) ---

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface CacheEntry<T> {
	data: T;
	expires: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | undefined {
	const entry = cache.get(key);
	if (!entry) return undefined;
	if (Date.now() > entry.expires) {
		cache.delete(key);
		return undefined;
	}
	return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
	cache.set(key, { data, expires: Date.now() + CACHE_TTL_MS });
}

/** Clear all cached products (call after admin writes). */
export function invalidateProductCache(): void {
	cache.clear();
}

// --- Helpers ---

function toIsoString(val: unknown): string {
	if (val instanceof Timestamp) return val.toDate().toISOString();
	if (val instanceof Date) return val.toISOString();
	if (typeof val === 'string') return val;
	return new Date().toISOString();
}

function docToStorefrontProduct(id: string, data: Record<string, unknown>, images: ProductImage[]): StorefrontProduct {
	return {
		id,
		slug: (data.slug ?? '') as string,
		title: (data.title ?? '') as string,
		description: (data.description ?? '') as string,
		garmentType: data.garmentType as StorefrontProduct['garmentType'],
		techniques: (data.techniques ?? []) as StorefrontProduct['techniques'],
		colorway: (data.colorway ?? []) as string[],
		colorFamily: data.colorFamily as StorefrontProduct['colorFamily'],
		sizes: (data.sizes ?? {}) as StorefrontProduct['sizes'],
		material: (data.material ?? '') as string,
		price: (data.price ?? 0) as number,
		compareAtPrice: data.compareAtPrice as number | undefined,
		availability: data.availability as StorefrontProduct['availability'],
		isOneOfAKind: (data.isOneOfAKind ?? false) as boolean,
		featured: (data.featured ?? false) as boolean,
		images,
		createdAt: toIsoString(data.createdAt),
		updatedAt: toIsoString(data.updatedAt),
	};
}

// --- Firestore queries ---

export async function resolveProductImages(
	mediaItemIds: string[],
	heroImageIndex: number,
	heroOnly: boolean = false
): Promise<ProductImage[]> {
	if (!adminDb || mediaItemIds.length === 0) return [];

	const idsToFetch = heroOnly
		? [mediaItemIds[heroImageIndex] ?? mediaItemIds[0]].filter(Boolean)
		: mediaItemIds;

	const cacheKey = `images:${idsToFetch.join(',')}`;
	const cached = getCached<ProductImage[]>(cacheKey);
	if (cached) return cached;

	try {
		const refs = idsToFetch.map(id => adminDb!.collection('mediaItems').doc(id));
		const snaps = await adminDb!.getAll(...refs);

		const images: ProductImage[] = [];
		for (const snap of snaps) {
			if (!snap.exists) continue;
			const d = snap.data()!;
			const originalUrl = (d.fullUrl ?? d.originalUrl) as string | undefined;
			const thumbnailUrl = d.thumbnailUrl as string;
			images.push({
				thumbnailUrl,
				originalUrl: originalUrl || thumbnailUrl,
			});
		}

		// If not heroOnly, reorder so hero is first
		if (!heroOnly && heroImageIndex > 0 && heroImageIndex < mediaItemIds.length) {
			const heroId = mediaItemIds[heroImageIndex];
			const heroIdx = idsToFetch.indexOf(heroId);
			if (heroIdx > 0) {
				const [hero] = images.splice(heroIdx, 1);
				if (hero) images.unshift(hero);
			}
		}

		setCache(cacheKey, images);
		return images;
	} catch (err) {
		console.error('Firestore image resolution failed:', err);
		return [];
	}
}

async function queryProducts(
	cacheKey: string,
	queryFn: (db: FirebaseFirestore.Firestore) => FirebaseFirestore.Query,
	heroOnly: boolean = true
): Promise<StorefrontProduct[]> {
	if (!adminDb) return [];

	const cached = getCached<StorefrontProduct[]>(cacheKey);
	if (cached) return cached;

	try {
		const snap = await queryFn(adminDb).get();
		const products: StorefrontProduct[] = [];

		for (const doc of snap.docs) {
			const data = doc.data();
			const mediaItemIds = (data.mediaItemIds as string[]) ?? [];
			const heroImageIndex = (data.heroImageIndex as number) ?? 0;
			const images = await resolveProductImages(mediaItemIds, heroImageIndex, heroOnly);
			products.push(docToStorefrontProduct(doc.id, data, images));
		}

		setCache(cacheKey, products);
		return products;
	} catch (err) {
		console.error('Firestore query failed:', err);
		return [];
	}
}

export async function getAvailableProducts(): Promise<StorefrontProduct[]> {
	return queryProducts('products:available', db =>
		db.collection('products')
			.where('availability', '==', 'available')
			.orderBy('createdAt', 'desc')
	);
}

export async function getFeaturedProducts(): Promise<StorefrontProduct[]> {
	return queryProducts('products:featured', db =>
		db.collection('products')
			.where('featured', '==', true)
			.where('availability', '==', 'available')
	);
}

export async function getAllDisplayableProducts(): Promise<StorefrontProduct[]> {
	if (!adminDb) return [];

	const cacheKey = 'products:displayable';
	const cached = getCached<StorefrontProduct[]>(cacheKey);
	if (cached) return cached;

	try {
		const snap = await adminDb.collection('products').orderBy('createdAt', 'desc').get();
		const products: StorefrontProduct[] = [];

		for (const doc of snap.docs) {
			const data = doc.data();
			if (data.availability === 'draft') continue;
			const mediaItemIds = (data.mediaItemIds as string[]) ?? [];
			const heroImageIndex = (data.heroImageIndex as number) ?? 0;
			const images = await resolveProductImages(mediaItemIds, heroImageIndex, true);
			products.push(docToStorefrontProduct(doc.id, data, images));
		}

		setCache(cacheKey, products);
		return products;
	} catch (err) {
		console.error('Firestore query failed:', err);
		return [];
	}
}

export async function getProductBySlug(slug: string): Promise<StorefrontProduct | null> {
	if (!adminDb) return null;

	const cacheKey = `product:${slug}`;
	const cached = getCached<StorefrontProduct | null>(cacheKey);
	if (cached !== undefined) return cached;

	try {
		const snap = await adminDb.collection('products')
			.where('slug', '==', slug)
			.limit(1)
			.get();

		if (snap.empty) return null;

		const doc = snap.docs[0];
		const data = doc.data();
		const mediaItemIds = (data.mediaItemIds as string[]) ?? [];
		const heroImageIndex = (data.heroImageIndex as number) ?? 0;
		const images = await resolveProductImages(mediaItemIds, heroImageIndex, false);

		const product = docToStorefrontProduct(doc.id, data, images);
		setCache(cacheKey, product);
		return product;
	} catch (err) {
		console.error('Firestore query failed:', err);
		return null;
	}
}

export async function getDisplayableProductsPage(
	limit: number = 24,
	afterCreatedAt?: string
): Promise<{ products: StorefrontProduct[]; hasMore: boolean }> {
	if (!adminDb) return { products: [], hasMore: false };

	try {
		let q: FirebaseFirestore.Query = adminDb.collection('products')
			.orderBy('createdAt', 'desc');

		if (afterCreatedAt) {
			const cursor = new Date(afterCreatedAt);
			q = q.startAfter(Timestamp.fromDate(cursor));
		}

		// Fetch limit+1 to determine if there are more pages
		const snap = await q.limit(limit + 1).get();
		const hasMore = snap.docs.length > limit;
		const docs = hasMore ? snap.docs.slice(0, limit) : snap.docs;

		const products: StorefrontProduct[] = [];
		for (const doc of docs) {
			const data = doc.data();
			if (data.availability === 'draft') continue;
			const mediaItemIds = (data.mediaItemIds as string[]) ?? [];
			const heroImageIndex = (data.heroImageIndex as number) ?? 0;
			const images = await resolveProductImages(mediaItemIds, heroImageIndex, true);
			products.push(docToStorefrontProduct(doc.id, data, images));
		}

		return { products, hasMore };
	} catch (err) {
		console.error('Firestore paginated query failed:', err);
		return { products: [], hasMore: false };
	}
}
