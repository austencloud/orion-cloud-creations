<script lang="ts">
	import type { MediaTag, MediaItem, MediaLibraryState, TagColor, TagCategory } from '@austencloud/media-manager';
	import {
		DEFAULT_LIBRARY_STATE,
		MediaGrid,
		MediaToolbar,
		TagSidebar,
		TagPickerPanel,
		TagManager,
		createMediaCurator,
		MediaSpotlightCurator
	} from '@austencloud/media-manager';
	import { OCC_CATEGORY_ORDER, OCC_CATEGORY_LABELS } from '$lib/types/media';
	import { browser } from '$app/environment';

	// Local components (app-specific spotlight that uses fullUrl, etc.)
	import MediaSpotlight from '$lib/components/media/MediaSpotlight.svelte';

	// Services
	import { mediaTagService, mediaItemService, mediaLibraryStateService } from '$lib/services/media';
	import type { MediaTaggingController } from '$lib/services/media-tagging.svelte';
	import { createMediaTaggingController } from '$lib/services/media-tagging.svelte';

	// State
	let tags = $state<MediaTag[]>([]);
	let items = $state<MediaItem[]>([]);
	let libraryState = $state<MediaLibraryState>({ ...DEFAULT_LIBRARY_STATE });
	let selectedIds = $state<Set<string>>(new Set());
	let loading = $state(true);
	let error = $state<string | null>(null);

	// UI toggles
	let sidebarOpen = $state(true);
	let tagPickerOpen = $state(false);
	let tagManagerOpen = $state(false);
	let spotlightItem = $state<MediaItem | null>(null);

	// Tagging controller
	let controller: MediaTaggingController | undefined;

	function buildController() {
		controller = createMediaTaggingController({
			getMediaItems: () => items,
			setMediaItems: (updated) => { items = updated; },
			getAllTags: () => tags,
			setAllTags: (updated) => { tags = updated; }
		});
	}

	// Curator for review workflow
	const curator = createMediaCurator({
		items: [],
		tags: [],
		filterMode: 'needsReview'
	});

	// Count of items needing review
	let needsReviewCount = $derived(items.filter((i) => i.needsReview).length);

	function openCurator() {
		curator.syncItems(items);
		curator.syncTags(tags);
		curator.open();
	}

	async function handleCuratorTagToggle(item: MediaItem, tagId: string) {
		if (!controller) return;
		const tag = tags.find((t) => t.id === tagId);
		if (!tag) return;
		if (item.tags.includes(tagId)) {
			await controller.removeTagFromItems([item], tag);
		} else {
			await controller.applyTagToItems([item], tag);
		}
		curator.syncItems(items);
	}

	async function handleCuratorNeedsReview(item: MediaItem, needsReview: boolean) {
		try {
			await mediaItemService.update(item.id, { needsReview });
			items = items.map((i) => i.id === item.id ? { ...i, needsReview } : i);
			curator.syncItems(items);
		} catch (e) {
			console.error('Failed to update needsReview:', e);
		}
	}

	async function handleCuratorRename(item: MediaItem, newName: string) {
		try {
			await mediaItemService.update(item.id, { suggestedName: newName });
			items = items.map((i) => i.id === item.id ? { ...i, suggestedName: newName } : i);
			curator.syncItems(items);
		} catch (e) {
			console.error('Failed to rename:', e);
		}
	}

	async function handleCuratorDescription(item: MediaItem, description: string) {
		try {
			await mediaItemService.update(item.id, { description });
			items = items.map((i) => i.id === item.id ? { ...i, description } : i);
			curator.syncItems(items);
		} catch (e) {
			console.error('Failed to update description:', e);
		}
	}

	async function handleCuratorNotes(item: MediaItem, notes: string) {
		try {
			await mediaItemService.update(item.id, { notes });
			items = items.map((i) => i.id === item.id ? { ...i, notes } : i);
			curator.syncItems(items);
		} catch (e) {
			console.error('Failed to update notes:', e);
		}
	}

	// Auto-show tag picker when items are selected
	$effect(() => {
		tagPickerOpen = selectedIds.size > 0;
	});

	// Filtered items based on activeTags and searchQuery
	let filteredItems = $derived.by(() => {
		let result = items;

		// Filter by active tags
		if (libraryState.activeTags.length > 0) {
			if (libraryState.filterMode === 'and') {
				result = result.filter((item) =>
					libraryState.activeTags.every((tagId) => item.tags.includes(tagId))
				);
			} else {
				result = result.filter((item) =>
					libraryState.activeTags.some((tagId) => item.tags.includes(tagId))
				);
			}
		}

		// Filter by search query
		if (libraryState.searchQuery.trim()) {
			const q = libraryState.searchQuery.toLowerCase();
			result = result.filter(
				(item) =>
					item.filename.toLowerCase().includes(q) ||
					item.description.toLowerCase().includes(q) ||
					item.suggestedName.toLowerCase().includes(q)
			);
		}

		return result;
	});

	// Selected items derived from selectedIds
	let selectedItems = $derived(
		items.filter((item) => selectedIds.has(item.id))
	);

	// Load data on mount
	$effect(() => {
		if (!browser) return;
		loadData();
	});

	async function loadData() {
		loading = true;
		error = null;
		try {
			const [loadedTags, loadedItems, loadedState] = await Promise.all([
				mediaTagService.getAll(),
				mediaItemService.getAll(),
				mediaLibraryStateService.get()
			]);
			tags = loadedTags;
			items = loadedItems;
			if (loadedState) {
				libraryState = loadedState;
			}
			buildController();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load data';
			console.error('Failed to load media data:', e);
		} finally {
			loading = false;
		}
	}

	async function saveLibraryState() {
		try {
			await mediaLibraryStateService.update(libraryState);
		} catch (e) {
			console.error('Failed to save library state:', e);
		}
	}

	// Selection handlers
	function handleSelect(ids: Set<string>) {
		selectedIds = ids;
	}

	function handleSelectAll() {
		if (selectedIds.size === filteredItems.length) {
			selectedIds = new Set();
		} else {
			selectedIds = new Set(filteredItems.map((i) => i.id));
		}
	}

	function handleDeselectAll() {
		selectedIds = new Set();
	}

	// Tag filter handlers
	function handleToggleTag(tagId: string) {
		const idx = libraryState.activeTags.indexOf(tagId);
		if (idx >= 0) {
			libraryState.activeTags = libraryState.activeTags.filter((id) => id !== tagId);
		} else {
			libraryState.activeTags = [...libraryState.activeTags, tagId];
		}
		saveLibraryState();
	}

	function handleFilterModeChange(mode: 'and' | 'or') {
		libraryState.filterMode = mode;
		saveLibraryState();
	}

	// Grid size
	function handleGridSizeChange(size: number) {
		libraryState.gridSize = size;
		saveLibraryState();
	}

	// Search
	function handleSearch(query: string) {
		libraryState.searchQuery = query;
		saveLibraryState();
	}

	// Bulk tagging — TagPickerPanel passes MediaTag objects
	async function handleBulkApply(tag: MediaTag) {
		if (!controller) return;
		try {
			await controller.applyTagToItems(selectedItems, tag);
		} catch (e) {
			console.error('Bulk tag failed:', e);
		}
	}

	async function handleBulkRemove(tag: MediaTag) {
		if (!controller) return;
		try {
			await controller.removeTagFromItems(selectedItems, tag);
		} catch (e) {
			console.error('Bulk untag failed:', e);
		}
	}

	// Spotlight
	function handleItemClick(item: MediaItem, _event: MouseEvent) {
		spotlightItem = item;
	}

	function handleCloseSpotlight() {
		spotlightItem = null;
	}

	// Spotlight item update
	async function handleSpotlightUpdate(updates: Partial<MediaItem>) {
		if (!spotlightItem) return;
		try {
			await mediaItemService.update(spotlightItem.id, updates);
			// Update local state
			items = items.map((item) =>
				item.id === spotlightItem!.id ? { ...item, ...updates } : item
			);
			spotlightItem = { ...spotlightItem, ...updates };
		} catch (e) {
			console.error('Failed to update item:', e);
		}
	}

	// Resolve tags for the spotlight item
	let spotlightItemTags = $derived(
		spotlightItem
			? tags.filter((t) => spotlightItem!.tags.includes(t.id))
			: []
	);

	// Tag manager handlers
	async function handleTagCreate(name: string, color: TagColor, category: TagCategory) {
		if (!controller) return;
		await controller.createTag(name, color, category);
	}

	async function handleTagUpdate(tagId: string, updates: { name?: string; color?: TagColor; category?: TagCategory }) {
		try {
			await mediaTagService.update(tagId, updates);
			tags = tags.map((t) => t.id === tagId ? { ...t, ...updates } : t);
		} catch (e) {
			console.error('Failed to update tag:', e);
		}
	}

	async function handleTagDelete(tagId: string) {
		if (!controller) return;
		const tag = tags.find((t) => t.id === tagId);
		if (tag) {
			await controller.deleteTag(tag);
		}
	}
