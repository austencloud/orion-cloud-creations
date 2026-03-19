# OCC Comprehensive Admin Panel — Design Spec

**Date:** 2026-03-17
**Status:** Approved
**Stack:** SvelteKit 5 + Svelte 5 runes + Firestore + Stripe Checkout + R2 + Firebase Auth
**CSS:** Scoped styles with CSS custom properties (no Tailwind in new code)

---

## Overview

Transform the existing media-only admin (`/admin`) into a full business management tool for Orion Cloud Creations. The admin handles products, orders, inventory, media, tags, and store settings — everything needed to run a one-of-a-kind tie-dye clothing business.

**Key architectural decisions:**
- Firestore for all structured data (products, orders, settings) alongside existing media collections
- Stripe Checkout for payments (no monthly fees, redirect-based)
- R2 for image assets (already configured)
- Firebase Auth (Google sign-in) for admin access
- `@austencloud/sidebar` shared package for navigation (same pattern as Ringmaster/TKA)
- Scoped CSS with `--color-*` tokens, dark theme

---

## 1. Navigation & Layout

### Sidebar

Consume `@austencloud/sidebar` with OCC-specific module definitions.

**Modules:**

| Module | Icon | Color | Sections |
|--------|------|-------|----------|
| Dashboard | `chart-line` | accent (purple) | — |
| Products | `shirt` | teal | All Products, Drafts |
| Orders | `receipt` | gold | All Orders, Pending, Fulfilled |
| Inventory | `boxes-stacked` | green | Stock Levels, Low Stock |
| Media | `images` | cyan | Library, Curate |
| Tags | `tags` | pink | — |
| Settings | `gear` | gray | General, Stripe, Seed Data |

**Layout structure:**
- Desktop (>=1024px): Fixed left sidebar (220px expanded, 64px collapsed), main content offset by margin-left
- Mobile (<1024px): Hidden sidebar, hamburger in top bar, bottom-sheet nav via `@austencloud/drawer` or inline mobile nav
- Collapse state persisted to localStorage key `"occ-admin-sidebar-collapsed"`
- Dark theme: existing `--color-*` tokens from admin.css, scoped via `.admin-theme`

**Header snippet:** "OCC Admin" branding with accent gradient
**Footer snippet:** User avatar + sign-out, "View Storefront" link

### Route Map

```
/admin                     → Dashboard
/admin/products            → Products > All Products
/admin/products/drafts     → Products > Drafts
/admin/products/[id]       → Product Editor (detail page)
/admin/products/new        → Product Editor (create mode)
/admin/orders              → Orders > All Orders
/admin/orders/pending      → Orders > Pending
/admin/orders/fulfilled    → Orders > Fulfilled
/admin/orders/[id]         → Order Detail
/admin/inventory           → Inventory > Stock Levels
/admin/inventory/low       → Inventory > Low Stock
/admin/media               → Media > Library (existing)
/admin/media/curate        → Media > Curate (existing curator)
/admin/tags                → Tags (existing)
/admin/settings            → Settings > General
/admin/settings/stripe     → Settings > Stripe
/admin/settings/seed       → Settings > Seed Data (existing seed page, relocated)
```

---

## 2. Data Model

### Products Collection (`products`)

```typescript
interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  garmentType: GarmentType;
  techniques: string[];        // tag IDs from mediaTags
  colorway: string[];          // tag IDs from mediaTags
  colorFamily: ColorFamily;
  sizes: Record<Size, SizeVariant>;  // map keyed by size for atomic Firestore updates
  material: string;
  price: number;               // cents
  compareAtPrice?: number;     // optional sale "was" price
  availability: 'available' | 'sold' | 'draft' | 'archived';
  isOneOfAKind: boolean;
  featured: boolean;
  mediaItemIds: string[];      // references to mediaItems collection
  heroImageIndex: number;      // which mediaItem is primary
  stripeProductId?: string;
  stripePriceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SizeVariant {
  stock: number;               // enables atomic FieldValue.increment(-1) on sizes.M.stock
  sku?: string;
}
// Key is the Size string ("S", "M", "L", etc.)
// Map structure allows: updateDoc(ref, { "sizes.M.stock": increment(-1) })
```

### Orders Collection (`orders`)

```typescript
interface Order {
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
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'refunded' | 'cancelled';
  trackingNumber?: string;
  trackingCarrier?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface OrderItem {
  productId: string;
  productTitle: string;
  size: Size;
  price: number;
  quantity: number;
  thumbnailUrl?: string;
}

interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}
```

### Settings Document (`settings/store`)

