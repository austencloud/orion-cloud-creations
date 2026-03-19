<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import FormField from '$lib/admin/components/ui/FormField.svelte';
	import ConfirmDialog from '$lib/admin/components/ui/ConfirmDialog.svelte';
	import { productService } from '$lib/admin/services/products';
	import { mediaItemService } from '$lib/admin/services/media';
	import {
		ALL_GARMENT_TYPES,
		ALL_COLOR_FAMILIES,
		ALL_SIZES,
		type GarmentType,
		type ColorFamily,
		type Size
	} from '$lib/types/product';
	import type { Product } from '$lib/types/product';
	import type { MediaItem } from '$lib/admin/types/media';

	let product = $state<Product | null>(null);
	let loading = $state(true);
	let notFound = $state(false);

	// Form fields
	let title = $state('');
	let description = $state('');
	let garmentType = $state<GarmentType>('shirt');
	let colorFamily = $state<ColorFamily>('warm');
	let material = $state('100% Cotton');
	let priceDollars = $state('');
	let compareAtPriceDollars = $state('');
	let availability = $state<'draft' | 'available' | 'sold' | 'archived'>('draft');
	let isOneOfAKind = $state(true);
	let featured = $state(false);
	let selectedSizes = $state<Record<string, string>>({});
	let selectedMediaIds = $state<string[]>([]);

	let mediaItems = $state<MediaItem[]>([]);
	let mediaPickerOpen = $state(false);
	let mediaLoading = $state(false);

	let saving = $state(false);
	let error = $state<string | null>(null);
	let showDeleteDialog = $state(false);

	$effect(() => {
		if (browser) loadProduct();
	});

	async function loadProduct() {
		loading = true;
		try {
			const p = await productService.get(page.params.id!);
			if (!p) { notFound = true; return; }
			product = p;
			title = p.title;
			description = p.description;
			garmentType = p.garmentType;
			colorFamily = p.colorFamily;
			material = p.material;
			priceDollars = (p.price / 100).toFixed(2);
			compareAtPriceDollars = p.compareAtPrice ? (p.compareAtPrice / 100).toFixed(2) : '';
			availability = p.availability;
			isOneOfAKind = p.isOneOfAKind;
			featured = p.featured;
			selectedMediaIds = [...(p.mediaItemIds ?? [])];
			const sizes: Record<string, string> = {};
			for (const [size, variant] of Object.entries(p.sizes)) {
				sizes[size] = String(variant.stock);
			}
			selectedSizes = sizes;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load product';
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		if (browser && mediaPickerOpen && mediaItems.length === 0) {
			loadMedia();
		}
	});

	async function loadMedia() {
		mediaLoading = true;
		try {
			const all = await mediaItemService.getAll();
			mediaItems = all.slice(0, 50);
		} catch (e) {
			console.error('Failed to load media:', e);
		} finally {
			mediaLoading = false;
		}
	}

	function toggleSize(size: Size) {
		if (size in selectedSizes) {
			const next = { ...selectedSizes };
			delete next[size];
			selectedSizes = next;
		} else {
			selectedSizes = { ...selectedSizes, [size]: '1' };
		}
	}

	function toggleMedia(id: string) {
		if (selectedMediaIds.includes(id)) {
			selectedMediaIds = selectedMediaIds.filter(x => x !== id);
		} else {
			selectedMediaIds = [...selectedMediaIds, id];
		}
	}

	async function handleSave() {
		if (!title.trim()) { error = 'Title is required'; return; }
		const priceVal = parseFloat(priceDollars);
		if (isNaN(priceVal) || priceVal <= 0) { error = 'Price must be a positive number'; return; }

		saving = true;
		error = null;
		try {
			const sizes: Record<string, { stock: number; sku?: string }> = {};
			for (const [size, stockStr] of Object.entries(selectedSizes)) {
				const existing = product?.sizes[size];
				sizes[size] = { stock: parseInt(stockStr, 10) || 0, sku: existing?.sku };
			}

			const compareAt = compareAtPriceDollars ? Math.round(parseFloat(compareAtPriceDollars) * 100) : undefined;

			await productService.update(page.params.id!, {
				title: title.trim(),
				description: description.trim(),
				garmentType,
				colorFamily,
				material,
				price: Math.round(priceVal * 100),
				compareAtPrice: compareAt,
				availability,
				isOneOfAKind,
				featured,
				sizes,
				mediaItemIds: selectedMediaIds
			});

			// Auto-sync to Stripe (non-blocking)
			try {
				await fetch('/api/products/sync', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ productId: page.params.id })
				});
			} catch (syncErr) {
				console.warn('Stripe sync failed (product saved, but sync may be stale):', syncErr);
			}

			goto('/admin/products');
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to save product';
		} finally {
			saving = false;
		}
	}

	async function handleDelete() {
		try {
			await productService.delete(page.params.id!);
			goto('/admin/products');
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to delete product';
		}
	}