</script>

<div class="media-page">
	{#if loading}
		<div class="loading-state">
			<div class="spinner"></div>
			<p>Loading media library...</p>
		</div>
	{:else if error}
		<div class="error-state">
			<p class="error-title">Failed to load</p>
			<p class="error-message">{error}</p>
			<button class="retry-btn" onclick={loadData}>Retry</button>
		</div>
	{:else}
		<div class="media-layout" class:sidebar-collapsed={!sidebarOpen}>
			<!-- Left: Tag Sidebar -->
			{#if sidebarOpen}
				<aside class="sidebar">
					<TagSidebar
						{tags}
						{items}
						activeTags={libraryState.activeTags}
						categories={OCC_CATEGORY_ORDER}
						categoryLabels={OCC_CATEGORY_LABELS}
						ontoggle={handleToggleTag}
					/>
				</aside>
			{/if}

			<!-- Center: Toolbar + Grid -->
			<div class="main-content">
				<div class="toolbar-row">
					<MediaToolbar
						totalCount={items.length}
						selectedCount={selectedIds.size}
						gridSize={libraryState.gridSize}
						searchQuery={libraryState.searchQuery}
						filterMode={libraryState.filterMode}
						onsearchchange={handleSearch}
						ongridsizechange={handleGridSizeChange}
						onselectall={handleSelectAll}
						ondeselectall={handleDeselectAll}
						onfiltermodechange={handleFilterModeChange}
					/>
					{#if needsReviewCount > 0}
						<button class="curate-btn" onclick={openCurator}>
							Curate
							<span class="curate-badge">{needsReviewCount}</span>
						</button>
					{/if}
				</div>
				<MediaGrid
					items={filteredItems}
					{tags}
					{selectedIds}
					gridSize={libraryState.gridSize}
					onselect={handleSelect}
					onitemclick={handleItemClick}
				/>
			</div>

			<!-- Right: Tag Picker Panel -->
			{#if tagPickerOpen && selectedIds.size > 0}
				<aside class="tag-picker-panel">
					<TagPickerPanel
						{tags}
						{selectedItems}
						categories={OCC_CATEGORY_ORDER}
						categoryLabels={OCC_CATEGORY_LABELS}
						onapply={handleBulkApply}
						onremove={handleBulkRemove}
					/>
				</aside>
			{/if}
		</div>
	{/if}

	<!-- Spotlight Modal -->
	{#if spotlightItem}
		<MediaSpotlight
			item={spotlightItem}
			tags={spotlightItemTags}
			allTags={tags}
			onupdate={handleSpotlightUpdate}
			onclose={handleCloseSpotlight}
		/>
	{/if}

	<!-- Tag Manager Modal -->
	{#if tagManagerOpen}
		<TagManager
			{tags}
			{items}
			open={tagManagerOpen}
			categories={OCC_CATEGORY_ORDER}
			categoryLabels={OCC_CATEGORY_LABELS}
			onclose={() => (tagManagerOpen = false)}
			oncreate={handleTagCreate}
			onupdate={handleTagUpdate}
			ondelete={handleTagDelete}
		/>
	{/if}

	<!-- Curator Spotlight -->
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
</div>

<style>
	.media-page {
		height: calc(100vh - 48px);
		display: flex;
		flex-direction: column;
	}

	.loading-state,
	.error-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		gap: 12px;
		color: var(--color-text-muted);
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--color-border);
		border-top-color: var(--color-accent);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.error-title {
		font-size: 16px;
		font-weight: 600;
		color: var(--color-danger);
	}

	.error-message {
		font-size: 13px;
		max-width: 400px;
		text-align: center;
	}

	.retry-btn {
		padding: 6px 16px;
		background: var(--color-accent);
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
	}

	.retry-btn:hover {
		background: var(--color-accent-hover);
	}

	.media-layout {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.sidebar {
		width: 250px;
		flex-shrink: 0;
		border-right: 1px solid var(--color-border);
		overflow-y: auto;
	}

	.main-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 0;
		overflow-y: auto;
	}

	.tag-picker-panel {
		width: 300px;
		flex-shrink: 0;
		border-left: 1px solid var(--color-border);
		overflow-y: auto;
	}

	.toolbar-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.toolbar-row :global(:first-child) {
		flex: 1;
	}

	.curate-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 6px 14px;
		background: var(--color-accent);
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
		transition: background 0.15s;
	}

	.curate-btn:hover {
		background: var(--color-accent-hover);
	}

	.curate-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 20px;
		height: 20px;
		padding: 0 6px;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 10px;
		font-size: 11px;
		font-weight: 700;
	}
</style>
