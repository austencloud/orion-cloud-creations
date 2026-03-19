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
		try { entries = await inventoryService.getAllStockEntries(); }
		catch (e) { error = e instanceof Error ? e.message : 'Failed to load inventory'; }
		finally { loading = false; }
	}

	async function handleStockSave(entry: StockEntry, newStock: number) {
		try {
			await inventoryService.updateStock(entry.productId, entry.size, newStock);
			entries = entries.map(e =>
				e.productId === entry.productId && e.size === entry.size ? { ...e, stock: newStock } : e
			);
		} catch (e) {
			console.error('Failed to update stock:', e);
		}
	}

	function rowClass(stock: number) {
		if (stock === 0) return 'row-danger';
		if (stock <= 1) return 'row-warning';
		return '';
	}
</script>

<div class="page">
	<div class="page-header">
		<h1 class="page-title">Inventory</h1>
		<p class="page-subtitle">Click any stock number to edit it inline.</p>
	</div>
	{#if loading}
		<div class="loading-rows">{#each Array(8) as _}<div class="skeleton-row"></div>{/each}</div>
	{:else if error}
		<div class="error-banner">{error}</div>
	{:else if entries.length === 0}
		<EmptyState title="No inventory data" description="Add products with sizes to see stock levels here" />
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
		<div class="legend">
			<span class="legend-item danger">Red = out of stock</span>
			<span class="legend-item warning">Yellow = 1 unit left</span>
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
	.legend { display: flex; gap: 20px; padding: 10px 0; }
	.legend-item { font-size: 12px; color: var(--color-text-dim); }
	.legend-item.danger::before { content: ''; display: inline-block; width: 10px; height: 10px; background: color-mix(in srgb, var(--color-danger) 40%, transparent); border-radius: 2px; margin-right: 6px; vertical-align: middle; }
	.legend-item.warning::before { content: ''; display: inline-block; width: 10px; height: 10px; background: color-mix(in srgb, var(--color-warning) 40%, transparent); border-radius: 2px; margin-right: 6px; vertical-align: middle; }
	.loading-rows { display: flex; flex-direction: column; gap: 8px; }
	.skeleton-row { height: 44px; background: var(--color-surface-raised); border-radius: 8px; animation: pulse 1.5s ease-in-out infinite; }
	@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
</style>
