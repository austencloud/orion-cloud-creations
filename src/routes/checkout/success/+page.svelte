<script lang="ts">
	import { cart } from '$lib/stores/cart.svelte';
	import { browser } from '$app/environment';
	if (browser) cart.clear();
</script>

<div class="success-page">
	<div class="success-card">
		<div class="success-icon">&#10003;</div>
		<h1>Thank you for your order!</h1>
		<p>You'll receive a confirmation email shortly.</p>
		<a href="/shop" class="continue-btn">Continue Shopping</a>
	</div>
</div>

<style>
	.success-page {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		padding: var(--spacing-md);
	}

	.success-card {
		text-align: center;
		max-width: 400px;
		background: var(--occ-glass-bg);
		backdrop-filter: blur(var(--occ-glass-blur));
		-webkit-backdrop-filter: blur(var(--occ-glass-blur));
		border: 1px solid var(--occ-glass-border);
		border-radius: var(--occ-glass-radius);
		padding: 3rem 2rem;
	}

	.success-icon {
		width: 64px;
		height: 64px;
		margin: 0 auto 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2rem;
		background: var(--occ-teal);
		color: white;
		border-radius: 50%;
	}

	h1 {
		font-size: 1.5rem;
		font-weight: 300;
		color: var(--occ-glass-text);
		margin: 0 0 0.5rem;
	}

	p {
		color: var(--occ-glass-text-dim);
		margin: 0 0 1.5rem;
	}

	.continue-btn {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		background: var(--occ-purple);
		color: white;
		border-radius: var(--radius-2026-sm, 8px);
		transition: background var(--duration-normal) var(--ease-out);
	}

	.continue-btn:hover {
		background: var(--occ-purple-hover);
	}
</style>
