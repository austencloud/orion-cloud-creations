# Tailwind to Scoped CSS + Backgrounds Integration

**Date:** 2026-03-19
**Status:** Design
**Scope:** Remove Tailwind, adopt scoped CSS with design tokens matching TKA/Cirque Aflame patterns, integrate animated canvas backgrounds.

---

## Problem

OCC uses Tailwind v4 utility classes — every other Austen project (TKA, Cirque Aflame, all shared packages) uses scoped CSS with `--token` custom properties. Tailwind bypasses Svelte's built-in style scoping, creates sprawling class strings, and makes OCC the odd one out. The storefront also has no cursor:pointer on buttons, no transition system, no animation foundations, and no backgrounds integration.

## Solution

1. Remove Tailwind entirely (dependency + vite plugin + `@import "tailwindcss"`)
2. Create `app.css` with OCC brand tokens mapped to the `--theme-*` convention used by shared packages
3. Import `@austencloud/theme/css/index.css` for shared transitions, shadows, keyframes, panel utilities
4. Convert all components from Tailwind utility classes to scoped `<style>` blocks
5. Integrate `@austencloud/backgrounds` for animated canvas behind the storefront
6. Fix cursor:pointer and other basic interaction states globally

---

## Token Architecture

### Layer 1: Shared Foundation (`@austencloud/theme`)

Imported via `@austencloud/theme/css/index.css`. Provides:
- Spacing scale: `--spacing-xs` through `--spacing-2xl`
- Typography scale: `--font-size-xs` through `--font-size-3xl`
- Duration tiers: `--duration-instant` (100ms) through `--duration-dramatic` (350ms)
- Easing curves: `--ease-out`, `--ease-spring`, `--ease-smooth`
- Composite transitions: `--transition-micro`, `--transition-fast`, `--transition-normal`
- Shadow system: `--shadow-glass`, `--shadow-2026-sm/md/lg`
- Border radius: `--radius-2026-xs/sm/md/lg`
- Touch targets: `--min-touch-target` (48px)
- Keyframe animations: spin, pulse, fadeIn, slideUp, scaleIn, shimmer, etc.
- Panel utilities: `.panel-glass`, `.surface-card`, `.overlay-scrim`, etc.
- Modal tokens: dialog styling with `@starting-style` entry animations

### Layer 2: OCC Brand Tokens (`app.css`)

OCC-specific colors and semantic mappings:

```css
:root {
  /* ── OCC Brand Colors ── */
  --occ-cream: #faf9f6;
  --occ-warm-white: #f5f3ef;
  --occ-charcoal: #1a1a1a;
  --occ-muted: #6b6b6b;
  --occ-light-muted: #9a9a9a;
  --occ-border: #e5e2db;
  --occ-border-light: #f0ede8;

  /* Accent Palette */
  --occ-purple: #5b3a8c;
  --occ-purple-hover: #4a2f73;
  --occ-teal: #2a9d8f;
  --occ-gold: #d4a843;

  /* ── Theme Mappings (shared package convention) ── */
  --theme-panel-bg: rgba(255, 255, 255, 0.95);
  --theme-panel-elevated-bg: rgba(255, 255, 255, 1);
  --theme-card-bg: #ffffff;
  --theme-card-hover-bg: var(--occ-warm-white);
  --theme-stroke: var(--occ-border);
  --theme-text: var(--occ-charcoal);
  --theme-text-dim: var(--occ-muted);
  --theme-accent: var(--occ-purple);

  /* ── Typography ── */
  --occ-font-display: "Georgia", "Times New Roman", serif;
  --occ-font-body: "Inter", system-ui, sans-serif;
}
```

### Layer 3: Component Tokens (scoped)

Complex components get a sibling `*-tokens.css` file with `--component-*` tokens. Simple components just reference `--occ-*` and `--theme-*` directly in their `<style>` block. Follow TKA's pattern — only create a token file when a component has 5+ configurable values.

---

## Global Styles (`app.css`)

After the token definitions, `app.css` includes:

```css
/* ── Reset ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: var(--occ-font-body);
  color: var(--theme-text);
  background: var(--occ-cream);
  -webkit-font-smoothing: antialiased;
  line-height: 1.6;
}

/* ── Interactive Elements ── */
button, a, [role="button"] { cursor: pointer; }
button { font-family: inherit; }

/* ── Focus ── */
:focus-visible {
  outline: 2px solid var(--occ-purple);
  outline-offset: 2px;
}

/* ── Images ── */
img { display: block; max-width: 100%; }

/* ── Links ── */
a { color: inherit; text-decoration: none; }

/* ── Reduced Motion ── */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

No utility classes beyond what `@austencloud/theme` provides via panel-utilities.css. Components use scoped CSS.

---

## Component Migration Pattern

### Before (Tailwind):
```svelte
<div class="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-16">
  <h1 class="text-3xl lg:text-4xl font-light text-charcoal">Shop</h1>
  <p class="mt-3 text-muted text-sm">2 pieces available.</p>
