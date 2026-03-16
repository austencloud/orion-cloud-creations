# OCC Admin Tagger — Design Spec

## Overview

Separate SvelteKit admin app for managing Orion Cloud Creations' photo inventory. Ported from Cirque Aflame's ringmaster media tagging system (core subset). Provides a UI for viewing, tagging, and correcting AI-generated photo metadata.

## Decisions

| Decision | Choice |
|----------|--------|
| Scope | Core subset (tag CRUD, color-coded categories, tag picker, media grid, batch tagging) |
| Structure | Separate admin app at `F:\occ-admin\` with own repo |
| Storage | New Firebase project (`orion-cloud-creations`) |
| Photo hosting | Cloudflare R2 |
| Initial data | Auto-seed from `photo-catalog.json` on first boot |
| Auth | None initially (local dev tool) |

## Architecture

### Tech Stack
- SvelteKit 5 + TypeScript + Tailwind v4
- Firebase JS SDK (Firestore)
- AWS S3 SDK (for R2 compatibility)
- ImageMagick (local, for thumbnail generation — already installed)

### Firebase Collections

**`mediaTags`** — Tag definitions
```typescript
interface MediaTag {
  id: string
  name: string
  color: TagColor  // flame, gold, royal, cyan, green, red, purple, navy, teal, pink, lime, gray
  category: string // garment, technique, color, colorFamily, photoType, size, custom
  description?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**`mediaItems`** — Photo entries
```typescript
interface MediaItem {
  id: string
  filename: string           // original filename
  tags: string[]             // array of tag IDs
  r2Key: string              // R2 object key
  r2ThumbnailKey: string     // R2 thumbnail key
  thumbnailUrl: string       // R2 public URL for thumbnail
  fullUrl: string            // R2 public URL for full image
  description: string        // AI-generated description
  suggestedName: string      // AI-suggested product name
  sizeFromFilename?: string  // extracted size code
  notes?: string             // special notes
  needsReview: boolean       // flag for items needing human review
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**`mediaLibraryState`** — UI state persistence (single doc "current")
```typescript
interface MediaLibraryState {
  gridSize: number
  searchQuery: string
  activeTags: string[]
  filterMode: 'and' | 'or'
  categoryLabels: Record<string, string>
}
```

### R2 Structure
```
occ-media/
  originals/    — full-size photos
  thumbnails/   — 800px compressed thumbnails
```

### Route Structure
```
/                — redirect to /media
/media           — main grid + tag sidebar + tag picker panel
/media/[id]      — spotlight detail view
/tags            — standalone tag manager
/seed            — one-time seed page (imports photo-catalog.json)
```

## Components (Ported from Ringmaster Core Subset)

### Tag Management
- **TagManager.svelte** — modal for managing all tags (CRUD, search, filter by category, batch ops)
- **TagManagerTagRow.svelte** — single tag row with rename, color picker, category picker, delete
- **TagManagerToolbar.svelte** — search, sort, category filter
- **TagManagerColorPicker.svelte** — 12-color grid
- **TagManagerCategoryPicker.svelte** — category dropdown
- **TagManagerBatchBar.svelte** — batch actions toolbar
- **TagManagerInlineCreate.svelte** — new tag form
- **TagChip.svelte** — colored tag badge

### Media Grid
- **MediaGrid.svelte** — thumbnail grid with selection, right-click context
- **MediaGridItem.svelte** — single thumbnail card with tag chips, selection checkbox
- **MediaToolbar.svelte** — search, grid size, filter controls
- **MediaSpotlight.svelte** — detail view for single item

### Tag Application
- **TagPickerPanel.svelte** — category-organized tag picker for bulk tagging selected items
- **TagTreeView.svelte** — sidebar tree for filtering by tags
- **TagTreeNode.svelte** — recursive tree node

### Services
- **media.ts** — Firestore CRUD for tags, items, library state
- **media-tagging.svelte.ts** — optimistic tag application controller
- **r2.ts** — R2 upload/URL generation (server-side)
- **seed.ts** — auto-import from photo-catalog.json

## Domain Categories

Instead of Cirque Aflame's performer/act/season, OCC uses:
- **garment** — shirt, long_sleeve, tank, hoodie, crewneck, leggings, bandana, tapestry, button_down, polo, onesie, dress, shorts, socks
- **technique** — ice_dye, scrunch, spiral, geode, crumple, shibori, bullseye, mandala, reverse, starburst, chevron
- **color** — specific color tags (cyan, magenta, gold, forest green, etc.)
- **colorFamily** — warm, cool, neutral, rainbow, monochrome, earth
- **photoType** — flat_lay, hero, lifestyle, process, detail, closeup, group
- **size** — XS, S, M, L, XL, 2XL, 3XL, WS, WM, WL, WXL, YS, YM, YL
- **custom** — user-defined tags

## Seed Process

On first boot (or via `/seed` route):
1. Read `photo-catalog.json` (705 entries)
2. Create tags in Firestore for all unique values across categories
3. Create mediaItem docs with tag references
4. Upload thumbnails from `PHOTOS/thumbnails/` to R2
5. Upload originals from `PHOTOS/` to R2
6. Mark items with `needsReview: true` so user knows to verify AI tags

## What This Does NOT Include
- Hierarchical tags (parent/child)
- Tag prerequisites
- Tag aliases
- Smart collections
- Drag-to-merge
- Firebase Auth
- Any storefront integration (that's a separate task)
