<script lang="ts">
	import ProductCard from '$lib/components/ProductCard.svelte';

	let { data } = $props();

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

	let filteredProducts = $derived(
		data.products.filter((p) => {
			const matchesType = activeFilter === 'all' || p.garmentType === activeFilter;
			const matchesTechnique =
				activeTechnique === 'all' || p.techniques.includes(activeTechnique);
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

<div class="page">
	<div class="page-header">
		<h1 class="page-title">Shop</h1>
		<p class="page-subtitle">
			{data.products.length} pieces available. Each one handmade, one of a kind.
		</p>
	</div>

	<div class="filters">
		<div class="filter-group">
			{#each garmentTypes as type}
				<button
					class="filter-btn"
					class:active={activeFilter === type.value}
					onclick={() => (activeFilter = type.value)}
				>
					{type.label}
				</button>
			{/each}
		</div>

		<div class="filter-group">
			{#each techniqueFilters as tech}
				<button
					class="filter-btn technique"
					class:active={activeTechnique === tech.value}
					onclick={() => (activeTechnique = tech.value)}
				>
					{tech.label}
				</button>
			{/each}
		</div>
	</div>

	{#if filteredProducts.length > 0}
		<div class="product-grid">
			{#each filteredProducts as product}
				<ProductCard {product} />
			{/each}
		</div>
	{:else}
		<div class="empty">
			<p>No pieces match those filters right now.</p>
			<button
				class="clear-btn"
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

<style>
	.page {
		max-width: 80rem;
		margin: 0 auto;
		padding: 3rem var(--spacing-md);
		background: var(--occ-glass-bg);
		backdrop-filter: blur(var(--occ-glass-blur));
		-webkit-backdrop-filter: blur(var(--occ-glass-blur));
		border: 1px solid var(--occ-glass-border);
		border-radius: var(--occ-glass-radius);
		margin-top: 1rem;
		margin-bottom: 2rem;
	}

	.page-header {
		margin-bottom: 3rem;
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
	}

	.filters {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		margin-bottom: 2.5rem;
		padding-bottom: 2rem;
		border-bottom: 1px solid var(--occ-glass-border);
	}

	.filter-group {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.filter-btn {
		padding: 0.5rem 1rem;
		font-size: var(--font-size-compact);
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--occ-glass-text-dim);
		border: 1px solid var(--occ-glass-border);
		background: var(--occ-glass-bg);
		transition: all var(--duration-normal) var(--ease-out);
	}

	.filter-btn:hover {
		color: var(--occ-glass-text);
		background: var(--occ-glass-bg-hover);
	}

	.filter-btn.active {
		background: var(--occ-charcoal);
		border-color: var(--occ-charcoal);
		color: white;
	}

	.filter-btn.technique.active {
		background: var(--occ-purple);
		border-color: var(--occ-purple);
		color: white;
	}

	.product-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1.5rem;
	}

	.empty {
		text-align: center;
		padding: 5rem 0;
	}

	.empty p {
		color: var(--occ-glass-text-dim);
		font-size: var(--font-size-sm);
	}

	.clear-btn {
		margin-top: 1rem;
		font-size: var(--font-size-sm);
		color: var(--occ-purple);
		transition: color var(--duration-normal) var(--ease-out);
	}

	.clear-btn:hover {
		color: var(--occ-glass-text);
	}

	@media (min-width: 640px) {
		.filters {
			flex-direction: row;
		}
	}

	@media (min-width: 768px) {
		.product-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.page {
			padding: 4rem var(--spacing-lg);
		}

		.page-title {
			font-size: 2.25rem;
		}

		.product-grid {
			grid-template-columns: repeat(4, 1fr);
			gap: 2rem;
		}
	}
</style>
