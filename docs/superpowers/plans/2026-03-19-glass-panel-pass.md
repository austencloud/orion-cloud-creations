# Glass Panel Pass — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert all storefront content from opaque light-theme to dark glass panels floating over the Deep Ocean animated background.

**Architecture:** Add glass tokens to app.css, then update every storefront component to use dark glass backgrounds with `backdrop-filter: blur(16px)` and white/cream text. The hero section is redesigned to remove the image and let the ocean be the visual impact.

**Tech Stack:** SvelteKit 5, CSS custom properties, backdrop-filter

---

## Glass Color Reference

Use this mapping when converting each component:

| Old Token | New Token | Purpose |
|---|---|---|
| `var(--occ-charcoal)` (text) | `var(--occ-glass-text)` | Primary text |
| `var(--occ-muted)` (text) | `var(--occ-glass-text-dim)` | Secondary text |
| `var(--occ-light-muted)` (text) | `var(--occ-glass-text-muted)` | Tertiary text |
| `var(--occ-border-light)` | `var(--occ-glass-border)` | Borders |
| `var(--occ-border)` | `var(--occ-glass-border)` | Borders |
| `var(--occ-warm-white)` (bg) | `var(--occ-glass-bg)` + blur | Section backgrounds |
| `var(--occ-charcoal)` (bg) | `var(--occ-glass-bg)` + blur | Dark section backgrounds |
| `var(--occ-cream)` (bg) | `transparent` | Body/page backgrounds |
| `var(--occ-purple)` | `var(--occ-purple)` | **Unchanged** — purple pops on dark |

### Glass panel pattern (apply in scoped CSS where needed):

```css
background: var(--occ-glass-bg);
backdrop-filter: blur(var(--occ-glass-blur));
-webkit-backdrop-filter: blur(var(--occ-glass-blur));
border: 1px solid var(--occ-glass-border);
border-radius: var(--occ-glass-radius);
```

---

## Task 1: Glass Tokens + Body

**Files:**
- Modify: `src/app.css`

- [ ] **Step 1: Add glass tokens to `:root` and update body**

Add after the Typography section in `:root`:

```css
  /* Glass Panel System */
  --occ-glass-bg: rgba(10, 10, 30, 0.6);
  --occ-glass-bg-hover: rgba(10, 10, 30, 0.7);
  --occ-glass-blur: 16px;
  --occ-glass-border: rgba(255, 255, 255, 0.08);
  --occ-glass-border-hover: rgba(255, 255, 255, 0.12);
  --occ-glass-radius: 12px;

  /* Glass Text Colors */
  --occ-glass-text: #e8e8f0;
  --occ-glass-text-dim: rgba(255, 255, 255, 0.6);
  --occ-glass-text-muted: rgba(255, 255, 255, 0.4);
```

Change body styles:

```css
body {
  font-family: var(--occ-font-body);
  color: var(--occ-glass-text);       /* was: var(--occ-charcoal) */
  background: transparent;             /* was: var(--occ-cream) */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.6;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app.css
git commit -m "feat: add glass panel tokens, transparent body background"
```

---

## Task 2: Layout — Transparent Shell

**Files:**
- Modify: `src/routes/+layout.svelte`

- [ ] **Step 1: Ensure shell and main have no opaque backgrounds**

The current layout styles are already transparent (no background set on `.shell` or `.main`). Verify this is the case — if any background is set, remove it. No other changes needed.

- [ ] **Step 2: Commit (if changes needed)**

```bash
git add src/routes/+layout.svelte
git commit -m "feat: ensure layout shell is transparent for ocean background"
```

---

## Task 3: Glass Header

**Files:**
- Modify: `src/lib/components/Header.svelte`

- [ ] **Step 1: Update header styles**

Changes to the `<style>` block:

```
.header background: rgba(250, 249, 246, 0.95) → var(--occ-glass-bg)
.header backdrop-filter: blur(4px) → blur(var(--occ-glass-blur))
  ADD: -webkit-backdrop-filter: blur(var(--occ-glass-blur))
.header border-bottom: → 1px solid var(--occ-glass-border)
  ADD: border-radius: 0 (header is edge-to-edge, no radius)

.logo ADD: filter: invert(1) brightness(2)

.nav-link color: var(--occ-muted) → var(--occ-glass-text-dim)
.nav-link:hover color: var(--occ-charcoal) → var(--occ-glass-text)

.cart-btn, .menu-btn color: var(--occ-muted) → var(--occ-glass-text-dim)
.cart-btn:hover, .menu-btn:hover color: var(--occ-charcoal) → var(--occ-glass-text)

.mobile-menu border-top: → 1px solid var(--occ-glass-border)
  ADD: background: rgba(10, 10, 30, 0.85)
  ADD: backdrop-filter: blur(var(--occ-glass-blur))
  ADD: -webkit-backdrop-filter: blur(var(--occ-glass-blur))

.mobile-link color: var(--occ-muted) → var(--occ-glass-text-dim)
.mobile-link:hover color: var(--occ-charcoal) → var(--occ-glass-text)
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/components/Header.svelte
git commit -m "feat: glass header with dark blur and light text"
```

