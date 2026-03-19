# Curation Chip + Wizard Quick-Tag Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace checkbox-based tag selection with colored chips in the shared media-manager package, and add a wizard-guided quick-tag mode to OCC's curate page.

**Architecture:** Two independent parts. Part 1 modifies `TagPickerPanel.svelte` in `@austencloud/media-manager` (shared package) — visual-only change, no API break. Part 2 adds a new `/admin/media/curate/wizard` route in OCC with a grid-based tagging flow. Both use existing Firestore services and the `MediaTaggingController`.

**Tech Stack:** SvelteKit 5, TypeScript, CSS custom properties (`--mm-*` tokens), Firestore via existing services.

**Spec:** `docs/superpowers/specs/2026-03-17-curation-chip-wizard-redesign.md`

---

## File Map

### Part 1: Shared Package (chip redesign)

| Action | File | Responsibility |
|--------|------|---------------|
| Modify | `F:/_CODE/shared-packages/packages/media-manager/src/grid/TagPickerPanel.svelte` | Replace checkbox rows with chip flow layout |

### Part 2: OCC Wizard

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `src/lib/admin/components/wizard/WizardGrid.svelte` | Selectable thumbnail grid |
| Create | `src/lib/admin/components/wizard/WizardStepHeader.svelte` | Step instruction + progress bar |
| Create | `src/lib/admin/components/wizard/WizardSummary.svelte` | End-of-wizard stats |
| Create | `src/routes/admin/media/curate/wizard/+page.svelte` | Wizard route, orchestration, data loading |
| Modify | `src/routes/admin/media/curate/+page.svelte` | Add "Quick Tag" entry button |

---

## Task 1: Chip-Based TagPickerPanel

**Files:**
- Modify: `F:/_CODE/shared-packages/packages/media-manager/src/grid/TagPickerPanel.svelte`

This is a visual-only refactor. Same Props interface, same callbacks. The rendering changes from checkbox rows to colored chip flow.

- [ ] **Step 1: Replace the tag button markup (lines 136-169)**

Replace the `.picker-tag-list` and `.picker-tag-btn` markup. Each tag becomes a pill chip using `getTagHex()` for inline color styles.

In `TagPickerPanel.svelte`, replace the tag list rendering block:

```svelte
{#if !collapsedCategories.has(category)}
	<div class="picker-tag-list">
		{#each categoryTags as tag (tag.id)}
			{@const state = getTagState(tag)}
			{@const hex = getTagHex(tag)}
			<button
				class="picker-chip"
				class:applied={state === 'all'}
				class:partial={state === 'some'}
				style="--chip-hex: {hex}"
				onclick={() => handleTagClick(tag)}
				title={state === 'all'
					? 'Applied. Click to remove.'
					: state === 'some'
						? 'On some items. Click to apply to all.'
						: 'Click to apply.'}
			>
				{#if state === 'all'}
					<svg class="chip-check" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M2.5 6l2.5 2.5L9.5 4" />
					</svg>
				{:else if state === 'some'}
					<span class="chip-count">
						{selectedItems.filter(i => i.tags.includes(tag.id)).length}/{selectedItems.length}
					</span>
				{:else}
					<span class="chip-dot" style="background: {hex}"></span>
				{/if}
				<span class="chip-label">{tag.name}</span>
			</button>
		{/each}
	</div>
{/if}
```

- [ ] **Step 2: Replace the tag list and tag button CSS (lines 321-400)**

Remove all `.picker-tag-list`, `.picker-tag-btn`, `.picker-checkbox`, `.picker-check-icon`, `.picker-tag-dot`, `.picker-tag-name` styles. Replace with chip styles:

