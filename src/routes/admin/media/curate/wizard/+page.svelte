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
