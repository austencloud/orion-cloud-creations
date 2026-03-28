<script lang="ts">
	import type { StorefrontProduct } from '$lib/types/product';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import CommissionForm from '$lib/components/CommissionForm.svelte';

	interface Props {
		product: StorefrontProduct | null;
		availableProducts: StorefrontProduct[];
		onclose: () => void;
	}

	let { product, availableProducts, onclose }: Props = $props();

	let showCommissionForm = $state(false);

	const similarProducts = $derived.by(() => {
		if (!product) return [];
		const primaryTechnique = product.techniques[0];
		if (!primaryTechnique) return [];

		let matches = availableProducts.filter(
			(p) => p.id !== product.id && p.techniques[0] === primaryTechnique
		);

		if (matches.length < 2) {
			matches = availableProducts.filter(
				(p) => p.id !== product.id && p.techniques.some((t) => product.techniques.includes(t))
			);
		}

		return matches.slice(0, 4);
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onclose();
	}

	function handleBackdropClick(e: MouseEvent) {
		if ((e.target as HTMLElement).classList.contains('lightbox-backdrop')) {
			onclose();
		}
	}

	$effect(() => {
		if (product) showCommissionForm = false;
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if product}
	{@const heroImage = product.images[0]}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="lightbox-backdrop" onclick={handleBackdropClick}>
		<div class="lightbox" role="dialog" aria-modal="true" aria-label={product.title}>
			<button class="close-btn" onclick={onclose} aria-label="Close">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="24" height="24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
				</svg>
			</button>

			<div class="lightbox-content">
				<div class="lightbox-image">
					{#if heroImage}
						<img src={heroImage.originalUrl} alt={product.title} />
					{/if}
				</div>

				<div class="lightbox-info">
					<div class="info-header">
						<h2 class="product-title">{product.title}</h2>
						<p class="product-technique">
							{product.techniques.map((t) => t.replace('_', ' ')).join(' · ')}
						</p>
						{#if product.description}
							<p class="product-desc">{product.description}</p>
						{/if}
					</div>

					{#if product.availability !== 'available'}
						<div class="commission-section">
							{#if !showCommissionForm}
								<div class="commission-cta">
									<h3 class="cta-heading">Love this piece?</h3>
									<p class="cta-subtext">
										Commission something similar. Every commission is a new original — it won't look exactly like this, but I'll use the same technique and color direction.
									</p>
									<button class="cta-btn" onclick={() => (showCommissionForm = true)}>
										Request a Commission
									</button>
								</div>
							{:else}
								<CommissionForm
									productId={product.id}
									productTitle={product.title}
								/>
							{/if}
						</div>
					{/if}

					{#if similarProducts.length > 0}
						<div class="similar-section">
							<h3 class="similar-heading">Similar available pieces</h3>
							<div class="similar-grid">
								{#each similarProducts as similar}
									<ProductCard product={similar} showPrice={true} />
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.lightbox-backdrop {
		position: fixed;
		inset: 0;
		z-index: 100;
		background: rgba(0, 0, 0, 0.9);
		overflow-y: auto;
		padding: 2rem 1rem;
	}

	.lightbox {
		max-width: 64rem;
		margin: 0 auto;
		position: relative;
	}

	.close-btn {
		position: fixed;
		top: 1rem;
		right: 1rem;
		z-index: 101;
		color: rgba(255, 255, 255, 0.6);
		padding: 0.5rem;
		transition: color var(--duration-normal) var(--ease-out);
	}

	.close-btn:hover {
		color: white;
	}

	.lightbox-content {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.lightbox-image {
		display: flex;
		justify-content: center;
	}

	.lightbox-image img {
		max-width: 100%;
		max-height: 70vh;
		object-fit: contain;
		border-radius: 8px;
	}

	.lightbox-info {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.info-header {
		text-align: center;
	}

	.product-title {
		font-size: 1.5rem;
		font-weight: 300;
		color: var(--occ-glass-text);
	}

	.product-technique {
		margin-top: 0.5rem;
		font-size: var(--font-size-sm);
		color: var(--occ-purple);
		text-transform: capitalize;
	}

	.product-desc {
		margin-top: 1rem;
		font-size: var(--font-size-sm);
		color: var(--occ-glass-text-dim);
		line-height: 1.625;
		max-width: 36rem;
		margin-left: auto;
		margin-right: auto;
	}

	.commission-section {
		max-width: 28rem;
		margin: 0 auto;
		width: 100%;
	}

	.commission-cta {
		text-align: center;
		padding: 2rem;
		background: rgba(91, 58, 140, 0.1);
		border: 1px solid rgba(91, 58, 140, 0.2);
		border-radius: 8px;
	}

	.cta-heading {
		font-size: 1.125rem;
		font-weight: 400;
		color: var(--occ-glass-text);
	}

	.cta-subtext {
		margin-top: 0.75rem;
		font-size: var(--font-size-compact);
		color: var(--occ-glass-text-dim);
		line-height: 1.625;
	}

	.cta-btn {
		margin-top: 1.25rem;
		padding: 0.75rem 2rem;
		background: var(--occ-purple);
		color: white;
		font-size: var(--font-size-sm);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		border-radius: 4px;
		transition: background var(--duration-normal) var(--ease-out);
	}

	.cta-btn:hover {
		background: var(--occ-purple-hover);
	}

	.similar-section {
		border-top: 1px solid rgba(255, 255, 255, 0.08);
		padding-top: 2rem;
	}

	.similar-heading {
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--occ-glass-text-dim);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 1rem;
		text-align: center;
	}

	.similar-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	@media (min-width: 768px) {
		.similar-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.product-title {
			font-size: var(--font-size-3xl);
		}
	}
</style>
