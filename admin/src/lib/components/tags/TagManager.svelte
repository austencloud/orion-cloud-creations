<script lang="ts">
	import TagManagerToolbar from './TagManagerToolbar.svelte';
	import TagManagerTagRow from './TagManagerTagRow.svelte';
	import TagManagerBatchBar from './TagManagerBatchBar.svelte';
	import TagManagerInlineCreate from './TagManagerInlineCreate.svelte';
	import TagManagerColorPicker from './TagManagerColorPicker.svelte';
	import TagManagerCategoryPicker from './TagManagerCategoryPicker.svelte';
	import {
		CATEGORY_ORDER,
		getCategoryLabel,
		type MediaTag,
		type MediaItem,
		type TagColor,
		type TagCategory
	} from '$lib/types/media';

	type SortOption = 'name' | 'usage' | 'date';

	interface Props {
		tags: MediaTag[];
		items: MediaItem[];
		open: boolean;
		onclose: () => void;
		oncreate: (name: string, color: TagColor, category: TagCategory) => void;
		onupdate: (tagId: string, updates: { name?: string; color?: TagColor; category?: TagCategory }) => void;
		ondelete: (tagId: string) => void;
	}

	const { tags, items, open, onclose, oncreate, onupdate, ondelete }: Props = $props();

	// UI state
	let searchQuery = $state('');
	let sortBy = $state<SortOption>('name');
	let filterCategory = $state<TagCategory | null>(null);
	let showInlineCreate = $state(false);
	let selectedTagIds = $state<Set<string>>(new Set());

	// Batch picker state
	let showBatchColorPicker = $state(false);
	let showBatchCategoryPicker = $state(false);

	// Item counts per tag
	let itemCountMap = $derived.by(() => {
		const counts = new Map<string, number>();
		for (const tag of tags) {
			counts.set(tag.id, 0);
		}
		for (const item of items) {
			for (const tagId of item.tags) {
				const current = counts.get(tagId);
				if (current !== undefined) {
					counts.set(tagId, current + 1);
				}
			}
		}
		return counts;
	});

	// Search filter
	let searchFilteredTags = $derived.by(() => {
		if (!searchQuery.trim()) return tags;
		const q = searchQuery.trim().toLowerCase();
		return tags.filter((t) => t.name.toLowerCase().includes(q));
	});

	// Category filter
	let filteredTags = $derived.by(() => {
		if (!filterCategory) return searchFilteredTags;
		return searchFilteredTags.filter((t) => t.category === filterCategory);
	});

	// Sort
	let sortedTags = $derived.by(() => {
		const sorted = [...filteredTags];
		switch (sortBy) {
			case 'name':
				sorted.sort((a, b) => a.name.localeCompare(b.name));
				break;
			case 'usage':
				sorted.sort((a, b) => (itemCountMap.get(b.id) ?? 0) - (itemCountMap.get(a.id) ?? 0));
				break;
			case 'date':
				sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
				break;
		}
		return sorted;
	});

	// Group by category
	let tagsByCategory = $derived.by(() => {
		const grouped = new Map<TagCategory, Array<{ tag: MediaTag; itemCount: number }>>();
		for (const cat of CATEGORY_ORDER) {
			const catTags = sortedTags
				.filter((t) => t.category === cat)
				.map((tag) => ({ tag, itemCount: itemCountMap.get(tag.id) ?? 0 }));
			if (catTags.length > 0) {
				grouped.set(cat, catTags);
			}
		}
		return grouped;
	});

	let visibleCategories = $derived(
		CATEGORY_ORDER.filter((cat) => tagsByCategory.has(cat))
	);

	// Selection
	function toggleSelect(tagId: string) {
		const next = new Set(selectedTagIds);
		if (next.has(tagId)) {
			next.delete(tagId);
		} else {
			next.add(tagId);
		}
		selectedTagIds = next;
	}

	function clearSelection() {
		selectedTagIds = new Set();
	}

	// Batch operations
	function handleBatchColorClick() {
		showBatchColorPicker = true;
		showBatchCategoryPicker = false;
	}

	function handleBatchCategoryClick() {
		showBatchCategoryPicker = true;
		showBatchColorPicker = false;
	}

	function handleBatchColorSelect(color: TagColor) {
		for (const tagId of selectedTagIds) {
			onupdate(tagId, { color });
		}
		showBatchColorPicker = false;
		clearSelection();
	}

	function handleBatchCategorySelect(category: TagCategory) {
		for (const tagId of selectedTagIds) {
			onupdate(tagId, { category });
		}
		showBatchCategoryPicker = false;
		clearSelection();
	}

	function handleBatchDelete() {
		for (const tagId of selectedTagIds) {
			ondelete(tagId);
		}
		clearSelection();
	}

	// Create tag
	function handleCreate(name: string, color: TagColor, category: TagCategory) {
		oncreate(name, color, category);
		showInlineCreate = false;
	}

	// Keyboard
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			if (showInlineCreate) {
				showInlineCreate = false;
				e.stopPropagation();
			} else if (showBatchColorPicker || showBatchCategoryPicker) {
				showBatchColorPicker = false;
				showBatchCategoryPicker = false;
				e.stopPropagation();
			} else if (searchQuery) {
				searchQuery = '';
				e.stopPropagation();
			} else if (selectedTagIds.size > 0) {
				clearSelection();
				e.stopPropagation();
			} else {
				onclose();
			}
		}
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="overlay"
		onclick={(e) => { if (e.target === e.currentTarget) onclose(); }}
		onkeydown={handleKeydown}
	>
		<div class="panel" role="dialog" aria-label="Manage tags">
			<!-- Header -->
			<div class="header">
				<div class="header-left">
					<h2 class="title">Manage Tags</h2>
					<span class="tag-count">{tags.length}</span>
				</div>
				<div class="header-actions">
					{#if !showInlineCreate}
						<button class="new-tag-btn" onclick={() => (showInlineCreate = true)}>
							<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
								<path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
							</svg>
							New Tag
						</button>
					{/if}
					<button class="close-btn" onclick={onclose} aria-label="Close">
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
							<path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
						</svg>
					</button>
				</div>
			</div>

			<!-- Inline create -->
			{#if showInlineCreate}
				<div class="create-section">
					<TagManagerInlineCreate oncreate={handleCreate} />
				</div>
			{/if}

			<!-- Toolbar -->
			<TagManagerToolbar
				{searchQuery}
				{sortBy}
				{filterCategory}
				onsearchchange={(q) => (searchQuery = q)}
				onsortchange={(s) => (sortBy = s)}
				oncategorychange={(c) => (filterCategory = c)}
			/>

			<!-- Batch pickers -->
			{#if showBatchColorPicker}
				<div class="batch-picker-section">
					<p class="batch-picker-label">Change color for {selectedTagIds.size} tag{selectedTagIds.size !== 1 ? 's' : ''}</p>
					<TagManagerColorPicker selected="gray" onselect={handleBatchColorSelect} />
					<button class="batch-cancel" onclick={() => (showBatchColorPicker = false)}>Cancel</button>
				</div>
			{/if}
			{#if showBatchCategoryPicker}
				<div class="batch-picker-section">
					<p class="batch-picker-label">Change category for {selectedTagIds.size} tag{selectedTagIds.size !== 1 ? 's' : ''}</p>
					<TagManagerCategoryPicker selected="custom" onselect={handleBatchCategorySelect} />
					<button class="batch-cancel" onclick={() => (showBatchCategoryPicker = false)}>Cancel</button>
				</div>
			{/if}

			<!-- Tag list -->
			<div class="tag-list" role="list">
				{#if sortedTags.length === 0}
					<div class="empty-state">
						{#if searchQuery.trim()}
							<p>No tags matching "{searchQuery.trim()}"</p>
						{:else}
							<p>No tags yet. Create one above.</p>
						{/if}
					</div>
				{:else}
					{#each visibleCategories as category}
						<div class="category-group">
							<h3 class="category-header">{getCategoryLabel(category)}</h3>
							{#each tagsByCategory.get(category) ?? [] as { tag, itemCount }}
								<TagManagerTagRow
									{tag}
									{itemCount}
									selected={selectedTagIds.has(tag.id)}
									onselect={toggleSelect}
									{onupdate}
									{ondelete}
								/>
							{/each}
						</div>
					{/each}
				{/if}
			</div>

			<!-- Batch bar -->
			<TagManagerBatchBar
				selectedCount={selectedTagIds.size}
				onbatchcolor={handleBatchColorClick}
				onbatchcategory={handleBatchCategoryClick}
				onbatchdelete={handleBatchDelete}
			/>
		</div>
	</div>
{/if}

<style>
	.overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1050;
		backdrop-filter: blur(4px);
		animation: overlay-fade 0.2s ease-out;
	}

	@keyframes overlay-fade {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.panel {
		display: flex;
		flex-direction: column;
		width: min(800px, 90vw);
		max-height: min(700px, 85vh);
		background: var(--color-surface-raised);
		border: 1px solid var(--color-border);
		border-radius: 12px;
		box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
		overflow: hidden;
		animation: panel-enter 0.25s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes panel-enter {
		from {
			opacity: 0;
			transform: scale(0.96) translateY(8px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	/* Header */
	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 20px;
		border-bottom: 1px solid var(--color-border);
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.title {
		font-size: 16px;
		font-weight: 600;
		color: var(--color-text);
		margin: 0;
	}

	.tag-count {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 24px;
		height: 22px;
		padding: 0 7px;
		background: color-mix(in srgb, var(--color-accent) 20%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-accent) 30%, transparent);
		border-radius: 9999px;
		font-size: 12px;
		font-weight: 600;
		color: var(--color-accent-hover);
	}

	.new-tag-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 7px 14px;
		background: var(--color-accent);
		border: none;
		border-radius: 6px;
		color: white;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.15s;
	}

	.new-tag-btn:hover {
		background: var(--color-accent-hover);
	}

	.new-tag-btn:active {
		transform: scale(0.95);
	}

	.new-tag-btn:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	.close-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		background: none;
		border: none;
		border-radius: 6px;
		color: var(--color-text-muted);
		cursor: pointer;
		transition: background 0.15s, color 0.15s;
	}

	.close-btn:hover {
		background: var(--color-surface-overlay);
		color: var(--color-text);
	}

	.close-btn:active {
		transform: scale(0.9);
	}

	.close-btn:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: -2px;
	}

	/* Create section */
	.create-section {
		padding: 12px 16px;
		border-bottom: 1px solid var(--color-border);
	}

	/* Batch picker section */
	.batch-picker-section {
		padding: 12px 16px;
		background: color-mix(in srgb, var(--color-accent) 8%, var(--color-surface));
		border-bottom: 1px solid var(--color-border);
	}

	.batch-picker-label {
		font-size: 13px;
		color: var(--color-text-muted);
		margin: 0 0 8px;
	}

	.batch-cancel {
		margin-top: 8px;
		padding: 4px 12px;
		background: none;
		border: none;
		border-radius: 4px;
		color: var(--color-text-dim);
		font-size: 13px;
		cursor: pointer;
		transition: background 0.15s, color 0.15s;
	}

	.batch-cancel:hover {
		background: var(--color-surface-overlay);
		color: var(--color-text);
	}

	/* Tag list */
	.tag-list {
		flex: 1;
		overflow-y: auto;
		padding: 8px 12px;
	}

	.category-group {
		margin-bottom: 8px;
	}

	.category-header {
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-dim);
		padding: 8px 10px 4px;
		margin: 0;
	}

	.empty-state {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 40px 20px;
		color: var(--color-text-dim);
		font-size: 14px;
	}

	.empty-state p {
		margin: 0;
	}
</style>
