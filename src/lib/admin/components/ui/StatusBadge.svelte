<script lang="ts">
	interface Props {
		status: string;
		size?: 'sm' | 'md';
	}

	const { status, size = 'md' }: Props = $props();

	const colorMap: Record<string, string> = {
		pending: 'var(--color-status-pending, #e0a030)',
		paid: 'var(--color-status-paid, #7c5cbf)',
		shipped: 'var(--color-status-shipped, #20b0c0)',
		delivered: 'var(--color-status-delivered, #40b080)',
		refunded: 'var(--color-status-refunded, #e04050)',
		cancelled: 'var(--color-status-cancelled, #606080)',
		available: 'var(--color-success, #40b080)',
		draft: 'var(--color-text-dim, #606080)',
		sold: 'var(--color-danger, #e04050)',
		archived: 'var(--color-text-dim, #606080)'
	};

	let color = $derived(colorMap[status] ?? 'var(--color-text-dim, #606080)');
</script>

<span class="badge" class:sm={size === 'sm'} style="--badge-color: {color}">
	{status}
</span>

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		padding: 3px 10px;
		font-size: 12px;
		font-weight: 600;
		text-transform: capitalize;
		border-radius: 999px;
		color: var(--badge-color);
		background: color-mix(in srgb, var(--badge-color) 12%, transparent);
		border: 1px solid color-mix(in srgb, var(--badge-color) 25%, transparent);
		white-space: nowrap;
	}
	.badge.sm { padding: 1px 7px; font-size: 11px; }
</style>
