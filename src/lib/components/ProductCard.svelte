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

<a
	href="/product/{product.slug}"
	class="group block no-underline"
>
	<div class="relative overflow-hidden bg-warm-white rounded-sm aspect-square">
		{#if heroImage}
			<img
				src={heroImage.thumbnailUrl}
				alt={product.title}
				class="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
				loading="lazy"
			/>
		{:else}
			<div class="w-full h-full bg-warm-white flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
				<span class="text-xs text-muted opacity-40">{product.title}</span>
			</div>
		{/if}
		{#if product.availability === 'sold'}
			<div class="absolute top-3 left-3 bg-charcoal/80 text-white text-xs font-medium px-3 py-1 uppercase tracking-wider">
				Sold
			</div>
		{/if}
		</div>

	<div class="mt-4 px-1">
		<h3 class="text-sm font-medium text-charcoal group-hover:text-accent-purple transition-colors">
			{product.title}
		</h3>
		<div class="flex items-center justify-between mt-1">
			{#if showPrice && product.availability === 'available'}
				<p class="text-sm text-muted font-medium">{formatPrice(product.price)}</p>
			{:else if product.availability === 'sold'}
				<p class="text-sm text-light-muted italic">Sold</p>
			{/if}
			<p class="text-xs text-light-muted capitalize">{product.garmentType.replace('_', ' ')}</p>
		</div>
	</div>
</a>
