<script lang="ts">
	interface Props {
		title: string;
		description?: string;
		actionLabel?: string;
		onaction?: () => void;
	}

	const { title, description, actionLabel, onaction }: Props = $props();
</script>

<div class="empty-state">
	<h3 class="empty-title">{title}</h3>
	{#if description}<p class="empty-desc">{description}</p>{/if}
	{#if actionLabel && onaction}
		<button class="empty-action" onclick={onaction}>{actionLabel}</button>
	{/if}
</div>

<style>
	.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 24px; text-align: center; }
	.empty-title { font-size: 16px; font-weight: 600; color: var(--color-text, #e8e8f0); margin: 0 0 8px; }
	.empty-desc { font-size: 13px; color: var(--color-text-muted, #9090b0); margin: 0 0 20px; max-width: 300px; }
	.empty-action {
		padding: 8px 20px; font-size: 13px; font-weight: 600;
		background: var(--color-accent, #7c5cbf); color: white;
		border: none; border-radius: 8px; cursor: pointer; transition: background 0.15s;
	}
	.empty-action:hover { background: var(--color-accent-hover, #9070d0); }
</style>
