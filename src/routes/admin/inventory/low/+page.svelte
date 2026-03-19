<script lang="ts">
	import { browser } from '$app/environment';
	import InlineEdit from '$lib/admin/components/ui/InlineEdit.svelte';
	import EmptyState from '$lib/admin/components/ui/EmptyState.svelte';
	import { inventoryService, type StockEntry } from '$lib/admin/services/inventory';

	let entries = $state<StockEntry[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	$effect(() => { if (browser) loadStock(); });

	async function loadStock() {
		loading = true;
		error = null;
		try { entries = await inventoryService.getLowStock(1); }
		catch (e) { error = e instanceof Error ? e.message : 'Failed to load low stock'; }
		finally { loading = false; }
	}

	async function handleStockSave(entry: StockEntry, newStock: number) {
		try {
			await inventoryService.updateStock(entry.productId, entry.size, newStock);
			// Re-filter: items with stock > 1 drop off the list
			entries = entries
				.map(e => e.productId === entry.productId && e.size === entry.size ? { ...e, stock: newStock } : e)
				.filter(e => e.stock <= 1);
		} catch (e) {
			console.error('Failed to update stock:', e);
		}
	}

	function rowClass(stock: number) {
		return stock === 0 ? 'row-danger' : 'row-warning';
	}
</script>

<div class="page">
	<div class="page-header">
		<h1 class="page-title">Low Stock</h1>
		<p class="page-subtitle">Items with 1 or fewer units remaining.</p>
	</div>
	{#if loading}
		<div class="loading-rows">{#each Array(5) as _}<div class="skeleton-row"></div>{/each}</div>
	{:else if error}
		<div class="error-banner">{error}</div>
	{:else if entries.length === 0}
		<EmptyState title="All stocked up" description="No items are running low right now" />
	{:else}
		<div class="table-wrapper">
			<table class="data-table">
				<thead>
					<tr>
						<th>Product</th>
						<th>Type</th>
						<th>Size</th>
						<th>Stock</th>
						<th>SKU</th>
					</tr>
				</thead>
				<tbody>
					{#each entries as entry}
						<tr class={rowClass(entry.stock)}>
							<td class="product-name">{entry.productTitle}</td>
							<td class="garment-type">{entry.garmentType.replace('_', ' ')}</td>
							<td><span class="size-tag">{entry.size}</span></td>
							<td>
								<InlineEdit
									value={entry.stock}
									onsave={(val) => handleStockSave(entry, val)}
								/>
							</td>
							<td class="sku">{entry.sku ?? '—'}</td>
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
	.page-subtitle { font-size: 13px; color: var(--color-text-dim); margin: 4px 0 0; }
	.error-banner { padding: 10px 16px; font-size: 13px; color: var(--color-danger); background: color-mix(in srgb, var(--color-danger) 10%, transparent); border: 1px solid color-mix(in srgb, var(--color-danger) 25%, transparent); border-radius: 8px; }
	.table-wrapper { overflow-x: auto; border: 1px solid var(--color-table-border); border-radius: 10px; }
	.data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
	.data-table th { text-align: left; padding: 10px 16px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-dim); background: var(--color-table-header); border-bottom: 1px solid var(--color-table-border); }
	.data-table td { padding: 10px 16px; color: var(--color-text-muted); border-bottom: 1px solid var(--color-table-border); }
	.row-danger { background: color-mix(in srgb, var(--color-danger) 6%, transparent); }
	.row-warning { background: color-mix(in srgb, var(--color-warning) 6%, transparent); }
	.product-name { font-weight: 500; color: var(--color-text); }
	.garment-type { text-transform: capitalize; font-size: 12px; }
	.size-tag { display: inline-flex; align-items: center; justify-content: center; padding: 2px 8px; font-size: 11px; font-weight: 700; background: var(--color-surface-overlay); border-radius: 4px; color: var(--color-text-muted); }
	.sku { font-family: monospace; font-size: 12px; color: var(--color-text-dim); }
	.loading-rows { display: flex; flex-direction: column; gap: 8px; }
	.skeleton-row { height: 44px; background: var(--color-surface-raised); border-radius: 8px; animation: pulse 1.5s ease-in-out infinite; }
	@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
</style>