---

## Task 4: Glass Footer

**Files:**
- Modify: `src/lib/components/Footer.svelte`

- [ ] **Step 1: Update footer styles**

```
.footer background: var(--occ-charcoal) → var(--occ-glass-bg)
  ADD: backdrop-filter: blur(var(--occ-glass-blur))
  ADD: -webkit-backdrop-filter: blur(var(--occ-glass-blur))
  ADD: border-top: 1px solid var(--occ-glass-border)
  ADD: border-radius: var(--occ-glass-radius) var(--occ-glass-radius) 0 0
.footer color: rgba(255, 255, 255, 0.7) → var(--occ-glass-text-dim)
.footer margin-top: 8rem → margin-top: 2rem (less gap, ocean shows between)

.footer-heading color: white → var(--occ-glass-text)

.copyright color: rgba(255, 255, 255, 0.4) → var(--occ-glass-text-muted)
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/components/Footer.svelte
git commit -m "feat: glass footer with blur and glass tokens"
```

---

## Task 5: Glass ProductCard

**Files:**
- Modify: `src/lib/components/ProductCard.svelte`

- [ ] **Step 1: Update ProductCard styles**

```
.image-wrap background: var(--occ-warm-white) → rgba(20, 20, 40, 0.4)
  ADD: border-radius: var(--occ-glass-radius)
  (keep overflow: hidden)

.placeholder background: var(--occ-warm-white) → rgba(20, 20, 40, 0.4)
.placeholder span color: var(--occ-muted) → var(--occ-glass-text-muted)

.title color: var(--occ-charcoal) → var(--occ-glass-text)
(hover color stays var(--occ-purple) — good on dark)

.price color: var(--occ-muted) → var(--occ-glass-text-dim)
.sold-label color: var(--occ-light-muted) → var(--occ-glass-text-muted)
.type color: var(--occ-light-muted) → var(--occ-glass-text-muted)
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/components/ProductCard.svelte
git commit -m "feat: glass ProductCard with dark image container and light text"
```

---

## Task 6: Glass Homepage + Hero Redesign

**Files:**
- Modify: `src/routes/+page.svelte`

This is the biggest change. The hero section is completely redesigned and every content section gets a glass panel wrapper.

- [ ] **Step 1: Redesign hero — remove image, ocean IS the hero**

Replace the hero section markup (lines 30-57). Remove the `hero-bg`, `hero-img`, and `hero-overlay` elements. Keep the text content. The hero is now just text floating over the ocean.

New hero markup:
```svelte
<!-- Hero Section -->
<section class="hero">
	<div class="hero-content">
		<p class="hero-label">Handmade in Chicago</p>
		<h1 class="hero-title">
			Wearable art,<br />
			<span class="hero-title-accent">dyed by hand.</span>
		</h1>
		<p class="hero-desc">
			Professional Procion fiber reactive dyes on 100% cotton. Every piece is unique. Every color is permanent.
		</p>
		<div class="hero-actions">
			<a href="/shop" class="btn-primary">Shop Collection</a>
			<a href="/techniques" class="btn-outline">Learn More</a>
		</div>
	</div>
</section>
```

- [ ] **Step 2: Wrap each content section in glass panels**

Each section after the hero (`section.section`, `section.techniques-band`, `section.newsletter`) gets a glass panel. Add a `.glass-panel` class to the outer section elements or add an inner wrapper.

For the featured products section:
```svelte
<section class="glass-section">
  <!-- existing content, keep section-header, product-grid-3, section-cta -->
</section>
```

For techniques: replace `techniques-band` with `glass-section`.
For about teaser: wrap in `glass-section`.
For newsletter: replace charcoal band with `glass-section`.

- [ ] **Step 3: Update all hero styles**