```css
.picker-tag-list {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
	padding: 4px 8px 10px;
}

.picker-chip {
	display: inline-flex;
	align-items: center;
	gap: 5px;
	padding: 6px 12px;
	min-height: 40px;
	border: 1px solid var(--mm-border, #333355);
	border-radius: 9999px;
	background: transparent;
	color: var(--mm-text-muted, #9999b0);
	font-size: 12px;
	font-weight: 500;
	cursor: pointer;
	white-space: nowrap;
	transition: all 0.15s;
	user-select: none;
}

.picker-chip:hover {
	border-color: var(--chip-hex);
	background: color-mix(in srgb, var(--chip-hex) 10%, transparent);
	color: var(--mm-text, #e8e8f0);
}

.picker-chip.applied {
	background: color-mix(in srgb, var(--chip-hex) 25%, transparent);
	border-color: var(--chip-hex);
	color: var(--mm-text, #e8e8f0);
}

.picker-chip.partial {
	background: color-mix(in srgb, var(--chip-hex) 12%, transparent);
	border-color: var(--chip-hex);
	border-style: dashed;
	color: var(--mm-text, #e8e8f0);
}

.chip-check {
	width: 12px;
	height: 12px;
	flex-shrink: 0;
	color: var(--chip-hex);
}

.chip-count {
	font-size: 10px;
	font-weight: 600;
	color: var(--chip-hex);
	font-variant-numeric: tabular-nums;
}

.chip-dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	flex-shrink: 0;
}

.chip-label {
	line-height: 1;
}
```

- [ ] **Step 3: Verify in browser**

Open OCC at `localhost:5176/admin/media/curate`, open the spotlight curator, and verify:
- Tags display as colored pill chips in a wrapping row
- Applied tags show filled background + checkmark
- Not-applied tags show dot + muted text
- Chips wrap correctly in the 280px sidebar
- Clicking toggles tag state

- [ ] **Step 4: Rebuild shared package**

```bash
cd F:/_CODE/shared-packages
npm run build --workspace=packages/media-manager
```

- [ ] **Step 5: Commit**

```bash
cd F:/_CODE/shared-packages
git add packages/media-manager/src/grid/TagPickerPanel.svelte
git commit -m "feat(media-manager): replace checkbox tag picker with colored chip flow"
```

---

## Task 2: WizardGrid Component

**Files:**
- Create: `F:/orion-cloud-creations/src/lib/admin/components/wizard/WizardGrid.svelte`

Selectable thumbnail grid. Each thumbnail is clickable, showing selection state with a colored border and checkmark overlay.

- [ ] **Step 1: Create the component**

```svelte
<!--
	WizardGrid.svelte — Selectable thumbnail grid for wizard quick-tag.
	Shows all items with selection and already-tagged states.
-->
<script lang="ts">
	import type { MediaItem } from '@austencloud/media-manager';

	interface Props {
		items: MediaItem[];
		/** IDs of items currently selected by the user in this step. */
		selectedIds: Set<string>;
		/** IDs of items already tagged with the current tag (shown dimmed). */
		alreadyTaggedIds: Set<string>;
		/** Hex color for selection highlight. */
		accentHex: string;
		ontoggle: (itemId: string) => void;
	}

	const { items, selectedIds, alreadyTaggedIds, accentHex, ontoggle }: Props = $props();
</script>

<div class="wizard-grid">
	{#each items as item (item.id)}
		{@const isSelected = selectedIds.has(item.id)}
		{@const isTagged = alreadyTaggedIds.has(item.id)}
		<button
			class="grid-thumb"
			class:selected={isSelected}
			class:tagged={isTagged}
			style="--accent: {accentHex}"
			onclick={() => { if (!isTagged) ontoggle(item.id); }}
			disabled={isTagged}
			aria-label="{item.suggestedName || item.filename}{isTagged ? ' (already tagged)' : ''}"
		>
			<img
				src={item.thumbnailUrl || item.url}
				alt=""
				loading="lazy"
				class="thumb-img"
			/>
			{#if isSelected}
				<div class="select-overlay">
					<svg class="select-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
						<path d="M5 12l5 5L19 7" />
					</svg>
				</div>
			{/if}
			{#if isTagged}
				<div class="tagged-overlay">
					<svg class="tagged-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
						<path d="M5 12l5 5L19 7" />
					</svg>
				</div>
			{/if}
		</button>
	{/each}
</div>

<style>
	.wizard-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 6px;
		padding: 8px;
		overflow-y: auto;
	}

	.grid-thumb {
		position: relative;
		aspect-ratio: 1;
		border: 3px solid transparent;
		border-radius: 8px;
		overflow: hidden;
		cursor: pointer;
		background: var(--color-surface, #1a1a2e);
		padding: 0;
		transition: border-color 0.12s, opacity 0.12s;
	}

	.grid-thumb:hover:not(:disabled) {
		border-color: color-mix(in srgb, var(--accent) 50%, transparent);
	}

	.grid-thumb.selected {
		border-color: var(--accent);
		box-shadow: 0 0 0 1px var(--accent);
	}

	.grid-thumb.tagged {
		opacity: 0.35;
		cursor: default;
	}

	.thumb-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.select-overlay {
		position: absolute;
		inset: 0;
		background: color-mix(in srgb, var(--accent) 20%, transparent);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.select-check {
		width: 32px;
		height: 32px;
		color: white;
		filter: drop-shadow(0 1px 3px rgba(0,0,0,0.5));
	}

	.tagged-overlay {
		position: absolute;
		top: 4px;
		right: 4px;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: rgba(0,0,0,0.6);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.tagged-check {
		width: 14px;
		height: 14px;
		color: rgba(255,255,255,0.7);
	}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/admin/components/wizard/WizardGrid.svelte
git commit -m "feat: add WizardGrid thumbnail selection component"
```

