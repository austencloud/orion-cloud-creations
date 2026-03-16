<!--
	TagPickerPanel.svelte — Side panel for bulk tagging selected items.
	Tags grouped by category with tri-state checkboxes (all/some/none).
-->
<script lang="ts">
	import type { MediaItem, MediaTag, TagCategory } from '$lib/types/media';
	import { getTagHex, CATEGORY_ORDER, getCategoryLabel } from '$lib/types/media';

	interface Props {
		tags: MediaTag[];
		selectedItems: MediaItem[];
		onapply: (tag: MediaTag) => void;
		onremove: (tag: MediaTag) => void;
	}

	const { tags, selectedItems, onapply, onremove }: Props = $props();

	let searchQuery = $state('');
	let collapsedCategories = $state(new Set<string>());

	// Filter tags by search
	const filteredTags = $derived(
		searchQuery.trim()
			? tags.filter((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
			: tags
	);

	// Group filtered tags by category in display order
	const tagsByCategory = $derived.by(() => {
		const grouped = new Map<string, MediaTag[]>();
		// First pass: collect tags into categories
		for (const tag of filteredTags) {
			const cat = tag.category;
			if (!grouped.has(cat)) grouped.set(cat, []);
			grouped.get(cat)!.push(tag);
		}
		// Return in CATEGORY_ORDER, then any extras
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

	// Compute tag application state across selected items
	type TagState = 'all' | 'some' | 'none';

	function getTagState(tag: MediaTag): TagState {
		if (selectedItems.length === 0) return 'none';
		const count = selectedItems.filter((item) => item.tags.includes(tag.id)).length;
		if (count === selectedItems.length) return 'all';
		if (count > 0) return 'some';
		return 'none';
	}

	function handleTagClick(tag: MediaTag) {
		const state = getTagState(tag);
		if (state === 'all') {
			onremove(tag);
		} else {
			onapply(tag);
		}
	}

	function toggleCategory(category: string) {
		const next = new Set(collapsedCategories);
		if (next.has(category)) {
			next.delete(category);
		} else {
			next.add(category);
		}
		collapsedCategories = next;
	}
</script>

<div class="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface-raised">
	<!-- Search header -->
	<div class="border-b border-border p-3">
		<div class="flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20">
			<svg class="h-3.5 w-3.5 shrink-0 text-text-muted" viewBox="0 0 20 20" fill="currentColor">
				<path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.45 4.39l4.26 4.26a.75.75 0 11-1.06 1.06l-4.26-4.26A7 7 0 012 9z" clip-rule="evenodd" />
			</svg>
			<input
				type="text"
				class="min-w-0 flex-1 border-none bg-transparent text-xs text-text outline-none placeholder:text-text-dim"
				placeholder="Filter tags..."
				bind:value={searchQuery}
			/>
			{#if searchQuery}
				<button
					class="flex h-4 w-4 items-center justify-center rounded-full bg-surface-overlay text-text-muted hover:text-text"
					onclick={() => (searchQuery = '')}
				>
					<svg class="h-2.5 w-2.5" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M2 2l6 6M8 2l-6 6" />
					</svg>
				</button>
			{/if}
		</div>
		<p class="mt-1.5 text-[10px] text-text-dim">
			{selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
		</p>
	</div>

	<!-- Tag categories -->
	<div class="flex-1 overflow-y-auto">
		{#each [...tagsByCategory.entries()] as [category, categoryTags] (category)}
			<div class="border-b border-border-subtle last:border-b-0">
				<!-- Category header (collapsible) -->
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

				<!-- Tags in category -->
				{#if !collapsedCategories.has(category)}
					<div class="flex flex-col gap-0.5 px-2 pb-2">
						{#each categoryTags as tag (tag.id)}
							{@const state = getTagState(tag)}
							<button
								class="flex items-center gap-2 rounded px-2 py-1 text-left transition-colors hover:bg-surface-hover"
								onclick={() => handleTagClick(tag)}
								title={state === 'all'
									? 'On all selected. Click to remove.'
									: state === 'some'
										? 'On some selected. Click to apply to all.'
										: 'Click to apply to all selected.'}
							>
								<!-- Tri-state checkbox -->
								<div
									class="flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors
										{state === 'all'
											? 'border-accent bg-accent text-white'
											: state === 'some'
												? 'border-accent bg-accent/30 text-accent'
												: 'border-text-dim bg-transparent'}"
								>
									{#if state === 'all'}
										<svg class="h-2.5 w-2.5" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="2">
											<path d="M2 5l2.5 2.5L8 3" />
										</svg>
									{:else if state === 'some'}
										<svg class="h-2.5 w-2.5" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="2.5">
											<path d="M2 5h6" />
										</svg>
									{/if}
								</div>

								<!-- Tag color dot -->
								<span
									class="h-2.5 w-2.5 shrink-0 rounded-full"
									style="background: {getTagHex(tag)}"
								></span>

								<!-- Tag name -->
								<span class="min-w-0 flex-1 truncate text-xs text-text">{tag.name}</span>
							</button>
						{/each}
					</div>
				{/if}
			</div>
		{:else}
			<div class="flex flex-col items-center gap-2 py-8 text-text-dim">
				<p class="text-xs">No tags found</p>
			</div>
		{/each}
	</div>
</div>
