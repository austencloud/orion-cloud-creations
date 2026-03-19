# Firestore-to-Storefront Integration

**Date:** 2026-03-18
**Status:** Design
**Scope:** Connect the OCC storefront to Firestore so products created in admin appear live with real images, are purchasable via Stripe, and decrement inventory on sale.

---

## Problem

The storefront reads from a hardcoded `src/lib/data/products.ts` file with 13 fake products. The admin writes to Firestore's `products` collection. These two systems are completely disconnected. Products created in admin never appear on the storefront. The 50 tagged photos in R2 (with working public URLs) are never displayed.

## Solution

Add SvelteKit server-side loaders (`+page.server.ts`) to each storefront route that query Firestore via `firebase-admin`, resolve `mediaItemIds` to R2 image URLs, and pass real product data to pages. Wire Stripe sync into the admin save flow and add inventory decrement to the checkout webhook.

---

## Architecture

```
Admin (client-side Firebase SDK)     Storefront (server-side Firebase Admin SDK)
         | writes                              | reads
    +--------------------------------------------------+
    |              Firestore `products`                 |
    |  (also: `mediaItems` for image URLs)             |
    +--------------------------------------------------+
                        | synced to
                   Stripe Products
                        | drives
                  Checkout -> Webhook -> Orders + Stock Decrement
```

No realtime sync. Server-side rendering on each request. Cache later if needed.

---

## Components

### 1. Server-Side Product Service (`src/lib/server/products.ts`)

Shared module used by all `+page.server.ts` loaders. Uses `firebase-admin` SDK.

**Functions:**
- `getAvailableProducts()` — products where `availability === 'available'`, ordered by `createdAt` desc
- `getFeaturedProducts()` — products where `featured === true` AND `availability === 'available'`
- `getAllDisplayableProducts()` — products where `availability !== 'draft'` (for gallery, includes sold)
- `getProductBySlug(slug: string)` — single product lookup by slug field
- `resolveProductImages(mediaItemIds: string[], heroImageIndex: number)` — batch-fetches `mediaItems` docs, returns `{ thumbnailUrl, originalUrl }[]` with hero image first

**Serialization:** Firestore `Timestamp` fields converted to ISO strings for SvelteKit serialization. Returns a plain object, not the `Product` type (which has `Date` fields).

**Image resolution strategy:** For list pages (shop, homepage, gallery), only resolve the hero image to minimize Firestore reads. For the product detail page, resolve all images.

### 2. Storefront Route Loaders

Each route gets a `+page.server.ts` that calls the server product service:

| Route | Loader | Query |
|-------|--------|-------|
| `/` (homepage) | `+page.server.ts` | `getFeaturedProducts()` with hero images |
| `/shop` | `+page.server.ts` | `getAvailableProducts()` with hero images |
| `/gallery` | `+page.server.ts` | `getAllDisplayableProducts()` with hero images |
| `/product/[slug]` | `+page.server.ts` | `getProductBySlug(slug)` with all images |

Each page component switches from static imports to `export let data` (SvelteKit load pattern).

### 3. Page Component Updates

**What changes in each page:**
- Remove `import { ... } from '$lib/data/products'`
- Add `let { data } = $props()` to receive server-loaded data
- Use `data.products` (or `data.product`) instead of calling static functions
- Render actual `<img>` tags with R2 URLs instead of "Photo coming soon" placeholders

**`ProductCard.svelte`:**
- Accept an `imageUrl: string` prop (the hero image thumbnail URL)
- Render `<img src={imageUrl}>` with a fallback for products with no media

### 4. Product Detail Image Gallery

The `/product/[slug]` page receives all resolved images. Display:
- Hero image large
- Thumbnail strip below for additional images
- Click thumbnail to swap main image
- Fallback placeholder if no images assigned

### 5. Stripe Sync on Admin Save

In the admin product create (`/admin/products/new`) and edit (`/admin/products/[id]`) pages:
- After successful Firestore save, call `/api/products/sync` with the product ID
- Show sync status (syncing/synced/failed) in the UI
- Products without `stripePriceId` can't be purchased — the checkout API already validates this