---

## Task 3: WizardStepHeader Component

**Files:**
- Create: `F:/orion-cloud-creations/src/lib/admin/components/wizard/WizardStepHeader.svelte`

Displays the current wizard instruction, tag chip, progress, and action buttons.

- [ ] **Step 1: Create the component**

```svelte
<!--
	WizardStepHeader.svelte — Instruction bar for each wizard step.
	Shows "Select all [tag]" with progress and action buttons.
-->
<script lang="ts">
	import type { MediaTag } from '@austencloud/media-manager';
	import { getTagHex } from '@austencloud/media-manager';

	interface Props {
		tag: MediaTag;
		categoryLabel: string;
		stepIndex: number;
		totalSteps: number;
		selectedCount: number;
		totalItems: number;
		alreadyTaggedCount: number;
		onapply: () => void;
		onskip: () => void;
		onskipcategory: () => void;
		onselectall: () => void;
		ondeselectall: () => void;
		onexit: () => void;
	}

	const {
		tag, categoryLabel, stepIndex, totalSteps,
		selectedCount, totalItems, alreadyTaggedCount,
		onapply, onskip, onskipcategory,
		onselectall, ondeselectall, onexit
	}: Props = $props();

	let hex = $derived(getTagHex(tag));
	let progressPercent = $derived(Math.round(((stepIndex + 1) / totalSteps) * 100));
</script>

<div class="step-header">
	<!-- Progress bar -->
	<div class="progress-track">
		<div class="progress-fill" style="width: {progressPercent}%"></div>
	</div>

	<div class="step-content">
		<!-- Left: instruction -->
		<div class="step-instruction">
			<span class="step-category">{categoryLabel}</span>
			<span class="step-prompt">Select all</span>
			<span class="step-chip" style="--chip-hex: {hex}">
				<span class="chip-dot" style="background: {hex}"></span>
				{tag.name}
			</span>
		</div>

		<!-- Center: counts -->
		<div class="step-counts">
			<span class="count-selected">{selectedCount} selected</span>
			<span class="count-sep">&middot;</span>
			<span class="count-total">{totalItems - alreadyTaggedCount} remaining</span>
			{#if alreadyTaggedCount > 0}
				<span class="count-sep">&middot;</span>
				<span class="count-tagged">{alreadyTaggedCount} already tagged</span>
			{/if}
		</div>

		<!-- Right: actions -->
		<div class="step-actions">
			<button class="btn-text" onclick={onselectall}>Select All</button>
			<button class="btn-text" onclick={ondeselectall}>Deselect All</button>
			<button class="btn-text" onclick={onskipcategory}>Skip Category</button>
			<button class="btn-secondary" onclick={onskip}>Skip</button>
			<button
				class="btn-primary"
				onclick={onapply}
				disabled={selectedCount === 0}
				style="--accent: {hex}"
			>
				Apply & Next
			</button>
		</div>
	</div>

	<!-- Step counter + exit -->
	<div class="step-meta">
		<span class="step-counter">{stepIndex + 1} / {totalSteps}</span>
		<button class="btn-exit" onclick={onexit}>
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M4 4l8 8M12 4l-8 8" />
			</svg>
		</button>
	</div>
</div>

<style>
	.step-header {
		position: relative;
		background: var(--color-surface-raised, #222240);
		border-bottom: 1px solid var(--color-border, #333355);
	}

	.progress-track {
		height: 3px;
		background: rgba(255,255,255,0.08);
	}

	.progress-fill {
		height: 100%;
		background: var(--color-accent, #6366f1);
		transition: width 0.3s ease-out;
	}

	.step-content {
		display: flex;
		align-items: center;
		gap: 20px;
		padding: 12px 16px;
		flex-wrap: wrap;
	}

	.step-instruction {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 15px;
		font-weight: 600;
		color: var(--color-text, #e8e8f0);
	}

	.step-category {
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-text-muted, #9999b0);
		padding: 3px 8px;
		border: 1px solid var(--color-border, #333355);
		border-radius: 4px;
	}

	.step-prompt {
		color: var(--color-text-muted, #9999b0);
		font-weight: 400;
	}

	.step-chip {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 4px 12px;
		border-radius: 9999px;
		background: color-mix(in srgb, var(--chip-hex) 20%, transparent);
		border: 1px solid color-mix(in srgb, var(--chip-hex) 40%, transparent);
		font-size: 14px;
		font-weight: 600;
	}

	.chip-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}

	.step-counts {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 12px;
		color: var(--color-text-muted, #9999b0);
	}

	.count-selected { font-weight: 600; color: var(--color-text, #e8e8f0); }
	.count-sep { opacity: 0.4; }
	.count-tagged { font-style: italic; opacity: 0.7; }

	.step-actions {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-left: auto;
	}

	.btn-text {
		padding: 6px 10px;
		border: none;
		border-radius: 6px;
		background: transparent;
		color: var(--color-text-muted, #9999b0);
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
		transition: color 0.12s, background 0.12s;
	}

	.btn-text:hover {
		color: var(--color-text, #e8e8f0);
		background: rgba(255,255,255,0.06);
	}

	.btn-secondary {
		padding: 7px 14px;
		border: 1px solid var(--color-border, #333355);
		border-radius: 6px;
		background: transparent;
		color: var(--color-text-muted, #9999b0);
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.12s;
	}

	.btn-secondary:hover {
		border-color: var(--color-text-muted, #9999b0);
		color: var(--color-text, #e8e8f0);
	}

	.btn-primary {
		padding: 7px 16px;
		border: none;
		border-radius: 6px;
		background: var(--accent, var(--color-accent, #6366f1));
		color: white;
		font-size: 12px;
		font-weight: 700;
		cursor: pointer;
		transition: opacity 0.12s;
	}

	.btn-primary:hover { opacity: 0.9; }
	.btn-primary:disabled { opacity: 0.4; cursor: default; }

	.step-meta {
		position: absolute;
		top: 12px;
		right: 16px;
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.step-counter {
		font-size: 11px;
		color: var(--color-text-dim, #66668a);
		font-variant-numeric: tabular-nums;
	}

	.btn-exit {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border: none;
		border-radius: 6px;
		background: transparent;
		color: var(--color-text-muted, #9999b0);
		cursor: pointer;
		transition: background 0.12s;
	}

	.btn-exit:hover {
		background: rgba(255,255,255,0.08);
		color: var(--color-text, #e8e8f0);
	}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/admin/components/wizard/WizardStepHeader.svelte
git commit -m "feat: add WizardStepHeader instruction bar component"
```

