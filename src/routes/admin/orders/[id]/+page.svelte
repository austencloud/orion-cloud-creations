<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import StatusBadge from '$lib/admin/components/ui/StatusBadge.svelte';
	import FormField from '$lib/admin/components/ui/FormField.svelte';
	import { orderService } from '$lib/admin/services/orders';
	import { formatPrice } from '$lib/types/product';
	import { ORDER_STATUS_LABELS, type Order, type OrderStatus } from '$lib/types/order';

	let order = $state<Order | null>(null);
	let loading = $state(true);
	let notFound = $state(false);
	let saving = $state(false);
	let error = $state<string | null>(null);
	let successMsg = $state<string | null>(null);

	let trackingNumber = $state('');
	let trackingCarrier = $state('USPS');
	let adminNotes = $state('');
	let selectedStatus = $state<OrderStatus>('pending');

	$effect(() => { if (browser) loadOrder(); });

	async function loadOrder() {
		loading = true;
		try {
			const o = await orderService.get(page.params.id!);
			if (!o) { notFound = true; return; }
			order = o;
			trackingNumber = o.trackingNumber ?? '';
			trackingCarrier = o.trackingCarrier ?? 'USPS';
			adminNotes = o.notes ?? '';
			selectedStatus = o.status;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load order';
		} finally {
			loading = false;
		}
	}

	async function handleSave() {
		saving = true;
		error = null;
		successMsg = null;
		try {
			await orderService.update(page.params.id!, {
				status: selectedStatus,
				trackingNumber: trackingNumber || undefined,
				trackingCarrier: trackingCarrier || undefined,
				notes: adminNotes || undefined
			});
			if (order) order = { ...order, status: selectedStatus, trackingNumber, trackingCarrier, notes: adminNotes };
			successMsg = 'Order updated';
			setTimeout(() => successMsg = null, 3000);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to update order';
		} finally {
			saving = false;
		}
	}

	async function markAs(status: OrderStatus) {
		selectedStatus = status;
		await handleSave();
	}

	function formatDate(d: Date) {
		return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
	}

	function formatAddr(o: Order) {
		const a = o.shippingAddress;
		return [a.line1, a.line2, a.city + ', ' + a.state + ' ' + a.zip, a.country].filter(Boolean).join('\n');
	}
</script>

