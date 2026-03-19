# OCC Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a comprehensive admin panel for Orion Cloud Creations — sidebar nav, dashboard, product CRUD, order management, inventory views, Stripe integration, Firebase Auth, and settings — on top of the existing media tagger.

**Architecture:** SvelteKit 5 routes under `/admin/*` with Firebase Auth guard, Firestore collections for products/orders/settings, Stripe Checkout for payments, and `@austencloud/sidebar` shared package for navigation. All new code uses scoped CSS with `--color-*` tokens (no Tailwind utility classes).

**Tech Stack:** SvelteKit 5, Svelte 5 runes, Firestore, Stripe Checkout, Firebase Auth, Cloudflare R2, `@austencloud/sidebar`, scoped CSS

**Spec:** `docs/superpowers/specs/2026-03-17-occ-admin-design.md`

---

## File Map

### New Files

**Types & Data:**
- `src/lib/types/product.ts` — Updated Product, SizeVariant, Order, OrderItem, Address, StoreSettings, ShippingRate, CartItem types
- `src/lib/types/order.ts` — Order types (separated for clarity)
- `src/lib/types/settings.ts` — StoreSettings, ShippingRate types
- `src/lib/types/cart.ts` — CartItem type and cart helpers

**Admin Services:**
- `src/lib/admin/services/auth.ts` — Firebase Auth (Google sign-in, onAuthStateChanged, signOut)
- `src/lib/admin/services/products.ts` — Firestore CRUD for products collection
- `src/lib/admin/services/orders.ts` — Firestore CRUD for orders collection
- `src/lib/admin/services/inventory.ts` — Stock operations (decrement, low stock query)
- `src/lib/admin/services/settings.ts` — Settings document CRUD
- `src/lib/admin/services/dashboard.ts` — Aggregation queries for dashboard stats

**Server-Side:**
- `src/lib/server/firebase-admin.ts` — Firebase Admin SDK init
- `src/routes/api/checkout/+server.ts` — Stripe Checkout session creation
- `src/routes/api/webhooks/stripe/+server.ts` — Stripe webhook handler
- `src/routes/api/products/sync/+server.ts` — Sync product to Stripe

**Admin Navigation:**
- `src/lib/admin/components/navigation/AdminSidebar.svelte` — Wraps @austencloud/sidebar with OCC config
- `src/lib/admin/components/navigation/AdminMobileNav.svelte` — Mobile hamburger + nav
- `src/lib/admin/components/navigation/admin-modules.ts` — Module definitions array

**Admin UI Components:**
- `src/lib/admin/components/ui/StatCard.svelte` — Dashboard metric card
- `src/lib/admin/components/ui/DataTable.svelte` — Sortable table with selection
- `src/lib/admin/components/ui/StatusBadge.svelte` — Colored status pill
- `src/lib/admin/components/ui/InlineEdit.svelte` — Click-to-edit field
- `src/lib/admin/components/ui/ImagePicker.svelte` — Media item selector for products
- `src/lib/admin/components/ui/FormField.svelte` — Label + input + error wrapper
- `src/lib/admin/components/ui/ConfirmDialog.svelte` — Destructive action confirmation
- `src/lib/admin/components/ui/SearchInput.svelte` — Debounced search
- `src/lib/admin/components/ui/FilterBar.svelte` — Filter dropdowns + chips
- `src/lib/admin/components/ui/EmptyState.svelte` — Empty state with icon + CTA

**Admin Route Pages:**
- `src/routes/admin/+layout@.svelte` — Rewrite: sidebar nav, auth guard
- `src/routes/admin/+page.svelte` — Rewrite: dashboard
- `src/routes/admin/login/+page.svelte` — Login page
- `src/routes/admin/products/+page.svelte` — Products list
- `src/routes/admin/products/drafts/+page.svelte` — Drafts (pre-filtered)
- `src/routes/admin/products/new/+page.svelte` — Product create
- `src/routes/admin/products/[id]/+page.svelte` — Product editor
- `src/routes/admin/orders/+page.svelte` — Orders list
- `src/routes/admin/orders/pending/+page.svelte` — Pending orders
- `src/routes/admin/orders/fulfilled/+page.svelte` — Fulfilled orders
- `src/routes/admin/orders/[id]/+page.svelte` — Order detail
- `src/routes/admin/inventory/+page.svelte` — Stock levels
- `src/routes/admin/inventory/low/+page.svelte` — Low stock
- `src/routes/admin/media/curate/+page.svelte` — Standalone curator
- `src/routes/admin/settings/+page.svelte` — General settings
- `src/routes/admin/settings/stripe/+page.svelte` — Stripe config
- `src/routes/admin/settings/seed/+page.svelte` — Relocated seed page

**Storefront Updates:**
- `src/lib/stores/cart.svelte.ts` — Cart state (localStorage-backed)
- `src/routes/checkout/success/+page.svelte` — Checkout success
- `src/routes/checkout/cancel/+page.svelte` — Checkout cancel

### Modified Files
- `src/lib/admin/admin.css` — Add status/table/card/form tokens, remove `@import 'tailwindcss'`
- `src/lib/admin/services/firebase.ts` — Add auth exports, new collection constants
- `package.json` — Add `stripe`, `firebase-admin`, `@austencloud/sidebar` dependencies
- `vite.config.ts` — Add `@austencloud/sidebar` to ssr.noExternal
- `.gitignore` — Add `service-account.json`

---

## Task 1: Dependencies & Config

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Modify: `.gitignore`

- [ ] **Step 1: Install new dependencies**

```bash
cd F:/orion-cloud-creations
npm install stripe @austencloud/sidebar
```

Note: `@austencloud/sidebar` is a local file dependency. Add to package.json:
```json
"@austencloud/sidebar": "file:F:/_CODE/shared-packages/packages/sidebar"
```

- [ ] **Step 2: Update vite.config.ts**

Add `@austencloud/sidebar` to the `ssr.noExternal` array:

```typescript
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	ssr: {
		noExternal: [
			'@austencloud/media-manager',
			'@austencloud/media-spotlight',
			'@austencloud/sidebar'
		]
	}
});
```

- [ ] **Step 3: Add service-account.json to .gitignore**

Append `service-account.json` to `.gitignore`.

- [ ] **Step 4: Verify dev server starts**

```bash
npm run dev
```

Expected: No errors, dev server starts on port 5176.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vite.config.ts .gitignore
git commit -m "chore: add stripe, sidebar dependencies and config"
```

---

## Task 2: Types & Data Model

**Files:**
- Modify: `src/lib/types/product.ts`
- Create: `src/lib/types/order.ts`
- Create: `src/lib/types/settings.ts`
- Create: `src/lib/types/cart.ts`

- [ ] **Step 1: Update product types**

Replace `src/lib/types/product.ts`:

```typescript
export type GarmentType =
	| 'shirt'
	| 'long_sleeve'
	| 'tank'
	| 'hoodie'
	| 'crewneck'
	| 'leggings'
	| 'bandana'
	| 'tapestry';

export type Technique =
	| 'ice_dye'
	| 'scrunch'
	| 'spiral'
	| 'geode'
	| 'crumple'
	| 'shibori'
	| 'bullseye'
	| 'mandala'
	| 'reverse'
	| 'starburst';

export type ColorFamily = 'warm' | 'cool' | 'neutral' | 'rainbow' | 'monochrome' | 'earth';

export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | '2XL' | '3XL';

export const ALL_SIZES: Size[] = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
export const ALL_GARMENT_TYPES: GarmentType[] = ['shirt', 'long_sleeve', 'tank', 'hoodie', 'crewneck', 'leggings', 'bandana', 'tapestry'];
export const ALL_COLOR_FAMILIES: ColorFamily[] = ['warm', 'cool', 'neutral', 'rainbow', 'monochrome', 'earth'];

export interface SizeVariant {
	stock: number;
	sku?: string;
}

export interface Product {
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
	mediaItemIds: string[];
	heroImageIndex: number;
	stripeProductId?: string;
	stripePriceId?: string;
	createdAt: Date;
	updatedAt: Date;
}

/** Format price in cents to display string */
export function formatPrice(cents: number): string {
	return `$${(cents / 100).toFixed(2)}`;
}

