<script lang="ts">
	interface Props {
		label: string;
		value: string;
		subtitle?: string;
		color?: string;
	}

	const { label, value, subtitle, color = 'var(--color-accent)' }: Props = $props();
</script>

<div class="stat-card">
	<div class="stat-indicator" style="background: {color}"></div>
	<div class="stat-content">
		<span class="stat-label">{label}</span>
		<span class="stat-value">{value}</span>
		{#if subtitle}<span class="stat-subtitle">{subtitle}</span>{/if}
	</div>
</div>

<style>
	.stat-card {
		display: flex;
		gap: 16px;
		padding: 20px;
		background: var(--color-card-bg, #232340);
		border: 1px solid var(--color-card-border, #3a3a5c);
		border-radius: 12px;
		transition: border-color 0.15s;
	}
	.stat-card:hover { border-color: var(--color-border, #3a3a5c); }
	.stat-indicator { width: 4px; border-radius: 2px; flex-shrink: 0; align-self: stretch; }
	.stat-content { display: flex; flex-direction: column; gap: 4px; }
	.stat-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-muted, #9090b0); }
	.stat-value { font-size: 28px; font-weight: 700; color: var(--color-text, #e8e8f0); line-height: 1.1; }
	.stat-subtitle { font-size: 12px; color: var(--color-text-dim, #606080); }
</style>
