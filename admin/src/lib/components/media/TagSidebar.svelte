<!--
	TagSidebar.svelte — Left sidebar for filtering media by tags.
	Tags grouped by category with item counts, collapsible sections, active highlighting.
-->
<script lang="ts">
	import type { MediaItem, MediaTag } from '$lib/types/media';
	import { getTagHex, CATEGORY_ORDER, getCategoryLabel } from '$lib/types/media';

	interface Props {
		tags: MediaTag[];
		items: MediaItem[];
		activeTags: string[];
		ontoggle: (tagId: string) => void;
	}

	const { tags, items, activeTags, ontoggle }: Props = $props();

	let collapsedCategories = $state(new Set<string>());

	const activeTagSet = $derived(new Set(activeTags));

	// Count items per tag
	const tagCounts = $derived.by(() => {
		const counts = new Map<string, number>();
		for (const item of items) {
			for (const tagId of item.tags) {
				counts.set(tagId, (counts.get(tagId) ?? 0) + 1);
			}
		}
		return counts;
	});

	// Group tags by category in display order
	const tagsByCategory = $derived.by(() => {
		const grouped = new Map<string, MediaTag[]>();
		for (const tag of tags) {
			const cat = tag.category;
			if (!grouped.has(cat)) grouped.set(cat, []);
			grouped.get(cat)!.push(tag);
		}
		const ordered = new Map<string, MediaTag[]>();
		for (const cat of CATEGORY_ORDER) {
			if (grouped.has(cat)) {
				ordered.set(cat, grouped.get(cat)!);
				grouped.delete(cat);
			}
		}
		for (const [cat, catTags] of grouped) {
			ordered.set(cat, catTags);
		}
		return ordered;
	});

	function toggleCategory(category: string) {
		const next = new Set(collapsedCategories);
		if (next.has(category)) {
			next.delete(category);
		} else {
			next.add(category);
		}
		collapsedCategories = next;
	}

	function clearAll() {
		for (const tagId of activeTags) {
			ontoggle(tagId);
		}
	}
</script>

<aside class="flex h-full w-64 flex-col overflow-hidden border-r border-border bg-surface-raised" aria-label="Tag filters">
	<!-- Header -->
	<div class="flex items-center justify-between border-b border-border px-3 py-2.5">
		<h2 class="text-xs font-semibold uppercase tracking-wider text-text-muted">Tags</h2>
		{#if activeTags.length > 0}
			<button
				class="rounded px-1.5 py-0.5 text-[10px] text-accent hover:bg-accent/10"
				onclick={clearAll}
			>
				Clear all
			</button>
		{/if}
	</div>

	<!-- Active tags summary -->
	{#if activeTags.length > 0}
		<div class="flex flex-wrap gap-1 border-b border-border px-3 py-2">
			{#each activeTags as tagId (tagId)}
				{@const tag = tags.find((t) => t.id === tagId)}
				{#if tag}
					<span
						class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
						style="background: {getTagHex(tag)}"
					>
						{tag.name}
						<button
							class="flex h-3 w-3 items-center justify-center rounded-full hover:bg-white/20"
							onclick={() => ontoggle(tagId)}
							aria-label="Remove {tag.name} filter"
						>
							<svg class="h-2 w-2" viewBox="0 0 8 8" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M1.5 1.5l5 5M6.5 1.5l-5 5" />
							</svg>
						</button>
					</span>
				{/if}
			{/each}
		</div>
	{/if}

	<!-- Category sections -->
	<div class="flex-1 overflow-y-auto">
		{#each [...tagsByCategory.entries()] as [category, categoryTags] (category)}
			<div class="border-b border-border-subtle last:border-b-0">
				<!-- Category header -->
				<button
					class="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-surface-hover"
					onclick={() => toggleCategory(category)}
				>
					<svg
						class="h-3 w-3 shrink-0 text-text-dim transition-transform {collapsedCategories.has(category) ? '' : 'rotate-90'}"
						viewBox="0 0 12 12"
						fill="currentColor"
					>
						<path d="M4 2l4 4-4 4z" />
					</svg>
					<span class="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
						{getCategoryLabel(category)}
					</span>
					<span class="ml-auto text-[10px] text-text-dim">{categoryTags.length}</span>
				</button>

				<!-- Tags -->
				{#if !collapsedCategories.has(category)}
					<div class="flex flex-col gap-0.5 px-2 pb-2">
						{#each categoryTags as tag (tag.id)}
							{@const isActive = activeTagSet.has(tag.id)}
							{@const count = tagCounts.get(tag.id) ?? 0}
							<button
								class="flex items-center gap-2 rounded px-2 py-1 text-left transition-colors
									{isActive
										? 'bg-accent/15 text-accent'
										: 'text-text hover:bg-surface-hover'}"
								onclick={() => ontoggle(tag.id)}
							>
								<!-- Tag color dot -->
								<span
									class="h-2.5 w-2.5 shrink-0 rounded-full {isActive ? 'ring-2 ring-accent/40' : ''}"
									style="background: {getTagHex(tag)}"
								></span>

								<!-- Tag name -->
								<span class="min-w-0 flex-1 truncate text-xs">{tag.name}</span>

								<!-- Item count -->
								<span class="shrink-0 text-[10px] text-text-dim">{count}</span>
							</button>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</aside>
