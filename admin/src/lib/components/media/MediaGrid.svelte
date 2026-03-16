<!--
	MediaGrid.svelte — Grid of MediaGridItems with selection support.
	Supports click, shift-click (range), ctrl-click (multi), select/deselect all.
-->
<script lang="ts">
	import type { MediaItem, MediaTag } from '$lib/types/media';
	import MediaGridItem from './MediaGridItem.svelte';

	interface Props {
		items: MediaItem[];
		tags: MediaTag[];
		selectedIds: Set<string>;
		gridSize: number;
		onselect: (ids: Set<string>) => void;
		onitemclick: (item: MediaItem, event: MouseEvent) => void;
	}

	const { items, tags, selectedIds, gridSize, onselect, onitemclick }: Props = $props();

	// Pre-compute tag map for O(1) lookups
	const tagMap = $derived(new Map(tags.map((t) => [t.id, t])));

	// Track last clicked index for shift-click range selection
	let lastClickedIndex = $state(-1);

	function resolveItemTags(item: MediaItem): MediaTag[] {
		const resolved: MediaTag[] = [];
		for (const tagId of item.tags) {
			const tag = tagMap.get(tagId);
			if (tag) resolved.push(tag);
		}
		return resolved;
	}

	function handleItemClick(item: MediaItem, index: number, event: MouseEvent) {
		if (event.shiftKey && lastClickedIndex >= 0) {
			// Range select
			const start = Math.min(lastClickedIndex, index);
			const end = Math.max(lastClickedIndex, index);
			const newIds = new Set(selectedIds);
			for (let i = start; i <= end; i++) {
				newIds.add(items[i].id);
			}
			onselect(newIds);
		} else if (event.ctrlKey || event.metaKey) {
			// Toggle single item
			const newIds = new Set(selectedIds);
			if (newIds.has(item.id)) {
				newIds.delete(item.id);
			} else {
				newIds.add(item.id);
			}
			onselect(newIds);
			lastClickedIndex = index;
		} else {
			// Normal click — open item detail
			onitemclick(item, event);
			lastClickedIndex = index;
		}
	}

	function handleItemSelect(item: MediaItem, index: number, selected: boolean) {
		const newIds = new Set(selectedIds);
		if (selected) {
			newIds.add(item.id);
		} else {
			newIds.delete(item.id);
		}
		onselect(newIds);
		lastClickedIndex = index;
	}
</script>

{#if items.length === 0}
	<!-- Empty state -->
	<div class="flex flex-col items-center justify-center gap-3 py-20 text-text-muted">
		<svg class="h-12 w-12 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
			<path d="M21 15V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10m18 0l-4.5-4.5a2 2 0 00-2.83 0L3 17m18-2v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m3.5-5.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
		</svg>
		<p class="text-sm">No items match your filters</p>
		<p class="text-xs text-text-dim">Try adjusting your search or clearing filters</p>
	</div>
{:else}
	<div
		class="grid gap-2 p-4"
		style="grid-template-columns: repeat({gridSize}, minmax(0, 1fr))"
	>
		{#each items as item, index (item.id)}
			<MediaGridItem
				{item}
				selected={selectedIds.has(item.id)}
				tags={resolveItemTags(item)}
				onselect={(selected) => handleItemSelect(item, index, selected)}
				onclick={(event) => handleItemClick(item, index, event)}
			/>
		{/each}
	</div>
{/if}
