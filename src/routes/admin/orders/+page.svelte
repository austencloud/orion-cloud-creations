<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import SearchInput from '$lib/admin/components/ui/SearchInput.svelte';
	import StatusBadge from '$lib/admin/components/ui/StatusBadge.svelte';
	import EmptyState from '$lib/admin/components/ui/EmptyState.svelte';
	import { orderService } from '$lib/admin/services/orders';
	import { formatPrice } from '$lib/types/product';
	import type { Order } from '$lib/types/order';

	let orders = $state<Order[]>([]);
	let loading = $state(true);
	let searchQuery = $state('');

	$effect(() => { if (browser) loadOrders(); });

	async function loadOrders() {
		loading = true;
		try { orders = await orderService.getAll(); }
		catch (e) { console.error('Failed to load orders:', e); }
		finally { loading = false; }
	}

	let filtered = $derived.by(() => {
		if (!searchQuery) return orders;
		const q = searchQuery.toLowerCase();
		return orders.filter(o =>
			o.customerName.toLowerCase().includes(q) ||
			o.customerEmail.toLowerCase().includes(q) ||
			o.id.toLowerCase().includes(q)
		);
	});

	function formatDate(d: Date) {
		return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}
</script>

<div class="page">
	<div class="page-header">
		<h1 class="page-title">Orders</h1>
		<div class="header-search">
			<SearchInput bind:value={searchQuery} onchange={() => {}} placeholder="Search by customer or order ID..." />
		</div>
	</div>
	{#if loading}
		<div class="loading-rows">{#each Array(6) as _}<div class="skeleton-row"></div>{/each}</div>
	{:else if filtered.length === 0}
		<EmptyState
			title="No orders yet"
			description={searchQuery ? 'No orders match your search' : 'Orders will appear here once customers start purchasing'}
		/>
	{:else}
		<div class="table-wrapper">
			<table class="data-table">
				<thead>
					<tr>
						<th>Order #</th>
						<th>Customer</th>
						<th>Items</th>
						<th>Total</th>
						<th>Status</th>
						<th>Date</th>
					</tr>
				</thead>
				<tbody>
					{#each filtered as order}
						<tr class="clickable-row" onclick={() => goto('/admin/orders/' + order.id)}>
							<td class="order-id">{order.id.slice(0, 8).toUpperCase()}</td>
							<td>
								<div class="customer-name">{order.customerName}</div>
								<div class="customer-email">{order.customerEmail}</div>
							</td>
							<td>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</td>
							<td class="order-total">{formatPrice(order.total)}</td>
							<td><StatusBadge status={order.status} size="sm" /></td>
							<td class="order-date">{formatDate(order.createdAt)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div class="table-footer">{filtered.length} order{filtered.length !== 1 ? 's' : ''}</div>
	{/if}
</div>

<style>
	.page { padding: 24px; max-width: 1100px; }
	.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; gap: 16px; flex-wrap: wrap; }
	.page-title { font-size: 20px; font-weight: 700; color: var(--color-text); margin: 0; }
	.header-search { flex: 1; max-width: 400px; }
	.table-wrapper { overflow-x: auto; border: 1px solid var(--color-table-border); border-radius: 10px; }
	.data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
	.data-table th { text-align: left; padding: 10px 16px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-dim); background: var(--color-table-header); border-bottom: 1px solid var(--color-table-border); }
	.data-table td { padding: 12px 16px; color: var(--color-text-muted); border-bottom: 1px solid var(--color-table-border); vertical-align: middle; }
	.clickable-row { cursor: pointer; transition: background 0.15s; }
	.clickable-row:hover { background: var(--color-table-row-hover); }
	.order-id { font-family: monospace; font-size: 12px; font-weight: 600; color: var(--color-text); }
	.customer-name { font-weight: 500; color: var(--color-text); }
	.customer-email { font-size: 12px; color: var(--color-text-dim); margin-top: 2px; }
	.order-total { font-weight: 600; color: var(--color-text); }
	.order-date { font-size: 12px; white-space: nowrap; }
	.table-footer { padding: 10px 16px; font-size: 12px; color: var(--color-text-dim); text-align: right; }
	.loading-rows { display: flex; flex-direction: column; gap: 8px; }
	.skeleton-row { height: 56px; background: var(--color-surface-raised); border-radius: 8px; animation: pulse 1.5s ease-in-out infinite; }
	@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
</style>
