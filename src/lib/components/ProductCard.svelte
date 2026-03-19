<script lang="ts">
	import type { StorefrontProduct } from '$lib/types/product';
	import { formatPrice } from '$lib/types/product';

	interface Props {
		product: StorefrontProduct;
		showPrice?: boolean;
	}

	let { product, showPrice = true }: Props = $props();

	const heroImage = product.images[0];
</script>

<a href="/product/{product.slug}" class="card">
	<div class="image-wrap">
		{#if heroImage}
			<img
				src={heroImage.thumbnailUrl}
				alt={product.title}
				class="image"
				loading="lazy"
			/>
		{:else}
			<div class="placeholder">
				<span>{product.title}</span>
			</div>
		{/if}
		{#if product.availability === 'sold'}
			<div class="badge badge-sold">Sold</div>
		{/if}
		{#if product.isOneOfAKind && product.availability === 'available'}
			<div class="badge badge-unique">One of a Kind</div>
		{/if}
	</div>

	<div class="info">
		<h3 class="title">{product.title}</h3>
		<div class="meta">
			{#if showPrice && product.availability === 'available'}
				<p class="price">{formatPrice(product.price)}</p>
			{:else if product.availability === 'sold'}
				<p class="sold-label">Sold</p>
			{/if}
			<p class="type">{product.garmentType.replace('_', ' ')}</p>
		</div>
	</div>
</a>

<style>
	.card {
		display: block;
	}

	.image-wrap {
		position: relative;
		overflow: hidden;
		background: var(--occ-warm-white);
		border-radius: 2px;
		aspect-ratio: 1;
	}

	.image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform var(--duration-dramatic) var(--ease-out);
	}

	.card:hover .image {
		transform: scale(1.05);
	}

	.placeholder {
		width: 100%;
		height: 100%;
		background: var(--occ-warm-white);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform var(--duration-dramatic) var(--ease-out);
	}

	.placeholder span {
		font-size: var(--font-size-compact);
		color: var(--occ-muted);
		opacity: 0.4;
	}

	.card:hover .placeholder {
		transform: scale(1.05);
	}

	.badge {
		position: absolute;
		top: 0.75rem;
		font-size: var(--font-size-compact);
		font-weight: 500;
		padding: 0.25rem 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: white;
	}

	.badge-sold {
		left: 0.75rem;
		background: rgba(26, 26, 26, 0.8);
	}

	.badge-unique {
		right: 0.75rem;
		background: rgba(91, 58, 140, 0.9);
	}

	.info {
		margin-top: 1rem;
		padding: 0 0.25rem;
	}

	.title {
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--occ-charcoal);
		transition: color var(--duration-normal) var(--ease-out);
	}

	.card:hover .title {
		color: var(--occ-purple);
	}

	.meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 0.25rem;
	}

	.price {
		font-size: var(--font-size-sm);
		color: var(--occ-muted);
		font-weight: 500;
	}

	.sold-label {
		font-size: var(--font-size-sm);
		color: var(--occ-light-muted);
		font-style: italic;
	}

	.type {
		font-size: var(--font-size-compact);
		color: var(--occ-light-muted);
		text-transform: capitalize;
	}
</style>
