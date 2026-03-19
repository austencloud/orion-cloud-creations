<!--
	WizardGrid.svelte — Selectable thumbnail grid for wizard quick-tag.
	Shows all items with selection and already-tagged states.
-->
<script lang="ts">
	import type { MediaItem } from '@austencloud/media-manager';

	interface Props {
		items: MediaItem[];
		selectedIds: Set<string>;
		alreadyTaggedIds: Set<string>;
		accentHex: string;
		ontoggle: (itemId: string) => void;
	}

	const { items, selectedIds, alreadyTaggedIds, accentHex, ontoggle }: Props = $props();
</script>

<div class="wizard-grid">
	{#each items as item (item.id)}
		{@const isSelected = selectedIds.has(item.id)}
		{@const isTagged = alreadyTaggedIds.has(item.id)}
		<button
			class="grid-thumb"
			class:selected={isSelected}
			class:tagged={isTagged}
			style="--accent: {accentHex}"
			onclick={() => { if (!isTagged) ontoggle(item.id); }}
			disabled={isTagged}
			aria-label="{item.suggestedName || item.filename}{isTagged ? ' (already tagged)' : ''}"
		>
			<img
				src={item.thumbnailUrl || item.url}
				alt=""
				loading="lazy"
				class="thumb-img"
			/>
			{#if isSelected}
				<div class="select-overlay">
					<svg class="select-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
						<path d="M5 12l5 5L19 7" />
					</svg>
				</div>
			{/if}
			{#if isTagged}
				<div class="tagged-overlay">
					<svg class="tagged-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
						<path d="M5 12l5 5L19 7" />
					</svg>
				</div>
			{/if}
		</button>
	{/each}
</div>

<style>
	.wizard-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 6px;
		padding: 8px;
		overflow-y: auto;
	}

	.grid-thumb {
		position: relative;
		aspect-ratio: 1;
		border: 3px solid transparent;
		border-radius: 8px;
		overflow: hidden;
		cursor: pointer;
		background: var(--color-surface, #1a1a2e);
		padding: 0;
		transition: border-color 0.12s, opacity 0.12s;
	}

	.grid-thumb:hover:not(:disabled) {
		border-color: color-mix(in srgb, var(--accent) 50%, transparent);
	}

	.grid-thumb.selected {
		border-color: var(--accent);
		box-shadow: 0 0 0 1px var(--accent);
	}

	.grid-thumb.tagged {
		opacity: 0.35;
		cursor: default;
	}

	.thumb-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.select-overlay {
		position: absolute;
		inset: 0;
		background: color-mix(in srgb, var(--accent) 20%, transparent);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.select-check {
		width: 32px;
		height: 32px;
		color: white;
		filter: drop-shadow(0 1px 3px rgba(0,0,0,0.5));
	}

	.tagged-overlay {
		position: absolute;
		top: 4px;
		right: 4px;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: rgba(0,0,0,0.6);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.tagged-check {
		width: 14px;
		height: 14px;
		color: rgba(255,255,255,0.7);
	}
</style>
