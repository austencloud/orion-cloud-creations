import { adminDb } from './firebase-admin';
import type { StorefrontProduct, ProductImage } from '$lib/types/product';
import { Timestamp } from 'firebase-admin/firestore';

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
		techniques: (data.techniques ?? []) as string[],
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

export async function resolveProductImages(
	mediaItemIds: string[],
	heroImageIndex: number,
	heroOnly: boolean = false
): Promise<ProductImage[]> {
	if (!adminDb || mediaItemIds.length === 0) return [];

	const idsToFetch = heroOnly
		? [mediaItemIds[heroImageIndex] ?? mediaItemIds[0]].filter(Boolean)
		: mediaItemIds;

	const refs = idsToFetch.map(id => adminDb!.collection('mediaItems').doc(id));
	const snaps = await adminDb!.getAll(...refs);

	const images: ProductImage[] = [];
	for (const snap of snaps) {
		if (!snap.exists) continue;
		const d = snap.data()!;
		// Use thumbnailUrl as fallback for originalUrl since originals may not be uploaded to R2
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

	return images;
}

async function queryProducts(
	queryFn: (db: FirebaseFirestore.Firestore) => FirebaseFirestore.Query,
	heroOnly: boolean = true
): Promise<StorefrontProduct[]> {
	if (!adminDb) return [];

	const snap = await queryFn(adminDb).get();
	const products: StorefrontProduct[] = [];

	for (const doc of snap.docs) {
		const data = doc.data();
		const mediaItemIds = (data.mediaItemIds as string[]) ?? [];
		const heroImageIndex = (data.heroImageIndex as number) ?? 0;
		const images = await resolveProductImages(mediaItemIds, heroImageIndex, heroOnly);
		products.push(docToStorefrontProduct(doc.id, data, images));
	}

	return products;
}

export async function getAvailableProducts(): Promise<StorefrontProduct[]> {
	return queryProducts(db =>
		db.collection('products')
			.where('availability', '==', 'available')
			.orderBy('createdAt', 'desc')
	);
}

export async function getFeaturedProducts(): Promise<StorefrontProduct[]> {
	return queryProducts(db =>
		db.collection('products')
			.where('featured', '==', true)
			.where('availability', '==', 'available')
	);
}

export async function getAllDisplayableProducts(): Promise<StorefrontProduct[]> {
	if (!adminDb) return [];

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

	return products;
}

export async function getProductBySlug(slug: string): Promise<StorefrontProduct | null> {
	if (!adminDb) return null;

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

	return docToStorefrontProduct(doc.id, data, images);
}
