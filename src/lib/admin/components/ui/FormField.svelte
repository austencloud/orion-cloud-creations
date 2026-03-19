<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label: string;
		error?: string;
		required?: boolean;
		children: Snippet;
	}

	const { label, error, required = false, children }: Props = $props();
</script>

<div class="form-field" class:has-error={!!error}>
	<label class="field-label">
		{label}
		{#if required}<span class="required">*</span>{/if}
	</label>
	<div class="field-input">
		{@render children()}
	</div>
	{#if error}<span class="field-error">{error}</span>{/if}
</div>

<style>
	.form-field { display: flex; flex-direction: column; gap: 6px; }
	.field-label { font-size: 13px; font-weight: 600; color: var(--color-text-muted, #9090b0); }
	.required { color: var(--color-danger, #e04050); margin-left: 2px; }
	.field-input :global(input),
	.field-input :global(textarea),
	.field-input :global(select) {
		width: 100%;
		padding: 8px 12px;
		font-size: 14px;
		background: var(--color-input-bg, #1a1a2e);
		border: 1px solid var(--color-input-border, #3a3a5c);
		border-radius: 8px;
		color: var(--color-text, #e8e8f0);
		transition: border-color 0.15s;
		font-family: inherit;
	}
	.field-input :global(input:focus),
	.field-input :global(textarea:focus),
	.field-input :global(select:focus) {
		outline: none;
		border-color: var(--color-input-focus, #7c5cbf);
	}
	.has-error .field-input :global(input),
	.has-error .field-input :global(textarea),
	.has-error .field-input :global(select) {
		border-color: var(--color-input-error, #e04050);
	}
	.field-error { font-size: 12px; color: var(--color-danger, #e04050); }
	.field-input :global(textarea) { resize: vertical; min-height: 80px; }
	.field-input :global(select) { cursor: pointer; }
</style>
