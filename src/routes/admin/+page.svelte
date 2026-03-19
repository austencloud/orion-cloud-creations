<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import StatCard from '$lib/admin/components/ui/StatCard.svelte';
	import StatusBadge from '$lib/admin/components/ui/StatusBadge.svelte';
	import { dashboardService, type DashboardStats } from '$lib/admin/services/dashboard';
	import { orderService } from '$lib/admin/services/orders';
	import { productService } from '$lib/admin/services/products';
	import { formatPrice, getTotalStock } from '$lib/types/product';
	import type { Order } from '$lib/types/order';
	import type { Product } from '$lib/types/product';

	let stats = $state<DashboardStats | null>(null);
	let recentOrders = $state<Order[]>([]);
	let lowStockProducts = $state<Product[]>([]);
	let loading = $state(true);

	$effect(() => {
		if (!browser) return;
		loadDashboard();
	});

	async function loadDashboard() {
		loading = true;
		try {
			const [s, orders, products] = await Promise.all([
				dashboardService.getStats(),
				orderService.getRecent(5),
				productService.getAll()
			]);
			stats = s;
			recentOrders = orders;
			lowStockProducts = products.filter(p => p.availability === 'available' && getTotalStock(p.sizes) <= 1).slice(0, 5);
		} catch (e) {
			console.error('Dashboard load failed:', e);
		} finally {
			loading = false;
		}
	}
</script>

<div class="dashboard">
	<div class="page-header">
		<h1 class="page-title">Dashboard</h1>
		<p class="page-subtitle">Welcome back to OCC Admin</p>
	</div>
	{#if loading}
		<div class="stats-grid">
			{#each Array(4) as _}<div class="skeleton-card"></div>{/each}
		</div>
	{:else if stats}
		<div class="stats-grid">
			<StatCard label="Revenue This Month" value={formatPrice(stats.monthlyRevenue)} color="var(--color-success)" />
			<StatCard label="Orders This Month" value={String(stats.monthlyOrders)} color="var(--color-tag-gold)" />
			<StatCard label="Products Listed" value={String(stats.totalProducts)} color="var(--color-tag-teal)" />
			<StatCard label="Needs Review" value={String(stats.needsReviewCount)} subtitle="media items" color="var(--color-tag-cyan)" />
		</div>
		<div class="dashboard-grid">
			<section class="dashboard-section">
				<div class="section-header">
					<h2 class="section-title">Recent Orders</h2>
					<button class="section-link" onclick={() => goto('/admin/orders')}>View all</button>
				</div>
				{#if recentOrders.length === 0}
					<p class="empty-text">No orders yet</p>
				{:else}
					<div class="mini-list">
						{#each recentOrders as order}
							<button class="mini-row" onclick={() => goto('/admin/orders/' + order.id)}>
								<div class="mini-row-left">
									<span class="mini-primary">{order.customerName}</span>
									<span class="mini-secondary">{formatPrice(order.total)}</span>
								</div>
								<StatusBadge status={order.status} size="sm" />
							</button>
						{/each}
					</div>
				{/if}
			</section>
			<section class="dashboard-section">
				<div class="section-header">
					<h2 class="section-title">Low Stock</h2>
					<button class="section-link" onclick={() => goto('/admin/inventory/low')}>View all</button>
				</div>
				{#if lowStockProducts.length === 0}
					<p class="empty-text">All stocked up</p>
				{:else}
					<div class="mini-list">
						{#each lowStockProducts as product}
							<button class="mini-row" onclick={() => goto('/admin/products/' + product.id)}>
								<span class="mini-primary">{product.title}</span>
								<span class="stock-count" class:zero={getTotalStock(product.sizes) === 0}>{getTotalStock(product.sizes)} left</span>
							</button>
						{/each}
					</div>
				{/if}
			</section>
		</div>
		<div class="quick-actions">
			<button class="action-btn" onclick={() => goto('/admin/products/new')}>+ New Product</button>
			<button class="action-btn" onclick={() => goto('/admin/media/curate')}>Curate Media</button>
			<a class="action-btn" href="/" target="_blank">View Storefront &#8599;</a>
		</div>
	{/if}
</div>

<style>
	.dashboard { padding: 24px; max-width: 1200px; }
	.page-header { margin-bottom: 24px; }
	.page-title { font-size: 22px; font-weight: 700; color: var(--color-text); margin: 0; }
	.page-subtitle { font-size: 13px; color: var(--color-text-muted); margin: 4px 0 0; }
	.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
	.dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin-bottom: 24px; }
	.dashboard-section { background: var(--color-card-bg); border: 1px solid var(--color-card-border); border-radius: 12px; padding: 20px; }
	.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
	.section-title { font-size: 14px; font-weight: 700; color: var(--color-text); margin: 0; }
	.section-link { font-size: 12px; font-weight: 500; color: var(--color-accent); background: none; border: none; cursor: pointer; padding: 0; }
	.section-link:hover { color: var(--color-accent-hover); }
	.mini-list { display: flex; flex-direction: column; gap: 4px; }
	.mini-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: none; border: none; border-radius: 8px; cursor: pointer; width: 100%; text-align: left; transition: background 0.15s; }
	.mini-row:hover { background: var(--color-surface-hover); }
	.mini-row-left { display: flex; align-items: center; gap: 12px; }
	.mini-primary { font-size: 13px; font-weight: 500; color: var(--color-text); }
	.mini-secondary { font-size: 13px; color: var(--color-text-muted); }
	.stock-count { font-size: 12px; font-weight: 600; color: var(--color-warning); }
	.stock-count.zero { color: var(--color-danger); }
	.empty-text { font-size: 13px; color: var(--color-text-dim); margin: 0; padding: 12px 0; }
	.quick-actions { display: flex; gap: 12px; flex-wrap: wrap; }
	.action-btn { padding: 10px 20px; font-size: 13px; font-weight: 600; background: var(--color-surface-raised); border: 1px solid var(--color-border); border-radius: 8px; color: var(--color-text-muted); cursor: pointer; text-decoration: none; transition: color 0.15s, border-color 0.15s; }
	.action-btn:hover { color: var(--color-text); border-color: var(--color-accent); }
	.skeleton-card { height: 100px; background: var(--color-surface-raised); border-radius: 12px; animation: pulse 1.5s ease-in-out infinite; }
	@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
</style>