---

## Task 4: WizardSummary Component

**Files:**
- Create: `F:/orion-cloud-creations/src/lib/admin/components/wizard/WizardSummary.svelte`

Shows end-of-wizard stats and next actions.

- [ ] **Step 1: Create the component**

```svelte
<!--
	WizardSummary.svelte — End-of-wizard summary showing tags applied.
-->
<script lang="ts">
	import { getTagHex, type MediaTag } from '@austencloud/media-manager';

	interface TagStat {
		tag: MediaTag;
		count: number;
	}

	interface Props {
		stats: TagStat[];
		totalItemsTagged: number;
		totalItems: number;
		onclose: () => void;
		oncurate: () => void;
	}

	const { stats, totalItemsTagged, totalItems, onclose, oncurate }: Props = $props();

	let sortedStats = $derived(stats.filter(s => s.count > 0).sort((a, b) => b.count - a.count));
	let untaggedRemaining = $derived(totalItems - totalItemsTagged);
</script>

<div class="summary-page">
	<div class="summary-card">
		<div class="summary-icon">&#10003;</div>
		<h2 class="summary-title">Quick Tag Complete</h2>
		<p class="summary-subtitle">
			Tagged {totalItemsTagged} item{totalItemsTagged !== 1 ? 's' : ''} across {sortedStats.length} tag{sortedStats.length !== 1 ? 's' : ''}
		</p>

		{#if sortedStats.length > 0}
			<div class="stat-list">
				{#each sortedStats as { tag, count } (tag.id)}
					{@const hex = getTagHex(tag)}
					<div class="stat-row">
						<span class="stat-chip" style="--chip-hex: {hex}">
							<span class="stat-dot" style="background: {hex}"></span>
							{tag.name}
						</span>
						<span class="stat-count">{count}</span>
					</div>
				{/each}
			</div>
		{/if}

		<div class="summary-actions">
			{#if untaggedRemaining > 0}
				<p class="remaining-note">{untaggedRemaining} item{untaggedRemaining !== 1 ? 's' : ''} still need review</p>
				<button class="btn-primary" onclick={oncurate}>Open Curator</button>
			{/if}
			<button class="btn-secondary" onclick={onclose}>Back to Media</button>
		</div>
	</div>
</div>

<style>
	.summary-page {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100%;
		padding: 40px;
	}

	.summary-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		max-width: 480px;
		width: 100%;
		text-align: center;
	}

	.summary-icon { font-size: 48px; color: var(--color-success, #22c55e); line-height: 1; }
	.summary-title { font-size: 22px; font-weight: 700; color: var(--color-text, #e8e8f0); margin: 0; }
	.summary-subtitle { font-size: 14px; color: var(--color-text-muted, #9999b0); margin: 0; }

	.stat-list {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 4px;
		max-height: 300px;
		overflow-y: auto;
		margin-top: 8px;
	}

	.stat-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 6px 12px;
		border-radius: 6px;
		background: rgba(255,255,255,0.03);
	}

	.stat-chip {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		font-size: 13px;
		font-weight: 500;
		color: var(--color-text, #e8e8f0);
	}

	.stat-dot { width: 8px; height: 8px; border-radius: 50%; }
	.stat-count { font-size: 13px; font-weight: 600; color: var(--color-text-muted, #9999b0); font-variant-numeric: tabular-nums; }

	.summary-actions { display: flex; flex-direction: column; align-items: center; gap: 10px; margin-top: 16px; }
	.remaining-note { font-size: 13px; color: var(--color-warning, #f59e0b); font-weight: 500; margin: 0; }

	.btn-primary {
		padding: 10px 28px;
		border: none;
		border-radius: 8px;
		background: var(--color-accent, #6366f1);
		color: white;
		font-size: 14px;
		font-weight: 700;
		cursor: pointer;
	}

	.btn-primary:hover { opacity: 0.9; }

	.btn-secondary {
		padding: 8px 20px;
		border: 1px solid var(--color-border, #333355);
		border-radius: 8px;
		background: transparent;
		color: var(--color-text-muted, #9999b0);
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
	}

	.btn-secondary:hover { border-color: var(--color-text-muted); color: var(--color-text, #e8e8f0); }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/admin/components/wizard/WizardSummary.svelte
git commit -m "feat: add WizardSummary end-of-wizard stats component"
```

