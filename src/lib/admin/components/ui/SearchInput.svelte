<script lang="ts">
	interface Props {
		value: string;
		placeholder?: string;
		onchange: (value: string) => void;
	}

	let { value = $bindable(''), placeholder = 'Search...', onchange }: Props = $props();

	let timeout: ReturnType<typeof setTimeout>;

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		value = target.value;
		clearTimeout(timeout);
		timeout = setTimeout(() => onchange(value), 250);
	}

	function clear() {
		value = '';
		onchange('');
	}
</script>

<div class="search-input">
	<input type="text" {value} {placeholder} oninput={handleInput} />
	{#if value}
		<button class="clear-btn" onclick={clear} aria-label="Clear search">&times;</button>
	{/if}
</div>

<style>
	.search-input { position: relative; display: flex; align-items: center; flex: 1; }
	input {
		width: 100%;
		padding: 8px 32px 8px 12px;
		font-size: 13px;
		background: var(--color-input-bg, #1a1a2e);
		border: 1px solid var(--color-input-border, #3a3a5c);
		border-radius: 8px;
		color: var(--color-text, #e8e8f0);
		transition: border-color 0.15s;
		font-family: inherit;
	}
	input:focus { outline: none; border-color: var(--color-input-focus, #7c5cbf); }
	.clear-btn {
		position: absolute;
		right: 6px;
		width: 24px; height: 24px;
		display: flex; align-items: center; justify-content: center;
		border: none; background: transparent;
		color: var(--color-text-dim, #606080);
		font-size: 16px; cursor: pointer; border-radius: 4px;
	}
	.clear-btn:hover { color: var(--color-text, #e8e8f0); background: var(--color-surface-hover, #303055); }
</style>