```css
.hero {
  min-height: 60vh;        /* was: 85vh with 600px min */
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem var(--spacing-md);
}

/* Remove: .hero-bg, .hero-img, .hero-overlay — deleted */

.hero-content {
  max-width: 40rem;
}

.hero-label {
  color: var(--occ-glass-text-dim);    /* was: rgba(255,255,255,0.7) */
  /* rest stays the same */
}

.hero-title {
  color: white;                         /* stays white */
  /* font-size responsive stays */
}

.hero-desc {
  color: rgba(255, 255, 255, 0.8);     /* stays */
}

.btn-primary {
  background: var(--occ-glass-bg);      /* was: white */
  color: var(--occ-glass-text);         /* was: var(--occ-charcoal) */
  border: 1px solid var(--occ-glass-border-hover);
  backdrop-filter: blur(var(--occ-glass-blur));
  -webkit-backdrop-filter: blur(var(--occ-glass-blur));
}
.btn-primary:hover {
  background: var(--occ-glass-bg-hover);  /* was: white/90 */
}

.btn-outline {
  border: 1px solid var(--occ-glass-border-hover);  /* was: white/40 */
  color: var(--occ-glass-text);
}
.btn-outline:hover {
  background: rgba(255, 255, 255, 0.05);
}
```

- [ ] **Step 4: Add glass-section styles and update all section styles**

```css
.glass-section {
  max-width: 80rem;
  margin: 2rem auto;
  padding: 3rem var(--spacing-md);
  background: var(--occ-glass-bg);
  backdrop-filter: blur(var(--occ-glass-blur));
  -webkit-backdrop-filter: blur(var(--occ-glass-blur));
  border: 1px solid var(--occ-glass-border);
  border-radius: var(--occ-glass-radius);
}

@media (min-width: 1024px) {
  .glass-section {
    padding: 4rem var(--spacing-lg);
    margin: 2.5rem auto;
  }
}
```

Update text colors throughout:
```
.section-title color: var(--occ-charcoal) → var(--occ-glass-text)
.section-subtitle color: var(--occ-muted) → var(--occ-glass-text-dim)
.label color stays var(--occ-purple)
.link-arrow color stays var(--occ-purple)
.link-arrow:hover color: var(--occ-charcoal) → var(--occ-glass-text)

/* Techniques band — remove opaque bg */
.techniques-band: DELETE background: var(--occ-warm-white) and padding
  (now uses .glass-section instead)

.technique-desc color: var(--occ-muted) → var(--occ-glass-text-dim)

/* About section */
.about-body color: var(--occ-muted) → var(--occ-glass-text-dim)

/* Newsletter — remove opaque charcoal bg */
.newsletter: background: var(--occ-charcoal) → REMOVE (uses glass-section)
  color: white → var(--occ-glass-text)
.newsletter-subtitle color: rgba(255,255,255,0.6) → var(--occ-glass-text-dim)
.newsletter-input bg, border: keep as-is (already semi-transparent white)
.newsletter-btn: background: white → var(--occ-purple)
  color: var(--occ-charcoal) → white
.newsletter-btn:hover: background → var(--occ-purple-hover)
```

- [ ] **Step 5: Commit**

```bash
git add src/routes/+page.svelte
git commit -m "feat: glass homepage with ocean hero and glass content sections"
```

---

## Task 7: Glass Shop Page

**Files:**
- Modify: `src/routes/shop/+page.svelte`

- [ ] **Step 1: Wrap page in glass panel, update all colors**

Add glass panel to `.page`:
```css
.page {
  /* keep max-width, margin, padding */
  background: var(--occ-glass-bg);
  backdrop-filter: blur(var(--occ-glass-blur));
  -webkit-backdrop-filter: blur(var(--occ-glass-blur));
  border: 1px solid var(--occ-glass-border);
  border-radius: var(--occ-glass-radius);
  margin-top: 1rem;       /* space from header */
  margin-bottom: 2rem;    /* space before footer */
}
```

Color updates:
```
.page-title color: var(--occ-charcoal) → var(--occ-glass-text)
.page-subtitle color: var(--occ-muted) → var(--occ-glass-text-dim)

.filters border-bottom: var(--occ-border-light) → var(--occ-glass-border)

.filter-btn: ADD background: var(--occ-glass-bg)
  color: var(--occ-muted) → var(--occ-glass-text-dim)
  border: var(--occ-border) → var(--occ-glass-border)
.filter-btn:hover color: var(--occ-charcoal) → var(--occ-glass-text)
  ADD background: var(--occ-glass-bg-hover)
.filter-btn.active background: var(--occ-charcoal) → stays (good contrast)
.filter-btn.technique.active background: var(--occ-purple) → stays

.empty p color: var(--occ-muted) → var(--occ-glass-text-dim)
.clear-btn color stays var(--occ-purple)
.clear-btn:hover color: var(--occ-charcoal) → var(--occ-glass-text)
```

- [ ] **Step 2: Commit**

