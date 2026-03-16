<script lang="ts">
	import { CATEGORY_ORDER, getCategoryLabel, type TagCategory } from '$lib/types/media';

	interface Props {
		selected: TagCategory;
		onselect: (category: TagCategory) => void;
	}

	const { selected, onselect }: Props = $props();
</script>

<div class="category-picker" role="radiogroup" aria-label="Tag category">
	{#each CATEGORY_ORDER as category}
		<button
			class="category-pill"
			class:selected={selected === category}
			onclick={() => onselect(category)}
			role="radio"
			aria-checked={selected === category}
		>
			{getCategoryLabel(category)}
		</button>
	{/each}
</div>

<style>
	.category-picker {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		padding: 4px 0;
	}

	.category-pill {
		padding: 4px 12px;
		background: var(--color-surface-raised);
		border: 1px solid var(--color-border);
		border-radius: 9999px;
		color: var(--color-text-muted);
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.15s, border-color 0.15s, color 0.15s;
		white-space: nowrap;
	}

	.category-pill:hover {
		border-color: var(--color-text-muted);
		color: var(--color-text);
	}

	.category-pill:active {
		transform: scale(0.95);
	}

	.category-pill.selected {
		background: var(--color-accent);
		border-color: var(--color-accent);
		color: white;
	}

	.category-pill:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}
</style>
