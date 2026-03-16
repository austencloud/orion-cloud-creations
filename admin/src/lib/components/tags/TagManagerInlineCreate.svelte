<script lang="ts">
	import TagManagerColorPicker from './TagManagerColorPicker.svelte';
	import TagManagerCategoryPicker from './TagManagerCategoryPicker.svelte';
	import type { TagColor, TagCategory } from '$lib/types/media';

	interface Props {
		oncreate: (name: string, color: TagColor, category: TagCategory) => void;
	}

	const { oncreate }: Props = $props();

	let name = $state('');
	let color = $state<TagColor>('royal');
	let category = $state<TagCategory>('custom');
	let creating = $state(false);
	let nameInputEl: HTMLInputElement | undefined = $state();

	function handleCreate() {
		const trimmed = name.trim();
		if (!trimmed || creating) return;
		creating = true;
		oncreate(trimmed, color, category);
		name = '';
		creating = false;
		nameInputEl?.focus();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleCreate();
		}
	}

	$effect(() => {
		if (nameInputEl) {
			nameInputEl.focus();
		}
	});
</script>

<div class="inline-create">
	<div class="create-row">
		<input
			bind:this={nameInputEl}
			type="text"
			class="name-input"
			placeholder="Tag name..."
			bind:value={name}
			onkeydown={handleKeydown}
			aria-label="New tag name"
		/>
		<button
			class="create-btn"
			onclick={handleCreate}
			disabled={!name.trim() || creating}
		>
			{creating ? 'Creating...' : 'Create'}
		</button>
	</div>

	<div class="picker-section">
		<span class="picker-label">Color</span>
		<TagManagerColorPicker selected={color} onselect={(c) => (color = c)} />
	</div>

	<div class="picker-section">
		<span class="picker-label">Category</span>
		<TagManagerCategoryPicker selected={category} onselect={(c) => (category = c)} />
	</div>
</div>

<style>
	.inline-create {
		padding: 12px 16px;
		background: var(--color-surface-raised);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.create-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.name-input {
		flex: 1;
		padding: 8px 12px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 6px;
		color: var(--color-text);
		font-size: 14px;
		font-family: inherit;
		outline: none;
	}

	.name-input:focus {
		border-color: var(--color-accent);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-accent) 25%, transparent);
	}

	.name-input::placeholder {
		color: var(--color-text-dim);
	}

	.create-btn {
		padding: 8px 20px;
		background: var(--color-accent);
		border: none;
		border-radius: 6px;
		color: white;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.15s;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.create-btn:hover:not(:disabled) {
		background: var(--color-accent-hover);
	}

	.create-btn:active:not(:disabled) {
		transform: scale(0.95);
	}

	.create-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.create-btn:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	.picker-section {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.picker-label {
		font-size: 12px;
		font-weight: 500;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
</style>
