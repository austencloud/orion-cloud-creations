# Firestore-to-Storefront Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the OCC storefront to Firestore so products created in admin appear live with real R2 images, are purchasable via Stripe, and decrement inventory on sale.

**Architecture:** Server-side SvelteKit loaders (`+page.server.ts`) query Firestore via `firebase-admin`, resolve `mediaItemIds` to R2 image URLs, and pass serialized product data to page components. Stripe sync happens on admin save. Stock decrements on webhook.

**Tech Stack:** SvelteKit 5, Firebase Admin SDK, Stripe, Svelte 5 runes, TypeScript

**Spec:** `docs/superpowers/specs/2026-03-18-firestore-storefront-integration.md`

---

## File Structure

```
src/lib/
  types/
    product.ts              — Add StorefrontProduct, ProductImage interfaces
  server/
    firebase-admin.ts       — Edit: support inline JSON service account
    products.ts             — NEW: server-side Firestore queries + image resolution
  components/
    ProductCard.svelte      — Edit: accept imageUrl prop
src/routes/
  +page.server.ts           — NEW: load featured products
  +page.svelte              — Edit: use loaded data
  shop/
    +page.server.ts         — NEW: load available products
    +page.svelte            — Edit: use loaded data
  gallery/
    +page.server.ts         — NEW: load displayable products
    +page.svelte            — Edit: use loaded data
  product/[slug]/
    +page.server.ts         — NEW: load single product with all images
    +page.svelte            — Edit: use loaded data, render image gallery, wire add-to-cart
  api/
    checkout/+server.ts     — Edit: add size metadata + stock validation
    webhooks/stripe/+server.ts — Edit: add stock decrement using session metadata
  admin/products/
    new/+page.svelte        — Edit: auto-sync to Stripe after save
    [id]/+page.svelte       — Edit: auto-sync to Stripe after save
  api/products/
    sync/+server.ts         — EXISTS: no changes needed (creates/updates Stripe product & price)
```

**Note:** `/api/products/sync` already exists and handles Stripe product/price creation. The admin pages will call it after save — no changes needed to the endpoint itself.

**Descoped:** The spec mentions "show sync status (syncing/synced/failed) in the UI." The initial implementation uses fire-and-forget with console warnings. A visible toast/indicator can be added as a fast follow.

---

## Task 1: Types and Firebase Admin Config

**Files:**
- Modify: `src/lib/types/product.ts:58-71`
- Modify: `src/lib/server/firebase-admin.ts:1-27`

- [ ] **Step 1: Add StorefrontProduct and ProductImage types**

In `src/lib/types/product.ts`, add after the existing `Product` interface:

```ts
export interface ProductImage {
	thumbnailUrl: string;
	originalUrl: string;
}

export interface StorefrontProduct {
	id: string;
	slug: string;
	title: string;
	description: string;
	garmentType: GarmentType;
	techniques: string[];
	colorway: string[];
	colorFamily: ColorFamily;
	sizes: Record<string, SizeVariant>;
	material: string;
	price: number;
	compareAtPrice?: number;
	availability: 'available' | 'sold' | 'draft' | 'archived';
	isOneOfAKind: boolean;
	featured: boolean;
	images: ProductImage[];
	createdAt: string;
	updatedAt: string;
}
```

- [ ] **Step 2: Update firebase-admin.ts to support inline JSON**

Replace the `initAdmin()` function in `src/lib/server/firebase-admin.ts`:

```ts
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
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/types/product.ts src/lib/server/firebase-admin.ts
git commit -m "feat: add StorefrontProduct types and support inline Firebase credentials"
```

---

## Task 2: Server-Side Product Service

**Files:**
- Create: `src/lib/server/products.ts`

- [ ] **Step 1: Create the server-side product query service**

Create `src/lib/server/products.ts`:

```ts
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
		images.push({
			thumbnailUrl: d.thumbnailUrl as string,
			originalUrl: d.originalUrl as string,
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

	// Firestore doesn't support != queries well, so fetch all and filter
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
	const images = await resolveProductImages(mediaItemIds, heroImageIndex, false); // all images

	return docToStorefrontProduct(doc.id, data, images);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/server/products.ts
git commit -m "feat: add server-side product service for Firestore queries and image resolution"
```

