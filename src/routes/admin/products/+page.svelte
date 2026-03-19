<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import SearchInput from '$lib/admin/components/ui/SearchInput.svelte';
	import StatusBadge from '$lib/admin/components/ui/StatusBadge.svelte';
	import EmptyState from '$lib/admin/components/ui/EmptyState.svelte';
	import ConfirmDialog from '$lib/admin/components/ui/ConfirmDialog.svelte';
	import { productService } from '$lib/admin/services/products';
	import { formatPrice, getTotalStock } from '$lib/types/product';
	import type { Product } from '$lib/types/product';

	let products = $state<Product[]>([]);
	let loading = $state(true);
	let searchQuery = $state('');
	let deleteTarget = $state<Product | null>(null);

	$effect(() => { if (browser) loadProducts(); });

	async function loadProducts() {
		loading = true;
		try { products = await productService.getAll(); }
		catch (e) { console.error('Failed to load products:', e); }
		finally { loading = false; }
	}

	let filtered = $derived.by(() => {
		if (!searchQuery) return products;
		const q = searchQuery.toLowerCase();
		return products.filter(p => p.title.toLowerCase().includes(q) || p.garmentType.toLowerCase().includes(q));
	});

	async function handleDelete() {
		if (!deleteTarget) return;
		await productService.delete(deleteTarget.id);
		products = products.filter(p => p.id !== deleteTarget!.id);
		deleteTarget = null;
	}
</script>

<div class="page">
	<div class="page-header">
		<h1 class="page-title">Products</h1>
		<div class="header-actions">
			<SearchInput bind:value={searchQuery} onchange={() => {}} placeholder="Search products..." />
			<button class="btn-primary" onclick={() => goto('/admin/products/new')}>+ New Product</button>
		</div>
	</div>
	{#if loading}
		<div class="loading-rows">{#each Array(5) as _}<div class="skeleton-row"></div>{/each}</div>
	{:else if filtered.length === 0}
		<EmptyState title="No products found" description={searchQuery ? 'Try a different search' : 'Create your first product'} actionLabel={searchQuery ? undefined : '+ New Product'} onaction={searchQuery ? undefined : () => goto('/admin/products/new')} />
	{:else}
		<div class="table-wrapper">
			<table class="data-table">
				<thead><tr><th>Product</th><th>Type</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr></thead>
				<tbody>
					{#each filtered as product}
						<tr class="clickable-row" onclick={() => goto('/admin/products/' + product.id)}>
							<td class="product-name">{product.title}</td>
							<td class="product-type">{product.garmentType.replace('_', ' ')}</td>
							<td>{formatPrice(product.price)}</td>
							<td><span class="stock" class:zero={getTotalStock(product.sizes) === 0}>{getTotalStock(product.sizes)}</span></td>
							<td><StatusBadge status={product.availability} size="sm" /></td>
							<td><button class="delete-btn" onclick={(e) => { e.stopPropagation(); deleteTarget = product; }}>&times;</button></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<ConfirmDialog open={!!deleteTarget} title="Delete Product" message={'Delete "' + (deleteTarget?.title ?? '') + '"? This cannot be undone.'} confirmLabel="Delete" danger onconfirm={handleDelete} oncancel={() => deleteTarget = null} />

<style>
	.page { padding: 24px; max-width: 1100px; }
	.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
	.page-title { font-size: 20px; font-weight: 700; color: var(--color-text); margin: 0; }
	.header-actions { display: flex; gap: 12px; align-items: center; flex: 1; max-width: 500px; }
	.btn-primary { padding: 8px 20px; font-size: 13px; font-weight: 600; background: var(--color-accent); color: white; border: none; border-radius: 8px; cursor: pointer; white-space: nowrap; transition: background 0.15s; }
	.btn-primary:hover { background: var(--color-accent-hover); }
	.table-wrapper { overflow-x: auto; border: 1px solid var(--color-table-border); border-radius: 10px; }
	.data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
	.data-table th { text-align: left; padding: 10px 16px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-dim); background: var(--color-table-header); border-bottom: 1px solid var(--color-table-border); }
	.data-table td { padding: 12px 16px; color: var(--color-text-muted); border-bottom: 1px solid var(--color-table-border); }
	.clickable-row { cursor: pointer; transition: background 0.15s; }
	.clickable-row:hover { background: var(--color-table-row-hover); }
	.product-name { font-weight: 600; color: var(--color-text); }
	.product-type { text-transform: capitalize; }
	.stock.zero { color: var(--color-danger); font-weight: 600; }
	.delete-btn { padding: 4px 8px; font-size: 16px; background: none; border: none; color: var(--color-text-dim); cursor: pointer; border-radius: 4px; }
	.delete-btn:hover { color: var(--color-danger); background: color-mix(in srgb, var(--color-danger) 10%, transparent); }
	.loading-rows { display: flex; flex-direction: column; gap: 8px; }
	.skeleton-row { height: 48px; background: var(--color-surface-raised); border-radius: 8px; animation: pulse 1.5s ease-in-out infinite; }
	@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
</style>
