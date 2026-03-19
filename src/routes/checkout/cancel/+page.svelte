<div class="cancel-page">
	<div class="cancel-card">
		<h1>Checkout cancelled</h1>
		<p>Your cart is still here. Come back when you're ready.</p>
		<a href="/shop" class="back-btn">Back to Shop</a>
	</div>
</div>

<style>
	.cancel-page {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		padding: var(--spacing-md);
	}

	.cancel-card {
		text-align: center;
		max-width: 400px;
	}

	h1 {
		font-size: 1.5rem;
		font-weight: 300;
		color: var(--occ-charcoal);
		margin: 0 0 0.5rem;
	}

	p {
		color: var(--occ-muted);
		margin: 0 0 1.5rem;
	}

	.back-btn {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		background: var(--occ-charcoal);
		color: white;
		border-radius: var(--radius-2026-sm, 8px);
		transition: background var(--duration-normal) var(--ease-out);
	}

	.back-btn:hover {
		background: rgba(26, 26, 26, 0.9);
	}
</style>
