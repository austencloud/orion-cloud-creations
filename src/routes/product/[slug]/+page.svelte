<script lang="ts">
	import ProductCard from '$lib/components/ProductCard.svelte';
	import { formatPrice, type Size } from '$lib/types/product';
	import { cart } from '$lib/stores/cart.svelte';

	let { data } = $props();
	const { product, related } = data;

	let selectedSize = $state<Size | ''>('');
	let selectedImageIndex = $state(0);
	let addedToCart = $state(false);

	const mainImage = $derived(product.images[selectedImageIndex] ?? product.images[0]);

	function handleAddToCart() {
		if (!selectedSize) return;
		const size = selectedSize;
		const sizeVariant = product.sizes[size];
		if (!sizeVariant) return;

		cart.add(
			{
				productId: product.id,
				title: product.title,
				size,
				price: product.price,
				thumbnailUrl: product.images[0]?.thumbnailUrl ?? ''
			},
			sizeVariant.stock
		);

		addedToCart = true;
		setTimeout(() => (addedToCart = false), 2000);
	}
</script>

<svelte:head>
	<title>{product.title} | Orion Cloud Creations</title>
	<meta name="description" content={product.description} />
</svelte:head>

<div class="page">
	<nav class="breadcrumb">
		<a href="/">Home</a>
		<span class="sep">/</span>
		<a href="/shop">Shop</a>
		<span class="sep">/</span>
		<span class="current">{product.title}</span>
	</nav>

	<div class="product-layout">
		<!-- Images -->
		<div class="images">
			<div class="main-image">
				{#if mainImage}
					<img src={mainImage.thumbnailUrl} alt={product.title} />
				{:else}
					<div class="no-image">
						<span>Photo coming soon</span>
					</div>
				{/if}
			</div>

			{#if product.images.length > 1}
				<div class="thumbnails">
					{#each product.images as image, i}
						<button
							class="thumb"
							class:active={selectedImageIndex === i}
							onclick={() => (selectedImageIndex = i)}
						>
							<img src={image.thumbnailUrl} alt="{product.title} view {i + 1}" />
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Info -->
		<div class="info">
			{#if product.isOneOfAKind}
				<p class="label">One of a Kind</p>
			{/if}

			<h1 class="title">{product.title}</h1>

			{#if product.availability === 'available'}
				<p class="price">{formatPrice(product.price)}</p>
			{:else}
				<p class="sold-price">Sold</p>
			{/if}

			<p class="description">{product.description}</p>

			<div class="details">
				<div class="detail-row">
					<span class="detail-label">Material</span>
					<span class="detail-value">{product.material}</span>
				</div>
				{#if product.techniques.length > 0}
					<div class="detail-row">
						<span class="detail-label">Technique</span>
						<span class="detail-value capitalize">{product.techniques.map((t) => t.replace('_', ' ')).join(', ')}</span>
					</div>
				{/if}
				{#if product.colorway.length > 0}
					<div class="detail-row">
						<span class="detail-label">Colors</span>
						<span class="detail-value">{product.colorway.join(', ')}</span>
					</div>
				{/if}
				<div class="detail-row">
					<span class="detail-label">Type</span>
					<span class="detail-value capitalize">{product.garmentType.replace('_', ' ')}</span>
				</div>
			</div>

			{#if product.availability === 'available'}
				<div class="size-section">
					<p class="size-heading">Size</p>
					<div class="size-grid">
						{#each Object.entries(product.sizes) as [size, variant]}
							<button
								class="size-btn"
								class:active={selectedSize === size}
								class:oos={variant.stock === 0}
								onclick={() => {
									if (variant.stock > 0) selectedSize = size as Size;
								}}
								disabled={variant.stock === 0}
							>
								{size}
							</button>
						{/each}
					</div>
				</div>

				<button
					class="add-to-cart"
					disabled={!selectedSize}
					onclick={handleAddToCart}
				>
					{addedToCart ? 'Added!' : selectedSize ? 'Add to Cart' : 'Select a Size'}
				</button>

				<p class="shipping-note">Free shipping on orders over $100</p>
			{/if}

			<div class="trust-grid">
				<div class="trust-item">
					<p class="trust-title">Colorfast</p>
					<p>Procion dyes bond permanently. Won't fade or bleed.</p>
				</div>
				<div class="trust-item">
					<p class="trust-title">Handmade</p>
					<p>Folded, dyed, and finished by hand in Chicago.</p>
				</div>
				<div class="trust-item">
					<p class="trust-title">Machine Washable</p>
					<p>Wash and dry normally after first cold wash.</p>
				</div>
				<div class="trust-item">
					<p class="trust-title">100% Cotton</p>
					<p>Dye goes all the way through the fiber.</p>
				</div>
			</div>
		</div>
	</div>

	{#if related.length > 0}
		<section class="related">
			<h2 class="related-title">More Pieces</h2>
			<div class="related-grid">
				{#each related as relatedProduct}
					<ProductCard product={relatedProduct} />
				{/each}
			</div>
		</section>
	{/if}
</div>

<style>
	.page {
		max-width: 80rem;
		margin: 0 auto;
		padding: 2rem var(--spacing-md);
		background: var(--occ-glass-bg);
		backdrop-filter: blur(var(--occ-glass-blur));
		-webkit-backdrop-filter: blur(var(--occ-glass-blur));
		border: 1px solid var(--occ-glass-border);
		border-radius: var(--occ-glass-radius);
		margin-top: 1rem;
		margin-bottom: 2rem;
	}

	/* Breadcrumb */
	.breadcrumb {
		margin-bottom: 2rem;
		font-size: var(--font-size-compact);
		color: var(--occ-glass-text-muted);
	}

	.breadcrumb a {
		transition: color var(--duration-normal) var(--ease-out);
	}

	.breadcrumb a:hover {
		color: var(--occ-glass-text);
	}

	.sep {
		margin: 0 0.5rem;
	}

	.current {
		color: var(--occ-glass-text);
	}

	/* Layout */
	.product-layout {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2.5rem;
	}

	/* Images */
	.images {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.main-image {
		aspect-ratio: 1;
		overflow: hidden;
		background: rgba(20, 20, 40, 0.4);
		border-radius: var(--occ-glass-radius);
	}

	.main-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.no-image {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.no-image span {
		color: var(--occ-glass-text-dim);
		opacity: 0.4;
		font-size: var(--font-size-sm);
	}

	.thumbnails {
		display: flex;
		gap: 0.75rem;
		overflow-x: auto;
	}

	.thumb {
		width: 4rem;
		height: 4rem;
		flex-shrink: 0;
		overflow: hidden;
		border-radius: 2px;
		border: 2px solid transparent;
		padding: 0;
		transition: border-color var(--duration-normal) var(--ease-out);
	}

	.thumb.active {
		border-color: white;
	}

	.thumb:not(.active):hover {
		border-color: var(--occ-glass-border-hover);
	}

	.thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	/* Info */
	.info {
		padding: 0;
	}

	.label {
		font-size: var(--font-size-compact);
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		color: var(--occ-purple);
		margin-bottom: 0.75rem;
	}

	.title {
		font-size: 1.5rem;
		font-weight: 300;
		color: var(--occ-glass-text);
	}

	.price {
		margin-top: 0.75rem;
		font-size: 1.25rem;
		color: var(--occ-glass-text);
		font-weight: 500;
	}

	.sold-price {
		margin-top: 0.75rem;
		font-size: 1.125rem;
		color: var(--occ-glass-text-muted);
		font-style: italic;
	}

	.description {
		margin-top: 1.5rem;
		color: var(--occ-glass-text-dim);
		font-size: var(--font-size-sm);
		line-height: 1.625;
	}

	/* Details */
	.details {
		margin-top: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		font-size: var(--font-size-sm);
		border-top: 1px solid var(--occ-glass-border);
		padding-top: 1.5rem;
	}

	.detail-row {
		display: flex;
		gap: 0.5rem;
	}

	.detail-label {
		color: var(--occ-glass-text-muted);
		width: 6rem;
	}

	.detail-value {
		color: var(--occ-glass-text);
	}

	.capitalize {
		text-transform: capitalize;
	}

	/* Size */
	.size-section {
		margin-top: 2rem;
	}

	.size-heading {
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--occ-glass-text);
		margin-bottom: 0.75rem;
	}

	.size-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.size-btn {
		width: 3.5rem;
		height: 2.5rem;
		font-size: var(--font-size-sm);
		font-weight: 500;
		border: 1px solid var(--occ-glass-border);
		color: var(--occ-glass-text-dim);
		background: var(--occ-glass-bg);
		transition: all var(--duration-normal) var(--ease-out);
	}

	.size-btn:hover:not(.oos) {
		border-color: var(--occ-glass-border-hover);
		color: var(--occ-glass-text);
	}

	.size-btn.active {
		border-color: white;
		background: white;
		color: var(--occ-charcoal);
	}

	.size-btn.oos {
		color: var(--occ-glass-text-muted);
		text-decoration: line-through;
		opacity: 0.4;
		cursor: not-allowed;
	}

	/* Add to Cart */
	.add-to-cart {
		margin-top: 2rem;
		width: 100%;
		padding: 1rem;
		background: var(--occ-purple);
		color: white;
		font-size: var(--font-size-sm);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		transition: background var(--duration-normal) var(--ease-out);
	}

	.add-to-cart:hover:not(:disabled) {
		background: var(--occ-purple-hover);
	}

	.add-to-cart:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.shipping-note {
		margin-top: 1rem;
		font-size: var(--font-size-compact);
		color: var(--occ-glass-text-muted);
		text-align: center;
	}

	/* Trust Signals */
	.trust-grid {
		margin-top: 2.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--occ-glass-border);
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	.trust-item {
		font-size: var(--font-size-compact);
		color: var(--occ-glass-text-dim);
	}

	.trust-title {
		font-weight: 500;
		color: var(--occ-glass-text);
		margin-bottom: 0.25rem;
	}

	/* Related */
	.related {
		margin-top: 5rem;
		padding-top: 3rem;
		border-top: 1px solid var(--occ-glass-border);
	}

	.related-title {
		font-size: 1.25rem;
		font-weight: 300;
		color: var(--occ-glass-text);
		margin-bottom: 2rem;
	}

	.related-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1.5rem;
	}

	@media (min-width: 768px) {
		.related-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.page {
			padding: 3rem var(--spacing-lg);
		}

		.product-layout {
			grid-template-columns: repeat(2, 1fr);
			gap: 4rem;
		}

		.info {
			padding-top: 1rem;
		}

		.title {
			font-size: var(--font-size-3xl);
		}

		.related {
			margin-top: 7rem;
		}
	}
</style>
