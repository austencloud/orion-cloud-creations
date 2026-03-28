<script lang="ts">
	import type { StorefrontProduct } from '$lib/types/product';
	import GalleryLightbox from '$lib/components/GalleryLightbox.svelte';

	let { data } = $props();

	let products = $state<StorefrontProduct[]>(data.products);
	let hasMore = $state(data.hasMore);
	let loading = $state(false);
	let loadError = $state(false);
	let selectedProduct = $state<StorefrontProduct | null>(null);

	async function loadMore() {
		if (loading || !hasMore) return;
		loading = true;
		loadError = false;

		const lastProduct = products[products.length - 1];
		if (!lastProduct) return;

		try {
			const res = await fetch(`/api/gallery?after=${encodeURIComponent(lastProduct.createdAt)}`);
			if (!res.ok) throw new Error('Failed to load');

			const result = await res.json();
			products = [...products, ...result.products];
			hasMore = result.hasMore;
		} catch {
			loadError = true;
		} finally {
			loading = false;
		}
	}

	function openLightbox(product: StorefrontProduct) {
		selectedProduct = product;
		document.body.style.overflow = 'hidden';
	}

	function closeLightbox() {
		selectedProduct = null;
		document.body.style.overflow = '';
	}
</script>

<svelte:head>
	<title>Gallery | Orion Cloud Creations</title>
	<meta name="description" content="Browse the full Orion Cloud Creations collection. Handmade tie-dye clothing including sold and available pieces. Ice dye, shibori, spiral, and mandala techniques." />
	<meta property="og:title" content="Gallery | Orion Cloud Creations" />
	<meta property="og:description" content="Browse the full collection of handmade tie-dye art. Each piece is one of a kind." />
	<meta property="og:type" content="website" />
</svelte:head>

<div class="glass-page">
	<div class="page-header">
		<h1 class="page-title">Gallery</h1>
		<p class="page-subtitle">
			The full body of work. Click any piece to see it up close.
		</p>
	</div>

	{#if products.length > 0}
		<div class="masonry">
			{#each products as product, i}
				{@const heroImage = product.images[0]}
				<button
					class="tile"
					class:tall={product.featured || i % 5 === 0}
					onclick={() => openLightbox(product)}
					aria-label="View {product.title}"
				>
					{#if heroImage}
						<img
							src={heroImage.thumbnailUrl}
							alt={product.title}
							loading={i < 8 ? 'eager' : 'lazy'}
						/>
					{:else}
						<div class="tile-placeholder">{product.title}</div>
					{/if}
					<div class="tile-overlay">
						<h3 class="tile-title">{product.title}</h3>
						<p class="tile-technique">
							{product.techniques.map((t) => t.replace('_', ' ')).join(' · ')}
						</p>
					</div>
				</button>
			{/each}
		</div>

		{#if hasMore}
			<div class="load-more">
				<button class="load-more-btn" onclick={loadMore} disabled={loading}>
					{#if loading}
						<span class="spinner"></span>
						Loading...
					{:else if loadError}
						Failed to load — try again
					{:else}
						Load More
					{/if}
				</button>
			</div>
		{/if}
	{:else}
		<div class="empty">
			<p>No pieces in the gallery yet. Check back soon.</p>
		</div>
	{/if}
</div>

<GalleryLightbox
	product={selectedProduct}
	availableProducts={data.availableProducts}
	onclose={closeLightbox}
/>

<style>
	.page-header {
		margin-bottom: 2.5rem;
	}

	.page-title {
		font-size: var(--font-size-3xl);
		font-weight: 300;
		color: var(--occ-glass-text);
	}

	.page-subtitle {
		margin-top: 0.75rem;
		color: var(--occ-glass-text-dim);
		font-size: var(--font-size-sm);
		max-width: 32rem;
	}

	.masonry {
		columns: 2;
		column-gap: 12px;
	}

	.tile {
		break-inside: avoid;
		margin-bottom: 12px;
		position: relative;
		overflow: hidden;
		border-radius: 8px;
		background: rgba(20, 20, 40, 0.4);
		display: block;
		width: 100%;
		padding: 0;
		text-align: left;
		cursor: pointer;
	}

	.tile img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		transition: transform var(--duration-dramatic) var(--ease-out);
	}

	.tile:hover img {
		transform: scale(1.03);
	}

	.tile:not(.tall) {
		aspect-ratio: 1;
	}

	.tile.tall {
		aspect-ratio: 3/4;
	}

	.tile-placeholder {
		width: 100%;
		aspect-ratio: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--font-size-compact);
		color: var(--occ-glass-text-muted);
		opacity: 0.4;
	}

	.tile-overlay {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 12px;
		background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
		opacity: 1;
		transition: opacity var(--duration-normal) var(--ease-out);
	}

	.tile-title {
		font-size: 13px;
		font-weight: 500;
		color: white;
	}

	.tile-technique {
		font-size: 11px;
		color: rgba(255, 255, 255, 0.6);
		text-transform: capitalize;
		margin-top: 2px;
	}

	@media (min-width: 768px) {
		.masonry {
			columns: 3;
		}

		.tile-overlay {
			opacity: 0;
		}

		.tile:hover .tile-overlay {
			opacity: 1;
		}
	}

	@media (min-width: 1024px) {
		.masonry {
			columns: 4;
		}

		.page-title {
			font-size: 2.25rem;
		}
	}

	.load-more {
		text-align: center;
		margin-top: 2.5rem;
	}

	.load-more-btn {
		padding: 0.75rem 2.5rem;
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--occ-glass-text-dim);
		border: 1px solid var(--occ-glass-border);
		background: var(--occ-glass-bg);
		border-radius: 4px;
		transition: all var(--duration-normal) var(--ease-out);
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.load-more-btn:hover:not(:disabled) {
		color: var(--occ-glass-text);
		border-color: var(--occ-glass-border-hover);
	}

	.load-more-btn:disabled {
		opacity: 0.6;
		cursor: wait;
	}

	.spinner {
		display: inline-block;
		width: 14px;
		height: 14px;
		border: 2px solid rgba(255, 255, 255, 0.2);
		border-top-color: var(--occ-glass-text);
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.empty {
		text-align: center;
		padding: 5rem 0;
	}

	.empty p {
		color: var(--occ-glass-text-dim);
		font-size: var(--font-size-sm);
	}
</style>
