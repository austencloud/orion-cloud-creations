<script lang="ts">
	import { TAG_COLORS, type TagColor } from '$lib/types/media';

	interface Props {
		selected: TagColor;
		onselect: (color: TagColor) => void;
	}

	const { selected, onselect }: Props = $props();
</script>

<div class="color-picker" role="radiogroup" aria-label="Tag color">
	{#each TAG_COLORS as color}
		<button
			class="color-dot"
			class:selected={selected === color.value}
			style="--dot-color: {color.hex}"
			onclick={() => onselect(color.value)}
			role="radio"
			aria-checked={selected === color.value}
			aria-label={color.value}
			title={color.value}
		></button>
	{/each}
</div>

<style>
	.color-picker {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		gap: 8px;
		padding: 4px 0;
	}

	.color-dot {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		border: 2px solid transparent;
		background: var(--dot-color);
		cursor: pointer;
		transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s;
		justify-self: center;
	}

	.color-dot:hover {
		transform: scale(1.2);
	}

	.color-dot:active {
		transform: scale(0.85);
	}

	.color-dot.selected {
		border-color: var(--color-text);
		transform: scale(1.15);
		box-shadow:
			0 0 0 2px var(--color-surface),
			0 0 0 4px var(--dot-color);
	}

	.color-dot:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}
</style>
