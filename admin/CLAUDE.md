# OCC Admin — Claude Code Guidelines

## What This Is

Admin panel for Orion Cloud Creations. Photo tagging and inventory management for Austen's handmade tie-dye clothing.

Ported from Cirque Aflame's ringmaster media tagging system (core subset).

## Tech Stack

- SvelteKit 5 + TypeScript + Tailwind v4
- Firebase Firestore (new project: orion-cloud-creations)
- Cloudflare R2 for photo storage
- Port 5180 (avoids conflicts with OCC storefront on 5176, TKA on 5173/5174)

## Project Structure

```
src/
  lib/
    types/media.ts          — MediaTag, MediaItem, MediaLibraryState types
    services/
      firebase.ts           — Firebase init + collection refs
      media.ts              — Firestore CRUD (tags, items, state)
      media-tagging.svelte.ts — Optimistic tag controller (Svelte 5 runes)
    components/
      tags/                 — Tag management UI (TagManager, TagChip, pickers, etc.)
      media/                — Media grid, toolbar, spotlight, tag picker, sidebar
  routes/
    +layout.svelte          — Dark theme layout with nav
    +page.svelte            — Redirect to /media
    media/+page.svelte      — Main media management page
    tags/+page.svelte       — Standalone tag manager
    seed/+page.svelte       — One-time import from photo-catalog.json
```

## Firebase Collections

- `mediaTags` — tag definitions (name, color, category)
- `mediaItems` — photo entries (filename, tags[], URLs, metadata)
- `mediaLibraryState` — UI state persistence (single doc "current")

## R2 Structure

```
occ-media/
  originals/    — full-size photos
  thumbnails/   — 800px compressed thumbnails
```

## Domain Categories

- **garment** — shirt, long_sleeve, tank, hoodie, etc.
- **technique** — ice_dye, spiral, shibori, mandala, etc.
- **color** — specific color names
- **colorFamily** — warm, cool, rainbow, earth, etc.
- **photoType** — flat_lay, hero, lifestyle, process, etc.
- **size** — S, M, L, XL, WS, WM, YM, etc.
- **custom** — user-defined

## Setup

1. Create Firebase project at console.firebase.google.com
2. Create Firestore database (start in test mode)
3. Copy Firebase config to .env (see .env.example)
4. Create R2 bucket "occ-media" in Cloudflare dashboard
5. Set R2 public URL in .env
6. Run `npm install && npm run dev`
7. Visit /seed to import photo-catalog.json

## Relationship to Storefront

This admin app is separate from the storefront (F:\orion-cloud-creations).
The storefront currently uses static data in src/lib/data/products.ts.
Eventually the storefront will read from Shopify, which will be populated from data curated here.

## Dev Server

```bash
npm run dev    # port 5180
npm run build  # production build
npm run check  # TypeScript check
```