---

## Task 5: Wizard Route (Orchestration)

**Files:**
- Create: `F:/orion-cloud-creations/src/routes/admin/media/curate/wizard/+page.svelte`

This is the main wizard page. It loads data, generates the step queue, manages selection state, and handles Apply/Skip flow.

- [ ] **Step 1: Create the wizard route**

```svelte
<!--
	Wizard Quick-Tag — Grid-based batch tagging flow.
	Steps through each tag, showing a selectable thumbnail grid.
-->
<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import type { MediaItem, MediaTag } from '@austencloud/media-manager';
	import { getTagHex, getCategoryLabel } from '@austencloud/media-manager';
	import { OCC_CATEGORY_ORDER, OCC_CATEGORY_LABELS } from '$lib/admin/types/media';
	import { mediaItemService, mediaTagService } from '$lib/admin/services/media';
	import { createMediaTaggingController } from '$lib/admin/services/media-tagging.svelte';
	import type { MediaTaggingController } from '$lib/admin/services/media-tagging.svelte';
	import WizardGrid from '$lib/admin/components/wizard/WizardGrid.svelte';
	import WizardStepHeader from '$lib/admin/components/wizard/WizardStepHeader.svelte';
	import WizardSummary from '$lib/admin/components/wizard/WizardSummary.svelte';

	// ─── Data ────────────────────────────────────────────────────────────
	let tags = $state<MediaTag[]>([]);
	let items = $state<MediaItem[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let applyError = $state<string | null>(null);
	let controller: MediaTaggingController | undefined;

	// ─── Wizard State ────────────────────────────────────────────────────
	interface WizardStep {
		category: string;
		tag: MediaTag;
	}

	let steps = $state<WizardStep[]>([]);
	let currentStepIndex = $state(0);
	let selectedIds = $state(new Set<string>());
	let completed = $state(false);
	let stats = $state<Array<{ tag: MediaTag; count: number }>>([]);

	let currentStep = $derived(steps[currentStepIndex] as WizardStep | undefined);

	let alreadyTaggedIds = $derived.by(() => {
		if (!currentStep) return new Set<string>();
		const tagId = currentStep.tag.id;
		return new Set(items.filter(i => i.tags.includes(tagId)).map(i => i.id));
	});

	let totalItemsTagged = $derived.by(() => {
		// Count items that have at least one tag
		return items.filter(i => i.tags.length > 0).length;
	});

	// ─── Load Data ───────────────────────────────────────────────────────
	$effect(() => {
		if (browser) loadData();
	});

	async function loadData() {
		loading = true;
		error = null;
		try {
			const [loadedTags, loadedItems] = await Promise.all([
				mediaTagService.getAll(),
				mediaItemService.getAll()
			]);
			tags = loadedTags;
			items = loadedItems;
			controller = createMediaTaggingController({
				getMediaItems: () => items,
				setMediaItems: (updated) => { items = updated; },
				getAllTags: () => tags,
				setAllTags: (updated) => { tags = updated; }
			});
			generateSteps(loadedTags, loadedItems);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load data';
		} finally {
			loading = false;
		}
	}

	function generateSteps(allTags: MediaTag[], allItems: MediaItem[]) {
		const result: WizardStep[] = [];
		for (const category of OCC_CATEGORY_ORDER) {
			const categoryTags = allTags
				.filter(t => t.category === category)
				.sort((a, b) => a.name.localeCompare(b.name));
			for (const tag of categoryTags) {
				// Only include tags where at least one item is NOT yet tagged
				const untaggedCount = allItems.filter(i => !i.tags.includes(tag.id)).length;
				if (untaggedCount > 0) {
					result.push({ category, tag });
				}
			}
		}
		steps = result;
	}

	// ─── Actions ─────────────────────────────────────────────────────────
	function toggleItem(itemId: string) {
		const next = new Set(selectedIds);
		if (next.has(itemId)) {
			next.delete(itemId);
		} else {
			next.add(itemId);
		}
		selectedIds = next;
	}

	function selectAll() {
		const selectable = items
			.filter(i => !alreadyTaggedIds.has(i.id))
			.map(i => i.id);
		selectedIds = new Set(selectable);
	}

	function deselectAll() {
		selectedIds = new Set();
	}

	async function applyAndNext() {
		if (!controller || !currentStep || selectedIds.size === 0) return;
		applyError = null;
		const tagId = currentStep.tag.id;
		const selectedItems = items.filter(i => selectedIds.has(i.id));
		await controller.applyTagToItems(selectedItems, currentStep.tag);
		// Controller uses Promise.allSettled + rollback, never throws.
		// Check post-apply state to detect failures.
		const failedCount = items.filter(i => selectedIds.has(i.id) && !i.tags.includes(tagId)).length;
		if (failedCount > 0) {
			applyError = `${failedCount} item${failedCount !== 1 ? 's' : ''} failed to save. Try again.`;
			return;
		}
		stats = [...stats, { tag: currentStep.tag, count: selectedItems.length }];
		advanceStep();
	}

	function skip() {
		advanceStep();
	}

	function skipCategory() {
		if (!currentStep) return;
		const currentCat = currentStep.category;
		let nextIndex = currentStepIndex + 1;
		while (nextIndex < steps.length && steps[nextIndex].category === currentCat) {
			nextIndex++;
		}
		if (nextIndex >= steps.length) {
			completed = true;
		} else {
			currentStepIndex = nextIndex;
			selectedIds = new Set();
			applyError = null;
		}
	}

	function advanceStep() {
		if (currentStepIndex + 1 >= steps.length) {
			completed = true;
		} else {
			currentStepIndex = currentStepIndex + 1;
			selectedIds = new Set();
			applyError = null;
		}
	}

	function exitWizard() {
		if (selectedIds.size > 0) {
			if (!confirm(`You have ${selectedIds.size} item${selectedIds.size !== 1 ? 's' : ''} selected. Exit without applying?`)) {
				return;
			}
		}
		goto('/admin/media/curate');
	}

	function openCurator() {
		goto('/admin/media/curate');
	}

	// ─── Keyboard ────────────────────────────────────────────────────────
	function handleKeydown(e: KeyboardEvent) {
		if (completed) return;
		if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
		switch (e.key) {
			case 'Enter':
				e.preventDefault();
				applyAndNext();
				break;
			case 's':
			case 'S':
				e.preventDefault();
				skip();
				break;
			case 'Escape':
				e.preventDefault();
				exitWizard();
				break;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="wizard-page">
	{#if loading}
		<div class="center-state">
			<div class="spinner"></div>
			<p>Loading media...</p>
		</div>
	{:else if error}
		<div class="center-state">
			<p class="error-text">{error}</p>
			<button class="btn-retry" onclick={loadData}>Retry</button>
		</div>
	{:else if steps.length === 0}
		<div class="center-state">
			<p>No tags need assignment. All items are fully tagged.</p>
			<button class="btn-secondary" onclick={exitWizard}>Back to Curate</button>
		</div>
	{:else if completed}
		<WizardSummary
			{stats}
			{totalItemsTagged}
			totalItems={items.length}
			onclose={exitWizard}
			oncurate={openCurator}
		/>
	{:else if currentStep}
		<WizardStepHeader
			tag={currentStep.tag}
			categoryLabel={getCategoryLabel(currentStep.category, OCC_CATEGORY_LABELS)}
			stepIndex={currentStepIndex}
			totalSteps={steps.length}
			selectedCount={selectedIds.size}
			totalItems={items.length}
			alreadyTaggedCount={alreadyTaggedIds.size}
			onapply={applyAndNext}
			onskip={skip}
			onskipcategory={skipCategory}
			onselectall={selectAll}
			ondeselectall={deselectAll}
			onexit={exitWizard}
		/>

		{#if applyError}
			<div class="error-toast">
				{applyError}
				<button class="toast-dismiss" onclick={() => applyError = null}>Dismiss</button>
			</div>
		{/if}

		<div class="wizard-body">
			<WizardGrid
				{items}
				{selectedIds}
				{alreadyTaggedIds}
				accentHex={getTagHex(currentStep.tag)}
				ontoggle={toggleItem}
			/>
		</div>

		<!-- Keyboard hints -->
		<div class="keyboard-hints">
			<span class="hint"><kbd>Enter</kbd> Apply & Next</span>
			<span class="hint"><kbd>S</kbd> Skip</span>
			<span class="hint"><kbd>Esc</kbd> Exit</span>
		</div>
	{/if}
</div>

<style>
	.wizard-page {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: var(--color-surface, #1a1a2e);
		color: var(--color-text, #e8e8f0);
	}

	.wizard-body {
		flex: 1;
		overflow-y: auto;
		min-height: 0;
	}

	.center-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		flex: 1;
		gap: 12px;
		color: var(--color-text-muted, #9999b0);
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--color-border, #333355);
		border-top-color: var(--color-accent, #6366f1);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin { to { transform: rotate(360deg); } }

	.error-text { color: var(--color-danger, #ef4444); font-weight: 600; }

	.btn-retry {
		padding: 7px 18px;
		background: var(--color-accent, #6366f1);
		color: white;
		border: none;
		border-radius: 7px;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
	}

	.btn-secondary {
		padding: 8px 20px;
		border: 1px solid var(--color-border, #333355);
		border-radius: 8px;
		background: transparent;
		color: var(--color-text-muted, #9999b0);
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
	}

	.error-toast {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		padding: 8px 16px;
		background: color-mix(in srgb, var(--color-danger, #ef4444) 15%, var(--color-surface, #1a1a2e));
		border-bottom: 1px solid color-mix(in srgb, var(--color-danger, #ef4444) 30%, transparent);
		font-size: 13px;
		color: var(--color-danger, #ef4444);
	}

	.toast-dismiss {
		padding: 4px 10px;
		border: 1px solid currentColor;
		border-radius: 4px;
		background: transparent;
		color: inherit;
		font-size: 11px;
		cursor: pointer;
	}

	.keyboard-hints {
		display: flex;
		justify-content: center;
		gap: 16px;
		padding: 8px;
		background: rgba(0,0,0,0.3);
		border-top: 1px solid var(--color-border, #333355);
	}

	.hint {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 11px;
		color: var(--color-text-dim, #66668a);
	}

	.hint kbd {
		padding: 1px 6px;
		border-radius: 3px;
		background: rgba(255,255,255,0.08);
		font-size: 10px;
		font-family: inherit;
	}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/routes/admin/media/curate/wizard/+page.svelte
git commit -m "feat: add wizard quick-tag route with full orchestration"
```

