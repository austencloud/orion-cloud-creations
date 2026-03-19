<script lang="ts">
	import ProductCard from '$lib/components/ProductCard.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Gallery | Orion Cloud Creations</title>
	<meta name="description" content="Browse the full collection of handmade tie-dye work by Austen Cloud, including sold and one-of-a-kind pieces." />
</svelte:head>

<div class="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-16">
	<div class="mb-12">
		<h1 class="text-3xl lg:text-4xl font-light text-charcoal">Gallery</h1>
		<p class="mt-3 text-muted text-sm max-w-lg">
			Everything I've made, including sold pieces. This is the full body of work.
		</p>
	</div>

	{#if data.products.length > 0}
		<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
			{#each data.products as product}
				<ProductCard {product} showPrice={false} />
			{/each}
		</div>
	{:else}
		<div class="text-center py-20">
			<p class="text-muted text-sm">No pieces in the gallery yet.</p>
		</div>
	{/if}
</div>
