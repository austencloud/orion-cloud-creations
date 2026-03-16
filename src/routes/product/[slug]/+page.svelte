<script lang="ts">
	import { page } from '$app/stores';
	import { getProductBySlug, formatPrice, products } from '$lib/data/products';
	import ProductCard from '$lib/components/ProductCard.svelte';

	const slug = $derived($page.params.slug);
	const product = $derived(getProductBySlug(slug));

	let selectedSize = $state<string>('');
	let currentImageIndex = $state(0);

	const relatedProducts = $derived(
		product
			? products
					.filter((p) => p.id !== product.id && p.availability === 'available')
					.slice(0, 4)
			: []
	);
</script>

<svelte:head>
	{#if product}
		<title>{product.title} | Orion Cloud Creations</title>
		<meta name="description" content={product.description} />
	{:else}
		<title>Product Not Found | Orion Cloud Creations</title>
	{/if}
</svelte:head>

{#if product}
	<div class="mx-auto max-w-7xl px-6 lg:px-8 py-8 lg:py-12">
		<!-- Breadcrumb -->
		<nav class="mb-8 text-xs text-light-muted">
			<a href="/" class="hover:text-charcoal transition-colors">Home</a>
			<span class="mx-2">/</span>
			<a href="/shop" class="hover:text-charcoal transition-colors">Shop</a>
			<span class="mx-2">/</span>
			<span class="text-charcoal">{product.title}</span>
		</nav>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
			<!-- Images -->
			<div class="space-y-4">
				<div class="aspect-square overflow-hidden bg-warm-white rounded-sm">
					<img
						src={product.images[currentImageIndex].url}
						alt={product.images[currentImageIndex].alt}
						class="w-full h-full object-cover"
					/>
				</div>
				{#if product.images.length > 1}
					<div class="grid grid-cols-4 gap-3">
						{#each product.images as image, i}
							<button
								class="aspect-square overflow-hidden bg-warm-white rounded-sm border-2 transition-colors
									{currentImageIndex === i ? 'border-accent-purple' : 'border-transparent hover:border-border'}"
								onclick={() => (currentImageIndex = i)}
							>
								<img
									src={image.url}
									alt={image.alt}
									class="w-full h-full object-cover"
								/>
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Product Info -->
			<div class="lg:py-4">
				{#if product.isOneOfAKind}
					<p class="text-xs font-medium uppercase tracking-[0.2em] text-accent-purple mb-3">
						One of a Kind
					</p>
				{/if}

				<h1 class="text-2xl lg:text-3xl font-light text-charcoal">{product.title}</h1>

				{#if product.availability === 'available'}
					<p class="mt-3 text-xl text-charcoal font-medium">
						{formatPrice(product.price)}
					</p>
				{:else}
					<p class="mt-3 text-lg text-light-muted italic">Sold</p>
				{/if}

				<p class="mt-6 text-muted text-sm leading-relaxed">
					{product.description}
				</p>

				<!-- Details -->
				<div class="mt-8 space-y-4 text-sm border-t border-border-light pt-6">
					<div class="flex gap-2">
						<span class="text-light-muted w-24">Material</span>
						<span class="text-charcoal">{product.material}</span>
					</div>
					<div class="flex gap-2">
						<span class="text-light-muted w-24">Technique</span>
						<span class="text-charcoal capitalize">{product.techniques.map((t) => t.replace('_', ' ')).join(', ')}</span>
					</div>
					<div class="flex gap-2">
						<span class="text-light-muted w-24">Colors</span>
						<span class="text-charcoal">{product.colorway.join(', ')}</span>
					</div>
					<div class="flex gap-2">
						<span class="text-light-muted w-24">Type</span>
						<span class="text-charcoal capitalize">{product.garmentType.replace('_', ' ')}</span>
					</div>
				</div>

				{#if product.availability === 'available'}
					<!-- Size Selection -->
					<div class="mt-8">
						<p class="text-sm font-medium text-charcoal mb-3">Size</p>
						<div class="flex flex-wrap gap-3">
							{#each product.sizes as size}
								<button
									class="w-14 h-10 text-sm font-medium border transition-colors
										{selectedSize === size
											? 'border-charcoal bg-charcoal text-white'
											: 'border-border text-muted hover:border-charcoal hover:text-charcoal'}"
									onclick={() => (selectedSize = size)}
								>
									{size}
								</button>
							{/each}
						</div>
					</div>

					<!-- Add to Cart -->
					<button
						class="mt-8 w-full py-4 bg-charcoal text-white text-sm font-semibold uppercase tracking-wider hover:bg-charcoal/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
						disabled={!selectedSize}
					>
						{selectedSize ? 'Add to Cart' : 'Select a Size'}
					</button>

					<p class="mt-4 text-xs text-light-muted text-center">
						Free shipping on orders over $100
					</p>
				{/if}

				<!-- Trust Signals -->
				<div class="mt-10 pt-6 border-t border-border-light grid grid-cols-2 gap-4">
					<div class="text-xs text-muted">
						<p class="font-medium text-charcoal mb-1">Colorfast</p>
						<p>Procion dyes bond permanently. Won't fade or bleed.</p>
					</div>
					<div class="text-xs text-muted">
						<p class="font-medium text-charcoal mb-1">Handmade</p>
						<p>Folded, dyed, and finished by hand in Chicago.</p>
					</div>
					<div class="text-xs text-muted">
						<p class="font-medium text-charcoal mb-1">Machine Washable</p>
						<p>Wash and dry normally after first cold wash.</p>
					</div>
					<div class="text-xs text-muted">
						<p class="font-medium text-charcoal mb-1">100% Cotton</p>
						<p>Dye goes all the way through the fiber.</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Related Products -->
		{#if relatedProducts.length > 0}
			<section class="mt-20 lg:mt-28 pt-12 border-t border-border-light">
				<h2 class="text-xl font-light text-charcoal mb-8">More Pieces</h2>
				<div class="grid grid-cols-2 md:grid-cols-4 gap-6">
					{#each relatedProducts as related}
						<ProductCard product={related} />
					{/each}
				</div>
			</section>
		{/if}
	</div>
{:else}
	<div class="mx-auto max-w-7xl px-6 lg:px-8 py-20 text-center">
		<h1 class="text-2xl font-light text-charcoal">Product not found</h1>
		<a href="/shop" class="mt-4 inline-block text-sm text-accent-purple hover:text-charcoal transition-colors">
			Back to shop
		</a>
	</div>
{/if}