---

## Task 6: Add Quick Tag Entry Button to Curate Page

**Files:**
- Modify: `F:/orion-cloud-creations/src/routes/admin/media/curate/+page.svelte`

Add a "Quick Tag" button that links to the wizard.

- [ ] **Step 1: Add the Quick Tag button to the start state**

In `+page.svelte`, after the existing "Start Curating" button (line 160), add the wizard button. Also add it to the header area.

In the `.start-state` block, add after the `start-btn`:

```svelte
<button class="wizard-btn" onclick={() => goto('/admin/media/curate/wizard')}>
	Quick Tag (Wizard)
</button>
```

In the `.curate-header` block (after `.header-shortcuts`), add:

```svelte
<button class="wizard-link" onclick={() => goto('/admin/media/curate/wizard')}>
	Quick Tag
</button>
```

- [ ] **Step 2: Add the CSS for new buttons**

```css
.wizard-btn {
	padding: 10px 28px;
	font-size: 14px;
	font-weight: 600;
	background: transparent;
	border: 2px solid var(--color-accent);
	border-radius: 10px;
	color: var(--color-accent);
	cursor: pointer;
	transition: background 0.15s, color 0.15s;
}

.wizard-btn:hover {
	background: var(--color-accent);
	color: white;
}

.wizard-link {
	padding: 6px 14px;
	font-size: 12px;
	font-weight: 600;
	background: transparent;
	border: 1px solid var(--color-accent);
	border-radius: 6px;
	color: var(--color-accent);
	cursor: pointer;
	transition: background 0.12s, color 0.12s;
}

.wizard-link:hover {
	background: var(--color-accent);
	color: white;
}
```