</script>

<div class="page">
	<div class="page-header">
		<button class="back-btn" onclick={() => goto('/admin/products')}>&larr; Products</button>
		{#if loading}
			<h1 class="page-title">Loading...</h1>
		{:else if notFound}
			<h1 class="page-title">Product Not Found</h1>
		{:else}
			<h1 class="page-title">{title || 'Edit Product'}</h1>
			<button class="delete-link" onclick={() => showDeleteDialog = true}>Delete</button>
		{/if}
	</div>

	{#if loading}
		<div class="loading-skeleton">
			{#each Array(4) as _}<div class="skeleton-block"></div>{/each}
		</div>
	{:else if notFound}
		<p class="not-found-text">This product does not exist or was deleted.</p>
	{:else}
		{#if error}
			<div class="error-banner">{error}</div>
		{/if}

		<div class="form-layout">
			<div class="form-main">
				<section class="form-section">
					<h2 class="section-title">Basic Info</h2>
					<FormField label="Title" required>
						<input class="input" type="text" bind:value={title} placeholder="e.g. Cosmic Spiral Tee" />
					</FormField>
					<FormField label="Description">
						<textarea class="input textarea" bind:value={description} rows="4"></textarea>
					</FormField>
					<div class="field-row">
						<FormField label="Garment Type" required>
							<select class="input" bind:value={garmentType}>
								{#each ALL_GARMENT_TYPES as gt}
									<option value={gt}>{gt.replace('_', ' ')}</option>
								{/each}
							</select>
						</FormField>
						<FormField label="Color Family" required>
							<select class="input" bind:value={colorFamily}>
								{#each ALL_COLOR_FAMILIES as cf}
									<option value={cf}>{cf}</option>
								{/each}
							</select>
						</FormField>
					</div>
					<FormField label="Material">
						<input class="input" type="text" bind:value={material} />
					</FormField>
				</section>

				<section class="form-section">
					<h2 class="section-title">Pricing</h2>
					<div class="field-row">
						<FormField label="Price (USD)" required>
							<div class="input-prefix-wrap">
								<span class="input-prefix">$</span>
								<input class="input with-prefix" type="number" min="0" step="0.01" bind:value={priceDollars} />
							</div>
						</FormField>
						<FormField label="Compare At Price (optional)">
							<div class="input-prefix-wrap">
								<span class="input-prefix">$</span>
								<input class="input with-prefix" type="number" min="0" step="0.01" bind:value={compareAtPriceDollars} />
							</div>
						</FormField>
					</div>
				</section>

				<section class="form-section">
					<h2 class="section-title">Sizes & Stock</h2>
					<p class="section-hint">Click a size to toggle it.</p>
					<div class="size-chips">
						{#each ALL_SIZES as size}
							<button class="size-chip" class:active={size in selectedSizes} onclick={() => toggleSize(size)} type="button">{size}</button>
						{/each}
					</div>
					{#if Object.keys(selectedSizes).length > 0}
						<div class="size-stock-list">
							{#each ALL_SIZES.filter(s => s in selectedSizes) as size}
								<div class="size-stock-row">
									<span class="size-label">{size}</span>
									<input class="stock-input" type="number" min="0" bind:value={selectedSizes[size]} />
								</div>
							{/each}
						</div>
					{/if}
				</section>

				<section class="form-section">
					<h2 class="section-title">Media</h2>
					{#if selectedMediaIds.length > 0}
						<div class="selected-media-grid">
							{#each mediaItems.filter(m => selectedMediaIds.includes(m.id)) as item}
								<div class="selected-thumb-wrap">
									<img class="selected-thumb" src={item.thumbnailUrl} alt={item.suggestedName} />
									<button class="remove-thumb" onclick={() => toggleMedia(item.id)} type="button">&times;</button>
								</div>
							{/each}
						</div>
					{/if}
					<button class="expand-media-btn" onclick={() => mediaPickerOpen = !mediaPickerOpen} type="button">
						{mediaPickerOpen ? 'Close Media Picker' : 'Pick Media'} {selectedMediaIds.length > 0 ? `(${selectedMediaIds.length} selected)` : ''}
					</button>
					{#if mediaPickerOpen}
						{#if mediaLoading}
							<div class="media-loading"><div class="spinner"></div></div>
						{:else}
							<div class="media-picker-grid">
								{#each mediaItems as item}
									<button class="media-thumb-btn" class:selected={selectedMediaIds.includes(item.id)} onclick={() => toggleMedia(item.id)} type="button" title={item.suggestedName}>
										<img class="media-thumb" src={item.thumbnailUrl} alt={item.suggestedName} />
										{#if selectedMediaIds.includes(item.id)}<span class="check-overlay">&#10003;</span>{/if}
									</button>
								{/each}
							</div>
						{/if}
					{/if}
				</section>
			</div>

			<div class="form-sidebar">
				<section class="form-section">
					<h2 class="section-title">Status</h2>
					<FormField label="Availability">
						<select class="input" bind:value={availability}>
							<option value="draft">Draft</option>
							<option value="available">Available</option>
							<option value="sold">Sold</option>
							<option value="archived">Archived</option>
						</select>
					</FormField>
					<label class="checkbox-row">
						<input type="checkbox" bind:checked={isOneOfAKind} />
						<span>One of a Kind</span>
					</label>
					<label class="checkbox-row">
						<input type="checkbox" bind:checked={featured} />
						<span>Featured on homepage</span>
					</label>
				</section>
				<button class="save-btn" onclick={handleSave} disabled={saving}>
					{saving ? 'Saving...' : 'Save Changes'}
				</button>
			</div>
		</div>
	{/if}
</div>

<ConfirmDialog
	open={showDeleteDialog}
	title="Delete Product"
	message={'Delete "' + title + '"? This cannot be undone.'}
	confirmLabel="Delete"
	danger
	onconfirm={handleDelete}
	oncancel={() => showDeleteDialog = false}
/>

<style>
	.page { padding: 24px; max-width: 1100px; }
	.page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
	.back-btn { font-size: 13px; color: var(--color-text-muted); background: none; border: none; cursor: pointer; padding: 0; }
	.back-btn:hover { color: var(--color-text); }
	.page-title { font-size: 20px; font-weight: 700; color: var(--color-text); margin: 0; flex: 1; }
	.delete-link { font-size: 12px; color: var(--color-danger); background: none; border: none; cursor: pointer; padding: 4px 10px; border-radius: 6px; }
	.delete-link:hover { background: color-mix(in srgb, var(--color-danger) 10%, transparent); }
	.error-banner { padding: 10px 16px; font-size: 13px; color: var(--color-danger); background: color-mix(in srgb, var(--color-danger) 10%, transparent); border: 1px solid color-mix(in srgb, var(--color-danger) 25%, transparent); border-radius: 8px; margin-bottom: 16px; }
	.not-found-text { color: var(--color-text-muted); font-size: 14px; }
	.loading-skeleton { display: flex; flex-direction: column; gap: 16px; }
	.skeleton-block { height: 120px; background: var(--color-surface-raised); border-radius: 12px; animation: pulse 1.5s ease-in-out infinite; }
	@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
	.form-layout { display: grid; grid-template-columns: 1fr 280px; gap: 24px; align-items: start; }
	@media (max-width: 900px) { .form-layout { grid-template-columns: 1fr; } }
	.form-section { background: var(--color-card-bg); border: 1px solid var(--color-card-border); border-radius: 12px; padding: 20px; margin-bottom: 16px; }
	.section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); margin: 0 0 16px; }
	.section-hint { font-size: 12px; color: var(--color-text-dim); margin: -8px 0 12px; }
	.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
	.input { width: 100%; padding: 8px 12px; font-size: 13px; background: var(--color-surface-raised); border: 1px solid var(--color-border); border-radius: 8px; color: var(--color-text); outline: none; transition: border-color 0.15s; box-sizing: border-box; }
	.input:focus { border-color: var(--color-accent); }
	.textarea { resize: vertical; min-height: 80px; }
	.input-prefix-wrap { position: relative; }
	.input-prefix { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--color-text-dim); font-size: 13px; pointer-events: none; }
	.with-prefix { padding-left: 24px; }
	.size-chips { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
	.size-chip { padding: 6px 14px; font-size: 12px; font-weight: 600; background: var(--color-surface-raised); border: 1px solid var(--color-border); border-radius: 6px; color: var(--color-text-muted); cursor: pointer; transition: all 0.15s; }
	.size-chip.active { background: var(--color-accent); border-color: var(--color-accent); color: white; }
	.size-stock-list { display: flex; flex-direction: column; gap: 8px; }
	.size-stock-row { display: flex; align-items: center; gap: 12px; }
	.size-label { font-size: 13px; font-weight: 600; color: var(--color-text); width: 40px; }
	.stock-input { width: 80px; padding: 6px 10px; font-size: 13px; background: var(--color-surface-raised); border: 1px solid var(--color-border); border-radius: 6px; color: var(--color-text); text-align: center; }
	.expand-media-btn { padding: 8px 16px; font-size: 13px; font-weight: 600; background: var(--color-surface-overlay); border: 1px solid var(--color-border); border-radius: 8px; color: var(--color-text-muted); cursor: pointer; transition: color 0.15s, border-color 0.15s; margin-bottom: 12px; }
	.expand-media-btn:hover { color: var(--color-text); border-color: var(--color-accent); }
	.media-loading { display: flex; justify-content: center; padding: 24px; }
	.spinner { width: 24px; height: 24px; border: 2px solid var(--color-border); border-top-color: var(--color-accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
	@keyframes spin { to { transform: rotate(360deg); } }
	.media-picker-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 6px; max-height: 400px; overflow-y: auto; }
	.media-thumb-btn { position: relative; aspect-ratio: 1; background: var(--color-surface-raised); border: 2px solid transparent; border-radius: 6px; overflow: hidden; cursor: pointer; padding: 0; transition: border-color 0.15s; }
	.media-thumb-btn.selected { border-color: var(--color-accent); }
	.media-thumb { width: 100%; height: 100%; object-fit: cover; display: block; }
	.check-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: color-mix(in srgb, var(--color-accent) 50%, transparent); color: white; font-size: 18px; font-weight: 700; }
	.selected-media-grid { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
	.selected-thumb-wrap { position: relative; width: 64px; height: 64px; }
	.selected-thumb { width: 100%; height: 100%; object-fit: cover; border-radius: 6px; }
	.remove-thumb { position: absolute; top: -6px; right: -6px; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; background: var(--color-danger); color: white; border: none; border-radius: 50%; cursor: pointer; font-size: 12px; line-height: 1; }
	.checkbox-row { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--color-text-muted); cursor: pointer; margin-bottom: 8px; }
	.checkbox-row input { accent-color: var(--color-accent); }
	.save-btn { width: 100%; padding: 12px; font-size: 14px; font-weight: 700; background: var(--color-accent); color: white; border: none; border-radius: 10px; cursor: pointer; transition: background 0.15s; }
	.save-btn:hover:not(:disabled) { background: var(--color-accent-hover); }
	.save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