---

## Task 3: Storefront Route Loaders

**Files:**
- Create: `src/routes/+page.server.ts`
- Create: `src/routes/shop/+page.server.ts`
- Create: `src/routes/gallery/+page.server.ts`
- Create: `src/routes/product/[slug]/+page.server.ts`

- [ ] **Step 1: Create homepage loader**

Create `src/routes/+page.server.ts`:

```ts
import type { PageServerLoad } from './$types';
import { getFeaturedProducts } from '$lib/server/products';

export const load: PageServerLoad = async () => {
	const featured = await getFeaturedProducts();
	return { featured };
};
```

- [ ] **Step 2: Create shop loader**

Create `src/routes/shop/+page.server.ts`:

```ts
import type { PageServerLoad } from './$types';
import { getAvailableProducts } from '$lib/server/products';

export const load: PageServerLoad = async () => {
	const products = await getAvailableProducts();
	return { products };
};
```

- [ ] **Step 3: Create gallery loader**

Create `src/routes/gallery/+page.server.ts`:

```ts
import type { PageServerLoad } from './$types';
import { getAllDisplayableProducts } from '$lib/server/products';

export const load: PageServerLoad = async () => {
	const products = await getAllDisplayableProducts();
	return { products };
};
```

- [ ] **Step 4: Create product detail loader**

Create `src/routes/product/[slug]/+page.server.ts`:

```ts
import type { PageServerLoad } from './$types';
import { getProductBySlug, getAvailableProducts } from '$lib/server/products';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const product = await getProductBySlug(params.slug);
	if (!product) throw error(404, 'Product not found');

	// Get related products (same garment type, exclude current)
	const available = await getAvailableProducts();
	const related = available
		.filter(p => p.id !== product.id)
		.slice(0, 4);

	return { product, related };
};
```

- [ ] **Step 5: Commit**

```bash
git add src/routes/+page.server.ts src/routes/shop/+page.server.ts src/routes/gallery/+page.server.ts src/routes/product/[slug]/+page.server.ts
git commit -m "feat: add server-side loaders for all storefront routes"
```

---

## Task 4: Update ProductCard Component

**Files:**
- Modify: `src/lib/components/ProductCard.svelte`

- [ ] **Step 1: Update ProductCard to accept and render images**

Replace the entire `ProductCard.svelte`:

```svelte
<script lang="ts">
	import type { StorefrontProduct } from '$lib/types/product';
	import { formatPrice } from '$lib/types/product';

	interface Props {
		product: StorefrontProduct;
		showPrice?: boolean;
	}

	let { product, showPrice = true }: Props = $props();

	const heroImage = product.images[0];
</script>

<a
	href="/product/{product.slug}"
	class="group block no-underline"
>
	<div class="relative overflow-hidden bg-warm-white rounded-sm aspect-square">
		{#if heroImage}
			<img
				src={heroImage.thumbnailUrl}
				alt={product.title}
				class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
				loading="lazy"
			/>
		{:else}
			<div class="w-full h-full bg-warm-white flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
				<span class="text-xs text-muted opacity-40">{product.title}</span>
			</div>
		{/if}
		{#if product.availability === 'sold'}
			<div class="absolute top-3 left-3 bg-charcoal/80 text-white text-xs font-medium px-3 py-1 uppercase tracking-wider">
				Sold
			</div>
		{/if}
		{#if product.isOneOfAKind && product.availability === 'available'}
			<div class="absolute top-3 right-3 bg-accent-purple/90 text-white text-xs font-medium px-3 py-1 uppercase tracking-wider">
				One of a Kind
			</div>
		{/if}
	</div>

	<div class="mt-4 px-1">
		<h3 class="text-sm font-medium text-charcoal group-hover:text-accent-purple transition-colors">
			{product.title}
		</h3>
		<div class="flex items-center justify-between mt-1">
			{#if showPrice && product.availability === 'available'}
				<p class="text-sm text-muted font-medium">{formatPrice(product.price)}</p>
			{:else if product.availability === 'sold'}
				<p class="text-sm text-light-muted italic">Sold</p>
			{/if}
			<p class="text-xs text-light-muted capitalize">{product.garmentType.replace('_', ' ')}</p>
		</div>
	</div>
</a>
```