```typescript
interface StoreSettings {
  storeName: string;
  storeEmail: string;
  currency: string;
  stripePublishableKey?: string;
  shippingRates: ShippingRate[];
  taxRate: number;
  lowStockThreshold: number;
}

interface ShippingRate {
  label: string;
  price: number;
  estimatedDays: string;
}
```

**Note:** Stripe secret key and webhook secret are env vars only (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`), never stored in Firestore.

### Existing Collections (unchanged)

- `mediaTags` — tag definitions (name, color, category)
- `mediaItems` — photo entries (filename, tags[], URLs, needsReview)
- `mediaLibraryState` — UI state (single doc)

---

## 3. Authentication

### Firebase Auth with Google Sign-in

- Single admin user (Austen's Google account)
- Firestore security rules check `request.auth.uid == "<austen-uid>"` for write operations
- Read access on products/settings stays public (storefront needs it)
- Admin layout checks auth state on mount — redirects to login if not authenticated

### Login Page (`/admin/login`)

- Minimal dark-themed page with OCC branding
- Single "Sign in with Google" button
- On success, redirect to `/admin`
- On failure, show error message

### Auth Guard

- `+layout.svelte` checks `onAuthStateChanged`
- If not authenticated and not on `/admin/login`, redirect to login
- Auth state exposed via context so child pages can access user info

---

## 4. Stripe Integration

### Checkout Flow

1. Customer clicks "Buy" on storefront product page
2. SvelteKit server endpoint (`/api/checkout`) creates a Stripe Checkout Session
3. Customer redirected to Stripe's hosted checkout
4. On success, Stripe redirects to `/checkout/success?session_id={id}`
5. Stripe webhook (`/api/webhooks/stripe`) fires `checkout.session.completed`
6. Webhook handler creates Order document in Firestore, decrements stock

### Product Sync

- When admin creates/edits a product with `availability: 'available'`, sync to Stripe:
  - Create/update Stripe Product (name, description, images)
  - Create/update Stripe Price (amount in cents)
  - Store `stripeProductId` and `stripePriceId` on the Firestore document
- When product goes to `draft`/`archived`/`sold`, deactivate the Stripe Product

### Server Endpoints

```
POST /api/checkout          — Create Stripe Checkout Session
POST /api/webhooks/stripe   — Handle Stripe webhook events
POST /api/products/sync     — Sync product to Stripe (called from admin)
```

### Webhook Events Handled

- `checkout.session.completed` → Create order, decrement inventory
- `charge.refunded` → Update order status to 'refunded'

---

## 5. Admin Pages

### Dashboard (`/admin`)

At-a-glance business overview with stat cards and recent activity.

**Stat cards (top row):**
- Total Revenue (this month) — sum of completed orders
- Orders (this month) — count
- Products Listed — count of available products
- Items Needing Review — count of media items with `needsReview: true`

**Sections below:**
- Recent Orders — last 5 orders with status badges, click to detail
- Low Stock Alerts — products where any SizeVariant has stock <= threshold
- Quick Actions — "Add Product", "Curate Media", "View Storefront" buttons

**Data loading:** Server load function queries Firestore aggregates. Stats computed from collection queries (at this scale, client-side aggregation is fine — no need for Cloud Functions).

### Products — All Products (`/admin/products`)

**Layout:** Table/list view with columns: thumbnail, title, garment type, price, availability, stock total, actions.

**Features:**
- Search by title
- Filter by availability (available/draft/sold/archived)
- Filter by garment type
- Sort by title, price, date created
- Click row → navigate to product editor
- "New Product" button → `/admin/products/new`
- Bulk actions: archive, delete (with confirmation)

**Empty state:** Illustration + "No products yet. Create your first product." CTA.

### Products — Drafts (`/admin/products/drafts`)

Same as All Products but pre-filtered to `availability: 'draft'`. These are products being prepared but not yet live.

### Product Editor (`/admin/products/[id]` and `/admin/products/new`)

**Two-column layout:**
- Left (wide): Form fields
- Right (narrow): Image picker + preview

**Form fields:**
- Title (text input)
- Description (textarea)
- Garment Type (select from GarmentType union)
- Techniques (tag picker — pulls from mediaTags with category 'technique')
- Colorway (tag picker — pulls from mediaTags with category 'color')
- Color Family (select from ColorFamily union)
- Material (text input, defaults to "100% Cotton")
- Price (number input, displayed as dollars, stored as cents)
- Compare At Price (optional, for showing "was $X" on sale items)
- One of a Kind (toggle)
- Featured (toggle)
- Availability (select: available/draft/sold/archived)

**Size & Stock section:**
- List of size rows, each with: size label, stock count input, optional SKU
- "Add Size" button to add rows
- For one-of-a-kind items, typically one size with stock=1

**Image picker (right column):**
- Pulls from media library (mediaItems collection)
- Grid of thumbnails, click to select/deselect
- Drag to reorder selected images
- First image (or heroImageIndex) shown large as preview
- "Open Media Library" link to go to /admin/media for full management

**Save behavior:**
- Auto-generates slug from title on create
- Validates required fields
- On save with `availability: 'available'`, offers to sync to Stripe
- Optimistic update pattern (same as media tagging)

### Orders — All Orders (`/admin/orders`)

**Layout:** Table with columns: order #, customer, items summary, total, status, date, actions.

**Features:**
- Filter by status (pending/paid/shipped/delivered/refunded/cancelled)
- Search by customer name/email or order ID
- Sort by date (newest first default), total
- Click row → order detail
- Status badge with semantic colors (pending=warning, paid=accent, shipped=cyan, delivered=success, refunded=danger)

**Empty state:** "No orders yet. Once customers start purchasing, orders will appear here."

### Orders — Pending / Fulfilled

Pre-filtered views of the orders list.

### Order Detail (`/admin/orders/[id]`)

**Layout:** Single page with sections:

**Header:** Order # + date + status badge + status update dropdown

**Customer info card:** Name, email, shipping address

**Items list:** Product thumbnail, title, size, price, quantity — each row links to product

**Financial summary:** Subtotal, shipping, tax, total

**Fulfillment section:**
- Tracking number input
- Carrier select (USPS, UPS, FedEx, Other)
- "Mark as Shipped" button (sets status, saves tracking)
- "Mark as Delivered" button

**Admin notes:** Textarea for internal notes

**Actions:** Refund button (calls Stripe refund API), opens confirmation dialog

### Inventory — Stock Levels (`/admin/inventory`)

**Layout:** Table view of all products × sizes with stock counts.

**Columns:** Product thumbnail, title, size, stock count, inline edit button

**Features:**
- Inline stock editing — click count to edit, Enter to save
- Filter by garment type
- Sort by stock level (ascending = lowest first)
- Color-coded rows: red for 0, yellow for <= threshold, green for above
- Bulk stock update (select multiple, set stock count)

### Inventory — Low Stock (`/admin/inventory/low`)

Same view but pre-filtered to items at or below `lowStockThreshold` from settings. For one-of-a-kind items, this effectively shows items with stock=0 (sold out).

### Media Library (`/admin/media`)

**Existing page — no changes needed.** Already built with `@austencloud/media-manager` components: MediaGrid, MediaToolbar, TagSidebar, TagPickerPanel.

### Media Curate (`/admin/media/curate`)

**Existing curator functionality.** Currently accessed via a "Curate" button within the media page. Moving it to its own route makes it a first-class section accessible from the sidebar.

### Tags (`/admin/tags`)

**Existing page — no changes needed.** Inline tag management with CRUD, search, sort by usage.

### Settings — General (`/admin/settings`)

**Form fields:**
- Store Name (text)
- Store Email (text)
- Currency (select, default USD)
- Tax Rate (percentage input)
- Low Stock Threshold (number)
- Shipping Rates (repeatable group: label + price + estimated days)

**Save button** updates `settings/store` document.

### Settings — Stripe (`/admin/settings/stripe`)

**Display:**
- Stripe Publishable Key (text input — stored in settings doc)
- Stripe Secret Key status: shows "Configured" or "Not configured" based on env var presence
- Stripe Webhook Secret status: same
- Instructions for setting env vars (since secrets don't go in Firestore)
- "Test Connection" button — pings Stripe API to verify keys work
- Link to Stripe Dashboard

### Settings — Seed Data (`/admin/settings/seed`)

**Existing seed page relocated.** Clear All Data, Seed Tags, Seed Items with progress indicators. No functional changes.

---

## 6. Storefront Integration

### Cart

The storefront needs a cart to send customers to Stripe Checkout. Cart state lives in localStorage (no server-side cart needed for this scale).

```typescript
interface CartItem {
  productId: string;
  title: string;
  size: Size;
  price: number;
  thumbnailUrl: string;
  quantity: number;           // almost always 1
}
```

**Cart UI:** Slide-out drawer from right side (can use `@austencloud/drawer`). Shows items, quantities, subtotal, "Checkout" button.

**Checkout button:** POSTs to `/api/checkout` with cart items, receives Stripe Checkout URL, redirects.

### Product Pages — Dynamic Data

Replace hardcoded `src/lib/data/products.ts` with Firestore reads:
- `/shop` page queries products with `availability: 'available'`
- `/product/[slug]` queries single product by slug
- Images resolved from `mediaItemIds` → `mediaItems` collection → `thumbnailUrl`/`fullUrl`

### Success/Cancel Pages

- `/checkout/success` — "Thank you!" with order confirmation
- `/checkout/cancel` — "Your cart is still here" with link back to shop

---

## 7. Services Architecture

Following existing patterns from `src/lib/admin/services/`:

### New Service Files

**`src/lib/admin/services/products.ts`**
- `productService`: CRUD for products collection
- Slug generation, validation, Firestore conversion
- Query helpers: getAvailable, getByGarmentType, getBySlug, getDrafts, getFeatured

**`src/lib/admin/services/orders.ts`**
- `orderService`: CRUD for orders collection
- Status transitions with validation
- Query helpers: getByStatus, getRecent, getByCustomer

**`src/lib/admin/services/inventory.ts`**
- `inventoryService`: Stock operations
- `decrementStock(productId, size, quantity)` — atomic decrement
- `getLowStock(threshold)` — query across products
- `bulkUpdateStock(updates[])` — batch write

**`src/lib/admin/services/settings.ts`**
- `settingsService`: get/update for settings/store document
- Default values for initial setup

**`src/lib/admin/services/dashboard.ts`**
- `dashboardService`: Aggregation queries
- `getMonthlyRevenue()`, `getMonthlyOrderCount()`, `getProductCount()`, `getReviewCount()`
- Returns pre-computed stat objects for dashboard cards

**`src/lib/admin/services/auth.ts`**
- Firebase Auth initialization
- `signInWithGoogle()`, `signOut()`, `onAuthStateChanged` wrapper
- Auth guard utility

### Server-Side (SvelteKit endpoints)

**`src/routes/api/checkout/+server.ts`**
- POST: Creates Stripe Checkout Session from cart items
- Validates products exist and are available
- Uses `STRIPE_SECRET_KEY` env var

**`src/routes/api/webhooks/stripe/+server.ts`**
- POST: Handles Stripe webhook events
- Validates webhook signature
- Creates order documents, decrements inventory

**`src/routes/api/products/sync/+server.ts`**
- POST: Syncs a product to Stripe (create/update Product + Price)
- Called from admin product editor on save

---

## 8. Component Architecture

### New Shared Patterns

All new admin components follow scoped CSS with `--color-*` tokens. No Tailwind classes.

**Reusable admin components (`src/lib/admin/components/`):**

- `StatCard.svelte` — Dashboard metric card (icon, label, value, optional trend)
- `DataTable.svelte` — Generic table with sortable columns, row selection, empty state
- `StatusBadge.svelte` — Colored pill for order/product status
- `InlineEdit.svelte` — Click-to-edit field (used for inventory stock counts)
- `ImagePicker.svelte` — Grid of media items for product image selection
- `FormField.svelte` — Label + input + error wrapper for consistent form styling
- `ConfirmDialog.svelte` — Modal confirmation for destructive actions
- `SearchInput.svelte` — Debounced search input with clear button
- `FilterBar.svelte` — Horizontal bar with filter dropdowns and active filter chips

### Existing Components (kept as-is)

All `@austencloud/media-manager` components, `ProgressRing`, `ShimmerBlock`.

---

## 9. CSS Architecture

### Token System

Extend existing `admin.css` tokens for new semantic needs:

```css
/* Status colors (map to existing semantic tokens) */
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
```

### Scoping Strategy

Each component has its own `<style>` block. Shared tokens defined in `admin.css` and referenced via `var(--color-*)`. No global utility classes — everything is scoped.

---

## 10. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin UID (set after first Google sign-in)
    function isAdmin() {
      return request.auth != null && request.auth.uid == "ADMIN_UID_HERE";
    }

    // Products: public read, admin write
    match /products/{productId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Orders: admin only
    match /orders/{orderId} {
      allow read, write: if isAdmin();
    }

    // Settings: public read (storefront needs shipping rates), admin write
    match /settings/{settingId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Existing media collections: admin only
    match /mediaTags/{tagId} {
      allow read, write: if isAdmin();
    }
    match /mediaItems/{itemId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /mediaLibraryState/{docId} {
      allow read, write: if isAdmin();
    }
  }
}
```

---

## 11. Dependencies

### New packages needed:
- `stripe` — Stripe Node.js SDK (server-side checkout + webhooks)
- `firebase-admin` — Firebase Admin SDK for server-side Firestore writes (webhooks, checkout endpoints). Client SDK is browser-only; server endpoints need Admin SDK with service account.
- `@stripe/stripe-js` — Stripe.js for client-side (optional, only if using Stripe Elements later)
- `firebase/auth` — Already included in firebase package

### Server-side Firebase Init (`src/lib/server/firebase-admin.ts`)

Server endpoints (webhooks, checkout, product sync) cannot use the client Firebase SDK (it's browser-only). A separate `firebase-admin` init module:
- Reads `GOOGLE_APPLICATION_CREDENTIALS` env var or inline service account JSON
- Exports `adminDb` (Firestore instance) for server-side reads/writes
- Manual setup: download service account JSON from Firebase Console → Project Settings → Service Accounts

### Shared packages (already installed):
- `@austencloud/sidebar` — Sidebar navigation
- `@austencloud/media-manager` — Media grid, tagger, curator
- `@austencloud/media-spotlight` — Full-screen image viewer

### No new infrastructure:
- Firestore: already provisioned
- R2: already provisioned
- Firebase Auth: enable Google provider in Firebase Console (manual step)

---

## 12. Product Type Migration

The existing `src/lib/types/product.ts` and `src/lib/data/products.ts` (13 hardcoded products) will be replaced:

**Type changes:**
- `sizes: Size[]` → `sizes: Record<Size, SizeVariant>` (map with stock counts)
- `images: ProductImage[]` → `mediaItemIds: string[]` + `heroImageIndex` (references to mediaItems)
- `techniques: Technique[]` → `techniques: string[]` (tag IDs from mediaTags, enabling dynamic technique management)
- `availability` gains `'draft'` and `'archived'`, drops `'gallery_only'` (archived serves the same purpose)
- `garmentType` stays as a typed union (limited set, rarely changes — unlike techniques which are dynamic)
- `colorFamily: ColorFamily` stays as typed union: `'warm' | 'cool' | 'neutral' | 'rainbow' | 'monochrome' | 'earth'`
- Image type metadata (`hero`, `detail`, `lifestyle`) is intentionally dropped — the `heroImageIndex` identifies the primary image, and the remaining images display in order. Simpler than maintaining type metadata per image.

**Migration approach:**
- The 13 static products become seed data (like the photo catalog seed)
- Add a "Seed Products" button to the Settings > Seed Data page
- Old `products.ts` kept temporarily as seed source, then deleted once data lives in Firestore
- Storefront pages updated to read from Firestore instead of importing static data

**Storefront fallback:** If Firestore is unreachable, product pages show a "Currently unavailable, please try again" message rather than crashing. At this scale this is extremely unlikely to happen.

---

## 13. Stripe Integration Details

### Checkout validation guard
The `/api/checkout` endpoint validates that every cart item has a valid `stripePriceId` before creating a Stripe session. If a product lacks a Stripe price ID (admin forgot to sync), the endpoint returns a 400 error and the storefront shows "This product is not yet available for purchase."

The storefront "Add to Cart" button is also disabled for products without a `stripePriceId`.

### Webhook raw body access
Stripe webhook signature verification requires the raw request body (not parsed JSON). The SvelteKit endpoint must use `await request.text()` to get the raw body before passing it to `stripe.webhooks.constructEvent()`. Do NOT use `await request.json()` first.

### Cart quantity validation
For one-of-a-kind items (stock=1), the storefront prevents adding more than the available stock. The "Add to Cart" button becomes "Sold Out" when stock=0.

---

## 14. Manual Setup Steps (Austen)

Before the admin is fully functional, these one-time steps are needed:

1. **Firebase Auth:** Enable Google sign-in provider in Firebase Console → Authentication → Sign-in method
2. **Firebase Admin SDK:** Download service account JSON from Firebase Console → Project Settings → Service Accounts → Generate New Private Key. Save as `service-account.json` (gitignored).
3. **Firestore Rules:** Deploy updated rules with `isAdmin()` function (after first sign-in to get UID)
4. **Stripe Account:** Create Stripe account, get API keys
5. **Env vars:** Add to `.env`:
   - `STRIPE_SECRET_KEY=sk_...`
   - `STRIPE_WEBHOOK_SECRET=whsec_...`
   - `VITE_STRIPE_PUBLISHABLE_KEY=pk_...`
   - `GOOGLE_APPLICATION_CREDENTIALS=./service-account.json`
6. **Stripe Webhook:** Configure webhook endpoint in Stripe Dashboard pointing to deployed URL + `/api/webhooks/stripe`
