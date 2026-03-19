<script lang="ts">
	import type { MediaTag, MediaItem, TagColor, TagCategory } from '@austencloud/media-manager';
	import { getCategoryLabel, TagManagerToolbar, TagManagerTagRow, TagManagerInlineCreate } from '@austencloud/media-manager';
	import { OCC_CATEGORY_ORDER, OCC_CATEGORY_LABELS } from '$lib/admin/types/media';
	import { browser } from '$app/environment';
	import { mediaTagService, mediaItemService } from '$lib/admin/services/media';

	type SortOption = 'name' | 'usage' | 'date';

	let tags = $state<MediaTag[]>([]);
	let items = $state<MediaItem[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let searchQuery = $state('');
	let sortBy = $state<SortOption>('name');
	let filterCategory = $state<TagCategory | null>(null);
	let showCreate = $state(false);

	$effect(() => {
		if (!browser) return;
		loadData();
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
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load tags';
		} finally {
			loading = false;
		}
	}

	let itemCountMap = $derived.by(() => {
		const map = new Map<string, number>();
		for (const item of items) {
			for (const tagId of item.tags) {
				map.set(tagId, (map.get(tagId) ?? 0) + 1);
			}
		}
		return map;
	});

	let filteredTags = $derived.by(() => {
		let result = tags;
		if (searchQuery) {
			const q = searchQuery.toLowerCase();
			result = result.filter((t) => String(t.name).toLowerCase().includes(q));
		}
		if (filterCategory) {
			result = result.filter((t) => t.category === filterCategory);
		}
		return result;
	});

	let sortedTags = $derived.by(() => {
		const sorted = [...filteredTags];
		switch (sortBy) {
			case 'name':
				sorted.sort((a, b) => String(a.name).localeCompare(String(b.name)));
				break;
			case 'usage':
				sorted.sort((a, b) => (itemCountMap.get(b.id) ?? 0) - (itemCountMap.get(a.id) ?? 0));
				break;
		}
		return sorted;
	});

	let groupedTags = $derived.by(() => {
		const groups: { category: string; label: string; tags: MediaTag[] }[] = [];
		for (const cat of OCC_CATEGORY_ORDER) {
			const catTags = sortedTags.filter((t) => t.category === cat);
			if (catTags.length > 0) {
				groups.push({ category: cat, label: getCategoryLabel(cat), tags: catTags });
			}
		}
		const uncategorized = sortedTags.filter((t) => !OCC_CATEGORY_ORDER.includes(t.category as any));
		if (uncategorized.length > 0) {
			groups.push({ category: 'other', label: 'Other', tags: uncategorized });
		}
		return groups;
	});

	async function handleCreate(name: string, color: TagColor, category: TagCategory) {
		try {
			const id = await mediaTagService.add({ name, color, category });
			tags = [...tags, { id, name, color, category, createdAt: new Date(), updatedAt: new Date() }];
			showCreate = false;
		} catch (e) {
			console.error('Failed to create tag:', e);
		}
	}

	async function handleUpdate(tagId: string, updates: { name?: string; color?: TagColor; category?: TagCategory }) {
		try {
			await mediaTagService.update(tagId, updates);
			tags = tags.map((t) => (t.id === tagId ? { ...t, ...updates } : t));
		} catch (e) {
			console.error('Failed to update tag:', e);
		}
	}

	async function handleDelete(tagId: string) {
		try {
			await mediaTagService.delete(tagId);
			tags = tags.filter((t) => t.id !== tagId);
		} catch (e) {
			console.error('Failed to delete tag:', e);
		}
	}
</script>

<div class="tags-page">
	{#if loading}
		<div class="center-state">
			<div class="spinner"></div>
			<p>Loading tags...</p>
		</div>
	{:else if error}
		<div class="center-state">
			<p class="error-title">Failed to load</p>
			<p class="error-msg">{error}</p>
			<button class="retry-btn" onclick={loadData}>Retry</button>
		</div>
	{:else}
		<div class="tags-header">
			<h1>Manage Tags <span class="tag-count">{tags.length}</span></h1>
			<button class="create-btn" onclick={() => (showCreate = !showCreate)}>
				+ New Tag
			</button>
		</div>

		{#if showCreate}
			<div class="create-section">
				<TagManagerInlineCreate
					oncreate={handleCreate}
					categories={OCC_CATEGORY_ORDER}
					categoryLabels={OCC_CATEGORY_LABELS}
				/>
			</div>
		{/if}

		<div class="toolbar-section">
			<TagManagerToolbar
				{searchQuery}
				{sortBy}
				filterCategory={filterCategory}
				categories={OCC_CATEGORY_ORDER}
				categoryLabels={OCC_CATEGORY_LABELS}
				onsearchchange={(q: string) => (searchQuery = q)}
				onsortchange={(s: 'name' | 'usage' | 'date') => (sortBy = s)}
				oncategorychange={(c: string | null) => (filterCategory = c)}
			/>
		</div>

		<div class="tags-list">
			{#each groupedTags as group}
				<div class="category-group">
					<h3 class="category-header">{group.label}</h3>
					{#each group.tags as tag}
						<TagManagerTagRow
							{tag}
							itemCount={itemCountMap.get(tag.id) ?? 0}
							selected={false}
							categories={OCC_CATEGORY_ORDER}
							categoryLabels={OCC_CATEGORY_LABELS}
							onselect={() => {}}
							onupdate={(tagId: string, updates: { name?: string; color?: TagColor; category?: string }) => handleUpdate(tagId, updates)}
							ondelete={(tagId: string) => handleDelete(tagId)}
						/>
					{/each}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.tags-page {
		height: calc(100vh - 48px);
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		padding: 20px 24px;
	}

	.center-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		flex: 1;
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
		to { transform: rotate(360deg); }
	}

	.error-title {
		font-size: 16px;
		font-weight: 600;
		color: var(--color-danger);
	}

	.error-msg {
		font-size: 13px;
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

	.tags-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 16px;
	}

	.tags-header h1 {
		font-size: 20px;
		font-weight: 700;
	}

	.tag-count {
		font-size: 13px;
		font-weight: 500;
		background: var(--color-surface-overlay);
		color: var(--color-text-muted);
		padding: 2px 8px;
		border-radius: 10px;
		margin-left: 8px;
	}

	.create-btn {
		padding: 6px 16px;
		background: var(--color-accent);
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
	}

	.create-btn:hover {
		background: var(--color-accent-hover);
	}

	.create-section {
		margin-bottom: 16px;
		padding: 16px;
		background: var(--color-surface-raised);
		border: 1px solid var(--color-border);
		border-radius: 8px;
	}

	.toolbar-section {
		margin-bottom: 12px;
	}

	.tags-list {
		flex: 1;
	}

	.category-group {
		margin-bottom: 20px;
	}

	.category-header {
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-text-dim);
		padding: 8px 0;
		border-bottom: 1px solid var(--color-border-subtle);
		margin-bottom: 4px;
	}
</style>