Note: `formatPrice` is moved to import from `$lib/types/product` instead of `$lib/data/products`. It already exists in `product.ts:60-62`.

- [ ] **Step 2: Commit**

```bash
git add src/lib/components/ProductCard.svelte
git commit -m "feat: update ProductCard to render real images from R2"
```

---

## Task 5: Update Homepage

**Files:**
- Modify: `src/routes/+page.svelte`

- [ ] **Step 1: Update homepage to use loaded data**

Replace the `<script>` block at the top of `src/routes/+page.svelte`:

```svelte
<script lang="ts">
	import ProductCard from '$lib/components/ProductCard.svelte';

	let { data } = $props();
	const featured = data.featured;

	const techniques = [
		{
			name: 'Ice Dye',
			description: 'Frozen dye crystals melt through fabric, creating organic, watercolor-like patterns with incredible depth and detail.',
			image: '/images/products/blue-mandala.jpg'
		},
		{
			name: 'Shibori',
			description: 'Ancient Japanese resist-dyeing technique. Precise folding, binding, and clamping creates geometric symmetry.',
			image: '/images/products/golden-shibori-grid.jpg'
		},
		{
			name: 'Spiral',
			description: 'The foundation of tie-dye, elevated. Pinch-and-twist spirals with professional dyes and color theory.',
			image: '/images/products/classic-spiral-rainbow.jpg'
		}
	];
</script>
```

The rest of the template stays the same — it already uses `{#each featured as product}` and `<ProductCard {product} />`.

- [ ] **Step 2: Commit**

```bash
git add src/routes/+page.svelte
git commit -m "feat: wire homepage to server-loaded featured products"
```

---

## Task 6: Update Shop Page

**Files:**
- Modify: `src/routes/shop/+page.svelte`

- [ ] **Step 1: Update shop page to use loaded data**

Replace the `<script>` block in `src/routes/shop/+page.svelte`:

```svelte
<script lang="ts">
	import ProductCard from '$lib/components/ProductCard.svelte';
	import type { GarmentType, Technique } from '$lib/types/product';

	let { data } = $props();

	let activeFilter = $state<string>('all');
	let activeTechnique = $state<string>('all');

	const garmentTypes: { value: string; label: string }[] = [
		{ value: 'all', label: 'All' },
		{ value: 'shirt', label: 'T-Shirts' },
		{ value: 'long_sleeve', label: 'Long Sleeves' },
		{ value: 'tank', label: 'Tanks' },
		{ value: 'hoodie', label: 'Hoodies' }
	];

	const techniqueFilters: { value: string; label: string }[] = [
		{ value: 'all', label: 'All Techniques' },
		{ value: 'ice_dye', label: 'Ice Dye' },
		{ value: 'spiral', label: 'Spiral' },
		{ value: 'shibori', label: 'Shibori' },
		{ value: 'mandala', label: 'Mandala' },
		{ value: 'reverse', label: 'Reverse Dye' },
		{ value: 'starburst', label: 'Starburst' },
		{ value: 'crumple', label: 'Crumple' }
	];

	let filteredProducts = $derived(
		data.products.filter((p) => {
			const matchesType = activeFilter === 'all' || p.garmentType === activeFilter;
			const matchesTechnique =
				activeTechnique === 'all' || p.techniques.includes(activeTechnique);
			return matchesType && matchesTechnique;
		})
	);
</script>
```

In the template, replace `{availableProducts.length}` with `{data.products.length}` on line 53.

- [ ] **Step 2: Commit**

```bash
git add src/routes/shop/+page.svelte
git commit -m "feat: wire shop page to server-loaded available products"
```

---

## Task 7: Update Gallery Page

**Files:**
- Modify: `src/routes/gallery/+page.svelte`

- [ ] **Step 1: Update gallery page to use loaded data**

Replace the entire `src/routes/gallery/+page.svelte`:

```svelte
<script lang="ts">
	import ProductCard from '$lib/components/ProductCard.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Gallery | Orion Cloud Creations</title>
	<meta name="description" content="Browse the full collection of handmade tie-dye work by Austen Cloud, including sold and one-of-a-kind pieces." />
</svelte:head>

<div class="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-16">
	<div class="mb-12">
		<h1 class="text-3xl lg:text-4xl font-light text-charcoal">Gallery</h1>
		<p class="mt-3 text-muted text-sm max-w-lg">
			Everything I've made, including sold pieces. This is the full body of work.
		</p>
	</div>

	{#if data.products.length > 0}
		<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
			{#each data.products as product}
				<ProductCard {product} showPrice={false} />
			{/each}
		</div>
	{:else}
		<div class="text-center py-20">
			<p class="text-muted text-sm">No pieces in the gallery yet.</p>
		</div>
	{/if}
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/routes/gallery/+page.svelte
git commit -m "feat: wire gallery page to server-loaded products"
```

---

## Task 8: Update Product Detail Page

**Files:**
- Modify: `src/routes/product/[slug]/+page.svelte`

- [ ] **Step 1: Rewrite product detail page to use loaded data with image gallery and add-to-cart**

Replace the entire `src/routes/product/[slug]/+page.svelte`:

```svelte
<script lang="ts">
	import ProductCard from '$lib/components/ProductCard.svelte';
	import { formatPrice, type Size } from '$lib/types/product';
	import { cart } from '$lib/stores/cart.svelte';

	let { data } = $props();
	const { product, related } = data;

	let selectedSize = $state<Size | ''>('');
	let selectedImageIndex = $state(0);
	let addedToCart = $state(false);

	const mainImage = $derived(product.images[selectedImageIndex] ?? product.images[0]);

	function handleAddToCart() {
		if (!selectedSize || selectedSize === '') return;
		const size = selectedSize as Size;
		const sizeVariant = product.sizes[size];
		if (!sizeVariant) return;

		cart.add({
			productId: product.id,
			title: product.title,
			size,
			price: product.price,
			thumbnailUrl: product.images[0]?.thumbnailUrl ?? ''
		}, sizeVariant.stock);

		addedToCart = true;
		setTimeout(() => addedToCart = false, 2000);
	}
</script>

<svelte:head>
	<title>{product.title} | Orion Cloud Creations</title>
	<meta name="description" content={product.description} />
</svelte:head>

<div class="mx-auto max-w-7xl px-6 lg:px-8 py-8 lg:py-12">
	<!-- Breadcrumb -->
	<nav class="mb-8 text-xs text-light-muted">
		<a href="/" class="hover:text-charcoal transition-colors">Home</a>
		<span class="mx-2">/</span>
		<a href="/shop" class="hover:text-charcoal transition-colors">Shop</a>
		<span class="mx-2">/</span>
		<span class="text-charcoal">{product.title}</span>
	</nav>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
		<!-- Images -->
		<div class="space-y-4">
			<div class="aspect-square overflow-hidden bg-warm-white rounded-sm">
				{#if mainImage}
					<img
						src={mainImage.originalUrl}
						alt={product.title}
						class="w-full h-full object-cover"
					/>
				{:else}
					<div class="w-full h-full flex items-center justify-center">
						<span class="text-muted opacity-40 text-sm">Photo coming soon</span>
					</div>
				{/if}
			</div>

			{#if product.images.length > 1}
				<div class="flex gap-3 overflow-x-auto">
					{#each product.images as image, i}
						<button
							class="w-16 h-16 flex-shrink-0 overflow-hidden rounded-sm border-2 transition-colors
								{selectedImageIndex === i ? 'border-charcoal' : 'border-transparent hover:border-border'}"
							onclick={() => selectedImageIndex = i}
						>
							<img src={image.thumbnailUrl} alt="{product.title} view {i + 1}" class="w-full h-full object-cover" />
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Product Info -->
		<div class="lg:py-4">
			{#if product.isOneOfAKind}
				<p class="text-xs font-medium uppercase tracking-[0.2em] text-accent-purple mb-3">
					One of a Kind
				</p>
			{/if}

			<h1 class="text-2xl lg:text-3xl font-light text-charcoal">{product.title}</h1>

			{#if product.availability === 'available'}
				<p class="mt-3 text-xl text-charcoal font-medium">
					{formatPrice(product.price)}
				</p>
			{:else}
				<p class="mt-3 text-lg text-light-muted italic">Sold</p>
			{/if}

			<p class="mt-6 text-muted text-sm leading-relaxed">
				{product.description}
			</p>

			<!-- Details -->
			<div class="mt-8 space-y-4 text-sm border-t border-border-light pt-6">
				<div class="flex gap-2">
					<span class="text-light-muted w-24">Material</span>
					<span class="text-charcoal">{product.material}</span>
				</div>
				{#if product.techniques.length > 0}
					<div class="flex gap-2">
						<span class="text-light-muted w-24">Technique</span>
						<span class="text-charcoal capitalize">{product.techniques.map((t) => t.replace('_', ' ')).join(', ')}</span>
					</div>
				{/if}
				{#if product.colorway.length > 0}
					<div class="flex gap-2">
						<span class="text-light-muted w-24">Colors</span>
						<span class="text-charcoal">{product.colorway.join(', ')}</span>
					</div>
				{/if}
				<div class="flex gap-2">
					<span class="text-light-muted w-24">Type</span>
					<span class="text-charcoal capitalize">{product.garmentType.replace('_', ' ')}</span>
				</div>
			</div>

			{#if product.availability === 'available'}
				<!-- Size Selection -->
				<div class="mt-8">
					<p class="text-sm font-medium text-charcoal mb-3">Size</p>
					<div class="flex flex-wrap gap-3">
						{#each Object.entries(product.sizes) as [size, variant]}
							<button
								class="w-14 h-10 text-sm font-medium border transition-colors
									{variant.stock === 0
										? 'border-border text-light-muted line-through cursor-not-allowed opacity-40'
										: selectedSize === size
											? 'border-charcoal bg-charcoal text-white'
											: 'border-border text-muted hover:border-charcoal hover:text-charcoal'}"
								onclick={() => { if (variant.stock > 0) selectedSize = size; }}
								disabled={variant.stock === 0}
							>
								{size}
							</button>
						{/each}
					</div>
				</div>

				<!-- Add to Cart -->
				<button
					class="mt-8 w-full py-4 bg-charcoal text-white text-sm font-semibold uppercase tracking-wider hover:bg-charcoal/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
					disabled={!selectedSize}
					onclick={handleAddToCart}
				>
					{addedToCart ? 'Added!' : selectedSize ? 'Add to Cart' : 'Select a Size'}
				</button>

				<p class="mt-4 text-xs text-light-muted text-center">
					Free shipping on orders over $100
				</p>
			{/if}

			<!-- Trust Signals -->
			<div class="mt-10 pt-6 border-t border-border-light grid grid-cols-2 gap-4">
				<div class="text-xs text-muted">
					<p class="font-medium text-charcoal mb-1">Colorfast</p>
					<p>Procion dyes bond permanently. Won't fade or bleed.</p>
				</div>
				<div class="text-xs text-muted">
					<p class="font-medium text-charcoal mb-1">Handmade</p>
					<p>Folded, dyed, and finished by hand in Chicago.</p>
				</div>
				<div class="text-xs text-muted">
					<p class="font-medium text-charcoal mb-1">Machine Washable</p>
					<p>Wash and dry normally after first cold wash.</p>
				</div>
				<div class="text-xs text-muted">
					<p class="font-medium text-charcoal mb-1">100% Cotton</p>
					<p>Dye goes all the way through the fiber.</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Related Products -->
	{#if related.length > 0}
		<section class="mt-20 lg:mt-28 pt-12 border-t border-border-light">
			<h2 class="text-xl font-light text-charcoal mb-8">More Pieces</h2>
			<div class="grid grid-cols-2 md:grid-cols-4 gap-6">
				{#each related as relatedProduct}
					<ProductCard product={relatedProduct} />
				{/each}
			</div>
		</section>
	{/if}
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/routes/product/[slug]/+page.svelte
git commit -m "feat: wire product detail page to Firestore with image gallery and add-to-cart"
```