- [ ] **Step 3: Verify in browser**

Navigate to `localhost:5176/admin/media/curate`. Verify:
- "Quick Tag" button appears in the header
- "Quick Tag (Wizard)" button appears in the start state alongside "Start Curating"
- Clicking either navigates to `/admin/media/curate/wizard`
- Wizard loads data, shows first step, grid is interactive

- [ ] **Step 4: Commit**

```bash
git add src/routes/admin/media/curate/+page.svelte
git commit -m "feat: add Quick Tag wizard entry button to curate page"
```

---

## Task 7: Visual Verification & Polish

**Files:** All files from Tasks 1-6.

Final pass to verify everything works end-to-end.

- [ ] **Step 1: Verify chip picker in spotlight curator**

Open `localhost:5176/admin/media/curate`, start curating, check:
- Chips render correctly in 280px sidebar
- Applied/partial/not-applied states are visually distinct
- Click behavior toggles correctly

- [ ] **Step 2: Verify wizard flow end-to-end**

Navigate to wizard, step through at least 2 tags:
- Thumbnails load with `loading="lazy"`
- Selection works (click to toggle, select all, deselect all)
- "Apply & Next" writes to Firestore and advances
- "Skip" advances without writing
- "Skip Category" jumps to next category
- Keyboard shortcuts work (Enter, S, Escape)
- Summary screen shows correct counts at the end

- [ ] **Step 3: Commit all remaining changes**

If any polish adjustments were made, commit them:

```bash
git add -A
git commit -m "fix: polish wizard and chip picker visual details"
```