/** Generate URL-safe slug from title */
export function generateSlug(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

/** Get total stock across all sizes */
export function getTotalStock(sizes: Record<string, SizeVariant>): number {
	return Object.values(sizes).reduce((sum, v) => sum + v.stock, 0);
}
```

- [ ] **Step 2: Create order types**

Create `src/lib/types/order.ts`:

```typescript
import type { Size } from './product';

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'refunded' | 'cancelled';

export interface Address {
	line1: string;
	line2?: string;
	city: string;
	state: string;
	zip: string;
	country: string;
}

export interface OrderItem {
	productId: string;
	productTitle: string;
	size: Size;
	price: number;
	quantity: number;
	thumbnailUrl?: string;
}

export interface Order {
	id: string;
	stripeSessionId: string;
	stripePaymentIntentId: string;
	customerEmail: string;
	customerName: string;
	shippingAddress: Address;
	items: OrderItem[];
	subtotal: number;
	shipping: number;
	tax: number;
	total: number;
	status: OrderStatus;
	trackingNumber?: string;
	trackingCarrier?: string;
	notes?: string;
	createdAt: Date;
	updatedAt: Date;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
	pending: 'Pending',
	paid: 'Paid',
	shipped: 'Shipped',
	delivered: 'Delivered',
	refunded: 'Refunded',
	cancelled: 'Cancelled'
};
```

- [ ] **Step 3: Create settings types**

Create `src/lib/types/settings.ts`:

```typescript
export interface ShippingRate {
	label: string;
	price: number;
	estimatedDays: string;
}

export interface StoreSettings {
	storeName: string;
	storeEmail: string;
	currency: string;
	stripePublishableKey?: string;
	shippingRates: ShippingRate[];
	taxRate: number;
	lowStockThreshold: number;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
	storeName: 'Orion Cloud Creations',
	storeEmail: '',
	currency: 'usd',
	shippingRates: [
		{ label: 'Standard', price: 599, estimatedDays: '5-7 business days' },
		{ label: 'Priority', price: 1299, estimatedDays: '2-3 business days' }
	],
	taxRate: 0,
	lowStockThreshold: 1
};
```

- [ ] **Step 4: Create cart types**

Create `src/lib/types/cart.ts`:

```typescript
import type { Size } from './product';

export interface CartItem {
	productId: string;
	title: string;
	size: Size;
	price: number;
	thumbnailUrl: string;
	quantity: number;
}
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/types/
git commit -m "feat: add product, order, settings, cart types for admin panel"
```

---

## Task 3: CSS Token System

**Files:**
- Modify: `src/lib/admin/admin.css`

- [ ] **Step 1: Update admin.css with new tokens and remove Tailwind import**

Replace the `@import 'tailwindcss'` line at the top and add new tokens. Keep the `@import '@austencloud/media-manager/css/media-manager-tokens.css'` and `@theme` block, but add status/table/card/form tokens as regular CSS custom properties inside `.admin-theme`:

```css
@import '@austencloud/media-manager/css/media-manager-tokens.css';
@import '@austencloud/sidebar/css/sidebar-tokens.css';

@theme {
	--font-sans: 'Inter', system-ui, sans-serif;

	--color-surface: #1a1a2e;
	--color-surface-raised: #232340;
	--color-surface-overlay: #2a2a4a;
	--color-surface-hover: #303055;
	--color-border: #3a3a5c;
	--color-border-subtle: #2e2e4e;
	--color-text: #e8e8f0;
	--color-text-muted: #9090b0;
	--color-text-dim: #606080;
	--color-accent: #7c5cbf;
	--color-accent-hover: #9070d0;
	--color-danger: #e04050;
	--color-danger-hover: #f05060;
	--color-success: #40b080;
	--color-warning: #e0a030;

	/* Tag colors */
	--color-tag-flame: #e06030;
	--color-tag-gold: #d0a020;
	--color-tag-royal: #5050d0;
	--color-tag-cyan: #20b0c0;
	--color-tag-green: #30a050;
	--color-tag-red: #d03040;
	--color-tag-purple: #9040c0;
	--color-tag-navy: #304080;
	--color-tag-teal: #208070;
	--color-tag-pink: #d060a0;
	--color-tag-lime: #80c030;
	--color-tag-gray: #707080;
}

.admin-theme {
	font-family: var(--font-sans);
	background-color: var(--color-surface);
	color: var(--color-text);

	/* Status colors */
	--color-status-pending: var(--color-warning);
	--color-status-paid: var(--color-accent);
	--color-status-shipped: var(--color-tag-cyan);
	--color-status-delivered: var(--color-success);
	--color-status-refunded: var(--color-danger);
	--color-status-cancelled: var(--color-text-dim);

	/* Table tokens */
	--color-table-header: var(--color-surface-raised);
	--color-table-row-hover: var(--color-surface-hover);
	--color-table-border: var(--color-border-subtle);

	/* Card tokens */
	--color-card-bg: var(--color-surface-raised);
	--color-card-border: var(--color-border);

	/* Form tokens */
	--color-input-bg: var(--color-surface);
	--color-input-border: var(--color-border);
	--color-input-focus: var(--color-accent);
	--color-input-error: var(--color-danger);

	/* Sidebar overrides for admin theme */
	--sidebar-bg: var(--color-surface-raised);
	--sidebar-border: var(--color-border);
	--sidebar-text: var(--color-text);
	--sidebar-text-dim: var(--color-text-muted);
	--sidebar-hover-bg: var(--color-surface-hover);
	--sidebar-active-bg: var(--color-surface-overlay);
}

/* Custom scrollbars within admin */
.admin-theme ::-webkit-scrollbar {
	width: 8px;
	height: 8px;
}

.admin-theme ::-webkit-scrollbar-track {
	background: transparent;
}

.admin-theme ::-webkit-scrollbar-thumb {
	background: var(--color-border);
	border-radius: 4px;
}

.admin-theme ::-webkit-scrollbar-thumb:hover {
	background: var(--color-text-dim);
}

.admin-theme ::-webkit-scrollbar-corner {
	background: transparent;
}

/* Firefox scrollbars */
.admin-theme * {
	scrollbar-width: thin;
	scrollbar-color: var(--color-border) transparent;
}
```

Note: We keep `@theme` for now because the existing media/tags/seed pages use Tailwind utility classes. We'll remove `@import 'tailwindcss'` but keep `@theme` so those pages don't break. New pages will use scoped CSS only.

Actually — the existing pages depend on Tailwind utilities. We need to keep `@import 'tailwindcss'` until those pages are migrated. Add the new tokens alongside it. Replace the first line with:

```css
@import 'tailwindcss';
@import '@austencloud/media-manager/css/media-manager-tokens.css';
@import '@austencloud/sidebar/css/sidebar-tokens.css';
```

This preserves backward compatibility while new code uses scoped CSS.

- [ ] **Step 2: Commit**

```bash
git add src/lib/admin/admin.css
git commit -m "feat: add status, table, card, form CSS tokens for admin panel"
```

---

## Task 4: Firebase Auth Service

**Files:**
- Create: `src/lib/admin/services/auth.ts`
- Modify: `src/lib/admin/services/firebase.ts`

- [ ] **Step 1: Add auth imports to firebase.ts**

Add to `src/lib/admin/services/firebase.ts` — append new collection constants:

```typescript
// Add after existing collection constants:
export const PRODUCTS_COLLECTION = 'products';
export const ORDERS_COLLECTION = 'orders';
export const SETTINGS_COLLECTION = 'settings';
export const SETTINGS_DOC_ID = 'store';
```

- [ ] **Step 2: Create auth service**

Create `src/lib/admin/services/auth.ts`:

```typescript
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
	try {
		const result = await signInWithPopup(auth, provider);
		return result.user;
	} catch (e) {
		console.error('Google sign-in failed:', e);
		throw e;
	}
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
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/admin/services/auth.ts src/lib/admin/services/firebase.ts
git commit -m "feat: add Firebase Auth service with Google sign-in"
```

---

## Task 5: Admin Services (Products, Orders, Settings, Inventory, Dashboard)

**Files:**
- Create: `src/lib/admin/services/products.ts`
- Create: `src/lib/admin/services/orders.ts`
- Create: `src/lib/admin/services/settings.ts`
- Create: `src/lib/admin/services/inventory.ts`
- Create: `src/lib/admin/services/dashboard.ts`

- [ ] **Step 1: Create products service**

Create `src/lib/admin/services/products.ts`:

```typescript
import {
	collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs,
	query, where, orderBy, Timestamp, increment
} from 'firebase/firestore';
import { getDbInstance, PRODUCTS_COLLECTION } from './firebase';
import type { Product } from '$lib/types/product';
import { generateSlug } from '$lib/types/product';
import { browser } from '$app/environment';

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
```

- [ ] **Step 2: Create orders service**

Create `src/lib/admin/services/orders.ts`:

```typescript
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
```

- [ ] **Step 3: Create settings service**

Create `src/lib/admin/services/settings.ts`:

```typescript
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
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
```

- [ ] **Step 4: Create inventory service**

Create `src/lib/admin/services/inventory.ts`:

```typescript
import type { Product } from '$lib/types/product';
import { getTotalStock } from '$lib/types/product';
import { productService } from './products';

export interface StockEntry {
	productId: string;
	productTitle: string;
	garmentType: string;
	size: string;
	stock: number;
	sku?: string;
	thumbnailUrl?: string;
}

export const inventoryService = {
	async getAllStockEntries(): Promise<StockEntry[]> {
		const products = await productService.getAll();
		const entries: StockEntry[] = [];
		for (const product of products) {
			if (!product.sizes) continue;
			for (const [size, variant] of Object.entries(product.sizes)) {
				entries.push({
					productId: product.id,
					productTitle: product.title,
					garmentType: product.garmentType,
					size,
					stock: variant.stock,
					sku: variant.sku
				});
			}
		}
		return entries;
	},

	async getLowStock(threshold: number): Promise<StockEntry[]> {
		const all = await this.getAllStockEntries();
		return all.filter(e => e.stock <= threshold);
	},

	async updateStock(productId: string, size: string, newStock: number): Promise<void> {
		await productService.update(productId, {
			sizes: { [size]: { stock: newStock } } as any
		});
	}
};
```

- [ ] **Step 5: Create dashboard service**

Create `src/lib/admin/services/dashboard.ts`:

```typescript
import { productService } from './products';
import { orderService } from './orders';
import { mediaItemService } from './media';
import type { Order } from '$lib/types/order';
import { getTotalStock } from '$lib/types/product';

export interface DashboardStats {
	monthlyRevenue: number;
	monthlyOrders: number;
	totalProducts: number;
	needsReviewCount: number;
}

export const dashboardService = {
	async getStats(): Promise<DashboardStats> {
		const [orders, products, items] = await Promise.all([
			orderService.getAll(),
			productService.getAll(),
			mediaItemService.getAll()
		]);

		const now = new Date();
		const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

		const monthlyOrders = orders.filter(o =>
			o.createdAt >= monthStart && (o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered')
		);

		return {
			monthlyRevenue: monthlyOrders.reduce((sum, o) => sum + o.total, 0),
			monthlyOrders: monthlyOrders.length,
			totalProducts: products.filter(p => p.availability === 'available').length,
			needsReviewCount: items.filter((i: any) => i.needsReview).length
		};
	}
};
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/admin/services/products.ts src/lib/admin/services/orders.ts src/lib/admin/services/settings.ts src/lib/admin/services/inventory.ts src/lib/admin/services/dashboard.ts
git commit -m "feat: add admin services for products, orders, settings, inventory, dashboard"
```

---

## Task 6: Admin Navigation (Sidebar)

**Files:**
- Create: `src/lib/admin/components/navigation/admin-modules.ts`
- Create: `src/lib/admin/components/navigation/AdminSidebar.svelte`
- Create: `src/lib/admin/components/navigation/AdminMobileNav.svelte`

- [ ] **Step 1: Create module definitions**

Create `src/lib/admin/components/navigation/admin-modules.ts`:

```typescript
import type { ModuleDefinition } from '@austencloud/sidebar';

export const adminModules: ModuleDefinition[] = [
	{
		id: 'dashboard',
		label: 'Dashboard',
		icon: 'chart-line',
		color: '#7c5cbf',
		isMain: true,
		sections: []
	},
	{
		id: 'products',
		label: 'Products',
		icon: 'shirt',
		color: '#208070',
		isMain: true,
		sections: [
			{ id: 'all-products', label: 'All Products', icon: 'list', color: '#208070' },
			{ id: 'drafts', label: 'Drafts', icon: 'file-pen', color: '#9090b0' }
		]
	},
	{
		id: 'orders',
		label: 'Orders',
		icon: 'receipt',
		color: '#d0a020',
		isMain: true,
		sections: [
			{ id: 'all-orders', label: 'All Orders', icon: 'list', color: '#d0a020' },
			{ id: 'pending', label: 'Pending', icon: 'clock', color: '#e0a030' },
			{ id: 'fulfilled', label: 'Fulfilled', icon: 'circle-check', color: '#40b080' }
		]
	},
	{
		id: 'inventory',
		label: 'Inventory',
		icon: 'boxes-stacked',
		color: '#30a050',
		isMain: true,
		sections: [
			{ id: 'stock-levels', label: 'Stock Levels', icon: 'warehouse', color: '#30a050' },
			{ id: 'low-stock', label: 'Low Stock', icon: 'triangle-exclamation', color: '#e04050' }
		]
	},
	{
		id: 'media',
		label: 'Media',
		icon: 'images',
		color: '#20b0c0',
		isMain: true,
		sections: [
			{ id: 'library', label: 'Library', icon: 'photo-film', color: '#20b0c0' },
			{ id: 'curate', label: 'Curate', icon: 'wand-magic-sparkles', color: '#9040c0' }
		]
	},
	{
		id: 'tags',
		label: 'Tags',
		icon: 'tags',
		color: '#d060a0',
		isMain: true,
		sections: []
	},
	{
		id: 'settings',
		label: 'Settings',
		icon: 'gear',
		color: '#707080',
		isMain: true,
		sections: [
			{ id: 'general', label: 'General', icon: 'sliders', color: '#707080' },
			{ id: 'stripe', label: 'Stripe', icon: 'credit-card', color: '#635bff' },
			{ id: 'seed', label: 'Seed Data', icon: 'database', color: '#e0a030' }
		]
	}
];

export const moduleRoutes: Record<string, string> = {
	dashboard: '/admin',
	products: '/admin/products',
	orders: '/admin/orders',
	inventory: '/admin/inventory',
	media: '/admin/media',
	tags: '/admin/tags',
	settings: '/admin/settings'
};

export const sectionRoutes: Record<string, Record<string, string>> = {
	products: {
		'all-products': '/admin/products',
		drafts: '/admin/products/drafts'
	},
	orders: {
		'all-orders': '/admin/orders',
		pending: '/admin/orders/pending',
		fulfilled: '/admin/orders/fulfilled'
	},
	inventory: {
		'stock-levels': '/admin/inventory',
		'low-stock': '/admin/inventory/low'
	},
	media: {
		library: '/admin/media',
		curate: '/admin/media/curate'
	},
	settings: {
		general: '/admin/settings',
		stripe: '/admin/settings/stripe',
		seed: '/admin/settings/seed'
	}
};
```

- [ ] **Step 2: Create AdminSidebar component**

Create `src/lib/admin/components/navigation/AdminSidebar.svelte`:

```svelte
<script lang="ts">
	import { Sidebar } from '@austencloud/sidebar';
	import type { ModuleDefinition } from '@austencloud/sidebar';
	import { adminModules, moduleRoutes, sectionRoutes } from './admin-modules';
	import { goto } from '$app/navigation';
	import { signOut } from '$lib/admin/services/auth';
	import type { Snippet } from 'svelte';

	interface Props {
		currentModule: string;
		currentSection: string;
		collapsed?: boolean;
		onModuleChange?: (moduleId: string) => void;
		onSectionChange?: (sectionId: string) => void;
	}

	let {
		currentModule,
		currentSection,
		collapsed = $bindable(false),
		onModuleChange,
		onSectionChange
	}: Props = $props();

	function handleModuleChange(moduleId: string) {
		if (onModuleChange) onModuleChange(moduleId);
		const route = moduleRoutes[moduleId];
		if (route) goto(route);
	}

	function handleSectionChange(sectionId: string) {
		if (onSectionChange) onSectionChange(sectionId);
		const route = sectionRoutes[currentModule]?.[sectionId];
		if (route) goto(route);
	}

	function toggleCollapse() {
		collapsed = !collapsed;
	}

	async function handleSignOut() {
		await signOut();
		goto('/admin/login');
	}
</script>

<Sidebar
	modules={adminModules}
	{currentModule}
	{currentSection}
	onModuleChange={handleModuleChange}
	onSectionChange={handleSectionChange}
	collapsible
	bind:collapsed
	collapseStorageKey="occ-admin-sidebar-collapsed"
	class="admin-sidebar"
>
	{#snippet header(isCollapsed: boolean)}
		<div class="sidebar-header" class:collapsed={isCollapsed}>
			<div class="brand">
				<span class="logo-badge">OCC</span>
				{#if !isCollapsed}
					<span class="brand-name">Admin</span>
				{/if}
			</div>
			<button
				class="collapse-toggle"
				onclick={toggleCollapse}
				aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
			>
				<span class="chevron" class:rotated={isCollapsed}>&#8249;</span>
			</button>
		</div>
	{/snippet}

	{#snippet footer(isCollapsed: boolean)}
		<div class="sidebar-footer" class:collapsed={isCollapsed}>
			<a href="/" class="footer-link storefront-link">
				<span class="footer-icon">&#8599;</span>
				{#if !isCollapsed}<span>Storefront</span>{/if}
			</a>
			<button class="footer-link sign-out-btn" onclick={handleSignOut}>
				<span class="footer-icon">&#x23FB;</span>
				{#if !isCollapsed}<span>Sign Out</span>{/if}
			</button>
		</div>
	{/snippet}
</Sidebar>

<style>
	.sidebar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 12px 12px;
		border-bottom: 1px solid var(--sidebar-border, rgba(255, 255, 255, 0.08));
	}

	.sidebar-header.collapsed {
		flex-direction: column;
		gap: 8px;
		padding: 12px 4px;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.logo-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 10px;
		background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-tag-teal) 100%);
		color: white;
		font-size: 11px;
		font-weight: 800;
		letter-spacing: 0.04em;
		flex-shrink: 0;
	}

	.brand-name {
		font-size: 15px;
		font-weight: 700;
		color: var(--sidebar-text, rgba(255, 255, 255, 0.95));
		letter-spacing: 0.02em;
	}

	.collapse-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border: none;
		background: transparent;
		border-radius: 6px;
		color: var(--sidebar-text-dim, rgba(255, 255, 255, 0.5));
		cursor: pointer;
		transition: background 0.15s, color 0.15s;
		font-size: 18px;
	}

	.collapse-toggle:hover {
		background: var(--sidebar-hover-bg, rgba(255, 255, 255, 0.06));
		color: var(--sidebar-text, rgba(255, 255, 255, 0.95));
	}

	.chevron {
		display: inline-block;
		transition: transform 0.2s;
	}

	.chevron.rotated {
		transform: rotate(180deg);
	}

	.sidebar-footer {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 8px;
		border-top: 1px solid var(--sidebar-border, rgba(255, 255, 255, 0.08));
	}

	.sidebar-footer.collapsed {
		align-items: center;
		padding: 8px 4px;
	}

	.footer-link {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 12px;
		font-size: 13px;
		font-weight: 500;
		color: var(--sidebar-text-dim, rgba(255, 255, 255, 0.5));
		text-decoration: none;
		border: none;
		background: none;
		border-radius: 8px;
		cursor: pointer;
		transition: color 0.15s, background 0.15s;
		width: 100%;
	}

	.footer-link:hover {
		color: var(--sidebar-text, rgba(255, 255, 255, 0.95));
		background: var(--sidebar-hover-bg, rgba(255, 255, 255, 0.06));
	}

	.collapsed .footer-link {
		justify-content: center;
		padding: 8px;
	}

	.footer-icon {
		font-size: 16px;
		flex-shrink: 0;
	}
</style>
```

- [ ] **Step 3: Create AdminMobileNav component**

Create `src/lib/admin/components/navigation/AdminMobileNav.svelte`:

```svelte
<script lang="ts">
	import { adminModules, moduleRoutes } from './admin-modules';
	import { goto } from '$app/navigation';

	interface Props {
		isOpen: boolean;
		currentModule: string;
		onClose: () => void;
	}

	let { isOpen, currentModule, onClose }: Props = $props();

	function handleNav(moduleId: string) {
		const route = moduleRoutes[moduleId];
		if (route) goto(route);
		onClose();
	}
</script>

{#if isOpen}
	<div class="mobile-nav-backdrop" onclick={onClose} role="presentation"></div>
	<nav class="mobile-nav" aria-label="Admin navigation">
		<div class="mobile-nav-header">
			<span class="mobile-nav-title">OCC Admin</span>
			<button class="mobile-nav-close" onclick={onClose} aria-label="Close navigation">&times;</button>
		</div>
		<div class="mobile-nav-items">
			{#each adminModules.filter(m => m.isMain) as mod}
				<button
					class="mobile-nav-item"
					class:active={mod.id === currentModule}
					onclick={() => handleNav(mod.id)}
				>
					<span class="mobile-nav-dot" style="background: {mod.color}"></span>
					<span>{mod.label}</span>
				</button>
			{/each}
		</div>
		<div class="mobile-nav-footer">
			<a href="/" class="mobile-nav-item storefront">&#8599; Storefront</a>
		</div>
	</nav>
{/if}

<style>
	.mobile-nav-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
		z-index: 199;
	}

	.mobile-nav {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		width: 280px;
		background: var(--color-surface-raised);
		border-right: 1px solid var(--color-border);
		z-index: 200;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
	}

	.mobile-nav-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px;
		border-bottom: 1px solid var(--color-border);
	}

	.mobile-nav-title {
		font-size: 15px;
		font-weight: 700;
		color: var(--color-text);
	}

	.mobile-nav-close {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		background: transparent;
		color: var(--color-text-muted);
		font-size: 24px;
		cursor: pointer;
		border-radius: 6px;
	}

	.mobile-nav-close:hover {
		background: var(--color-surface-hover);
		color: var(--color-text);
	}

	.mobile-nav-items {
		flex: 1;
		padding: 8px;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.mobile-nav-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		font-size: 14px;
		font-weight: 500;
		color: var(--color-text-muted);
		text-decoration: none;
		border: none;
		background: none;
		border-radius: 8px;
		cursor: pointer;
		width: 100%;
		text-align: left;
		transition: color 0.15s, background 0.15s;
	}

	.mobile-nav-item:hover {
		color: var(--color-text);
		background: var(--color-surface-hover);
	}

	.mobile-nav-item.active {
		color: var(--color-text);
		background: var(--color-surface-overlay);
	}

	.mobile-nav-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.mobile-nav-footer {
		padding: 8px;
		border-top: 1px solid var(--color-border);
	}

	.storefront {
		color: var(--color-text-dim);
	}
</style>
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/admin/components/navigation/
git commit -m "feat: add admin sidebar navigation with module definitions and mobile nav"
```

---

## Task 7: Reusable UI Components

**Files:**
- Create: `src/lib/admin/components/ui/StatCard.svelte`
- Create: `src/lib/admin/components/ui/StatusBadge.svelte`
- Create: `src/lib/admin/components/ui/DataTable.svelte`
- Create: `src/lib/admin/components/ui/FormField.svelte`
- Create: `src/lib/admin/components/ui/SearchInput.svelte`
- Create: `src/lib/admin/components/ui/EmptyState.svelte`
- Create: `src/lib/admin/components/ui/ConfirmDialog.svelte`
- Create: `src/lib/admin/components/ui/InlineEdit.svelte`

- [ ] **Step 1: Create StatCard**

Create `src/lib/admin/components/ui/StatCard.svelte`:

```svelte
<script lang="ts">
	interface Props {
		label: string;
		value: string;
		subtitle?: string;
		color?: string;
	}

	const { label, value, subtitle, color = 'var(--color-accent)' }: Props = $props();
</script>

<div class="stat-card">
	<div class="stat-indicator" style="background: {color}"></div>
	<div class="stat-content">
		<span class="stat-label">{label}</span>
		<span class="stat-value">{value}</span>
		{#if subtitle}
			<span class="stat-subtitle">{subtitle}</span>
		{/if}
	</div>
</div>

<style>
	.stat-card {
		display: flex;
		gap: 16px;
		padding: 20px;
		background: var(--color-card-bg);
		border: 1px solid var(--color-card-border);
		border-radius: 12px;
		transition: border-color 0.15s;
	}

	.stat-card:hover {
		border-color: var(--color-border);
	}

	.stat-indicator {
		width: 4px;
		border-radius: 2px;
		flex-shrink: 0;
		align-self: stretch;
	}

	.stat-content {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.stat-label {
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-muted);
	}

	.stat-value {
		font-size: 28px;
		font-weight: 700;
		color: var(--color-text);
		line-height: 1.1;
	}

	.stat-subtitle {
		font-size: 12px;
		color: var(--color-text-dim);
	}
</style>
```

- [ ] **Step 2: Create StatusBadge**

Create `src/lib/admin/components/ui/StatusBadge.svelte`:

```svelte
<script lang="ts">
	interface Props {
		status: string;
		size?: 'sm' | 'md';
	}

	const { status, size = 'md' }: Props = $props();

	const colorMap: Record<string, string> = {
		pending: 'var(--color-status-pending)',
		paid: 'var(--color-status-paid)',
		shipped: 'var(--color-status-shipped)',
		delivered: 'var(--color-status-delivered)',
		refunded: 'var(--color-status-refunded)',
		cancelled: 'var(--color-status-cancelled)',
		available: 'var(--color-success)',
		draft: 'var(--color-text-dim)',
		sold: 'var(--color-danger)',
		archived: 'var(--color-text-dim)'
	};

	let color = $derived(colorMap[status] ?? 'var(--color-text-dim)');
</script>

<span class="badge" class:sm={size === 'sm'} style="--badge-color: {color}">
	{status}
</span>

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		padding: 3px 10px;
		font-size: 12px;
		font-weight: 600;
		text-transform: capitalize;
		border-radius: 999px;
		color: var(--badge-color);
		background: color-mix(in srgb, var(--badge-color) 12%, transparent);
		border: 1px solid color-mix(in srgb, var(--badge-color) 25%, transparent);
		white-space: nowrap;
	}

	.badge.sm {
		padding: 1px 7px;
		font-size: 11px;
	}
</style>
```

- [ ] **Step 3: Create FormField**

Create `src/lib/admin/components/ui/FormField.svelte`:

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label: string;
		error?: string;
		required?: boolean;
		children: Snippet;
	}

	const { label, error, required = false, children }: Props = $props();
</script>

<div class="form-field" class:has-error={!!error}>
	<label class="field-label">
		{label}
		{#if required}<span class="required">*</span>{/if}
	</label>
	<div class="field-input">
		{@render children()}
	</div>
	{#if error}
		<span class="field-error">{error}</span>
	{/if}
</div>

<style>
	.form-field {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.field-label {
		font-size: 13px;
		font-weight: 600;
		color: var(--color-text-muted);
	}

	.required {
		color: var(--color-danger);
		margin-left: 2px;
	}

	.field-input :global(input),
	.field-input :global(textarea),
	.field-input :global(select) {
		width: 100%;
		padding: 8px 12px;
		font-size: 14px;
		background: var(--color-input-bg);
		border: 1px solid var(--color-input-border);
		border-radius: 8px;
		color: var(--color-text);
		transition: border-color 0.15s;
		font-family: inherit;
	}

	.field-input :global(input:focus),
	.field-input :global(textarea:focus),
	.field-input :global(select:focus) {
		outline: none;
		border-color: var(--color-input-focus);
	}

	.has-error .field-input :global(input),
	.has-error .field-input :global(textarea),
	.has-error .field-input :global(select) {
		border-color: var(--color-input-error);
	}

	.field-error {
		font-size: 12px;
		color: var(--color-danger);
	}

	.field-input :global(textarea) {
		resize: vertical;
		min-height: 80px;
	}

	.field-input :global(select) {
		cursor: pointer;
	}
</style>
```

- [ ] **Step 4: Create SearchInput**

Create `src/lib/admin/components/ui/SearchInput.svelte`:

```svelte
<script lang="ts">
	interface Props {
		value: string;
		placeholder?: string;
		onchange: (value: string) => void;
	}

	let { value = $bindable(''), placeholder = 'Search...', onchange }: Props = $props();

	let timeout: ReturnType<typeof setTimeout>;

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		value = target.value;
		clearTimeout(timeout);
		timeout = setTimeout(() => onchange(value), 250);
	}

	function clear() {
		value = '';
		onchange('');
	}
</script>

<div class="search-input">
	<span class="search-icon">&#x1F50D;</span>
	<input
		type="text"
		{value}
		{placeholder}
		oninput={handleInput}
	/>
	{#if value}
		<button class="clear-btn" onclick={clear} aria-label="Clear search">&times;</button>
	{/if}
</div>

<style>
	.search-input {
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-icon {
		position: absolute;
		left: 10px;
		font-size: 14px;
		pointer-events: none;
		opacity: 0.5;
	}

	input {
		width: 100%;
		padding: 8px 32px 8px 34px;
		font-size: 13px;
		background: var(--color-input-bg);
		border: 1px solid var(--color-input-border);
		border-radius: 8px;
		color: var(--color-text);
		transition: border-color 0.15s;
		font-family: inherit;
	}

	input:focus {
		outline: none;
		border-color: var(--color-input-focus);
	}

	.clear-btn {
		position: absolute;
		right: 6px;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		background: transparent;
		color: var(--color-text-dim);
		font-size: 16px;
		cursor: pointer;
		border-radius: 4px;
	}

	.clear-btn:hover {
		color: var(--color-text);
		background: var(--color-surface-hover);
	}
</style>
```

- [ ] **Step 5: Create EmptyState**

Create `src/lib/admin/components/ui/EmptyState.svelte`:

```svelte
<script lang="ts">
	interface Props {
		title: string;
		description?: string;
		actionLabel?: string;
		onaction?: () => void;
	}

	const { title, description, actionLabel, onaction }: Props = $props();
</script>

<div class="empty-state">
	<div class="empty-icon">&#9744;</div>
	<h3 class="empty-title">{title}</h3>
	{#if description}
		<p class="empty-desc">{description}</p>
	{/if}
	{#if actionLabel && onaction}
		<button class="empty-action" onclick={onaction}>{actionLabel}</button>
	{/if}
</div>

<style>
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 48px 24px;
		text-align: center;
	}

	.empty-icon {
		font-size: 48px;
		opacity: 0.3;
		margin-bottom: 16px;
	}

	.empty-title {
		font-size: 16px;
		font-weight: 600;
		color: var(--color-text);
		margin: 0 0 8px;
	}

	.empty-desc {
		font-size: 13px;
		color: var(--color-text-muted);
		margin: 0 0 20px;
		max-width: 300px;
	}

	.empty-action {
		padding: 8px 20px;
		font-size: 13px;
		font-weight: 600;
		background: var(--color-accent);
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		transition: background 0.15s;
	}

	.empty-action:hover {
		background: var(--color-accent-hover);
	}
</style>
```

- [ ] **Step 6: Create ConfirmDialog**

Create `src/lib/admin/components/ui/ConfirmDialog.svelte`:

```svelte
<script lang="ts">
	interface Props {
		open: boolean;
		title: string;
		message: string;
		confirmLabel?: string;
		danger?: boolean;
		onconfirm: () => void;
		oncancel: () => void;
	}

	const { open, title, message, confirmLabel = 'Confirm', danger = false, onconfirm, oncancel }: Props = $props();
</script>

{#if open}
	<div class="dialog-backdrop" onclick={oncancel} role="presentation"></div>
	<div class="dialog" role="alertdialog" aria-modal="true" aria-labelledby="dialog-title">
		<h3 id="dialog-title" class="dialog-title">{title}</h3>
		<p class="dialog-message">{message}</p>
		<div class="dialog-actions">
			<button class="btn btn-cancel" onclick={oncancel}>Cancel</button>
			<button class="btn" class:btn-danger={danger} class:btn-confirm={!danger} onclick={onconfirm}>
				{confirmLabel}
			</button>
		</div>
	</div>
{/if}

<style>
	.dialog-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
		z-index: 999;
	}

	.dialog {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 400px;
		max-width: 90vw;
		padding: 24px;
		background: var(--color-surface-raised);
		border: 1px solid var(--color-border);
		border-radius: 12px;
		z-index: 1000;
	}

	.dialog-title {
		font-size: 16px;
		font-weight: 700;
		color: var(--color-text);
		margin: 0 0 8px;
	}

	.dialog-message {
		font-size: 14px;
		color: var(--color-text-muted);
		margin: 0 0 20px;
		line-height: 1.5;
	}

	.dialog-actions {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
	}

	.btn {
		padding: 8px 16px;
		font-size: 13px;
		font-weight: 600;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		transition: background 0.15s;
	}

	.btn-cancel {
		background: var(--color-surface-hover);
		color: var(--color-text-muted);
	}

	.btn-cancel:hover {
		background: var(--color-surface-overlay);
		color: var(--color-text);
	}

	.btn-confirm {
		background: var(--color-accent);
		color: white;
	}

	.btn-confirm:hover {
		background: var(--color-accent-hover);
	}

	.btn-danger {
		background: var(--color-danger);
		color: white;
	}

	.btn-danger:hover {
		background: var(--color-danger-hover);
	}
</style>
```

- [ ] **Step 7: Create InlineEdit**

Create `src/lib/admin/components/ui/InlineEdit.svelte`:

```svelte
<script lang="ts">
	interface Props {
		value: number;
		onsave: (value: number) => void;
	}

	let { value, onsave }: Props = $props();

	let editing = $state(false);
	let editValue = $state(String(value));

	function startEdit() {
		editValue = String(value);
		editing = true;
	}

	function save() {
		const num = parseInt(editValue, 10);
		if (!isNaN(num) && num >= 0) {
			onsave(num);
		}
		editing = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') save();
		if (e.key === 'Escape') editing = false;
	}
</script>

{#if editing}
	<input
		type="number"
		class="inline-input"
		bind:value={editValue}
		onblur={save}
		onkeydown={handleKeydown}
		min="0"
	/>
{:else}
	<button class="inline-display" onclick={startEdit} aria-label="Edit value">
		{value}
	</button>
{/if}

<style>
	.inline-input {
		width: 60px;
		padding: 4px 8px;
		font-size: 14px;
		background: var(--color-input-bg);
		border: 1px solid var(--color-input-focus);
		border-radius: 6px;
		color: var(--color-text);
		text-align: center;
		font-family: inherit;
	}

	.inline-input:focus {
		outline: none;
	}

	.inline-display {
		padding: 4px 12px;
		font-size: 14px;
		font-weight: 600;
		background: transparent;
		border: 1px solid transparent;
		border-radius: 6px;
		color: var(--color-text);
		cursor: pointer;
		transition: border-color 0.15s, background 0.15s;
	}

	.inline-display:hover {
		border-color: var(--color-border);
		background: var(--color-surface-hover);
	}
</style>
```

- [ ] **Step 8: Commit**

```bash
git add src/lib/admin/components/ui/
git commit -m "feat: add reusable admin UI components (StatCard, StatusBadge, FormField, SearchInput, EmptyState, ConfirmDialog, InlineEdit)"
```

---

## Task 8: Admin Layout & Auth Guard

**Files:**
- Rewrite: `src/routes/admin/+layout@.svelte`
- Create: `src/routes/admin/login/+page.svelte`

- [ ] **Step 1: Rewrite admin layout with sidebar and auth guard**

Replace `src/routes/admin/+layout@.svelte`:

```svelte
<script lang="ts">
	import '../../app.css';
	import '$lib/admin/admin.css';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { onAuthStateChanged } from '$lib/admin/services/auth';
	import AdminSidebar from '$lib/admin/components/navigation/AdminSidebar.svelte';
	import AdminMobileNav from '$lib/admin/components/navigation/AdminMobileNav.svelte';
	import { moduleRoutes, sectionRoutes } from '$lib/admin/components/navigation/admin-modules';
	import type { User } from 'firebase/auth';

	interface Props {
		children: import('svelte').Snippet;
	}

	const { children }: Props = $props();

	let user = $state<User | null>(null);
	let authChecked = $state(false);
	let sidebarCollapsed = $state(false);
	let showMobileMenu = $state(false);
	let currentModule = $state('dashboard');
	let currentSection = $state('');

	// Auth guard
	$effect(() => {
		if (!browser) return;
		const unsubscribe = onAuthStateChanged((u) => {
			user = u;
			authChecked = true;
			if (!u && !page.url.pathname.includes('/admin/login')) {
				goto('/admin/login');
			}
		});
		return unsubscribe;
	});

	// Path → module/section mapping
	$effect(() => {
		const path = page.url.pathname;

		if (path === '/admin' || path === '/admin/') {
			currentModule = 'dashboard';
			currentSection = '';
		} else {
			// Find matching module
			for (const [moduleId, route] of Object.entries(moduleRoutes)) {
				if (moduleId !== 'dashboard' && path.startsWith(route)) {
					currentModule = moduleId;
					// Find matching section
					const sections = sectionRoutes[moduleId];
					if (sections) {
						let matched = false;
						for (const [sectionId, sectionRoute] of Object.entries(sections)) {
							if (path === sectionRoute || path.startsWith(sectionRoute + '/')) {
								currentSection = sectionId;
								matched = true;
								break;
							}
						}
						if (!matched) currentSection = Object.keys(sections)[0] || '';
					} else {
						currentSection = '';
					}
					break;
				}
			}
		}

		// Close mobile menu on navigation
		showMobileMenu = false;
	});

	let isLoginPage = $derived(page.url.pathname.includes('/admin/login'));
</script>

<div class="admin-theme">
	{#if isLoginPage}
		{@render children()}
	{:else if !authChecked}
		<div class="auth-loading">
			<div class="spinner"></div>
		</div>
	{:else if user}
		<div class="admin-layout" class:sidebar-collapsed={sidebarCollapsed}>
			<!-- Mobile header -->
			<header class="mobile-header">
				<button class="hamburger" onclick={() => showMobileMenu = true} aria-label="Open menu">
					<span></span><span></span><span></span>
				</button>
				<span class="mobile-title">OCC Admin</span>
			</header>

			<!-- Desktop sidebar -->
			<div class="sidebar-wrapper">
				<AdminSidebar
					{currentModule}
					{currentSection}
					bind:collapsed={sidebarCollapsed}
				/>
			</div>

			<!-- Mobile nav -->
			<AdminMobileNav
				isOpen={showMobileMenu}
				{currentModule}
				onClose={() => showMobileMenu = false}
			/>

			<!-- Main content -->
			<main class="admin-main">
				{@render children()}
			</main>
		</div>
	{/if}
</div>

<style>
	.admin-layout {
		display: flex;
		min-height: 100vh;
	}

	.sidebar-wrapper {
		position: fixed;
		left: 0;
		top: 0;
		bottom: 0;
		z-index: 150;
		display: none;
	}

	.admin-main {
		flex: 1;
		overflow-y: auto;
		min-height: 100vh;
	}

	/* Mobile header */
	.mobile-header {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 0 16px;
		height: 48px;
		background: var(--color-surface-raised);
		border-bottom: 1px solid var(--color-border);
	}

	.hamburger {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 8px;
		background: none;
		border: none;
		cursor: pointer;
	}

	.hamburger span {
		display: block;
		width: 18px;
		height: 2px;
		background: var(--color-text-muted);
		border-radius: 1px;
	}

	.mobile-title {
		font-size: 14px;
		font-weight: 700;
		color: var(--color-text);
	}

	/* Auth loading */
	.auth-loading {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		background: var(--color-surface);
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--color-border);
		border-top-color: var(--color-accent);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	/* Desktop */
	@media (min-width: 1024px) {
		.mobile-header {
			display: none;
		}

		.sidebar-wrapper {
			display: block;
		}

		.admin-main {
			margin-left: var(--sidebar-width, 220px);
			transition: margin-left 280ms cubic-bezier(0.16, 1, 0.3, 1);
		}

		.sidebar-collapsed .admin-main {
			margin-left: var(--sidebar-collapsed-width, 64px);
		}
	}
</style>
```

- [ ] **Step 2: Create login page**

Create `src/routes/admin/login/+page.svelte`:

```svelte
<script lang="ts">
	import { signInWithGoogle } from '$lib/admin/services/auth';
	import { goto } from '$app/navigation';

	let loading = $state(false);
	let error = $state<string | null>(null);

	async function handleSignIn() {
		loading = true;
		error = null;
		try {
			const user = await signInWithGoogle();
			if (user) {
				goto('/admin');
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Sign in failed';
		} finally {
			loading = false;
		}
	}
</script>

<div class="login-page">
	<div class="login-card">
		<div class="login-brand">
			<span class="login-badge">OCC</span>
			<h1 class="login-title">Admin</h1>
		</div>
		<p class="login-subtitle">Sign in to manage your store</p>

		{#if error}
			<div class="login-error">{error}</div>
		{/if}

		<button class="google-btn" onclick={handleSignIn} disabled={loading}>
			{#if loading}
				Signing in...
			{:else}
				Sign in with Google
			{/if}
		</button>

		<a href="/" class="back-link">&larr; Back to storefront</a>
	</div>
</div>

<style>
	.login-page {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		background: var(--color-surface);
	}

	.login-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		padding: 40px;
		background: var(--color-surface-raised);
		border: 1px solid var(--color-border);
		border-radius: 16px;
		width: 360px;
		max-width: 90vw;
	}

	.login-brand {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.login-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		border-radius: 12px;
		background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-tag-teal) 100%);
		color: white;
		font-size: 14px;
		font-weight: 800;
	}

	.login-title {
		font-size: 24px;
		font-weight: 700;
		color: var(--color-text);
		margin: 0;
	}

	.login-subtitle {
		font-size: 14px;
		color: var(--color-text-muted);
		margin: 0;
	}

	.login-error {
		padding: 10px 16px;
		font-size: 13px;
		color: var(--color-danger);
		background: color-mix(in srgb, var(--color-danger) 10%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-danger) 25%, transparent);
		border-radius: 8px;
		width: 100%;
		text-align: center;
	}

	.google-btn {
		width: 100%;
		padding: 12px;
		font-size: 14px;
		font-weight: 600;
		background: var(--color-accent);
		color: white;
		border: none;
		border-radius: 10px;
		cursor: pointer;
		transition: background 0.15s;
	}

	.google-btn:hover:not(:disabled) {
		background: var(--color-accent-hover);
	}

	.google-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.back-link {
		font-size: 13px;
		color: var(--color-text-dim);
		text-decoration: none;
	}

	.back-link:hover {
		color: var(--color-text-muted);
	}
</style>
```

- [ ] **Step 3: Commit**

```bash
git add src/routes/admin/+layout@.svelte src/routes/admin/login/
git commit -m "feat: rewrite admin layout with sidebar navigation and Firebase Auth guard"
```

---

## Task 9: Dashboard Page

**Files:**
- Rewrite: `src/routes/admin/+page.svelte`

- [ ] **Step 1: Create dashboard page**

Replace `src/routes/admin/+page.svelte`:

```svelte
<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import StatCard from '$lib/admin/components/ui/StatCard.svelte';
	import StatusBadge from '$lib/admin/components/ui/StatusBadge.svelte';
	import { dashboardService, type DashboardStats } from '$lib/admin/services/dashboard';
	import { orderService } from '$lib/admin/services/orders';
	import { productService } from '$lib/admin/services/products';
	import { formatPrice, getTotalStock } from '$lib/types/product';
	import type { Order } from '$lib/types/order';
	import type { Product } from '$lib/types/product';

	let stats = $state<DashboardStats | null>(null);
	let recentOrders = $state<Order[]>([]);
	let lowStockProducts = $state<Product[]>([]);
	let loading = $state(true);

	$effect(() => {
		if (!browser) return;
		loadDashboard();
	});

	async function loadDashboard() {
		loading = true;
		try {
			const [s, orders, products] = await Promise.all([
				dashboardService.getStats(),
				orderService.getRecent(5),
				productService.getAll()
			]);
			stats = s;
			recentOrders = orders;
			lowStockProducts = products.filter(p =>
				p.availability === 'available' && getTotalStock(p.sizes) <= 1
			).slice(0, 5);
		} catch (e) {
			console.error('Dashboard load failed:', e);
		} finally {
			loading = false;
		}
	}
</script>

<div class="dashboard">
	<div class="page-header">
		<h1 class="page-title">Dashboard</h1>
		<p class="page-subtitle">Welcome back to OCC Admin</p>
	</div>

	{#if loading}
		<div class="loading-grid">
			{#each Array(4) as _}
				<div class="skeleton-card"></div>
			{/each}
		</div>
	{:else if stats}
		<!-- Stats -->
		<div class="stats-grid">
			<StatCard
				label="Revenue This Month"
				value={formatPrice(stats.monthlyRevenue)}
				color="var(--color-success)"
			/>
			<StatCard
				label="Orders This Month"
				value={String(stats.monthlyOrders)}
				color="var(--color-tag-gold)"
			/>
			<StatCard
				label="Products Listed"
				value={String(stats.totalProducts)}
				color="var(--color-tag-teal)"
			/>
			<StatCard
				label="Needs Review"
				value={String(stats.needsReviewCount)}
				subtitle="media items"
				color="var(--color-tag-cyan)"
			/>
		</div>

		<div class="dashboard-grid">
			<!-- Recent Orders -->
			<section class="dashboard-section">
				<div class="section-header">
					<h2 class="section-title">Recent Orders</h2>
					<button class="section-link" onclick={() => goto('/admin/orders')}>View all</button>
				</div>
				{#if recentOrders.length === 0}
					<p class="empty-text">No orders yet</p>
				{:else}
					<div class="mini-list">
						{#each recentOrders as order}
							<button class="mini-row" onclick={() => goto(`/admin/orders/${order.id}`)}>
								<div class="mini-row-left">
									<span class="mini-primary">{order.customerName}</span>
									<span class="mini-secondary">{formatPrice(order.total)}</span>
								</div>
								<StatusBadge status={order.status} size="sm" />
							</button>
						{/each}
					</div>
				{/if}
			</section>

			<!-- Low Stock -->
			<section class="dashboard-section">
				<div class="section-header">
					<h2 class="section-title">Low Stock</h2>
					<button class="section-link" onclick={() => goto('/admin/inventory/low')}>View all</button>
				</div>
				{#if lowStockProducts.length === 0}
					<p class="empty-text">All stocked up</p>
				{:else}
					<div class="mini-list">
						{#each lowStockProducts as product}
							<button class="mini-row" onclick={() => goto(`/admin/products/${product.id}`)}>
								<span class="mini-primary">{product.title}</span>
								<span class="stock-count" class:zero={getTotalStock(product.sizes) === 0}>
									{getTotalStock(product.sizes)} left
								</span>
							</button>
						{/each}
					</div>
				{/if}
			</section>
		</div>

		<!-- Quick Actions -->
		<div class="quick-actions">
			<button class="action-btn" onclick={() => goto('/admin/products/new')}>
				+ New Product
			</button>
			<button class="action-btn" onclick={() => goto('/admin/media/curate')}>
				Curate Media
			</button>
			<a class="action-btn" href="/" target="_blank">
				View Storefront &#8599;
			</a>
		</div>
	{/if}
</div>

<style>
	.dashboard {
		padding: 24px;
		max-width: 1200px;
	}

	.page-header {
		margin-bottom: 24px;
	}

	.page-title {
		font-size: 22px;
		font-weight: 700;
		color: var(--color-text);
		margin: 0;
	}

	.page-subtitle {
		font-size: 13px;
		color: var(--color-text-muted);
		margin: 4px 0 0;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 16px;
		margin-bottom: 24px;
	}

	.dashboard-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 16px;
		margin-bottom: 24px;
	}

	.dashboard-section {
		background: var(--color-card-bg);
		border: 1px solid var(--color-card-border);
		border-radius: 12px;
		padding: 20px;
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 16px;
	}

	.section-title {
		font-size: 14px;
		font-weight: 700;
		color: var(--color-text);
		margin: 0;
	}

	.section-link {
		font-size: 12px;
		font-weight: 500;
		color: var(--color-accent);
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
	}

	.section-link:hover {
		color: var(--color-accent-hover);
	}

	.mini-list {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.mini-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 12px;
		background: none;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		width: 100%;
		text-align: left;
		transition: background 0.15s;
	}

	.mini-row:hover {
		background: var(--color-surface-hover);
	}

	.mini-row-left {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.mini-primary {
		font-size: 13px;
		font-weight: 500;
		color: var(--color-text);
	}

	.mini-secondary {
		font-size: 13px;
		color: var(--color-text-muted);
	}

	.stock-count {
		font-size: 12px;
		font-weight: 600;
		color: var(--color-warning);
	}

	.stock-count.zero {
		color: var(--color-danger);
	}

	.empty-text {
		font-size: 13px;
		color: var(--color-text-dim);
		margin: 0;
		padding: 12px 0;
	}

	.quick-actions {
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
	}

	.action-btn {
		padding: 10px 20px;
		font-size: 13px;
		font-weight: 600;
		background: var(--color-surface-raised);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		color: var(--color-text-muted);
		cursor: pointer;
		text-decoration: none;
		transition: color 0.15s, border-color 0.15s;
	}

	.action-btn:hover {
		color: var(--color-text);
		border-color: var(--color-accent);
	}

	.loading-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 16px;
	}

	.skeleton-card {
		height: 100px;
		background: var(--color-surface-raised);
		border-radius: 12px;
		animation: pulse 1.5s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 0.4; }
		50% { opacity: 0.7; }
	}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/routes/admin/+page.svelte
git commit -m "feat: add admin dashboard with stats, recent orders, low stock, quick actions"
```

---

## Task 10: Products Pages

**Files:**
- Create: `src/routes/admin/products/+page.svelte`
- Create: `src/routes/admin/products/drafts/+page.svelte`
- Create: `src/routes/admin/products/new/+page.svelte`
- Create: `src/routes/admin/products/[id]/+page.svelte`
- Create: `src/lib/admin/components/products/ProductForm.svelte`
- Create: `src/lib/admin/components/products/ProductList.svelte`

This is the largest task. The ProductForm and ProductList are extracted as components since they're reused across routes.

- [ ] **Step 1: Create ProductList component**

Create `src/lib/admin/components/products/ProductList.svelte`:

```svelte
<script lang="ts">
	import { goto } from '$app/navigation';
	import SearchInput from '$lib/admin/components/ui/SearchInput.svelte';
	import StatusBadge from '$lib/admin/components/ui/StatusBadge.svelte';
	import EmptyState from '$lib/admin/components/ui/EmptyState.svelte';
	import ConfirmDialog from '$lib/admin/components/ui/ConfirmDialog.svelte';
	import { productService } from '$lib/admin/services/products';
	import { formatPrice, getTotalStock } from '$lib/types/product';
	import type { Product } from '$lib/types/product';
	import { browser } from '$app/environment';

	interface Props {
		filterAvailability?: string;
	}

	const { filterAvailability }: Props = $props();

	let products = $state<Product[]>([]);
	let loading = $state(true);
	let searchQuery = $state('');
	let deleteTarget = $state<Product | null>(null);

	$effect(() => {
		if (!browser) return;
		loadProducts();
	});

	async function loadProducts() {
		loading = true;
		try {
			if (filterAvailability === 'draft') {
				products = await productService.getDrafts();
			} else {
				products = await productService.getAll();
			}
		} catch (e) {
			console.error('Failed to load products:', e);
		} finally {
			loading = false;
		}
	}

	let filtered = $derived.by(() => {
		let result = products;
		if (filterAvailability && filterAvailability !== 'draft') {
			result = result.filter(p => p.availability === filterAvailability);
		}
		if (searchQuery) {
			const q = searchQuery.toLowerCase();
			result = result.filter(p =>
				p.title.toLowerCase().includes(q) ||
				p.garmentType.toLowerCase().includes(q)
			);
		}
		return result;
	});

	async function handleDelete() {
		if (!deleteTarget) return;
		try {
			await productService.delete(deleteTarget.id);
			products = products.filter(p => p.id !== deleteTarget!.id);
		} catch (e) {
			console.error('Delete failed:', e);
		}
		deleteTarget = null;
	}
</script>

<div class="product-list">
	<div class="list-header">
		<SearchInput bind:value={searchQuery} onchange={() => {}} placeholder="Search products..." />
		<button class="btn-primary" onclick={() => goto('/admin/products/new')}>
			+ New Product
		</button>
	</div>

	{#if loading}
		<div class="loading-rows">
			{#each Array(5) as _}
				<div class="skeleton-row"></div>
			{/each}
		</div>
	{:else if filtered.length === 0}
		<EmptyState
			title="No products found"
			description={searchQuery ? 'Try a different search term' : 'Create your first product to get started'}
			actionLabel={searchQuery ? undefined : '+ New Product'}
			onaction={searchQuery ? undefined : () => goto('/admin/products/new')}
		/>
	{:else}
		<div class="table-wrapper">
			<table class="data-table">
				<thead>
					<tr>
						<th>Product</th>
						<th>Type</th>
						<th>Price</th>
						<th>Stock</th>
						<th>Status</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{#each filtered as product}
						<tr class="clickable-row" onclick={() => goto(`/admin/products/${product.id}`)}>
							<td class="product-name">{product.title}</td>
							<td class="product-type">{product.garmentType.replace('_', ' ')}</td>
							<td>{formatPrice(product.price)}</td>
							<td>
								<span class="stock" class:zero={getTotalStock(product.sizes) === 0}>
									{getTotalStock(product.sizes)}
								</span>
							</td>
							<td><StatusBadge status={product.availability} size="sm" /></td>
							<td>
								<button
									class="delete-btn"
									onclick|stopPropagation={() => deleteTarget = product}
									aria-label="Delete product"
								>
									&times;
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<ConfirmDialog
	open={!!deleteTarget}
	title="Delete Product"
	message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
	confirmLabel="Delete"
	danger
	onconfirm={handleDelete}
	oncancel={() => deleteTarget = null}
/>

<style>
	.product-list {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.list-header {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.list-header :global(.search-input) {
		flex: 1;
	}

	.btn-primary {
		padding: 8px 20px;
		font-size: 13px;
		font-weight: 600;
		background: var(--color-accent);
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		white-space: nowrap;
		transition: background 0.15s;
	}

	.btn-primary:hover {
		background: var(--color-accent-hover);
	}

	.table-wrapper {
		overflow-x: auto;
		border: 1px solid var(--color-table-border);
		border-radius: 10px;
	}

	.data-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 13px;
	}

	.data-table th {
		text-align: left;
		padding: 10px 16px;
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-dim);
		background: var(--color-table-header);
		border-bottom: 1px solid var(--color-table-border);
	}

	.data-table td {
		padding: 12px 16px;
		color: var(--color-text-muted);
		border-bottom: 1px solid var(--color-table-border);
	}

	.clickable-row {
		cursor: pointer;
		transition: background 0.15s;
	}

	.clickable-row:hover {
		background: var(--color-table-row-hover);
	}

	.product-name {
		font-weight: 600;
		color: var(--color-text);
	}

	.product-type {
		text-transform: capitalize;
	}

	.stock.zero {
		color: var(--color-danger);
		font-weight: 600;
	}

	.delete-btn {
		padding: 4px 8px;
		font-size: 16px;
		background: none;
		border: none;
		color: var(--color-text-dim);
		cursor: pointer;
		border-radius: 4px;
	}

	.delete-btn:hover {
		color: var(--color-danger);
		background: color-mix(in srgb, var(--color-danger) 10%, transparent);
	}

	.loading-rows {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.skeleton-row {
		height: 48px;
		background: var(--color-surface-raised);
		border-radius: 8px;
		animation: pulse 1.5s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 0.4; }
		50% { opacity: 0.7; }
	}
</style>
```

- [ ] **Step 2: Create ProductForm component**

Create `src/lib/admin/components/products/ProductForm.svelte`:

```svelte
<script lang="ts">
	import FormField from '$lib/admin/components/ui/FormField.svelte';
	import { goto } from '$app/navigation';
	import { productService } from '$lib/admin/services/products';
	import { mediaItemService } from '$lib/admin/services/media';
	import type { Product } from '$lib/types/product';
	import type { MediaItem } from '@austencloud/media-manager';
	import { ALL_GARMENT_TYPES, ALL_COLOR_FAMILIES, ALL_SIZES, formatPrice, generateSlug, type SizeVariant } from '$lib/types/product';
	import { browser } from '$app/environment';

	interface Props {
		product?: Product;
	}

	const { product }: Props = $props();

	let isNew = $derived(!product);

	// Form state
	let title = $state(product?.title ?? '');
	let description = $state(product?.description ?? '');
	let garmentType = $state(product?.garmentType ?? 'shirt');
	let colorFamily = $state(product?.colorFamily ?? 'rainbow');
	let material = $state(product?.material ?? '100% Cotton');
	let price = $state(product ? product.price / 100 : 55);
	let compareAtPrice = $state(product?.compareAtPrice ? product.compareAtPrice / 100 : 0);
	let availability = $state(product?.availability ?? 'draft');
	let isOneOfAKind = $state(product?.isOneOfAKind ?? true);
	let featured = $state(product?.featured ?? false);
	let sizes = $state<Record<string, SizeVariant>>(product?.sizes ?? {});
	let mediaItemIds = $state<string[]>(product?.mediaItemIds ?? []);
	let heroImageIndex = $state(product?.heroImageIndex ?? 0);

	let saving = $state(false);
	let error = $state<string | null>(null);

	// Media items for image picker
	let allMediaItems = $state<MediaItem[]>([]);
	let showImagePicker = $state(false);

	$effect(() => {
		if (!browser) return;
		mediaItemService.getAll().then(items => { allMediaItems = items; });
	});

	let selectedMedia = $derived(
		mediaItemIds
			.map(id => allMediaItems.find(m => m.id === id))
			.filter(Boolean) as MediaItem[]
	);

	function addSize(size: string) {
		if (sizes[size]) return;
		sizes = { ...sizes, [size]: { stock: isOneOfAKind ? 1 : 0 } };
	}

	function removeSize(size: string) {
		const { [size]: _, ...rest } = sizes;
		sizes = rest;
	}

	function updateStock(size: string, stock: number) {
		sizes = { ...sizes, [size]: { ...sizes[size], stock } };
	}

	function toggleMediaItem(id: string) {
		if (mediaItemIds.includes(id)) {
			mediaItemIds = mediaItemIds.filter(i => i !== id);
		} else {
			mediaItemIds = [...mediaItemIds, id];
		}
	}

	async function handleSave() {
		if (!title.trim()) { error = 'Title is required'; return; }
		if (price <= 0) { error = 'Price must be greater than 0'; return; }
		if (Object.keys(sizes).length === 0) { error = 'Add at least one size'; return; }

		saving = true;
		error = null;

		try {
			const data = {
				title: title.trim(),
				slug: generateSlug(title),
				description: description.trim(),
				garmentType: garmentType as any,
				techniques: [],
				colorway: [],
				colorFamily: colorFamily as any,
				sizes,
				material,
				price: Math.round(price * 100),
				compareAtPrice: compareAtPrice > 0 ? Math.round(compareAtPrice * 100) : undefined,
				availability: availability as any,
				isOneOfAKind,
				featured,
				mediaItemIds,
				heroImageIndex
			};

			if (product) {
				await productService.update(product.id, data);
				goto(`/admin/products/${product.id}`);
			} else {
				const id = await productService.add(data as any);
				goto(`/admin/products/${id}`);
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Save failed';
		} finally {
			saving = false;
		}
	}
</script>

<div class="product-form">
	<div class="form-header">
		<h1 class="form-title">{isNew ? 'New Product' : `Edit: ${product?.title}`}</h1>
		<div class="form-actions">
			<button class="btn-secondary" onclick={() => goto('/admin/products')}>Cancel</button>
			<button class="btn-primary" onclick={handleSave} disabled={saving}>
				{saving ? 'Saving...' : 'Save Product'}
			</button>
		</div>
	</div>

	{#if error}
		<div class="form-error">{error}</div>
	{/if}

	<div class="form-layout">
		<!-- Left column: form fields -->
		<div class="form-fields">
			<FormField label="Title" required>
				<input type="text" bind:value={title} placeholder="Blue Mandala Tee" />
			</FormField>

			<FormField label="Description">
				<textarea bind:value={description} placeholder="Describe this piece..." rows="4"></textarea>
			</FormField>

			<div class="form-row">
				<FormField label="Garment Type" required>
					<select bind:value={garmentType}>
						{#each ALL_GARMENT_TYPES as type}
							<option value={type}>{type.replace('_', ' ')}</option>
						{/each}
					</select>
				</FormField>

				<FormField label="Color Family">
					<select bind:value={colorFamily}>
						{#each ALL_COLOR_FAMILIES as cf}
							<option value={cf}>{cf}</option>
						{/each}
					</select>
				</FormField>
			</div>

			<div class="form-row">
				<FormField label="Price ($)" required>
					<input type="number" bind:value={price} min="0" step="0.01" />
				</FormField>

				<FormField label="Compare At ($)">
					<input type="number" bind:value={compareAtPrice} min="0" step="0.01" placeholder="0" />
				</FormField>
			</div>

			<FormField label="Material">
				<input type="text" bind:value={material} />
			</FormField>

			<div class="form-row">
				<FormField label="Availability">
					<select bind:value={availability}>
						<option value="draft">Draft</option>
						<option value="available">Available</option>
						<option value="sold">Sold</option>
						<option value="archived">Archived</option>
					</select>
				</FormField>

				<div class="toggle-group">
					<label class="toggle-label">
						<input type="checkbox" bind:checked={isOneOfAKind} />
						One of a Kind
					</label>
					<label class="toggle-label">
						<input type="checkbox" bind:checked={featured} />
						Featured
					</label>
				</div>
			</div>

			<!-- Sizes -->
			<div class="sizes-section">
				<h3 class="section-label">Sizes & Stock</h3>
				<div class="size-chips">
					{#each ALL_SIZES as size}
						{#if sizes[size]}
							<div class="size-row">
								<span class="size-label">{size}</span>
								<input
									type="number"
									class="stock-input"
									value={sizes[size].stock}
									onchange={(e) => updateStock(size, parseInt((e.target as HTMLInputElement).value) || 0)}
									min="0"
								/>
								<button class="remove-size" onclick={() => removeSize(size)}>&times;</button>
							</div>
						{:else}
							<button class="add-size-chip" onclick={() => addSize(size)}>{size}</button>
						{/if}
					{/each}
				</div>
			</div>
		</div>

		<!-- Right column: images -->
		<div class="form-images">
			<h3 class="section-label">Images</h3>
			{#if selectedMedia.length > 0}
				<div class="image-preview-grid">
					{#each selectedMedia as media, i}
						<div class="image-preview" class:hero={i === heroImageIndex}>
							<img
								src={media.thumbnailUrl || media.url || ''}
								alt={media.suggestedName || media.filename || ''}
							/>
							<div class="image-overlay">
								<button class="hero-btn" onclick={() => heroImageIndex = i}>
									{i === heroImageIndex ? '★' : '☆'}
								</button>
								<button class="remove-img-btn" onclick={() => toggleMediaItem(media.id)}>
									&times;
								</button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
			<button class="btn-secondary" onclick={() => showImagePicker = !showImagePicker}>
				{showImagePicker ? 'Hide Media' : 'Choose Images'}
			</button>

			{#if showImagePicker}
				<div class="image-picker-grid">
					{#each allMediaItems.slice(0, 50) as media}
						<button
							class="picker-thumb"
							class:selected={mediaItemIds.includes(media.id)}
							onclick={() => toggleMediaItem(media.id)}
						>
							<img
								src={media.thumbnailUrl || media.url || ''}
								alt={media.filename || ''}
							/>
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.product-form {
		padding: 24px;
		max-width: 1100px;
	}

	.form-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 24px;
		flex-wrap: wrap;
		gap: 12px;
	}

	.form-title {
		font-size: 20px;
		font-weight: 700;
		color: var(--color-text);
		margin: 0;
	}

	.form-actions {
		display: flex;
		gap: 8px;
	}

	.form-error {
		padding: 10px 16px;
		font-size: 13px;
		color: var(--color-danger);
		background: color-mix(in srgb, var(--color-danger) 10%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-danger) 25%, transparent);
		border-radius: 8px;
		margin-bottom: 16px;
	}

	.form-layout {
		display: grid;
		grid-template-columns: 1fr 320px;
		gap: 24px;
	}

	@media (max-width: 900px) {
		.form-layout {
			grid-template-columns: 1fr;
		}
	}

	.form-fields {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}

	.section-label {
		font-size: 13px;
		font-weight: 700;
		color: var(--color-text);
		margin: 0 0 12px;
	}

	/* Toggles */
	.toggle-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
		justify-content: flex-end;
	}

	.toggle-label {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 13px;
		color: var(--color-text-muted);
		cursor: pointer;
	}

	.toggle-label input[type="checkbox"] {
		accent-color: var(--color-accent);
	}

	/* Sizes */
	.sizes-section {
		padding-top: 8px;
	}

	.size-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		align-items: center;
	}

	.size-row {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 4px 8px;
		background: var(--color-surface-overlay);
		border-radius: 8px;
	}

	.size-label {
		font-size: 13px;
		font-weight: 600;
		color: var(--color-text);
		min-width: 28px;
	}

	.stock-input {
		width: 50px;
		padding: 4px 6px;
		font-size: 13px;
		background: var(--color-input-bg);
		border: 1px solid var(--color-input-border);
		border-radius: 6px;
		color: var(--color-text);
		text-align: center;
		font-family: inherit;
	}

	.remove-size {
		padding: 2px 6px;
		font-size: 14px;
		background: none;
		border: none;
		color: var(--color-text-dim);
		cursor: pointer;
	}

	.remove-size:hover {
		color: var(--color-danger);
	}

	.add-size-chip {
		padding: 6px 14px;
		font-size: 12px;
		font-weight: 600;
		background: none;
		border: 1px dashed var(--color-border);
		border-radius: 8px;
		color: var(--color-text-dim);
		cursor: pointer;
		transition: border-color 0.15s, color 0.15s;
	}

	.add-size-chip:hover {
		border-color: var(--color-accent);
		color: var(--color-text);
	}

	/* Images */
	.form-images {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.image-preview-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
	}

	.image-preview {
		position: relative;
		border-radius: 8px;
		overflow: hidden;
		border: 2px solid transparent;
		aspect-ratio: 1;
	}

	.image-preview.hero {
		border-color: var(--color-accent);
	}

	.image-preview img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.image-overlay {
		position: absolute;
		top: 4px;
		right: 4px;
		display: flex;
		gap: 4px;
		opacity: 0;
		transition: opacity 0.15s;
	}

	.image-preview:hover .image-overlay {
		opacity: 1;
	}

	.hero-btn, .remove-img-btn {
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		border-radius: 4px;
		font-size: 14px;
		cursor: pointer;
		background: rgba(0, 0, 0, 0.6);
		color: white;
	}

	.image-picker-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 6px;
		max-height: 400px;
		overflow-y: auto;
		padding: 8px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 8px;
	}

	.picker-thumb {
		aspect-ratio: 1;
		border-radius: 6px;
		overflow: hidden;
		border: 2px solid transparent;
		cursor: pointer;
		padding: 0;
		background: none;
		transition: border-color 0.15s;
	}

	.picker-thumb.selected {
		border-color: var(--color-accent);
	}

	.picker-thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	/* Buttons */
	.btn-primary {
		padding: 8px 20px;
		font-size: 13px;
		font-weight: 600;
		background: var(--color-accent);
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		transition: background 0.15s;
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--color-accent-hover);
	}

	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-secondary {
		padding: 8px 16px;
		font-size: 13px;
		font-weight: 600;
		background: var(--color-surface-hover);
		color: var(--color-text-muted);
		border: none;
		border-radius: 8px;
		cursor: pointer;
		transition: background 0.15s;
	}

	.btn-secondary:hover {
		background: var(--color-surface-overlay);
		color: var(--color-text);
	}
</style>
```

- [ ] **Step 3: Create Products list page**

Create `src/routes/admin/products/+page.svelte`:

```svelte
<script lang="ts">
	import ProductList from '$lib/admin/components/products/ProductList.svelte';
</script>

<div class="page">
	<div class="page-header">
		<h1 class="page-title">Products</h1>
	</div>
	<ProductList />
</div>

<style>
	.page {
		padding: 24px;
		max-width: 1100px;
	}

	.page-header {
		margin-bottom: 20px;
	}

	.page-title {
		font-size: 20px;
		font-weight: 700;
		color: var(--color-text);
		margin: 0;
	}
</style>
```

- [ ] **Step 4: Create Drafts page**

Create `src/routes/admin/products/drafts/+page.svelte`:

```svelte
<script lang="ts">
	import ProductList from '$lib/admin/components/products/ProductList.svelte';
</script>

<div class="page">
	<div class="page-header">
		<h1 class="page-title">Drafts</h1>
	</div>
	<ProductList filterAvailability="draft" />
</div>

<style>
	.page {
		padding: 24px;
		max-width: 1100px;
	}

	.page-header {
		margin-bottom: 20px;
	}

	.page-title {
		font-size: 20px;
		font-weight: 700;
		color: var(--color-text);
		margin: 0;
	}
</style>
```

- [ ] **Step 5: Create New Product page**

Create `src/routes/admin/products/new/+page.svelte`:

```svelte
<script lang="ts">
	import ProductForm from '$lib/admin/components/products/ProductForm.svelte';
</script>

<ProductForm />
```

- [ ] **Step 6: Create Product Editor page**

Create `src/routes/admin/products/[id]/+page.svelte`:

```svelte
<script lang="ts">
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import ProductForm from '$lib/admin/components/products/ProductForm.svelte';
	import { productService } from '$lib/admin/services/products';
	import type { Product } from '$lib/types/product';

	let product = $state<Product | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	$effect(() => {
		if (!browser) return;
		const id = page.params.id;
		if (id) loadProduct(id);
	});

	async function loadProduct(id: string) {
		loading = true;
		try {
			product = await productService.get(id);
			if (!product) error = 'Product not found';
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load product';
		} finally {
			loading = false;
		}
	}
</script>

{#if loading}
	<div class="loading">
		<div class="spinner"></div>
	</div>
{:else if error}
	<div class="error-page">
		<p>{error}</p>
		<a href="/admin/products">Back to products</a>
	</div>
{:else if product}
	<ProductForm {product} />
{/if}

<style>
	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 300px;
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--color-border);
		border-top-color: var(--color-accent);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.error-page {
		padding: 48px 24px;
		text-align: center;
		color: var(--color-text-muted);
	}

	.error-page a {
		color: var(--color-accent);
	}
</style>
```

- [ ] **Step 7: Commit**

```bash
git add src/lib/admin/components/products/ src/routes/admin/products/
git commit -m "feat: add product management pages (list, create, edit, drafts)"
```

---

## Task 11: Orders Pages

**Files:**
- Create: `src/routes/admin/orders/+page.svelte`
- Create: `src/routes/admin/orders/pending/+page.svelte`
- Create: `src/routes/admin/orders/fulfilled/+page.svelte`
- Create: `src/routes/admin/orders/[id]/+page.svelte`

- [ ] **Step 1: Create Orders list page**

Create `src/routes/admin/orders/+page.svelte`. This will be a table of all orders with status filter, search, and click-to-detail. Use the same patterns as ProductList but for orders: StatusBadge, SearchInput, EmptyState. Filter by status param, search by customer name/email.

- [ ] **Step 2: Create Pending orders page** (pre-filtered)

Create `src/routes/admin/orders/pending/+page.svelte` — same as orders list but filtered to 'pending'.

- [ ] **Step 3: Create Fulfilled orders page** (pre-filtered)

Create `src/routes/admin/orders/fulfilled/+page.svelte` — same but filtered to 'shipped' | 'delivered'.

- [ ] **Step 4: Create Order Detail page**

Create `src/routes/admin/orders/[id]/+page.svelte`. Shows: customer info card, items list with thumbnails, financial summary (subtotal/shipping/tax/total), status update dropdown, tracking number/carrier inputs, "Mark as Shipped" / "Mark as Delivered" buttons, admin notes textarea, refund button with ConfirmDialog.

- [ ] **Step 5: Commit**

```bash
git add src/routes/admin/orders/
git commit -m "feat: add order management pages (list, pending, fulfilled, detail)"
```

---

## Task 12: Inventory Pages

**Files:**
- Create: `src/routes/admin/inventory/+page.svelte`
- Create: `src/routes/admin/inventory/low/+page.svelte`

- [ ] **Step 1: Create Stock Levels page**

Create `src/routes/admin/inventory/+page.svelte`. Table of all products × sizes with InlineEdit for stock counts. Color-coded: red for 0, yellow for <=threshold, green for above. Sort by stock level ascending. Filter by garment type.

- [ ] **Step 2: Create Low Stock page**

Create `src/routes/admin/inventory/low/+page.svelte`. Same view pre-filtered to stock <= threshold from settings.

- [ ] **Step 3: Commit**

```bash
git add src/routes/admin/inventory/
git commit -m "feat: add inventory pages (stock levels, low stock)"
```

---

## Task 13: Settings Pages

**Files:**
- Create: `src/routes/admin/settings/+page.svelte`
- Create: `src/routes/admin/settings/stripe/+page.svelte`
- Move: `src/routes/admin/seed/` → `src/routes/admin/settings/seed/`

- [ ] **Step 1: Create General Settings page**

Create `src/routes/admin/settings/+page.svelte`. Form with: store name, store email, currency select, tax rate, low stock threshold, repeatable shipping rates (label + price + estimated days). Save button updates `settings/store` doc via settingsService.

- [ ] **Step 2: Create Stripe Settings page**

Create `src/routes/admin/settings/stripe/+page.svelte`. Shows: publishable key input, secret key status (reads env), webhook secret status, "Test Connection" button, link to Stripe Dashboard. Instructions for setting env vars.

- [ ] **Step 3: Relocate seed page**

Move existing seed files:
- `src/routes/admin/seed/+page.svelte` → `src/routes/admin/settings/seed/+page.svelte`
- `src/routes/admin/seed/+page.server.ts` → `src/routes/admin/settings/seed/+page.server.ts`

Delete old `src/routes/admin/seed/` directory.

- [ ] **Step 4: Commit**

```bash
git add src/routes/admin/settings/ && git rm -r src/routes/admin/seed/ 2>/dev/null; git add -A src/routes/admin/seed/ src/routes/admin/settings/
git commit -m "feat: add settings pages (general, stripe, seed data relocated)"
```

---

## Task 14: Media Curate Route

**Files:**
- Create: `src/routes/admin/media/curate/+page.svelte`

- [ ] **Step 1: Extract curator to its own route**

Create `src/routes/admin/media/curate/+page.svelte`. Move the curator-specific logic from the media page into this standalone page. Import `createMediaCurator`, `MediaSpotlightCurator` from `@austencloud/media-manager`. Load items with `needsReview: true`, provide full tagging functionality.

- [ ] **Step 2: Commit**

```bash
git add src/routes/admin/media/curate/
git commit -m "feat: add standalone media curate page as /admin/media/curate"
```

---

## Task 15: Server-Side Endpoints (Stripe)

**Files:**
- Create: `src/lib/server/firebase-admin.ts`
- Create: `src/routes/api/checkout/+server.ts`
- Create: `src/routes/api/webhooks/stripe/+server.ts`
- Create: `src/routes/api/products/sync/+server.ts`

- [ ] **Step 1: Create Firebase Admin init**

Create `src/lib/server/firebase-admin.ts`:

```typescript
import { initializeApp, cert, getApps, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

function initAdmin() {
	if (getApps().length > 0) {
		return getFirestore();
	}

	const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
	if (!credPath) {
		throw new Error('GOOGLE_APPLICATION_CREDENTIALS env var not set');
	}

	const serviceAccount = JSON.parse(readFileSync(credPath, 'utf-8')) as ServiceAccount;
	initializeApp({ credential: cert(serviceAccount) });
	return getFirestore();
}

export const adminDb = initAdmin();
```

- [ ] **Step 2: Create checkout endpoint**

Create `src/routes/api/checkout/+server.ts`:

```typescript
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Stripe from 'stripe';
import { adminDb } from '$lib/server/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-12-18.acacia' });

export const POST: RequestHandler = async ({ request }) => {
	const { items } = await request.json();

	if (!items || !Array.isArray(items) || items.length === 0) {
		throw error(400, 'Cart is empty');
	}

	// Validate products exist and have stripe price IDs
	const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
	for (const item of items) {
		const doc = await adminDb.collection('products').doc(item.productId).get();
		if (!doc.exists) throw error(400, `Product ${item.productId} not found`);

		const product = doc.data()!;
		if (!product.stripePriceId) {
			throw error(400, `Product "${product.title}" is not yet available for purchase`);
		}
		if (product.availability !== 'available') {
			throw error(400, `Product "${product.title}" is not available`);
		}

		lineItems.push({
			price: product.stripePriceId,
			quantity: item.quantity || 1
		});
	}

	const session = await stripe.checkout.sessions.create({
		mode: 'payment',
		line_items: lineItems,
		shipping_address_collection: { allowed_countries: ['US'] },
		success_url: `${request.headers.get('origin')}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${request.headers.get('origin')}/checkout/cancel`
	});

	return json({ url: session.url });
};
```

- [ ] **Step 3: Create webhook endpoint**

Create `src/routes/api/webhooks/stripe/+server.ts`:

```typescript
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Stripe from 'stripe';
import { adminDb } from '$lib/server/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-12-18.acacia' });

export const POST: RequestHandler = async ({ request }) => {
	const rawBody = await request.text();
	const sig = request.headers.get('stripe-signature');

	if (!sig) throw error(400, 'Missing stripe-signature header');

	let event: Stripe.Event;
	try {
		event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
	} catch (e) {
		throw error(400, 'Invalid webhook signature');
	}

	if (event.type === 'checkout.session.completed') {
		const session = event.data.object as Stripe.Checkout.Session;
		await handleCheckoutComplete(session);
	}

	if (event.type === 'charge.refunded') {
		const charge = event.data.object as Stripe.Charge;
		await handleRefund(charge);
	}

	return json({ received: true });
};

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
	const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

	const orderItems = [];
	for (const item of lineItems.data) {
		const priceId = item.price?.id;
		if (!priceId) continue;

		// Find product by stripePriceId
		const snap = await adminDb.collection('products')
			.where('stripePriceId', '==', priceId)
			.limit(1)
			.get();

		if (!snap.empty) {
			const product = snap.docs[0].data();
			orderItems.push({
				productId: snap.docs[0].id,
				productTitle: product.title,
				size: 'M', // TODO: size selection from metadata
				price: item.amount_total || 0,
				quantity: item.quantity || 1
			});

			// Decrement stock
			// TODO: determine actual size from checkout metadata
		}
	}

	const shipping = session.shipping_details;
	await adminDb.collection('orders').add({
		stripeSessionId: session.id,
		stripePaymentIntentId: session.payment_intent,
		customerEmail: session.customer_details?.email || '',
		customerName: session.customer_details?.name || '',
		shippingAddress: shipping?.address ? {
			line1: shipping.address.line1 || '',
			line2: shipping.address.line2 || '',
			city: shipping.address.city || '',
			state: shipping.address.state || '',
			zip: shipping.address.postal_code || '',
			country: shipping.address.country || ''
		} : {},
		items: orderItems,
		subtotal: session.amount_subtotal || 0,
		shipping: session.total_details?.amount_shipping || 0,
		tax: session.total_details?.amount_tax || 0,
		total: session.amount_total || 0,
		status: 'paid',
		createdAt: new Date(),
		updatedAt: new Date()
	});
}

async function handleRefund(charge: Stripe.Charge) {
	const snap = await adminDb.collection('orders')
		.where('stripePaymentIntentId', '==', charge.payment_intent)
		.limit(1)
		.get();

	if (!snap.empty) {
		await snap.docs[0].ref.update({
			status: 'refunded',
			updatedAt: new Date()
		});
	}
}
```

- [ ] **Step 4: Create product sync endpoint**

Create `src/routes/api/products/sync/+server.ts`:

```typescript
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Stripe from 'stripe';
import { adminDb } from '$lib/server/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-12-18.acacia' });

export const POST: RequestHandler = async ({ request }) => {
	const { productId } = await request.json();
	if (!productId) throw error(400, 'productId required');

	const doc = await adminDb.collection('products').doc(productId).get();
	if (!doc.exists) throw error(404, 'Product not found');

	const product = doc.data()!;

	let stripeProduct: Stripe.Product;

	if (product.stripeProductId) {
		stripeProduct = await stripe.products.update(product.stripeProductId, {
			name: product.title,
			description: product.description,
			active: product.availability === 'available'
		});
	} else {
		stripeProduct = await stripe.products.create({
			name: product.title,
			description: product.description
		});
	}

	let stripePrice: Stripe.Price;
	if (product.stripePriceId) {
		// Prices are immutable in Stripe — create new if amount changed
		const existing = await stripe.prices.retrieve(product.stripePriceId);
		if (existing.unit_amount !== product.price) {
			await stripe.prices.update(product.stripePriceId, { active: false });
			stripePrice = await stripe.prices.create({
				product: stripeProduct.id,
				unit_amount: product.price,
				currency: 'usd'
			});
		} else {
			stripePrice = existing;
		}
	} else {
		stripePrice = await stripe.prices.create({
			product: stripeProduct.id,
			unit_amount: product.price,
			currency: 'usd'
		});
	}

	await doc.ref.update({
		stripeProductId: stripeProduct.id,
		stripePriceId: stripePrice.id,
		updatedAt: new Date()
	});

	return json({ stripeProductId: stripeProduct.id, stripePriceId: stripePrice.id });
};
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/server/firebase-admin.ts src/routes/api/
git commit -m "feat: add Stripe checkout, webhook, and product sync server endpoints"
```

---

## Task 16: Storefront Cart & Checkout

**Files:**
- Create: `src/lib/stores/cart.svelte.ts`
- Create: `src/routes/checkout/success/+page.svelte`
- Create: `src/routes/checkout/cancel/+page.svelte`

- [ ] **Step 1: Create cart store**

Create `src/lib/stores/cart.svelte.ts`:

```typescript
import type { CartItem } from '$lib/types/cart';
import { browser } from '$app/environment';

const CART_KEY = 'occ-cart';

function loadCart(): CartItem[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem(CART_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

function saveCart(items: CartItem[]) {
	if (!browser) return;
	localStorage.setItem(CART_KEY, JSON.stringify(items));
}

let items = $state<CartItem[]>(loadCart());

export const cart = {
	get items() { return items; },
	get count() { return items.reduce((sum, i) => sum + i.quantity, 0); },
	get subtotal() { return items.reduce((sum, i) => sum + i.price * i.quantity, 0); },

	add(item: Omit<CartItem, 'quantity'>, maxStock: number = 1) {
		const existing = items.find(i => i.productId === item.productId && i.size === item.size);
		if (existing) {
			if (existing.quantity >= maxStock) return;
			existing.quantity++;
			items = [...items];
		} else {
			items = [...items, { ...item, quantity: 1 }];
		}
		saveCart(items);
	},

	remove(productId: string, size: string) {
		items = items.filter(i => !(i.productId === productId && i.size === size));
		saveCart(items);
	},

	clear() {
		items = [];
		saveCart(items);
	},

	async checkout() {
		const res = await fetch('/api/checkout', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ items: items.map(i => ({ productId: i.productId, size: i.size, quantity: i.quantity })) })
		});

		if (!res.ok) {
			const data = await res.json();
			throw new Error(data.message || 'Checkout failed');
		}

		const { url } = await res.json();
		window.location.href = url;
	}
};
```

- [ ] **Step 2: Create checkout success page**

Create `src/routes/checkout/success/+page.svelte`:

```svelte
<script lang="ts">
	import { cart } from '$lib/stores/cart.svelte';
	import { browser } from '$app/environment';

	if (browser) {
		cart.clear();
	}
</script>

<div class="success-page">
	<div class="success-card">
		<div class="success-icon">&#10003;</div>
		<h1>Thank you for your order!</h1>
		<p>You'll receive a confirmation email shortly.</p>
		<a href="/shop" class="continue-btn">Continue Shopping</a>
	</div>
</div>

<style>
	.success-page {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		padding: 24px;
	}

	.success-card {
		text-align: center;
		max-width: 400px;
	}

	.success-icon {
		width: 64px;
		height: 64px;
		margin: 0 auto 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 32px;
		background: var(--color-success, #40b080);
		color: white;
		border-radius: 50%;
	}

	h1 {
		font-size: 24px;
		margin: 0 0 8px;
	}

	p {
		color: var(--color-muted, #666);
		margin: 0 0 24px;
	}

	.continue-btn {
		display: inline-block;
		padding: 12px 24px;
		background: var(--color-charcoal, #333);
		color: white;
		text-decoration: none;
		border-radius: 8px;
	}
</style>
```

- [ ] **Step 3: Create checkout cancel page**

Create `src/routes/checkout/cancel/+page.svelte`:

```svelte
<div class="cancel-page">
	<div class="cancel-card">
		<h1>Checkout cancelled</h1>
		<p>Your cart is still here. Come back when you're ready.</p>
		<a href="/shop" class="back-btn">Back to Shop</a>
	</div>
</div>

<style>
	.cancel-page {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		padding: 24px;
	}

	.cancel-card {
		text-align: center;
		max-width: 400px;
	}

	h1 {
		font-size: 24px;
		margin: 0 0 8px;
	}

	p {
		color: var(--color-muted, #666);
		margin: 0 0 24px;
	}

	.back-btn {
		display: inline-block;
		padding: 12px 24px;
		background: var(--color-charcoal, #333);
		color: white;
		text-decoration: none;
		border-radius: 8px;
	}
</style>
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/stores/cart.svelte.ts src/routes/checkout/
git commit -m "feat: add cart store with localStorage persistence and checkout success/cancel pages"
```

---

## Task 17: Verify & Polish

- [ ] **Step 1: Run dev server and verify all routes load**

```bash
cd F:/orion-cloud-creations && npm run dev
```

Visit each admin route and verify no errors:
- /admin (dashboard)
- /admin/login
- /admin/products
- /admin/products/new
- /admin/orders
- /admin/inventory
- /admin/media
- /admin/tags
- /admin/settings

- [ ] **Step 2: Run TypeScript check**

```bash
npm run check
```

Fix any type errors.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete OCC admin panel - dashboard, products, orders, inventory, settings, Stripe integration"
```