---

## Task 9: Checkout — Size Metadata and Stock Validation

**Files:**
- Modify: `src/routes/api/checkout/+server.ts`

- [ ] **Step 1: Update checkout endpoint to pass size metadata and validate stock**

Replace the entire `src/routes/api/checkout/+server.ts`:

```ts
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Stripe from 'stripe';
import { adminDb } from '$lib/server/firebase-admin';

export const POST: RequestHandler = async ({ request }) => {
	if (!adminDb) throw error(500, 'Server-side Firebase not configured');

	const secretKey = process.env.STRIPE_SECRET_KEY;
	if (!secretKey) throw error(500, 'Stripe not configured');

	const stripe = new Stripe(secretKey);
	const { items } = await request.json();

	if (!items || !Array.isArray(items) || items.length === 0) {
		throw error(400, 'Cart is empty');
	}

	const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
	const metadata: Record<string, string> = { itemCount: String(items.length) };

	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		const doc = await adminDb.collection('products').doc(item.productId).get();
		if (!doc.exists) throw error(400, 'Product ' + item.productId + ' not found');

		const product = doc.data()!;
		if (!product.stripePriceId) {
			throw error(400, 'Product "' + product.title + '" is not yet available for purchase');
		}
		if (product.availability !== 'available') {
			throw error(400, 'Product "' + product.title + '" is not available');
		}

		// Validate stock for requested size
		const size = item.size;
		const sizeData = product.sizes?.[size];
		if (!sizeData || sizeData.stock < (item.quantity || 1)) {
			throw error(400, '"' + product.title + '" size ' + size + ' is out of stock');
		}

		lineItems.push({
			price: product.stripePriceId,
			quantity: item.quantity || 1
		});

		// Encode item details in session metadata for webhook
		metadata[`item_${i}_productId`] = item.productId;
		metadata[`item_${i}_size`] = size;
		metadata[`item_${i}_quantity`] = String(item.quantity || 1);
	}

	const origin = request.headers.get('origin') || '';
	const session = await stripe.checkout.sessions.create({
		mode: 'payment',
		line_items: lineItems,
		metadata,
		shipping_address_collection: { allowed_countries: ['US'] },
		success_url: origin + '/checkout/success?session_id={CHECKOUT_SESSION_ID}',
		cancel_url: origin + '/checkout/cancel'
	});

	return json({ url: session.url });
};
```

- [ ] **Step 2: Commit**

```bash
git add src/routes/api/checkout/+server.ts
git commit -m "feat: add size metadata and stock validation to checkout endpoint"
```

---

## Task 10: Webhook — Stock Decrement and Size from Metadata

**Files:**
- Modify: `src/routes/api/webhooks/stripe/+server.ts`

- [ ] **Step 1: Update webhook to use session metadata for sizes and decrement stock**

Replace the entire `src/routes/api/webhooks/stripe/+server.ts`:

```ts
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Stripe from 'stripe';
import { adminDb } from '$lib/server/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const POST: RequestHandler = async ({ request }) => {
	if (!adminDb) throw error(500, 'Server-side Firebase not configured');

	const secretKey = process.env.STRIPE_SECRET_KEY;
	const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
	if (!secretKey || !webhookSecret) throw error(500, 'Stripe not configured');

	const stripe = new Stripe(secretKey);
	const rawBody = await request.text();
	const sig = request.headers.get('stripe-signature');

	if (!sig) throw error(400, 'Missing stripe-signature header');

	let event: Stripe.Event;
	try {
		event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
	} catch {
		throw error(400, 'Invalid webhook signature');
	}

	if (event.type === 'checkout.session.completed') {
		const session = event.data.object as Stripe.Checkout.Session;
		await handleCheckoutComplete(stripe, session);
	}

	if (event.type === 'charge.refunded') {
		const charge = event.data.object as Stripe.Charge;
		await handleRefund(charge);
	}

	return json({ received: true });
};

async function handleCheckoutComplete(stripe: Stripe, session: Stripe.Checkout.Session) {
	if (!adminDb) return;

	const metadata = session.metadata ?? {};
	const itemCount = parseInt(metadata.itemCount ?? '0', 10);
	const orderItems = [];

	for (let i = 0; i < itemCount; i++) {
		const productId = metadata[`item_${i}_productId`];
		const size = metadata[`item_${i}_size`];
		const quantity = parseInt(metadata[`item_${i}_quantity`] ?? '1', 10);

		if (!productId || !size) continue;

		const productDoc = await adminDb!.collection('products').doc(productId).get();
		const productData = productDoc.exists ? productDoc.data()! : null;

		orderItems.push({
			productId,
			productTitle: productData?.title ?? 'Unknown',
			size,
			price: productData?.price ?? 0,
			quantity
		});

		// Decrement stock
		if (productDoc.exists) {
			await productDoc.ref.update({
				[`sizes.${size}.stock`]: FieldValue.increment(-quantity),
				updatedAt: new Date()
			});

			// Check if all sizes are now out of stock
			const freshDoc = await productDoc.ref.get();
			const freshData = freshDoc.data();
			if (freshData?.sizes) {
				const totalStock = Object.values(freshData.sizes as Record<string, { stock: number }>)
					.reduce((sum, v) => sum + v.stock, 0);
				if (totalStock <= 0) {
					await productDoc.ref.update({ availability: 'sold', updatedAt: new Date() });
				}
			}
		}
	}

	const shipping = session.shipping_details;
	await adminDb!.collection('orders').add({
		stripeSessionId: session.id,
		stripePaymentIntentId: session.payment_intent,
		customerEmail: session.customer_details?.email ?? '',
		customerName: session.customer_details?.name ?? '',
		shippingAddress: shipping?.address ? {
			line1: shipping.address.line1 ?? '',
			line2: shipping.address.line2 ?? '',
			city: shipping.address.city ?? '',
			state: shipping.address.state ?? '',
			zip: shipping.address.postal_code ?? '',
			country: shipping.address.country ?? ''
		} : {},
		items: orderItems,
		subtotal: session.amount_subtotal ?? 0,
		shipping: session.total_details?.amount_shipping ?? 0,
		tax: session.total_details?.amount_tax ?? 0,
		total: session.amount_total ?? 0,
		status: 'paid',
		createdAt: new Date(),
		updatedAt: new Date()
	});
}

async function handleRefund(charge: Stripe.Charge) {
	if (!adminDb) return;

	const snap = await adminDb.collection('orders')
		.where('stripePaymentIntentId', '==', charge.payment_intent)
		.limit(1)
		.get();

	if (!snap.empty) {
		await snap.docs[0].ref.update({ status: 'refunded', updatedAt: new Date() });
	}
}
```

- [ ] **Step 2: Commit**

```bash
git add src/routes/api/webhooks/stripe/+server.ts
git commit -m "feat: add stock decrement and size tracking to Stripe webhook"
```

---

## Task 11: Admin Stripe Auto-Sync

**Files:**
- Modify: `src/routes/admin/products/new/+page.svelte:78-117`
- Modify: `src/routes/admin/products/[id]/+page.svelte:115-151`

- [ ] **Step 1: Update new product page to sync to Stripe after save**

In `src/routes/admin/products/new/+page.svelte`, replace the `handleSave` function (lines 78-117):

```ts
	async function handleSave() {
		if (!title.trim()) { error = 'Title is required'; return; }
		const priceVal = parseFloat(priceDollars);
		if (isNaN(priceVal) || priceVal <= 0) { error = 'Price must be a positive number'; return; }

		saving = true;
		error = null;
		try {
			const sizes: Record<string, { stock: number; sku?: string }> = {};
			for (const [size, stockStr] of Object.entries(selectedSizes)) {
				sizes[size] = { stock: parseInt(stockStr, 10) || 0 };
			}

			const compareAt = compareAtPriceDollars ? Math.round(parseFloat(compareAtPriceDollars) * 100) : undefined;

			const productId = await productService.add({
				title: title.trim(),
				description: description.trim(),
				slug: '',
				garmentType,
				colorFamily,
				material,
				price: Math.round(priceVal * 100),
				compareAtPrice: compareAt,
				availability,
				isOneOfAKind,
				featured,
				sizes,
				techniques: [],
				colorway: [],
				mediaItemIds: selectedMediaIds,
				heroImageIndex: 0
			});

			// Auto-sync to Stripe (non-blocking — product is saved either way)
			try {
				await fetch('/api/products/sync', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ productId })
				});
			} catch (syncErr) {
				console.warn('Stripe sync failed (product saved, but not yet purchasable):', syncErr);
			}

			goto('/admin/products');
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to save product';
		} finally {
			saving = false;
		}
	}
```

