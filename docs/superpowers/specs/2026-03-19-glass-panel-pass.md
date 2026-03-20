# Glass Panel Pass — Content Integration with Deep Ocean Background

**Date:** 2026-03-19
**Status:** Approved
**Scope:** Convert all storefront content sections from opaque backgrounds to dark glass panels over the animated Deep Ocean background.
**Depends on:** Tailwind-to-scoped-CSS migration (complete)

---

## Problem

The Tailwind-to-scoped-CSS migration preserved the original light-theme visual design (cream backgrounds, charcoal text, opaque sections). But the Deep Ocean animated background is now rendering behind all content. The result: the background is invisible behind opaque panels, text is unreadable in areas with transparent backgrounds, and the storefront looks broken — two competing visual languages fighting each other.

## Solution

Convert the entire storefront to a dark glass panel aesthetic. Every content section floats in a glass container over the ocean. Text is white/cream. The background is the atmosphere, always visible in the gaps between panels.

---

## Glass Token System

Add to `app.css` `:root`:

```css
/* ── Glass Panel System ── */
--occ-glass-bg: rgba(10, 10, 30, 0.6);
--occ-glass-bg-hover: rgba(10, 10, 30, 0.7);
--occ-glass-blur: 16px;
--occ-glass-border: rgba(255, 255, 255, 0.08);
--occ-glass-border-hover: rgba(255, 255, 255, 0.12);
--occ-glass-radius: 12px;

/* ── Glass Text Colors ── */
--occ-glass-text: #e8e8f0;
--occ-glass-text-dim: rgba(255, 255, 255, 0.6);
--occ-glass-text-muted: rgba(255, 255, 255, 0.4);
```

### Body Changes

```css
body {
  background: transparent;  /* was: var(--occ-cream) */
  color: var(--occ-glass-text);  /* was: var(--occ-charcoal) */
}
```

### Reusable Glass Panel Pattern

Every content section uses this pattern in its scoped CSS:

```css
.panel {
  background: var(--occ-glass-bg);
  backdrop-filter: blur(var(--occ-glass-blur));
  -webkit-backdrop-filter: blur(var(--occ-glass-blur));
  border: 1px solid var(--occ-glass-border);
  border-radius: var(--occ-glass-radius);
}
```

Not extracted to a global utility class — each component applies it in its scoped styles to the appropriate element.

---

## Component Changes

### Header

- Background: `var(--occ-glass-bg)` with `backdrop-filter: blur(var(--occ-glass-blur))`
- Border-bottom: `var(--occ-glass-border)` (was `--occ-border-light`)
- Nav links: `var(--occ-glass-text-dim)`, hover to `var(--occ-glass-text)`
- Cart icon, menu icon: same glass text colors
- Mobile menu: glass background, glass border
- Logo: add `filter: invert(1) brightness(2)` to make white (same as footer currently does)

### Footer

- Background: `var(--occ-glass-bg)` with blur (was solid `--occ-charcoal`)
- Remove `margin-top: 8rem` — spacing between last content panel and footer is handled by page layout
- Text colors stay as-is (already white/light) — just update the opacity values to use glass tokens
- Footer headings: `var(--occ-glass-text)`
- Footer links/body: `var(--occ-glass-text-dim)`, hover to `var(--occ-glass-text)`
- Copyright: `var(--occ-glass-text-muted)`
- Add border and border-radius matching glass system

### Homepage

**Hero section:**
- Remove the hero image and overlay entirely
- The Deep Ocean background IS the hero
- Keep the text content: "Handmade in Chicago" label, "Wearable art, dyed by hand" headline, description, CTA buttons
- Text floats directly over the ocean — NO glass panel behind the hero text
- Hero label: `var(--occ-glass-text-dim)`
- Headline: white
- Description: `rgba(255, 255, 255, 0.8)`
- CTA "Shop Collection": glass-filled button (`var(--occ-glass-bg)` with border, white text)
- CTA "Learn More": transparent button with `var(--occ-glass-border)` border, white text
- Reduce height from 85vh to ~60vh — still impactful but doesn't monopolize the viewport

**Featured Products section:**
- Wrap in a glass panel
- Section title, subtitle: `var(--occ-glass-text)` and `var(--occ-glass-text-dim)`
- "View All Pieces" link: `var(--occ-purple)` stays (purple pops on dark glass)

**Technique Highlights section:**
- Remove `background: var(--occ-warm-white)` — wrap in glass panel instead
- Section title, subtitle: glass text colors
- Technique card descriptions: `var(--occ-glass-text-dim)`
- Technique images keep their own backgrounds (photos are self-contained)

**About Teaser section:**
- Wrap in glass panel
- "About the Artist" label: `var(--occ-purple)` (stays)
- Section title, body text: glass text colors
- Images are self-contained (product/process photos)

**Newsletter section:**
- Remove `background: var(--occ-charcoal)` — glass panel instead
- Title: `var(--occ-glass-text)`
- Subtitle: `var(--occ-glass-text-dim)`
- Email input: glass-styled (`rgba(255, 255, 255, 0.1)` bg, glass border)
- Button: glass-filled with white text

### Shop Page

- Page wrapper: glass panel
- Page title, subtitle: glass text colors
- Filter buttons (inactive): glass-filled (`var(--occ-glass-bg)` with `var(--occ-glass-border)`, white text) — NOT transparent border-only
- Filter buttons (active garment): solid `var(--occ-charcoal)` with white text (contrast against glass)
- Filter buttons (active technique): solid `var(--occ-purple)` with white text
- Empty state text: `var(--occ-glass-text-dim)`
- Clear filters link: `var(--occ-purple)`
- Filter divider border: `var(--occ-glass-border)`

