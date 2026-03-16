<!--
	MediaGridItem.svelte — Single thumbnail card in the media grid.
	Shows thumbnail, tag chips, selection checkbox, review badge, and suggested name.
-->
<script lang="ts">
	import type { MediaItem, MediaTag } from '$lib/types/media';
	import { getTagHex } from '$lib/types/media';

	interface Props {
		item: MediaItem;
		selected: boolean;
		tags: MediaTag[];
		onselect: (selected: boolean) => void;
		onclick: (event: MouseEvent) => void;
	}

	const { item, selected, tags, onselect, onclick }: Props = $props();

	const maxVisibleTags = 3;
	const visibleTags = $derived(tags.slice(0, maxVisibleTags));
	const extraTagCount = $derived(Math.max(0, tags.length - maxVisibleTags));
</script>

<button
	class="group relative aspect-square overflow-hidden rounded-lg border-2 bg-surface-raised p-0 transition-all duration-150
		{selected ? 'border-accent ring-2 ring-accent/30' : 'border-transparent hover:border-accent/50'}
		cursor-pointer hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.97]"
	onclick={onclick}
	title={item.filename}
>
	<!-- Thumbnail image -->
	<img
		src={item.thumbnailUrl}
		alt={item.suggestedName || item.filename}
		class="h-full w-full object-cover"
		loading="lazy"
		decoding="async"
	/>

	<!-- Selection checkbox (top-left) -->
	<div
		class="absolute top-2 left-2 flex h-5 w-5 items-center justify-center rounded border-2 transition-all duration-150
			{selected
				? 'border-accent bg-accent text-white'
				: 'border-text-muted/60 bg-surface/60 text-transparent backdrop-blur-sm'}"
		role="checkbox"
		tabindex={0}
		aria-checked={selected}
		onclick={(e) => { e.stopPropagation(); onselect(!selected); }}
		onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onselect(!selected); } }}
	>
		{#if selected}
			<svg class="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.5">
				<path d="M2 6l3 3 5-5" />
			</svg>
		{/if}
	</div>

	<!-- Needs Review badge (top-right) -->
	{#if item.needsReview}
		<span class="absolute top-2 right-2 rounded bg-warning/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-surface">
			Review
		</span>
	{/if}

	<!-- Tag chips (bottom-left) -->
	{#if tags.length > 0}
		<div class="absolute bottom-2 left-2 flex items-center gap-1">
			{#each visibleTags as tag (tag.id)}
				<span
					class="h-2.5 w-2.5 rounded-full border border-white/20"
					style="background: {getTagHex(tag)}"
					title={tag.name}
				></span>
			{/each}
			{#if extraTagCount > 0}
				<span class="rounded bg-surface/70 px-1 text-[10px] text-text backdrop-blur-sm">
					+{extraTagCount}
				</span>
			{/if}
		</div>
	{/if}

	<!-- Suggested name (bottom overlay, shown on hover) -->
	{#if item.suggestedName}
		<div class="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/80 to-transparent px-2 pt-4 pb-1.5 opacity-0 transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100">
			<span class="block truncate text-xs text-text">
				{item.suggestedName}
			</span>
		</div>
	{/if}
</button>