```bash
git add src/routes/shop/+page.svelte
git commit -m "feat: glass shop page with glass filter buttons"
```

---

## Task 8: Glass Gallery Page

**Files:**
- Modify: `src/routes/gallery/+page.svelte`

- [ ] **Step 1: Add glass panel to page, update colors**

Same glass panel pattern on `.page` as shop. Color updates:

```
.page-title color: var(--occ-charcoal) → var(--occ-glass-text)
.page-subtitle color: var(--occ-muted) → var(--occ-glass-text-dim)
.empty p color: var(--occ-muted) → var(--occ-glass-text-dim)
```

- [ ] **Step 2: Commit**

```bash
git add src/routes/gallery/+page.svelte
git commit -m "feat: glass gallery page"
```

---

## Task 9: Glass Product Detail Page

**Files:**
- Modify: `src/routes/product/[slug]/+page.svelte`

- [ ] **Step 1: Add glass panel to page wrapper, update all colors**

Glass panel on `.page`. All color updates:

```
.breadcrumb color: var(--occ-light-muted) → var(--occ-glass-text-muted)
.breadcrumb a:hover color: var(--occ-charcoal) → var(--occ-glass-text)
.current color: var(--occ-charcoal) → var(--occ-glass-text)

.main-image bg: var(--occ-warm-white) → rgba(20, 20, 40, 0.4)
  ADD: border-radius: var(--occ-glass-radius)
.no-image span color: var(--occ-muted) → var(--occ-glass-text-muted)

.thumb border active: var(--occ-charcoal) → white
.thumb:not(.active):hover border: var(--occ-border) → var(--occ-glass-border-hover)

.label color stays var(--occ-purple)
.title color: var(--occ-charcoal) → var(--occ-glass-text)
.price color: var(--occ-charcoal) → var(--occ-glass-text)
.sold-price color: var(--occ-light-muted) → var(--occ-glass-text-muted)
.description color: var(--occ-muted) → var(--occ-glass-text-dim)

.details border-top: var(--occ-border-light) → var(--occ-glass-border)
.detail-label color: var(--occ-light-muted) → var(--occ-glass-text-muted)
.detail-value color: var(--occ-charcoal) → var(--occ-glass-text)

.size-heading color: var(--occ-charcoal) → var(--occ-glass-text)
.size-btn: border: var(--occ-border) → var(--occ-glass-border)
  color: var(--occ-muted) → var(--occ-glass-text-dim)
  ADD: background: var(--occ-glass-bg)
.size-btn:hover border: var(--occ-charcoal) → var(--occ-glass-border-hover)
  color: var(--occ-charcoal) → var(--occ-glass-text)
.size-btn.active: bg: var(--occ-charcoal) → white; color: white → var(--occ-charcoal)
  (inverted for contrast on glass)
.size-btn.oos color: var(--occ-light-muted) → var(--occ-glass-text-muted)

.add-to-cart: bg: var(--occ-charcoal) → var(--occ-purple)
.add-to-cart:hover bg: rgba(26,26,26,0.9) → var(--occ-purple-hover)

.shipping-note color: var(--occ-light-muted) → var(--occ-glass-text-muted)

.trust-grid border-top: var(--occ-border-light) → var(--occ-glass-border)
.trust-item color: var(--occ-muted) → var(--occ-glass-text-dim)
.trust-title color: var(--occ-charcoal) → var(--occ-glass-text)

.related border-top: var(--occ-border-light) → var(--occ-glass-border)
.related-title color: var(--occ-charcoal) → var(--occ-glass-text)
```

- [ ] **Step 2: Commit**

```bash
git add "src/routes/product/[slug]/+page.svelte"
git commit -m "feat: glass product detail page with purple CTA"
```

---

## Task 10: Glass About Page

**Files:**
- Modify: `src/routes/about/+page.svelte`

- [ ] **Step 1: Add glass panel to page, update colors**

Glass panel on `.page`. Color updates:

```
.label color stays var(--occ-purple)
.page-title color: var(--occ-charcoal) → var(--occ-glass-text)
.story color: var(--occ-muted) → var(--occ-glass-text-dim)

.differentiators border-top: var(--occ-border-light) → var(--occ-glass-border)
.diff-heading color: var(--occ-charcoal) → var(--occ-glass-text)
.diff-list strong color: var(--occ-charcoal) → var(--occ-glass-text)
.check-icon color stays var(--occ-purple)
```

- [ ] **Step 2: Commit**

```bash
git add src/routes/about/+page.svelte
git commit -m "feat: glass about page"
```

---

## Task 11: Glass Techniques Page

**Files:**
- Modify: `src/routes/techniques/+page.svelte`