- [ ] **Step 2: Update edit product page to sync to Stripe after save**

In `src/routes/admin/products/[id]/+page.svelte`, replace the `handleSave` function (lines 115-151):

```ts
	async function handleSave() {
		if (!title.trim()) { error = 'Title is required'; return; }
		const priceVal = parseFloat(priceDollars);
		if (isNaN(priceVal) || priceVal <= 0) { error = 'Price must be a positive number'; return; }

		saving = true;
		error = null;
		try {
			const sizes: Record<string, { stock: number; sku?: string }> = {};
			for (const [size, stockStr] of Object.entries(selectedSizes)) {
				const existing = product?.sizes[size];
				sizes[size] = { stock: parseInt(stockStr, 10) || 0, sku: existing?.sku };
			}

			const compareAt = compareAtPriceDollars ? Math.round(parseFloat(compareAtPriceDollars) * 100) : undefined;

			await productService.update(page.params.id!, {
				title: title.trim(),
				description: description.trim(),
				garmentType,
				colorFamily,
				material,
				price: Math.round(priceVal * 100),
				compareAtPrice: compareAt,
				availability,
				isOneOfAKind,
				featured,
				sizes,
				mediaItemIds: selectedMediaIds
			});

			// Auto-sync to Stripe (non-blocking)
			try {
				await fetch('/api/products/sync', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ productId: page.params.id })
				});
			} catch (syncErr) {
				console.warn('Stripe sync failed (product saved, but sync may be stale):', syncErr);
			}

			goto('/admin/products');
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to save product';
		} finally {
			saving = false;
		}
	}
```

- [ ] **Step 3: Commit**

```bash
git add src/routes/admin/products/new/+page.svelte src/routes/admin/products/[id]/+page.svelte
git commit -m "feat: auto-sync products to Stripe after admin save"
```

---

## Task 12: Verify End-to-End

- [ ] **Step 1: Ensure Firebase service account is configured**

Check that either `GOOGLE_APPLICATION_CREDENTIALS` or `FIREBASE_SERVICE_ACCOUNT` is set in `.env`.

If not, download the service account JSON from Firebase Console → Project Settings → Service Accounts → Generate New Private Key. Then add to `.env`:

```
GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json
```

- [ ] **Step 2: Handle Firestore composite index creation**

When the dev server first queries Firestore, queries with `where` + `orderBy` on different fields will fail with an error containing an index creation link. Click the link in the console error to auto-create the index in Firebase Console. Required indexes:

- `products`: `availability` ASC + `createdAt` DESC (for shop page)
- `products`: `featured` ASC + `availability` ASC (for featured products)

Alternatively, create a `firestore.indexes.json` and deploy with `firebase deploy --only firestore:indexes`.

- [ ] **Step 3: Run the dev server and verify**

```bash
npm run dev
```

Check:
- Homepage loads (may be empty if no featured products in Firestore)
- Shop page loads with empty state
- Gallery page loads with empty state
- No console errors about Firebase or type mismatches

- [ ] **Step 4: Create a test product via admin**

Go to `http://localhost:5180/admin/products/new` (admin app), create a product with:
- Title, price, at least one size with stock
- Pick media items from the media picker
- Set availability to "available"
- Save

Verify:
- Product appears on shop page at `http://localhost:5176/shop`
- Product detail page shows real images from R2
- Image gallery works (thumbnails clickable)
- Add to cart works
- Cart → checkout creates a Stripe session (requires Stripe keys)

- [ ] **Step 5: Run TypeScript check**

```bash
npm run check
```

Fix any type errors.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "chore: fix any remaining type errors from Firestore integration"
```