<div class="page">
	<div class="page-header">
		<button class="back-btn" onclick={() => goto('/admin/orders')}>&larr; Orders</button>
		{#if loading}
			<h1 class="page-title">Loading...</h1>
		{:else if order}
			<div class="header-left">
				<h1 class="page-title">Order {order.id.slice(0, 8).toUpperCase()}</h1>
				<StatusBadge status={order.status} />
			</div>
			<span class="order-date">{formatDate(order.createdAt)}</span>
		{/if}
	</div>

	{#if loading}
		<div class="loading-skeleton">{#each Array(3) as _}<div class="skeleton-block"></div>{/each}</div>
	{:else if notFound}
		<p class="not-found-text">Order not found.</p>
	{:else if order}
		{#if error}<div class="error-banner">{error}</div>{/if}
		{#if successMsg}<div class="success-banner">{successMsg}</div>{/if}

		<div class="order-layout">
			<div class="order-main">
				<!-- Customer -->
				<section class="card">
					<h2 class="card-title">Customer</h2>
					<div class="info-row"><span class="info-label">Name</span><span class="info-value">{order.customerName}</span></div>
					<div class="info-row"><span class="info-label">Email</span><span class="info-value">{order.customerEmail}</span></div>
					<div class="info-row align-top"><span class="info-label">Ship to</span><span class="info-value address">{formatAddr(order)}</span></div>
				</section>

				<!-- Items -->
				<section class="card">
					<h2 class="card-title">Items</h2>
					<div class="items-list">
						{#each order.items as item}
							<div class="item-row">
								{#if item.thumbnailUrl}
									<img class="item-thumb" src={item.thumbnailUrl} alt={item.productTitle} />
								{:else}
									<div class="item-thumb-placeholder"></div>
								{/if}
								<div class="item-info">
									<span class="item-title">{item.productTitle}</span>
									<span class="item-meta">Size: {item.size} &middot; Qty: {item.quantity}</span>
								</div>
								<span class="item-price">{formatPrice(item.price * item.quantity)}</span>
							</div>
						{/each}
					</div>
					<div class="financials">
						<div class="finance-row"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
						<div class="finance-row"><span>Shipping</span><span>{formatPrice(order.shipping)}</span></div>
						{#if order.tax > 0}<div class="finance-row"><span>Tax</span><span>{formatPrice(order.tax)}</span></div>{/if}
						<div class="finance-row total"><span>Total</span><span>{formatPrice(order.total)}</span></div>
					</div>
				</section>

				<!-- Admin Notes -->
				<section class="card">
					<h2 class="card-title">Admin Notes</h2>
					<textarea class="input textarea" bind:value={adminNotes} placeholder="Internal notes for this order..." rows="3"></textarea>
				</section>
			</div>

			<div class="order-sidebar">
				<!-- Status -->
				<section class="card">
					<h2 class="card-title">Status</h2>
					<FormField label="Order Status">
						<select class="input" bind:value={selectedStatus}>
							{#each Object.entries(ORDER_STATUS_LABELS) as [val, label]}
								<option value={val}>{label}</option>
							{/each}
						</select>
					</FormField>
				</section>

				<!-- Fulfillment -->
				<section class="card">
					<h2 class="card-title">Fulfillment</h2>
					<FormField label="Tracking Number">
						<input class="input" type="text" bind:value={trackingNumber} placeholder="e.g. 9400111899223842890043" />
					</FormField>
					<FormField label="Carrier">
						<select class="input" bind:value={trackingCarrier}>
							<option value="USPS">USPS</option>
							<option value="UPS">UPS</option>
							<option value="FedEx">FedEx</option>
							<option value="Other">Other</option>
						</select>
					</FormField>
					<div class="fulfillment-actions">
						<button class="action-btn" onclick={() => markAs('shipped')} disabled={saving || order.status === 'shipped'}>
							Mark Shipped
						</button>
						<button class="action-btn" onclick={() => markAs('delivered')} disabled={saving || order.status === 'delivered'}>
							Mark Delivered
						</button>
					</div>
				</section>

				<button class="save-btn" onclick={handleSave} disabled={saving}>
					{saving ? 'Saving...' : 'Save Changes'}
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.page { padding: 24px; max-width: 1100px; }
	.page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
	.back-btn { font-size: 13px; color: var(--color-text-muted); background: none; border: none; cursor: pointer; padding: 0; }
	.back-btn:hover { color: var(--color-text); }
	.header-left { display: flex; align-items: center; gap: 12px; flex: 1; }
	.page-title { font-size: 20px; font-weight: 700; color: var(--color-text); margin: 0; }
	.order-date { font-size: 12px; color: var(--color-text-dim); }
	.error-banner { padding: 10px 16px; font-size: 13px; color: var(--color-danger); background: color-mix(in srgb, var(--color-danger) 10%, transparent); border: 1px solid color-mix(in srgb, var(--color-danger) 25%, transparent); border-radius: 8px; margin-bottom: 16px; }
	.success-banner { padding: 10px 16px; font-size: 13px; color: var(--color-success); background: color-mix(in srgb, var(--color-success) 10%, transparent); border: 1px solid color-mix(in srgb, var(--color-success) 25%, transparent); border-radius: 8px; margin-bottom: 16px; }
	.not-found-text { color: var(--color-text-muted); font-size: 14px; }
	.loading-skeleton { display: flex; flex-direction: column; gap: 16px; }
	.skeleton-block { height: 120px; background: var(--color-surface-raised); border-radius: 12px; animation: pulse 1.5s ease-in-out infinite; }
	@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }
	.order-layout { display: grid; grid-template-columns: 1fr 280px; gap: 24px; align-items: start; }
	@media (max-width: 900px) { .order-layout { grid-template-columns: 1fr; } }
	.card { background: var(--color-card-bg); border: 1px solid var(--color-card-border); border-radius: 12px; padding: 20px; margin-bottom: 16px; }
	.card-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); margin: 0 0 16px; }
	.info-row { display: flex; gap: 12px; padding: 6px 0; border-bottom: 1px solid var(--color-border); }
	.info-row:last-child { border-bottom: none; }
	.info-row.align-top { align-items: flex-start; }
	.info-label { font-size: 12px; font-weight: 600; color: var(--color-text-dim); width: 64px; flex-shrink: 0; padding-top: 1px; }
	.info-value { font-size: 13px; color: var(--color-text-muted); }
	.address { white-space: pre-line; line-height: 1.6; }
	.items-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
	.item-row { display: flex; align-items: center; gap: 12px; }
	.item-thumb { width: 48px; height: 48px; object-fit: cover; border-radius: 6px; flex-shrink: 0; }
	.item-thumb-placeholder { width: 48px; height: 48px; background: var(--color-surface-raised); border-radius: 6px; flex-shrink: 0; }
	.item-info { flex: 1; }
	.item-title { display: block; font-size: 13px; font-weight: 500; color: var(--color-text); }
	.item-meta { display: block; font-size: 12px; color: var(--color-text-dim); margin-top: 2px; }
	.item-price { font-size: 13px; font-weight: 600; color: var(--color-text); }
	.financials { border-top: 1px solid var(--color-border); padding-top: 12px; display: flex; flex-direction: column; gap: 6px; }
	.finance-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--color-text-muted); }
	.finance-row.total { font-weight: 700; color: var(--color-text); font-size: 14px; border-top: 1px solid var(--color-border); padding-top: 8px; margin-top: 4px; }
	.input { width: 100%; padding: 8px 12px; font-size: 13px; background: var(--color-surface-raised); border: 1px solid var(--color-border); border-radius: 8px; color: var(--color-text); outline: none; transition: border-color 0.15s; box-sizing: border-box; }
	.input:focus { border-color: var(--color-accent); }
	.textarea { resize: vertical; min-height: 70px; }
	.fulfillment-actions { display: flex; gap: 8px; margin-top: 12px; }
	.action-btn { flex: 1; padding: 8px; font-size: 12px; font-weight: 600; background: var(--color-surface-overlay); border: 1px solid var(--color-border); border-radius: 8px; color: var(--color-text-muted); cursor: pointer; transition: color 0.15s, border-color 0.15s; }
	.action-btn:hover:not(:disabled) { color: var(--color-text); border-color: var(--color-accent); }
	.action-btn:disabled { opacity: 0.4; cursor: not-allowed; }
	.save-btn { width: 100%; padding: 12px; font-size: 14px; font-weight: 700; background: var(--color-accent); color: white; border: none; border-radius: 10px; cursor: pointer; transition: background 0.15s; }
	.save-btn:hover:not(:disabled) { background: var(--color-accent-hover); }
	.save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
