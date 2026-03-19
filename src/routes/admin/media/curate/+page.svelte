<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { createMediaCurator, MediaSpotlightCurator } from '@austencloud/media-manager';
	import type { MediaTag, MediaItem } from '@austencloud/media-manager';
	import { OCC_CATEGORY_ORDER, OCC_CATEGORY_LABELS } from '$lib/admin/types/media';
	import { mediaItemService, mediaTagService } from '$lib/admin/services/media';
	import { createMediaTaggingController } from '$lib/admin/services/media-tagging.svelte';
	import type { MediaTaggingController } from '$lib/admin/services/media-tagging.svelte';

	let tags = $state<MediaTag[]>([]);
	let items = $state<MediaItem[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	let controller: MediaTaggingController | undefined;

	const curator = createMediaCurator({
		items: [],
		tags: [],
		filterMode: 'needsReview'
	});

	let needsReviewCount = $derived(items.filter(i => i.needsReview).length);

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
			// Auto-open curator with items needing review
			const reviewItems = loadedItems.filter(i => i.needsReview);
			curator.syncItems(reviewItems);
			curator.syncTags(loadedTags);
			if (reviewItems.length > 0) {
				curator.open(0);
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load data';
		} finally {
			loading = false;
		}
	}

	async function handleCuratorTagToggle(item: MediaItem, tagId: string) {
		if (!controller) return;
		const tag = tags.find(t => t.id === tagId);
		if (!tag) return;
		if (item.tags.includes(tagId)) {
			await controller.removeTagFromItems([item], tag);
		} else {
			await controller.applyTagToItems([item], tag);
		}
		curator.syncItems(items.filter(i => i.needsReview));
	}

	async function handleCuratorNeedsReview(item: MediaItem, needsReview: boolean) {
		try {
			await mediaItemService.update(item.id, { needsReview });
			items = items.map(i => i.id === item.id ? { ...i, needsReview } : i);
			curator.syncItems(items.filter(i => i.needsReview));
		} catch (e) {
			console.error('Failed to update needsReview:', e);
		}
	}

	async function handleCuratorRename(item: MediaItem, newName: string) {
		try {
			await mediaItemService.update(item.id, { suggestedName: newName });
			items = items.map(i => i.id === item.id ? { ...i, suggestedName: newName } : i);
		} catch (e) {
			console.error('Failed to rename:', e);
		}
	}

	async function handleCuratorDescription(item: MediaItem, description: string) {
		try {
			await mediaItemService.update(item.id, { description });
			items = items.map(i => i.id === item.id ? { ...i, description } : i);
		} catch (e) {
			console.error('Failed to update description:', e);
		}
	}

	async function handleCuratorNotes(item: MediaItem, notes: string) {
		try {
			await mediaItemService.update(item.id, { notes });
			items = items.map(i => i.id === item.id ? { ...i, notes } : i);
		} catch (e) {
			console.error('Failed to update notes:', e);
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!curator.isOpen) return;
		if (e.key === 'ArrowRight' && curator.canGoNext) { curator.next(); e.preventDefault(); }
		if (e.key === 'ArrowLeft' && curator.canGoPrev) { curator.prev(); e.preventDefault(); }
		if (e.key === 'Escape') { curator.close(); e.preventDefault(); }
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="curate-page">
	{#if loading}
		<div class="loading-state">
			<div class="spinner"></div>
			<p>Loading media...</p>
		</div>
	{:else if error}
		<div class="error-state">
			<p class="error-title">Failed to load</p>
			<p class="error-msg">{error}</p>
			<button class="retry-btn" onclick={loadData}>Retry</button>
		</div>
	{:else}
		<div class="curate-header">
			<button class="back-btn" onclick={() => goto('/admin/media')}>&larr; Media Library</button>
			<h1 class="page-title">Curate</h1>
			<div class="header-meta">
				{#if needsReviewCount > 0}
					<span class="review-count">{needsReviewCount} item{needsReviewCount !== 1 ? 's' : ''} need review</span>
				{:else}
					<span class="review-done">All items reviewed</span>
				{/if}
			</div>
			<div class="header-shortcuts">
				<span class="shortcut"><kbd>&larr;</kbd><kbd>&rarr;</kbd> Navigate</span>
				<span class="shortcut"><kbd>Esc</kbd> Close</span>
			</div>
			<button class="wizard-link" onclick={() => goto('/admin/media/curate/wizard')}>
				Quick Tag
			</button>
		</div>

		{#if !curator.isOpen && needsReviewCount === 0}
			<div class="empty-state">
				<div class="empty-icon">&#10003;</div>
				<h2 class="empty-title">All caught up</h2>
				<p class="empty-desc">No items are flagged for review. Great work.</p>
				<button class="btn-secondary" onclick={() => goto('/admin/media')}>Back to Media Library</button>
			</div>
		{:else if !curator.isOpen && needsReviewCount > 0}
			<div class="start-state">
				<div class="start-count">{needsReviewCount}</div>
				<p class="start-label">items need review</p>
				<button class="start-btn" onclick={() => { curator.syncItems(items.filter(i => i.needsReview)); curator.open(0); }}>
					Start Curating
				</button>
				<button class="wizard-btn" onclick={() => goto('/admin/media/curate/wizard')}>
					Quick Tag (Wizard)
				</button>
			</div>
		{/if}
	{/if}
</div>

{#if curator.isOpen}
	<MediaSpotlightCurator
		item={curator.currentItem}
		items={curator.workingItems}
		currentIndex={curator.currentIndex}
		{tags}
		progress={curator.progress}
		open={curator.isOpen}
		categories={OCC_CATEGORY_ORDER}
		categoryLabels={OCC_CATEGORY_LABELS}
		canGoNext={curator.canGoNext}
		canGoPrev={curator.canGoPrev}
		onclose={() => curator.close()}
		onnext={() => curator.next()}
		onprev={() => curator.prev()}
		onchange={(index) => curator.goToIndex(index)}
		ontagtoggle={handleCuratorTagToggle}
		onneedsreview={handleCuratorNeedsReview}
		onrename={handleCuratorRename}
		ondescription={handleCuratorDescription}
		onnotes={handleCuratorNotes}
	/>
{/if}

<style>
	.curate-page { padding: 24px; max-width: 1000px; }
	.loading-state, .error-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; gap: 12px; color: var(--color-text-muted); }
	.spinner { width: 32px; height: 32px; border: 3px solid var(--color-border); border-top-color: var(--color-accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
	@keyframes spin { to { transform: rotate(360deg); } }
	.error-title { font-size: 16px; font-weight: 600; color: var(--color-danger); margin: 0; }
	.error-msg { font-size: 13px; margin: 0; text-align: center; max-width: 400px; }
	.retry-btn { padding: 7px 18px; background: var(--color-accent); color: white; border: none; border-radius: 7px; font-size: 13px; font-weight: 600; cursor: pointer; }
	.curate-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; flex-wrap: wrap; }
	.back-btn { font-size: 13px; color: var(--color-text-muted); background: none; border: none; cursor: pointer; padding: 0; }
	.back-btn:hover { color: var(--color-text); }
	.page-title { font-size: 20px; font-weight: 700; color: var(--color-text); margin: 0; }
	.header-meta { flex: 1; }
	.review-count { font-size: 13px; color: var(--color-warning); font-weight: 600; }
	.review-done { font-size: 13px; color: var(--color-success); font-weight: 600; }
	.header-shortcuts { display: flex; gap: 16px; align-items: center; }
	.shortcut { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--color-text-dim); }
	kbd { display: inline-flex; align-items: center; justify-content: center; padding: 2px 6px; background: var(--color-surface-raised); border: 1px solid var(--color-border); border-radius: 4px; font-size: 11px; color: var(--color-text-muted); font-family: inherit; }
	.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: 80px 24px; text-align: center; }
	.empty-icon { font-size: 48px; color: var(--color-success); line-height: 1; }
	.empty-title { font-size: 20px; font-weight: 700; color: var(--color-text); margin: 0; }
	.empty-desc { font-size: 14px; color: var(--color-text-muted); margin: 0; }
	.btn-secondary { padding: 9px 24px; font-size: 13px; font-weight: 600; background: var(--color-surface-raised); border: 1px solid var(--color-border); border-radius: 8px; color: var(--color-text-muted); cursor: pointer; transition: color 0.15s, border-color 0.15s; }
	.btn-secondary:hover { color: var(--color-text); border-color: var(--color-accent); }
	.start-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 80px 24px; text-align: center; }
	.start-count { font-size: 64px; font-weight: 800; color: var(--color-text); line-height: 1; }
	.start-label { font-size: 16px; color: var(--color-text-muted); margin: 0; }
	.start-btn { margin-top: 8px; padding: 12px 36px; font-size: 15px; font-weight: 700; background: var(--color-accent); color: white; border: none; border-radius: 10px; cursor: pointer; transition: background 0.15s; }
	.start-btn:hover { background: var(--color-accent-hover); }
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
</style>