### 6. Inventory Decrement in Webhook

In `/api/webhooks/stripe/+server.ts`, after creating the order:
- For each line item, look up the product by `stripePriceId`
- Call `adminDb` to decrement `sizes.{size}.stock` by the quantity
- If stock hits 0 across all sizes, update `availability` to `'sold'`

**Size mapping:** The current webhook hardcodes `size: 'M'` for order items. This needs fixing — the cart should pass the selected size through to Stripe as metadata on the line item, and the webhook should read it back.

### 7. Firebase Admin Configuration

`src/lib/server/firebase-admin.ts` needs to support two modes:
- **File path:** `GOOGLE_APPLICATION_CREDENTIALS` env var pointing to a JSON file (dev)
- **Inline JSON:** `FIREBASE_SERVICE_ACCOUNT` env var containing the JSON string (deployment)

This is a small change to the existing `initAdmin()` function.

---

## Data Flow: End-to-End Product Lifecycle

1. **Tag photos** in admin media manager (already works — 50 photos tagged)
2. **Create product** in admin: set title, price, sizes, pick media items from tagged library
3. **Auto-sync to Stripe** on save → product gets `stripeProductId` + `stripePriceId`
4. **Storefront loads** from Firestore → resolves `mediaItemIds` → renders real R2 images
5. **Customer adds to cart** (localStorage) → clicks checkout
6. **Cart sends to `/api/checkout`** → validates against Firestore → creates Stripe session
7. **Customer pays** on Stripe hosted checkout
8. **Webhook fires** → creates order in Firestore → decrements stock
9. **Stock hits 0** → product marked as sold → moves from shop to gallery-only

---

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `src/lib/server/products.ts` | Create | Server-side product queries + image resolution |
| `src/lib/server/firebase-admin.ts` | Edit | Support inline JSON service account |
| `src/routes/+page.server.ts` | Create | Load featured products for homepage |
| `src/routes/+page.svelte` | Edit | Use loaded data instead of static imports |
| `src/routes/shop/+page.server.ts` | Create | Load available products |
| `src/routes/shop/+page.svelte` | Edit | Use loaded data |
| `src/routes/gallery/+page.server.ts` | Create | Load all non-draft products |
| `src/routes/gallery/+page.svelte` | Edit | Use loaded data |
| `src/routes/product/[slug]/+page.server.ts` | Create | Load single product with all images |
| `src/routes/product/[slug]/+page.svelte` | Edit | Use loaded data, render real image gallery |
| `src/lib/components/ProductCard.svelte` | Edit | Accept imageUrl prop, render real image |
| `src/routes/api/webhooks/stripe/+server.ts` | Edit | Add stock decrement + size from metadata |
| `src/routes/api/checkout/+server.ts` | Edit | Pass size as Stripe line item metadata |
| `src/routes/admin/products/new/+page.svelte` | Edit | Auto-sync to Stripe after save |
| `src/routes/admin/products/[id]/+page.svelte` | Edit | Auto-sync to Stripe after save |
| `src/lib/data/products.ts` | Keep | No longer imported by storefront; kept as reference |

---

## Out of Scope

- Customer accounts / order tracking
- Transactional emails
- SEO metadata (JSON-LD, OG tags)
- Newsletter integration
- Image optimization (WebP, srcset)
- Caching / ISR
- Admin product creation from media tags (auto-populate fields from tags) — nice-to-have enhancement, not blocking

---

## Prerequisites

- Firebase service account JSON (download from Firebase Console → Project Settings → Service Accounts)
- `GOOGLE_APPLICATION_CREDENTIALS` or `FIREBASE_SERVICE_ACCOUNT` env var set
- At least one product created in admin to verify the flow
- Stripe keys configured (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `VITE_STRIPE_PUBLIC_KEY`)

---

## Success Criteria

1. Products created in admin appear on the storefront with real R2 images
2. Product detail page shows full image gallery from assigned media items
3. Shop page only shows available products; gallery shows available + sold
4. Cart → checkout → Stripe payment → order created → stock decremented
5. Product auto-sold-out when all size stocks hit 0
6. No references to static `products.ts` in storefront routes
