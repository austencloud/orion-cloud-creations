<script lang="ts">
	import { browser } from '$app/environment';
	import FormField from '$lib/admin/components/ui/FormField.svelte';
	import { settingsService } from '$lib/admin/services/settings';
	import { formatPrice } from '$lib/types/product';
	import type { StoreSettings, ShippingRate } from '$lib/types/settings';

	let settings = $state<StoreSettings | null>(null);
	let loading = $state(true);
	let saving = $state(false);
	let error = $state<string | null>(null);
	let successMsg = $state<string | null>(null);

	// Editable fields
	let storeName = $state('');
	let storeEmail = $state('');
	let currency = $state('usd');
	let taxRatePct = $state('');
	let lowStockThreshold = $state('');
	let shippingRates = $state<ShippingRate[]>([]);

	$effect(() => { if (browser) loadSettings(); });

	async function loadSettings() {
		loading = true;
		try {
			const s = await settingsService.get();
			settings = s;
			storeName = s.storeName;
			storeEmail = s.storeEmail;
			currency = s.currency;
			taxRatePct = String(s.taxRate * 100);
			lowStockThreshold = String(s.lowStockThreshold);
			shippingRates = s.shippingRates.map(r => ({ ...r }));
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load settings';
		} finally {
			loading = false;
		}
	}

	function addShippingRate() {
		shippingRates = [...shippingRates, { label: '', price: 0, estimatedDays: '' }];
	}

	function removeShippingRate(idx: number) {
		shippingRates = shippingRates.filter((_, i) => i !== idx);
	}

	async function handleSave() {
		saving = true;
		error = null;
		successMsg = null;
		try {
			await settingsService.update({
				storeName: storeName.trim(),
				storeEmail: storeEmail.trim(),
				currency,
				taxRate: parseFloat(taxRatePct) / 100 || 0,
				lowStockThreshold: parseInt(lowStockThreshold, 10) || 1,
				shippingRates: shippingRates.filter(r => r.label.trim())
			});
			successMsg = 'Settings saved';
			setTimeout(() => successMsg = null, 3000);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to save settings';
		} finally {
			saving = false;
		}
	}
</script>

