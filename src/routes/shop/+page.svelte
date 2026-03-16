<script lang="ts">
	import ProductCard from '$lib/components/ProductCard.svelte';
	import { getAvailableProducts, products } from '$lib/data/products';
	import type { GarmentType, Technique } from '$lib/types/product';

	let activeFilter = $state<string>('all');
	let activeTechnique = $state<string>('all');

	const garmentTypes: { value: string; label: string }[] = [
		{ value: 'all', label: 'All' },
		{ value: 'shirt', label: 'T-Shirts' },
		{ value: 'long_sleeve', label: 'Long Sleeves' },
		{ value: 'tank', label: 'Tanks' },
		{ value: 'hoodie', label: 'Hoodies' }
	];

	const techniqueFilters: { value: string; label: string }[] = [
		{ value: 'all', label: 'All Techniques' },
		{ value: 'ice_dye', label: 'Ice Dye' },
		{ value: 'spiral', label: 'Spiral' },
		{ value: 'shibori', label: 'Shibori' },
		{ value: 'mandala', label: 'Mandala' },
		{ value: 'reverse', label: 'Reverse Dye' },
		{ value: 'starburst', label: 'Starburst' },
		{ value: 'crumple', label: 'Crumple' }
	];

	const availableProducts = getAvailableProducts();

	let filteredProducts = $derived(
		availableProducts.filter((p) => {
			const matchesType = activeFilter === 'all' || p.garmentType === activeFilter;
			const matchesTechnique =
				activeTechnique === 'all' || p.techniques.includes(activeTechnique as Technique);
			return matchesType && matchesTechnique;
		})
	);
</script>

<svelte:head>
	<title>Shop | Orion Cloud Creations</title>
	<meta
		name="description"
		content="Shop handmade tie-dye clothing. Ice dye, shibori, spiral, and mandala techniques on 100% cotton. Every piece is one of a kind."
	/>
</svelte:head>

<div class="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-16">
	<!-- Header -->
	<div class="mb-12">
		<h1 class="text-3xl lg:text-4xl font-light text-charcoal">Shop</h1>
		<p class="mt-3 text-muted text-sm">
			{availableProducts.length} pieces available. Each one handmade, one of a kind.
		</p>
	</div>

	<!-- Filters -->
	<div class="flex flex-col sm:flex-row gap-6 mb-10 pb-8 border-b border-border-light">
		<!-- Garment Type -->
		<div class="flex flex-wrap gap-2">
			{#each garmentTypes as type}
				<button
					class="px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors
						{activeFilter === type.value
							? 'bg-charcoal text-white'
							: 'bg-transparent text-muted hover:text-charcoal border border-border'}"
					onclick={() => (activeFilter = type.value)}
				>
					{type.label}
				</button>
			{/each}
		</div>

		<!-- Technique -->
		<div class="flex flex-wrap gap-2">
			{#each techniqueFilters as tech}
				<button
					class="px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors
						{activeTechnique === tech.value
							? 'bg-accent-purple text-white'
							: 'bg-transparent text-muted hover:text-charcoal border border-border'}"
					onclick={() => (activeTechnique = tech.value)}
				>
					{tech.label}
				</button>
			{/each}
		</div>
	</div>

	<!-- Product Grid -->
	{#if filteredProducts.length > 0}
		<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
			{#each filteredProducts as product}
				<ProductCard {product} />
			{/each}
		</div>
	{:else}
		<div class="text-center py-20">
			<p class="text-muted text-sm">No pieces match those filters right now.</p>
			<button
				class="mt-4 text-sm text-accent-purple hover:text-charcoal transition-colors"
				onclick={() => {
					activeFilter = 'all';
					activeTechnique = 'all';
				}}
			>
				Clear filters
			</button>
		</div>
	{/if}
</div>
