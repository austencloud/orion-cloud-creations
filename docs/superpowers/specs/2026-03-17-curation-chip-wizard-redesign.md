# OCC Curation Redesign: Chips + Wizard Quick-Tag

**Date:** 2026-03-17
**Status:** Draft

---

## Problem

The curation interface uses small checkboxes in a vertical list for tag selection. With 7 categories and 30+ tags visible, this creates visual overload — tiny hit targets, old-school aesthetics, and high cognitive load when curating 705 photos one at a time.

The single-item spotlight workflow requires the curator to make ~5 tag decisions per photo × 705 photos = ~3,500 individual decisions. This is exhausting.

## Solution: Two Complementary Improvements

### Part 1: Chip-Based Tag Picker (shared package upgrade)

Replace the checkbox-list UI in `TagPickerPanel.svelte` (in `@austencloud/media-manager`) with toggleable colored chips.

**What changes:**
- Each tag renders as a pill-shaped chip with the tag's color as background tint
- Active tags get full color fill + checkmark icon; inactive get subtle outline with color dot
- Partial state (some selected) uses dashed border + partial-fill background + count badge (e.g., "3/5") to clearly distinguish from "not applied"
- Minimum touch target: 40px height (up from 24px checkbox rows)
- Tags within each category flow as a wrapping flex row (`flex-wrap: wrap`) instead of vertical `flex-direction: column`
- Category headers remain collapsible
- Search/filter stays at top

**Visual states:**
| State | Appearance | Distinction cue |
|-------|-----------|-----------------|
| Applied (all) | Filled background in tag color, white checkmark, solid border | Bold, saturated |
| Partial (some) | Dashed border in tag color, 30% fill, count badge "N/M" | Dashed + count |
| Not applied | 1px solid `--mm-border`, tag color dot prefix, muted text | Dim, no fill |

**Spotlight sidebar note:** The `MediaSpotlightCurator` renders the tag picker in a fixed-width right panel (~280px). Chip flow will wrap within this width. After implementation, visually verify that the sidebar layout still works — chips should wrap into 2-3 per row at that width, which is comparable density to the old checkbox list.

**Why chips > checkboxes:**
- Larger touch targets reduce mis-taps
- Color-coded fills give instant visual scanning (you see the palette at a glance)
- Wrapping flow uses horizontal space better than a vertical list
- Modern, tactile feel that matches the rest of the admin design

### Part 2: Wizard Quick-Tag Mode (OCC-specific)

A new grid-based tagging flow accessed from the curate page. The wizard walks through one tag value at a time, showing all photos in a selectable grid. This is an OCC-specific feature (not in the shared package).

**Flow:**

1. User clicks "Quick Tag" button on the curate page
2. Wizard opens full-screen with a thumbnail grid of all items needing review
3. Wizard steps through categories in order (from `OCC_CATEGORY_ORDER`): Garment → Technique → Color → etc.
4. For each category, it steps through each tag value that has at least one untagged item (skip tags where every item is already tagged). Tags ordered alphabetically within each category.
5. For each tag step:
   - Header: "Select all **shirts**" (with the tag chip displayed)
   - Grid shows thumbnails. Items already tagged with *this specific tag* show a checkmark overlay and are dimmed
   - User clicks photos to select/deselect. Selected items get a colored border + checkmark
   - "Apply & Next" button commits the selection and moves to the next tag value
   - "Skip" to move on without applying
6. User can skip an entire category via "Skip Category" button in the category interstitial
7. After all categories: summary screen showing tag counts applied
8. Remaining untagged items can fall back to the single-item spotlight curator

**Grid interaction:**
- Thumbnail size: ~120px, responsive grid that fills the viewport
- Click to toggle selection (not drag — too error-prone at this scale)
- "Select All" / "Deselect All" buttons in the toolbar
- Item count: "12 selected · 705 total"
- Already-tagged items (for this specific tag) stay visible but dimmed so you can see context
- All 705 thumbnails render directly (no virtual scroll) — at 120px × ~15KB each this is well within browser capacity. Thumbnails lazy-load via `loading="lazy"` on `<img>`.

