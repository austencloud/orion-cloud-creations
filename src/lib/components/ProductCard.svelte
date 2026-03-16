<script lang="ts">
	import type { Product } from '$lib/types/product';
	import { formatPrice } from '$lib/data/products';

	interface Props {
		product: Product;
		showPrice?: boolean;
	}

	let { product, showPrice = true }: Props = $props();
</script>

<a
	href="/product/{product.slug}"
	class="group block no-underline"
>
	<div class="relative overflow-hidden bg-warm-white rounded-sm aspect-square">
		<img
			src={product.images[0].url}
			alt={product.images[0].alt}
			class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
			loading="lazy"
		/>
		{#if product.availability === 'sold'}
			<div class="absolute top-3 left-3 bg-charcoal/80 text-white text-xs font-medium px-3 py-1 uppercase tracking-wider">
				Sold
			</div>
		{/if}
		{#if product.isOneOfAKind && product.availability === 'available'}
			<div class="absolute top-3 right-3 bg-accent-purple/90 text-white text-xs font-medium px-3 py-1 uppercase tracking-wider">
				One of a Kind
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