### Gallery Page

- Page wrapper: glass panel
- Title, subtitle: glass text colors
- Empty state: glass text dim

### Product Detail Page

- Page wrapper: glass panel
- Breadcrumb: `var(--occ-glass-text-muted)`, hover to `var(--occ-glass-text)`
- Current breadcrumb item: `var(--occ-glass-text)`
- Main image container: keep `var(--occ-warm-white)` background (product photos need a neutral bg)
- Thumbnail buttons: glass border, active border white
- "One of a Kind" label: `var(--occ-purple)` (stays)
- Title: `var(--occ-glass-text)`
- Price: `var(--occ-glass-text)`
- Description: `var(--occ-glass-text-dim)`
- Detail labels: `var(--occ-glass-text-muted)`
- Detail values: `var(--occ-glass-text)`
- Size buttons: glass-styled (glass bg, glass border). Active: solid white text on charcoal. OOS: `var(--occ-glass-text-muted)` with line-through
- Add to Cart button: solid `var(--occ-purple)` (prominent, not glass). Hover: `var(--occ-purple-hover)`. Disabled: 40% opacity
- Shipping note: `var(--occ-glass-text-muted)`
- Trust signals: glass text colors. Titles: `var(--occ-glass-text)`, body: `var(--occ-glass-text-dim)`
- Detail/trust section borders: `var(--occ-glass-border)`
- Related products section border: `var(--occ-glass-border)`

### About Page

- Page wrapper: glass panel
- "About the Artist" label: `var(--occ-purple)`
- Title: `var(--occ-glass-text)`
- Story paragraphs: `var(--occ-glass-text-dim)`
- "What Makes This Different" heading: `var(--occ-glass-text)`
- Checklist items: `var(--occ-glass-text-dim)`, bold text: `var(--occ-glass-text)`
- Check icons: `var(--occ-purple)` (stays)
- Differentiators border: `var(--occ-glass-border)`
- Images are self-contained (process photos)

### Techniques Page

- Page wrapper: glass panel
- "The Craft" label: `var(--occ-purple)`
- Title, intro: glass text colors
- Section headings: `var(--occ-glass-text)`
- Body text: `var(--occ-glass-text-dim)`
- Care Instructions box: glass-styled inner panel (slightly lighter glass, like `rgba(255, 255, 255, 0.05)`) with glass border. Headings and list text use glass text colors.
- Images are self-contained

### ProductCard

- Image container: keep neutral background for product photos (`var(--occ-warm-white)` or darken to match glass)
- Info section below image: transparent (inherits from parent glass panel)
- Title: `var(--occ-glass-text)`, hover: `var(--occ-purple)`
- Price: `var(--occ-glass-text-dim)`
- Sold label: `var(--occ-glass-text-muted)`, italic
- Garment type: `var(--occ-glass-text-muted)`
- Badges stay as-is (positioned over product images, which have their own bg)

### Checkout Success

- Page wrapper: glass panel
- Green checkmark: keep `var(--occ-teal)` background (solid color is fine for an icon)
- Title: `var(--occ-glass-text)`
- Body text: `var(--occ-glass-text-dim)`
- Continue Shopping button: solid `var(--occ-purple)`, white text

### Checkout Cancel

- Same glass treatment as success
- Title: `var(--occ-glass-text)`
- Body text: `var(--occ-glass-text-dim)`
- Back to Shop button: solid `var(--occ-purple)`, white text

---

## Layout Changes

### +layout.svelte

The `.shell` wrapper needs transparent background. The `.main` element should have no background color — the ocean shows through everywhere.

### Page-level glass panels

Each page route adds a glass panel wrapper around its content. The panel has:
- `max-width: 80rem` (same as before)
- Horizontal margin: auto (centered)
- Vertical margin/padding: enough to show ocean in the gaps between header, content panels, and footer
- Glass background, blur, border, radius

The homepage is special: multiple glass panels (featured, techniques, about, newsletter) with ocean visible between them. The hero has no panel.

---

## Files to Change

| File | Description |
|------|-------------|
| `src/app.css` | Add glass tokens, change body bg/color |
| `src/lib/components/Header.svelte` | Glass header |
| `src/lib/components/Footer.svelte` | Glass footer |
| `src/lib/components/ProductCard.svelte` | Glass text colors |
| `src/routes/+page.svelte` | Hero redesign, glass sections |
| `src/routes/shop/+page.svelte` | Glass panel, glass filter buttons |
| `src/routes/gallery/+page.svelte` | Glass panel |
| `src/routes/product/[slug]/+page.svelte` | Glass panel, glass text colors |
| `src/routes/about/+page.svelte` | Glass panel |
| `src/routes/techniques/+page.svelte` | Glass panel, glass care section |
| `src/routes/checkout/success/+page.svelte` | Glass panel |
| `src/routes/checkout/cancel/+page.svelte` | Glass panel |

---

## Out of Scope

- Admin pages (separate visual system)
- Background type configurability (follow-up)
- New page designs or content changes
- SEO, structured data

---

## Success Criteria

1. Body background is transparent — ocean visible everywhere
2. Every content section uses glass panels (dark semi-transparent + blur)
3. No opaque white, cream, or charcoal backgrounds on any storefront element
4. Header and footer are glass — not solid
5. All text is readable on glass-over-dark (white/cream text, glass-dim for secondary)
6. Hero has no image — ocean IS the hero, text floats directly
7. Shop filter buttons have glass fills (not transparent border-only)
8. Purple accent color preserved for labels, active states, CTA buttons
9. Product images maintain neutral backgrounds (photos need contrast)
10. `npm run build` succeeds
11. Every page visually verified with Deep Ocean background running
