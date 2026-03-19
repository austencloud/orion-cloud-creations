<!--
	MediaSpotlight.svelte — Detail view for a single media item.
	Large image preview, editable fields, tag management, navigation.
-->
<script lang="ts">
	import type { MediaItem, MediaTag } from '$lib/admin/types/media';
	import { getTagHex } from '$lib/admin/types/media';

	interface Props {
		item: MediaItem;
		tags: MediaTag[];
		allTags: MediaTag[];
		onupdate: (updates: Partial<MediaItem>) => void;
		onclose: () => void;
		onnext?: () => void;
		onprev?: () => void;
	}

	const { item, tags, allTags, onupdate, onclose, onnext, onprev }: Props = $props();

	// Local editable state
	let editName = $state(item.suggestedName);
	let editDescription = $state(item.description);
	let editNotes = $state(item.notes ?? '');

	// Reset editable state when item changes
	$effect(() => {
		editName = item.suggestedName;
		editDescription = item.description;
		editNotes = item.notes ?? '';
	});

	// Tags not yet on this item (for the add dropdown)
	const availableTags = $derived(
		allTags.filter((t) => !item.tags.includes(t.id))
	);

	let showAddTag = $state(false);
	let tagSearch = $state('');

	const filteredAvailableTags = $derived(
		tagSearch.trim()
			? availableTags.filter((t) => t.name.toLowerCase().includes(tagSearch.toLowerCase()))
			: availableTags
	);

	function saveField(field: 'suggestedName' | 'description' | 'notes', value: string) {
		onupdate({ [field]: value });
	}

	function removeTag(tagId: string) {
		onupdate({ tags: item.tags.filter((id) => id !== tagId) });
	}

	function addTag(tagId: string) {
		onupdate({ tags: [...item.tags, tagId] });
		showAddTag = false;
		tagSearch = '';
	}

	function toggleNeedsReview() {
		onupdate({ needsReview: !item.needsReview });
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onclose();
		if (e.key === 'ArrowRight' && onnext) onnext();
		if (e.key === 'ArrowLeft' && onprev) onprev();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Backdrop -->
<div
	class="fixed inset-0 z-50 flex bg-black/70 backdrop-blur-sm"
	role="dialog"
	aria-modal="true"
	aria-label="Media detail view"
>
	<!-- Close button -->
	<button
		class="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-surface/80 text-text hover:bg-surface-raised"
		onclick={onclose}
		aria-label="Close"
	>
		<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
			<path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
		</svg>
	</button>

	<!-- Navigation arrows -->
	{#if onprev}
		<button
			class="absolute top-1/2 left-4 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/80 text-text hover:bg-surface-raised"
			onclick={onprev}
			aria-label="Previous item"
		>
			<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
				<path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
			</svg>
		</button>
	{/if}
	{#if onnext}
		<button
			class="absolute top-1/2 right-[22rem] z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/80 text-text hover:bg-surface-raised"
			onclick={onnext}
			aria-label="Next item"
		>
			<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
				<path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
			</svg>
		</button>
	{/if}

	<!-- Main content area -->
	<div class="flex flex-1 items-center justify-center p-8 pr-[22rem]">
		<img
			src={(item as any).fullUrl || item.thumbnailUrl}
			alt={item.suggestedName || item.filename}
			class="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
			onerror={(e) => { const img = e.currentTarget as HTMLImageElement; if (img.src !== item.thumbnailUrl) img.src = item.thumbnailUrl; }}
		/>
	</div>

	<!-- Right sidebar panel -->
	<aside class="flex w-[20rem] flex-col overflow-y-auto border-l border-border bg-surface-raised">
		<!-- Header -->
		<div class="border-b border-border p-4">
			<h2 class="text-sm font-semibold text-text">Details</h2>
			<p class="mt-1 truncate text-xs text-text-muted" title={item.filename}>{item.filename}</p>
			{#if item.sizeFromFilename}
				<p class="mt-0.5 text-xs text-text-dim">Size: {item.sizeFromFilename}</p>
			{/if}
		</div>

		<!-- Editable fields -->
		<div class="flex flex-col gap-4 p-4">
			<!-- Suggested Name -->
			<label class="flex flex-col gap-1">
				<span class="text-xs font-medium text-text-muted">Name</span>
				<input
					type="text"
					class="rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-text outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
					bind:value={editName}
					onblur={() => saveField('suggestedName', editName)}
				/>
			</label>

			<!-- Description -->
			<label class="flex flex-col gap-1">
				<span class="text-xs font-medium text-text-muted">Description</span>
				<textarea
					class="min-h-[4rem] resize-y rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-text outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
					bind:value={editDescription}
					onblur={() => saveField('description', editDescription)}
					rows={3}
				></textarea>
			</label>

			<!-- Notes -->
			<label class="flex flex-col gap-1">
				<span class="text-xs font-medium text-text-muted">Notes</span>
				<textarea
					class="min-h-[3rem] resize-y rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-text outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
					bind:value={editNotes}
					onblur={() => saveField('notes', editNotes)}
					rows={2}
				></textarea>
			</label>

			<!-- Needs Review toggle -->
			<div class="flex items-center justify-between">
				<span class="text-xs font-medium text-text-muted">Needs Review</span>
				<button
					class="relative h-5 w-9 rounded-full transition-colors {item.needsReview ? 'bg-warning' : 'bg-border'}"
					onclick={toggleNeedsReview}
					role="switch"
					aria-checked={item.needsReview}
				>
					<span
						class="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform {item.needsReview ? 'translate-x-4' : 'translate-x-0'}"
					></span>
				</button>
			</div>
		</div>

		<!-- Tags section -->
		<div class="flex flex-col gap-2 border-t border-border p-4">
			<div class="flex items-center justify-between">
				<span class="text-xs font-medium text-text-muted">Tags</span>
				<button
					class="rounded px-1.5 py-0.5 text-xs text-accent hover:bg-accent/10"
					onclick={() => (showAddTag = !showAddTag)}
				>
					{showAddTag ? 'Done' : '+ Add'}
				</button>
			</div>

			<!-- Current tags -->
			<div class="flex flex-wrap gap-1.5">
				{#each tags as tag (tag.id)}
					<span
						class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white"
						style="background: {getTagHex(tag)}"
					>
						{tag.name}
						<button
							class="flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-white/20"
							onclick={() => removeTag(tag.id)}
							aria-label="Remove {tag.name}"
						>
							<svg class="h-2.5 w-2.5" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M2 2l6 6M8 2l-6 6" />
							</svg>
						</button>
					</span>
				{/each}
				{#if tags.length === 0}
					<span class="text-xs text-text-dim italic">No tags</span>
				{/if}
			</div>

			<!-- Add tag dropdown -->
			{#if showAddTag}
				<div class="mt-1 flex flex-col rounded-md border border-border bg-surface">
					<input
						type="text"
						class="border-b border-border bg-transparent px-2.5 py-1.5 text-xs text-text outline-none placeholder:text-text-dim"
						placeholder="Search tags..."
						bind:value={tagSearch}
					/>
					<div class="max-h-40 overflow-y-auto">
						{#each filteredAvailableTags as tag (tag.id)}
							<button
								class="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs text-text transition-colors hover:bg-surface-hover"
								onclick={() => addTag(tag.id)}
							>
								<span
									class="h-2.5 w-2.5 rounded-full"
									style="background: {getTagHex(tag)}"
								></span>
								{tag.name}
								<span class="ml-auto text-text-dim">{tag.category}</span>
							</button>
						{:else}
							<p class="px-2.5 py-2 text-xs text-text-dim">No tags available</p>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<!-- Metadata footer -->
		<div class="mt-auto border-t border-border p-4 text-xs text-text-dim">
			<p>R2 Key: <span class="font-mono text-text-muted">{item.r2Key}</span></p>
			<p class="mt-1">Created: {item.createdAt.toLocaleDateString()}</p>
			<p>Updated: {item.updatedAt.toLocaleDateString()}</p>
		</div>
	</aside>
</div>
