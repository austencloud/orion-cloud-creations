# Orion Cloud Creations — Claude Code Guidelines

## What This Is

E-commerce site for Austen's handmade tie-dye clothing. SvelteKit 5 + TypeScript + Tailwind CSS v4.

The goal: get this live and selling inventory Austen already has sitting in bins. Lowest-friction revenue stream to reactivate.

---

## Current State (as of March 14, 2026)

### What's Built (Phase 1 Static Site — Complete)

All pages are built with static mock data and Tailwind styling:

| Page | Route | Status |
|------|-------|--------|
| Homepage | `/` | Hero, featured products, technique highlights, about teaser, newsletter CTA |
| Shop | `/shop` | Product grid with garment type + technique filters, empty state |
| Gallery | `/gallery` | Full collection grid (including sold pieces) |
| Product Detail | `/product/[slug]` | Image gallery, size selector, add to cart, details, trust signals, related products |
| About | `/about` | Artist story, "what makes this different" checklist, process photos |
| Techniques | `/techniques` | Procion dyes section, ice dye, shibori, spiral, mandala, care instructions |
| Layout | `+layout.svelte` | Header (desktop/mobile nav, cart icon) + Footer |

### Components
- `Header.svelte` — Fixed top nav, mobile hamburger menu, cart icon (placeholder)
- `Footer.svelte` — 3-column footer with brand, links, contact
- `ProductCard.svelte` — Image card with sold/one-of-a-kind badges, price, garment type

### Data Layer
- `src/lib/types/product.ts` — Product, ProductImage types, GarmentType/Technique/Size unions
- `src/lib/data/products.ts` — 13 hardcoded products with helper functions (getBySlug, getFeatured, getAvailable, formatPrice)
- Prices are in cents (5500 = $55)

### Design System
- `app.css` — Tailwind v4 with `@theme` custom colors: cream, warm-white, charcoal, muted, accent-purple/teal/gold
- Font: Inter (Google Fonts, loaded in layout)
- Clean, gallery-first aesthetic with light backgrounds so dye colors pop

### What Does NOT Exist Yet
- **No images.** All pages reference `/images/products/*.jpg`, `/images/hero/*.jpg`, `/images/process/*.jpg`, `/images/logo.png` — none of these files exist. The site renders but shows broken images.
- **No Shopify integration.** Everything is static data. No cart functionality, no checkout, no payment processing.
- **No deployment.** Not on Vercel or anywhere.
- **No SEO metadata.** No structured data (JSON-LD), no sitemap, no Open Graph tags.
- **No email/newsletter.** The newsletter form is a static placeholder.

---

## What to Work On Next

### Priority 1: Make It Visually Functional
The site needs placeholder images or Austen needs to photograph inventory. Without images, nothing looks right. Options:
- Generate colorful placeholder images (solid gradients or abstract patterns) so the layout can be evaluated
- Wait for Austen to provide real product photos

### Priority 2: Shopify Storefront API Integration
This is the path to actual revenue. The briefing doc specifies headless Shopify:
- Set up Shopify Storefront API connection
- Replace static `products.ts` data with API calls
- Implement cart (add/remove/update) using Storefront API
- Implement checkout redirect to Shopify-hosted checkout
- Reference: Vercel SvelteKit Commerce template pattern

### Priority 3: Deployment
- Deploy to Vercel (SvelteKit adapter-auto works)
- Connect domain (orioncloudcreations.com)

### Priority 4: SEO & Polish
- JSON-LD structured data on product pages (Product schema)
- Open Graph / Twitter Card meta tags
- XML sitemap
- Image optimization (WebP/AVIF, srcset, lazy loading)

---

## Architecture Notes

This is intentionally simple. Not TKA Scribe. No DI containers, no service classes, no ITI.

- Static data in `src/lib/data/`
- Types in `src/lib/types/`
- Components in `src/lib/components/`
- Routes follow SvelteKit conventions
- Tailwind v4 with `@theme` block (not tailwind.config)

Don't over-engineer this. It's a storefront, not a platform.

---

## Brand & Copy Rules

Same rules as global CLAUDE.md apply here. Additionally:

- **Gallery-first, store-second.** It should feel like walking into an art gallery that sells the art.
- **No apologies for premium pricing.** $50-80 for handmade, Procion-dyed, 100% cotton is fair.
- **Confident about quality.** Procion MX dyes form a covalent bond with cellulose. This is chemistry, not craft paint. State it plainly.
- **No AI copy.** Run the fire jam test: would Austen say this to another spinner? If it sounds like a press release, rewrite it.

---

## Shared Skills System

OCC uses 7 shared skills from `@austencloud/claude-skills`: **commit**, **changelog**, **check**, **ai-bust**, **monolith**, **deadcode**, **audit**.

- **Config:** `.claude/skills.config.json` declares which skills this project uses and project-specific variables.
- **Sync:** `npx @austencloud/claude-skills sync` renders templates from the shared package into `.claude/skills/` and `.claude/agents/`.
- **Do not edit synced files directly.** They have a managed-by comment at the top. Edits go to the template in `E:/shared-packages/packages/claude-skills/templates/` and then re-sync.
- **Audit tooling:** `ac-audit` and `ac-evidence` CLI commands come from `@austencloud/code-quality` (not local scripts).

---

## Dev Server

```bash
npm run dev          # starts on port 5176
npm run build        # production build
npm run check        # TypeScript check
```

Port 5176 is configured in package.json. No conflicts with TKA (5173/5174).

---

## Full Briefing Document

The original strategic briefing (business model, market context, data model spec, implementation phases, SEO strategy, photography standards) was provided in the conversation that built Phase 1. Key points are captured above, but if you need the full context, ask Austen.
