<script lang="ts">
	interface Props {
		value: number;
		onsave: (value: number) => void;
	}

	let { value, onsave }: Props = $props();

	let editing = $state(false);
	let editValue = $state(String(value));

	function startEdit() {
		editValue = String(value);
		editing = true;
	}

	function save() {
		const num = parseInt(editValue, 10);
		if (!isNaN(num) && num >= 0) onsave(num);
		editing = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') save();
		if (e.key === 'Escape') editing = false;
	}
</script>

{#if editing}
	<input type="number" class="inline-input" bind:value={editValue} onblur={save} onkeydown={handleKeydown} min="0" />
{:else}
	<button class="inline-display" onclick={startEdit} aria-label="Edit value">{value}</button>
{/if}

<style>
	.inline-input {
		width: 60px; padding: 4px 8px; font-size: 14px;
		background: var(--color-input-bg, #1a1a2e);
		border: 1px solid var(--color-input-focus, #7c5cbf);
		border-radius: 6px; color: var(--color-text, #e8e8f0);
		text-align: center; font-family: inherit;
	}
	.inline-input:focus { outline: none; }
	.inline-display {
		padding: 4px 12px; font-size: 14px; font-weight: 600;
		background: transparent; border: 1px solid transparent;
		border-radius: 6px; color: var(--color-text, #e8e8f0);
		cursor: pointer; transition: border-color 0.15s, background 0.15s;
	}
	.inline-display:hover {
		border-color: var(--color-border, #3a3a5c);
		background: var(--color-surface-hover, #303055);
	}
</style>
