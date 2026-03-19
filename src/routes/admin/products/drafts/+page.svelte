<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import StatusBadge from '$lib/admin/components/ui/StatusBadge.svelte';
	import EmptyState from '$lib/admin/components/ui/EmptyState.svelte';
	import { productService } from '$lib/admin/services/products';
	import { formatPrice } from '$lib/types/product';
	import type { Product } from '$lib/types/product';

	let products = $state<Product[]>([]);
	let loading = $state(true);

	$effect(() => { if (browser) loadDrafts(); });

	async function loadDrafts() {
		loading = true;
		try { products = await productService.getDrafts(); }
		catch (e) { console.error(e); }
		finally { loading = false; }
	}
</script>

<div class="page">
	<div class="page-header"><h1 class="page-title">Drafts</h1></div>
	{#if loading}
		<div class="loading">{#each Array(3) as _}<div class="skeleton-row"></div>{/each}</div>
	{:else if products.length === 0}
		<EmptyState title="No drafts" description="Products in draft status will appear here" />
	{:else}
		<div class="table-wrapper">
			<table class="data-table">
				<thead><tr><th>Product</th><th>Type</th><th>Price</th><th>Status</th></tr></thead>
				<tbody>
					{#each products as product}
						<tr class="clickable-row" onclick={() => goto('/admin/products/' + product.id)}>
							<td class="product-name">{product.title}</td>
							<td>{product.garmentType.replace('_', ' ')}</td>
							<td>{formatPrice(product.price)}</td>
							<td><StatusBadge status={product.availability} size="sm" /></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<style>
	.page { padding: 24px; max-width: 1100px; }
	.page-header { margin-bottom: 20px; }
	.page-title { font-size: 20px; font-weight: 700; color: var(--color-text); margin: 0; }
	.table-wrapper { overflow-x: auto; border: 1px solid var(--color-table-border); border-radius: 10px; }
	.data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
	.data-table th { text-align: left; padding: 10px 16px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-dim); background: var(--color-table-header); border-bottom: 1px solid var(--color-table-border); }
	.data-table td { padding: 12px 16px; color: var(--color-text-muted); border-bottom: 1px solid var(--color-table-border); }
	.clickable-row { cursor: pointer; transition: background 0.15s; }
	.clickable-row:hover { background: var(--color-table-row-hover); }
	.product-name { font-weight: 600; color: var(--color-text); }
	.loading { display: flex; flex-direction: column; gap: 8px; }
	.skeleton-row { height: 48px; background: var(--color-surface-raised); border-radius: 8px; animation: pulse 1.5s ease-in-out infinite; }
	@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
</style>