</div>
```

### After (Scoped CSS):
```svelte
<div class="page">
  <h1 class="title">Shop</h1>
  <p class="subtitle">2 pieces available.</p>
</div>

<style>
  .page {
    max-width: 80rem;
    margin: 0 auto;
    padding: var(--spacing-xl) var(--spacing-md);
  }

  .title {
    font-size: var(--font-size-3xl);
    font-weight: 300;
    color: var(--occ-charcoal);
  }

  .subtitle {
    margin-top: var(--spacing-sm);
    font-size: var(--font-size-sm);
    color: var(--occ-muted);
  }

  @media (min-width: 1024px) {
    .page { padding: var(--spacing-2xl) var(--spacing-lg); }
    .title { font-size: var(--font-size-4xl, 2.25rem); }
  }
</style>
```

---

## Backgrounds Integration

### Build the Package

`@austencloud/backgrounds` has source but no `dist/`. Needs `tsc` build first.

### Svelte Wrapper

Create `src/lib/components/BackgroundCanvas.svelte`:

```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { getBackgroundController, BackgroundType } from '@austencloud/backgrounds';

  let container: HTMLDivElement;
  let controller: ReturnType<typeof getBackgroundController> | null = null;

  onMount(() => {
    if (!browser) return;
    controller = getBackgroundController();
    controller.initialize(container);
    controller.setBackground(BackgroundType.DeepOcean); // or configurable
  });

  onDestroy(() => {
    controller?.destroy();
  });
</script>

<div class="background-canvas-container" bind:this={container}></div>
```

Import `@austencloud/backgrounds/css/backgrounds.css` in `app.css` for the container/crossfade styles.

### Layout Integration

In `+layout.svelte`, render `<BackgroundCanvas />` before the page content. The CSS positions it as `position: fixed; z-index: -1` so content renders on top.

### Background Choice

For a tie-dye storefront on a cream background, recommended options:
- **Deep Ocean** — blues and teals match the brand palette, fish add whimsy
- **Cherry Blossom** — organic floating petals, warm tones
- **Simple Gradient** — subtle animated gradient in OCC brand colors (most conservative)

The background type should be configurable, not hardcoded. Store the preference or let the user cycle through options.

---

## Files to Change

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Edit | Remove `@tailwindcss/vite`, add `@austencloud/theme`, `@austencloud/backgrounds` |
| `vite.config.ts` | Edit | Remove `tailwindcss()` plugin |
| `src/app.css` | Rewrite | Remove Tailwind, add token imports + OCC brand tokens + global resets |
| `src/lib/components/BackgroundCanvas.svelte` | Create | Animated canvas wrapper |
| `src/routes/+layout.svelte` | Rewrite | Scoped CSS, background canvas, semantic markup |
| `src/lib/components/Header.svelte` | Rewrite | Scoped CSS |
| `src/lib/components/Footer.svelte` | Rewrite | Scoped CSS |
| `src/lib/components/ProductCard.svelte` | Rewrite | Scoped CSS |
| `src/routes/+page.svelte` | Rewrite | Scoped CSS (homepage) |
| `src/routes/shop/+page.svelte` | Rewrite | Scoped CSS |
| `src/routes/gallery/+page.svelte` | Rewrite | Scoped CSS |
| `src/routes/product/[slug]/+page.svelte` | Rewrite | Scoped CSS |
| `src/routes/about/+page.svelte` | Rewrite | Scoped CSS |
| `src/routes/techniques/+page.svelte` | Rewrite | Scoped CSS |
| `src/routes/checkout/success/+page.svelte` | Rewrite | Scoped CSS |
| `src/routes/checkout/cancel/+page.svelte` | Rewrite | Scoped CSS |

Admin pages (`/admin/**`) can be migrated separately — they already use scoped CSS with `--color-*` tokens.

---

## Out of Scope

- Admin page migration (already scoped CSS, can be aligned later)
- New page designs or layout changes (1:1 visual parity with current Tailwind version)
- SEO, structured data, OG tags
- Dark mode (OCC is light-theme only for now)

---

## Prerequisites

- `@austencloud/theme` package built (`tsc` in packages/theme)
- `@austencloud/backgrounds` package built (`tsc` in packages/backgrounds)
- Both linked or file-referenced in OCC's package.json

---

## Success Criteria

1. Zero Tailwind dependencies or imports remain
2. Every storefront component uses scoped `<style>` blocks
3. All tokens reference `--occ-*` or `--theme-*` custom properties
4. `cursor: pointer` on all interactive elements
5. Transitions use shared duration/easing tokens
6. Animated canvas background renders behind the storefront
7. `prefers-reduced-motion` respected globally
8. Visual parity with current design (same colors, spacing, typography — just implemented differently)