<div class="page">
	<div class="page-header">
		<h1 class="page-title">Settings</h1>
	</div>

	{#if loading}
		<div class="loading-skeleton">{#each Array(3) as _}<div class="skeleton-block"></div>{/each}</div>
	{:else}
		{#if error}<div class="error-banner">{error}</div>{/if}
		{#if successMsg}<div class="success-banner">{successMsg}</div>{/if}

		<div class="settings-layout">
			<div class="settings-main">
				<!-- Store Info -->
				<section class="card">
					<h2 class="card-title">Store Info</h2>
					<FormField label="Store Name">
						<input class="input" type="text" bind:value={storeName} />
					</FormField>
					<FormField label="Store Email">
						<input class="input" type="email" bind:value={storeEmail} />
					</FormField>
					<FormField label="Currency">
						<select class="input" bind:value={currency}>
							<option value="usd">USD — US Dollar</option>
							<option value="eur">EUR — Euro</option>
							<option value="gbp">GBP — British Pound</option>
						</select>
					</FormField>
				</section>

				<!-- Tax & Stock -->
				<section class="card">
					<h2 class="card-title">Tax & Inventory</h2>
					<FormField label="Tax Rate (%)">
						<div class="input-suffix-wrap">
							<input class="input with-suffix" type="number" min="0" max="100" step="0.01" bind:value={taxRatePct} placeholder="0" />
							<span class="input-suffix">%</span>
						</div>
					</FormField>
					<FormField label="Low Stock Threshold">
						<input class="input" type="number" min="0" bind:value={lowStockThreshold} placeholder="1" />
					</FormField>
				</section>

				<!-- Shipping Rates -->
				<section class="card">
					<div class="card-header">
						<h2 class="card-title">Shipping Rates</h2>
						<button class="add-rate-btn" onclick={addShippingRate} type="button">+ Add Rate</button>
					</div>
					{#if shippingRates.length === 0}
						<p class="empty-text">No shipping rates configured.</p>
					{:else}
						<div class="rates-list">
							{#each shippingRates as rate, idx}
								<div class="rate-row">
									<div class="rate-fields">
										<input class="input" type="text" bind:value={rate.label} placeholder="Label (e.g. Standard)" />
										<div class="input-prefix-wrap">
											<span class="input-prefix">$</span>
											<input
												class="input with-prefix"
												type="number"
												min="0"
												step="0.01"
												value={(rate.price / 100).toFixed(2)}
												oninput={(e) => { rate.price = Math.round(parseFloat((e.target as HTMLInputElement).value) * 100) || 0; }}
												placeholder="5.99"
											/>
										</div>
										<input class="input" type="text" bind:value={rate.estimatedDays} placeholder="e.g. 5-7 business days" />
									</div>
									<button class="remove-rate-btn" onclick={() => removeShippingRate(idx)} type="button">&times;</button>
								</div>
							{/each}
						</div>
					{/if}
				</section>
			</div>

			<div class="settings-sidebar">
				<button class="save-btn" onclick={handleSave} disabled={saving}>
					{saving ? 'Saving...' : 'Save Settings'}
				</button>
				<div class="sidebar-links">
					<a href="/admin/settings/stripe" class="sidebar-link">Stripe Settings &rarr;</a>
					<a href="/admin/settings/seed" class="sidebar-link">Database Seed &rarr;</a>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.page { padding: 24px; max-width: 900px; }
	.page-header { margin-bottom: 24px; }
	.page-title { font-size: 20px; font-weight: 700; color: var(--color-text); margin: 0; }
	.error-banner { padding: 10px 16px; font-size: 13px; color: var(--color-danger); background: color-mix(in srgb, var(--color-danger) 10%, transparent); border: 1px solid color-mix(in srgb, var(--color-danger) 25%, transparent); border-radius: 8px; margin-bottom: 16px; }
	.success-banner { padding: 10px 16px; font-size: 13px; color: var(--color-success); background: color-mix(in srgb, var(--color-success) 10%, transparent); border: 1px solid color-mix(in srgb, var(--color-success) 25%, transparent); border-radius: 8px; margin-bottom: 16px; }
	.loading-skeleton { display: flex; flex-direction: column; gap: 16px; }
	.skeleton-block { height: 140px; background: var(--color-surface-raised); border-radius: 12px; animation: pulse 1.5s ease-in-out infinite; }
	@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
	.settings-layout { display: grid; grid-template-columns: 1fr 220px; gap: 24px; align-items: start; }
	@media (max-width: 700px) { .settings-layout { grid-template-columns: 1fr; } }
	.card { background: var(--color-card-bg); border: 1px solid var(--color-card-border); border-radius: 12px; padding: 20px; margin-bottom: 16px; }
	.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
	.card-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); margin: 0 0 16px; }
	.card-header .card-title { margin: 0; }
	.input { width: 100%; padding: 8px 12px; font-size: 13px; background: var(--color-surface-raised); border: 1px solid var(--color-border); border-radius: 8px; color: var(--color-text); outline: none; transition: border-color 0.15s; box-sizing: border-box; }
	.input:focus { border-color: var(--color-accent); }
	.input-prefix-wrap { position: relative; }
	.input-prefix { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--color-text-dim); font-size: 13px; pointer-events: none; }
	.with-prefix { padding-left: 24px; }
	.input-suffix-wrap { position: relative; }
	.input-suffix { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: var(--color-text-dim); font-size: 13px; pointer-events: none; }
	.with-suffix { padding-right: 28px; }
	.add-rate-btn { font-size: 12px; font-weight: 600; color: var(--color-accent); background: none; border: none; cursor: pointer; padding: 0; }
	.add-rate-btn:hover { color: var(--color-accent-hover); }
	.rates-list { display: flex; flex-direction: column; gap: 10px; }
	.rate-row { display: flex; align-items: flex-start; gap: 8px; }
	.rate-fields { display: grid; grid-template-columns: 1.5fr 1fr 1.5fr; gap: 8px; flex: 1; }
	.remove-rate-btn { padding: 8px; font-size: 16px; background: none; border: none; color: var(--color-text-dim); cursor: pointer; border-radius: 4px; flex-shrink: 0; }
	.remove-rate-btn:hover { color: var(--color-danger); background: color-mix(in srgb, var(--color-danger) 10%, transparent); }
	.empty-text { font-size: 13px; color: var(--color-text-dim); margin: 0; }
	.save-btn { width: 100%; padding: 12px; font-size: 14px; font-weight: 700; background: var(--color-accent); color: white; border: none; border-radius: 10px; cursor: pointer; transition: background 0.15s; }
	.save-btn:hover:not(:disabled) { background: var(--color-accent-hover); }
	.save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
	.sidebar-links { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }
	.sidebar-link { font-size: 13px; color: var(--color-text-muted); text-decoration: none; padding: 8px 12px; background: var(--color-surface-raised); border: 1px solid var(--color-border); border-radius: 8px; transition: color 0.15s, border-color 0.15s; }
	.sidebar-link:hover { color: var(--color-text); border-color: var(--color-accent); }
</style>
