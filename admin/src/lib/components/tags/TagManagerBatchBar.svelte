<script lang="ts">
	interface Props {
		selectedCount: number;
		onbatchcolor: () => void;
		onbatchcategory: () => void;
		onbatchdelete: () => void;
	}

	const {
		selectedCount,
		onbatchcolor,
		onbatchcategory,
		onbatchdelete
	}: Props = $props();
</script>

{#if selectedCount > 0}
	<div class="batch-bar">
		<span class="selection-count">
			<span class="count-num">{selectedCount}</span> selected
		</span>
		<div class="batch-actions">
			<button class="batch-btn" onclick={onbatchcolor}>Color</button>
			<button class="batch-btn" onclick={onbatchcategory}>Category</button>
			<button class="batch-btn danger" onclick={onbatchdelete}>Delete</button>
		</div>
	</div>
{/if}

<style>
	.batch-bar {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 16px;
		background: color-mix(in srgb, var(--color-accent) 10%, var(--color-surface));
		border-top: 1px solid color-mix(in srgb, var(--color-accent) 25%, transparent);
		animation: slide-up 0.2s ease-out;
	}

	@keyframes slide-up {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.selection-count {
		font-size: 13px;
		font-weight: 500;
		color: var(--color-text-muted);
		white-space: nowrap;
		flex-shrink: 0;
	}

	.count-num {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 22px;
		height: 20px;
		padding: 0 6px;
		background: var(--color-accent);
		border-radius: 9999px;
		font-weight: 700;
		font-size: 12px;
		font-variant-numeric: tabular-nums;
		color: white;
	}

	.batch-actions {
		display: flex;
		align-items: center;
		gap: 6px;
		flex: 1;
	}

	.batch-btn {
		padding: 5px 14px;
		background: var(--color-surface-overlay);
		border: 1px solid var(--color-border);
		border-radius: 6px;
		color: var(--color-text);
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.15s, border-color 0.15s;
		white-space: nowrap;
	}

	.batch-btn:hover {
		background: var(--color-surface-hover);
		border-color: var(--color-text-muted);
	}

	.batch-btn:active {
		transform: scale(0.95);
	}

	.batch-btn.danger {
		color: var(--color-danger);
		border-color: color-mix(in srgb, var(--color-danger) 30%, transparent);
	}

	.batch-btn.danger:hover {
		background: color-mix(in srgb, var(--color-danger) 15%, var(--color-surface));
		border-color: var(--color-danger);
	}

	.batch-btn:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}
</style>