- [ ] **Step 1: Add glass panel to page, update colors**

Glass panel on `.page`. Color updates:

```
.label color stays var(--occ-purple)
.page-title color: var(--occ-charcoal) → var(--occ-glass-text)
.page-intro color: var(--occ-muted) → var(--occ-glass-text-dim)
.heading-lg color: var(--occ-charcoal) → var(--occ-glass-text)
.heading-md color: var(--occ-charcoal) → var(--occ-glass-text)
.body-text color: var(--occ-muted) → var(--occ-glass-text-dim)

/* Care section — glass inner panel */
.care-section: bg: var(--occ-warm-white) → rgba(255, 255, 255, 0.05)
  ADD: border: 1px solid var(--occ-glass-border)
  (keep border-radius: 2px or update to var(--occ-glass-radius))
.care-heading color: var(--occ-charcoal) → var(--occ-glass-text)
.care-list color: var(--occ-muted) → var(--occ-glass-text-dim)
```

- [ ] **Step 2: Commit**

```bash
git add src/routes/techniques/+page.svelte
git commit -m "feat: glass techniques page with glass care section"
```

---

## Task 12: Glass Checkout Pages

**Files:**
- Modify: `src/routes/checkout/success/+page.svelte`
- Modify: `src/routes/checkout/cancel/+page.svelte`

- [ ] **Step 1: Update success page**

Add glass panel to `.success-page` or `.success-card`:
```css
.success-card {
  /* keep text-align, max-width */
  background: var(--occ-glass-bg);
  backdrop-filter: blur(var(--occ-glass-blur));
  -webkit-backdrop-filter: blur(var(--occ-glass-blur));
  border: 1px solid var(--occ-glass-border);
  border-radius: var(--occ-glass-radius);
  padding: 3rem 2rem;
}
```

```
.success-page padding: var(--spacing-md) → stays
h1 color: var(--occ-charcoal) → var(--occ-glass-text)
p color: var(--occ-muted) → var(--occ-glass-text-dim)
.continue-btn: bg: var(--occ-charcoal) → var(--occ-purple)
.continue-btn:hover bg → var(--occ-purple-hover)
```

- [ ] **Step 2: Update cancel page**

Same pattern:
```
.cancel-card: ADD glass panel styles + padding
h1 color: var(--occ-charcoal) → var(--occ-glass-text)
p color: var(--occ-muted) → var(--occ-glass-text-dim)
.back-btn: bg: var(--occ-charcoal) → var(--occ-purple)
.back-btn:hover bg → var(--occ-purple-hover)
```

- [ ] **Step 3: Commit**

```bash
git add src/routes/checkout/success/+page.svelte src/routes/checkout/cancel/+page.svelte
git commit -m "feat: glass checkout pages with purple CTAs"
```

---

## Task 13: Final Verification

- [ ] **Step 1: Run production build**

```bash
npm run build
```

Expected: succeeds.

- [ ] **Step 2: Grep for remaining opaque backgrounds**

Search storefront files for opaque cream/charcoal/warm-white backgrounds:

```bash
grep -rn "occ-cream\|occ-warm-white\|occ-charcoal" src/routes/ src/lib/components/Header.svelte src/lib/components/Footer.svelte src/lib/components/ProductCard.svelte --include="*.svelte"
```

Expected: zero matches in storefront files (admin excluded).

- [ ] **Step 3: Grep for remaining old text color tokens**

```bash
grep -rn "occ-muted\|occ-light-muted\|occ-border-light\|occ-border[^-]" src/routes/+page.svelte src/routes/shop/ src/routes/gallery/ src/routes/about/ src/routes/techniques/ src/routes/product/ src/routes/checkout/ src/lib/components/Header.svelte src/lib/components/Footer.svelte src/lib/components/ProductCard.svelte
```

Expected: zero matches (all converted to glass tokens).

- [ ] **Step 4: Visual check with dev server**

Start dev server and verify every page:
- `/` — Ocean visible, hero text floating, glass panels for sections
- `/shop` — Glass panel, glass filter buttons readable
- `/gallery` — Glass panel
- `/product/[any-slug]` — Glass panel, purple Add to Cart
- `/about` — Glass panel, purple accents
- `/techniques` — Glass panel, glass care section
- `/checkout/success` — Glass card
- `/checkout/cancel` — Glass card

Confirm:
- No opaque white/cream/charcoal blocks
- All text readable on glass
- Ocean animation visible in gaps between panels
- Header and footer are glass

- [ ] **Step 5: Commit any fixes**

```bash
git add <specific-files>
git commit -m "fix: glass panel visual parity adjustments"
```