**Keyboard shortcuts:**
- `Enter` — Apply & Next
- `S` — Skip to next tag (not Tab — Tab stays for browser focus navigation)
- `Escape` — Exit wizard (with confirmation if there's unapplied work)

**Error handling:**
- If a Firestore write fails on "Apply", show an error toast and stay on the current step (don't advance). The user can retry or skip.

**Why wizard > one-at-a-time:**
- Flips the cognitive model: instead of "what are all the tags for this one photo" it's "which photos match this one tag"
- Visual scanning of a grid is fast — you can spot all shirts in 2 seconds
- Reduces 3,500 individual decisions to ~50 wizard steps with batch selections
- The wizard tells you what to do at each step, eliminating decision fatigue

## Architecture

### Part 1: Shared Package Changes

**File:** `packages/media-manager/src/grid/TagPickerPanel.svelte`

The existing component gets a visual overhaul. No API changes — same props, same callbacks. The internal rendering changes from checkbox rows to chip flow.

Key CSS change: `.picker-tag-list` goes from `flex-direction: column` to `flex-direction: row; flex-wrap: wrap; gap: 6px`.

Chip rendering is built inline in the picker using `getTagHex()` for colors and CSS custom properties for theming. No dependency on external chip components.

**Blast radius:** This changes the tag picker everywhere the shared `MediaSpotlightCurator` is used (currently OCC and Cirque Aflame's spotlight mode). Cirque Aflame also has its own *local* `TagPickerPanel.svelte` which is unaffected — that component is separate from the shared package.

### Part 2: OCC-Specific Wizard

**New files in OCC:**

| File | Purpose |
|------|---------|
| `src/routes/admin/media/curate/wizard/+page.svelte` | Wizard route, orchestrates flow + data loading |
| `src/lib/admin/components/WizardGrid.svelte` | Thumbnail grid with selection state |
| `src/lib/admin/components/WizardStepHeader.svelte` | "Select all [tag]" header with chip + progress |
| `src/lib/admin/components/WizardSummary.svelte` | End-of-wizard summary |

**Data flow:**
- Wizard route loads its own data via `mediaItemService.getAll()` and `mediaTagService.getAll()` (same services, separate fetch — keeps the route self-contained)
- Generates a step queue: `Array<{ category: string, tag: MediaTag }>` from `OCC_CATEGORY_ORDER` × tags in each category, filtered to only include tags with at least one untagged item, alphabetical within category
- Each step shows all items in the grid. Items already tagged with the current tag are dimmed. Untagged items are selectable.
- On "Apply", calls `controller.applyTagToItems(selectedItems, tag)` with optimistic update + Firestore write
- Progress persists in component state (no server-side wizard state needed)
- On error: toast notification, stay on current step

**Entry point:**
- Add "Quick Tag" button to existing curate page header, next to "Start Curating"
- Links to `/admin/media/curate/wizard`

**Shared package versioning:** After Part 1 changes, rebuild `@austencloud/media-manager` and update the dependency in OCC's `package.json`. The shared packages use a local linking strategy (`file:` protocol or npm link).

## Scope

### In scope
- Chip redesign of `TagPickerPanel` in shared `@austencloud/media-manager` package
- Wizard quick-tag mode as new OCC route
- Touch-friendly sizing throughout
- Visual verification of spotlight sidebar after chip changes

### Out of scope
- Changes to the single-item spotlight curator layout (beyond verifying it still works)
- Changes to Cirque Aflame's local `TagPickerPanel.svelte` or `TagChip.svelte`
- Drag-to-select in wizard grid
- Undo/redo in wizard
- Wizard state persistence across page reloads
- Virtual scrolling (not needed at 705 items)

## Testing

- Visual verification in browser at `localhost:5176/admin/media/curate`
- Chip states: applied, partial, not-applied render with clear visual distinction
- Partial state count badge shows correct N/M values
- Spotlight sidebar: chips wrap correctly in ~280px panel
- Wizard flow: step through 2-3 tags, verify Firestore writes
- Wizard skips tags with zero untagged items
- Keyboard navigation: Enter (apply), S (skip), Escape (exit)
- Grid selection: click to toggle, select all/deselect all
- Error case: simulated Firestore failure shows toast, stays on step
- Responsive: grid reflows at different viewport widths
