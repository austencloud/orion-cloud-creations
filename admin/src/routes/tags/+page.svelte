<script lang="ts">
	import type { MediaTag, MediaItem, TagColor, TagCategory } from '$lib/types/media';
	import { browser } from '$app/environment';
	import TagManager from '$lib/components/tags/TagManager.svelte';
	import { mediaTagService, mediaItemService } from '$lib/services/media';

	let tags = $state<MediaTag[]>([]);
	let items = $state<MediaItem[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

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
			console.error('Failed to load tag data:', e);
		} finally {
			loading = false;
		}
	}

	async function handleCreate(name: string, color: TagColor, category: TagCategory) {
		try {
			const id = await mediaTagService.add({ name, color, category });
			const newTag: MediaTag = {
				id,
				name,
				color,
				category,
				createdAt: new Date(),
				updatedAt: new Date()
			};
			tags = [...tags, newTag].sort((a, b) => a.name.localeCompare(b.name));
		} catch (e) {
			console.error('Failed to create tag:', e);
		}
	}

	async function handleUpdate(tagId: string, updates: { name?: string; color?: TagColor; category?: TagCategory }) {
		try {
			await mediaTagService.update(tagId, updates);
			tags = tags.map((t) => t.id === tagId ? { ...t, ...updates } : t);
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

	// The tags page always shows the tag manager, so open is always true.
	// onclose is a no-op here since this is the dedicated tags page.
	function handleClose() {
		// No-op on dedicated tags page
	}
</script>

<div class="tags-page">
	{#if loading}
		<div class="loading-state">
			<div class="spinner"></div>
			<p>Loading tags...</p>
		</div>
	{:else if error}
		<div class="error-state">
			<p class="error-title">Failed to load</p>
			<p class="error-message">{error}</p>
			<button class="retry-btn" onclick={loadData}>Retry</button>
		</div>
	{:else}
		<TagManager
			{tags}
			{items}
			open={true}
			onclose={handleClose}
			oncreate={handleCreate}
			onupdate={handleUpdate}
			ondelete={handleDelete}
		/>
	{/if}
</div>

<style>
	.tags-page {
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
</style>
