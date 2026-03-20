<script lang="ts">
	import ProductCard from '$lib/components/ProductCard.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Gallery | Orion Cloud Creations</title>
	<meta name="description" content="Browse the full collection of handmade tie-dye work by Austen Cloud, including sold and one-of-a-kind pieces." />
</svelte:head>

<div class="page">
	<div class="page-header">
		<h1 class="page-title">Gallery</h1>
		<p class="page-subtitle">
			Everything I've made, including sold pieces. This is the full body of work.
		</p>
	</div>

	{#if data.products.length > 0}
		<div class="gallery-grid">
			{#each data.products as product}
				<ProductCard {product} showPrice={false} />
			{/each}
		</div>
	{:else}
		<div class="empty">
			<p>No pieces in the gallery yet.</p>
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
		max-width: 32rem;
	}

	.gallery-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	.empty {
		text-align: center;
		padding: 5rem 0;
	}

	.empty p {
		color: var(--occ-glass-text-dim);
		font-size: var(--font-size-sm);
	}

	@media (min-width: 768px) {
		.gallery-grid {
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

		.gallery-grid {
			grid-template-columns: repeat(4, 1fr);
			gap: 1.5rem;
		}
	}
</style>
