<script lang="ts">
	import ProductCard from '$lib/components/ProductCard.svelte';
	import { getFeaturedProducts, products, formatPrice } from '$lib/data/products';

	const featured = getFeaturedProducts();

	const techniques = [
		{
			name: 'Ice Dye',
			description: 'Frozen dye crystals melt through fabric, creating organic, watercolor-like patterns with incredible depth and detail.',
			image: '/images/products/blue-mandala.jpg'
		},
		{
			name: 'Shibori',
			description: 'Ancient Japanese resist-dyeing technique. Precise folding, binding, and clamping creates geometric symmetry.',
			image: '/images/products/golden-shibori-grid.jpg'
		},
		{
			name: 'Spiral',
			description: 'The foundation of tie-dye, elevated. Pinch-and-twist spirals with professional dyes and color theory.',
			image: '/images/products/classic-spiral-rainbow.jpg'
		}
	];
</script>

<svelte:head>
	<title>Orion Cloud Creations | Handmade Tie-Dye Clothing</title>
</svelte:head>

<!-- Hero Section -->
<section class="relative h-[85vh] min-h-[600px] overflow-hidden">
	<div class="absolute inset-0">
		<img
			src="/images/hero/hero-mandala.jpg"
			alt="Ice dye mandala t-shirt with radiant cyan center"
			class="w-full h-full object-cover"
		/>
		<div class="absolute inset-0 bg-gradient-to-r from-charcoal/70 via-charcoal/40 to-transparent"></div>
	</div>

	<div class="relative h-full mx-auto max-w-7xl px-6 lg:px-8 flex items-center">
		<div class="max-w-xl">
			<p class="text-white/70 text-sm font-medium uppercase tracking-[0.2em] mb-4">
				Handmade in Chicago
			</p>
			<h1 class="text-4xl sm:text-5xl lg:text-6xl font-light text-white leading-tight">
				Wearable art,<br />
				<span class="font-normal">dyed by hand.</span>
			</h1>
			<p class="mt-6 text-lg text-white/80 leading-relaxed max-w-md">
				Professional Procion fiber reactive dyes on 100% cotton. Every piece is unique. Every color is permanent.
			</p>
			<div class="mt-10 flex gap-4">
				<a
					href="/shop"
					class="inline-flex items-center px-8 py-3 bg-white text-charcoal text-sm font-semibold uppercase tracking-wider hover:bg-white/90 transition-colors no-underline"
				>
					Shop Collection
				</a>
				<a
					href="/techniques"
					class="inline-flex items-center px-8 py-3 border border-white/40 text-white text-sm font-semibold uppercase tracking-wider hover:bg-white/10 transition-colors no-underline"
				>
					Learn More
				</a>
			</div>
		</div>
	</div>
</section>

<!-- Featured Products -->
<section class="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-28">
	<div class="text-center mb-14">
		<h2 class="text-2xl lg:text-3xl font-light text-charcoal">
			Featured Pieces
		</h2>
		<p class="mt-3 text-muted text-sm max-w-md mx-auto">
			Each piece is one of a kind. When it's gone, it's gone.
		</p>
	</div>

	<div class="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
		{#each featured as product}
			<ProductCard {product} />
		{/each}
	</div>

	<div class="text-center mt-12">
		<a
			href="/shop"
			class="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-accent-purple hover:text-charcoal transition-colors no-underline"
		>
			View All Pieces
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
				<path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
			</svg>
		</a>
	</div>
</section>

<!-- Technique Highlights -->
<section class="bg-warm-white py-20 lg:py-28">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="text-center mb-14">
			<h2 class="text-2xl lg:text-3xl font-light text-charcoal">
				The Techniques
			</h2>
			<p class="mt-3 text-muted text-sm max-w-lg mx-auto">
				Not all tie-dye is created equal. These are professional techniques using fiber reactive dyes that bond permanently to the cotton fiber.
			</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
			{#each techniques as technique}
				<a href="/techniques" class="group block no-underline">
					<div class="relative overflow-hidden rounded-sm aspect-[4/3]">
						<img
							src={technique.image}
							alt={technique.name}
							class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
							loading="lazy"
						/>
						<div class="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent"></div>
						<h3 class="absolute bottom-4 left-4 text-white text-lg font-medium">
							{technique.name}
						</h3>
					</div>
					<p class="mt-3 text-sm text-muted leading-relaxed">
						{technique.description}
					</p>
				</a>
			{/each}
		</div>
	</div>
</section>

<!-- About Teaser -->
<section class="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-28">
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
		<div class="grid grid-cols-2 gap-4">
			<div class="space-y-4">
				<img
					src="/images/process/procion-dyes.jpg"
					alt="Collection of Procion fiber reactive dye powders"
					class="w-full rounded-sm object-cover aspect-square"
					loading="lazy"
				/>
				<img
					src="/images/process/dye-rack.jpg"
					alt="Tied garments on dye rack with fresh dye applied"
					class="w-full rounded-sm object-cover aspect-[3/4]"
					loading="lazy"
				/>
			</div>
			<div class="pt-8">
				<img
					src="/images/process/pre-dye-prep.jpg"
					alt="Shirts tied and prepared for ice dye process"
					class="w-full rounded-sm object-cover aspect-[3/4]"
					loading="lazy"
				/>
				<img
					src="/images/products/spiral-on-body.jpg"
					alt="Model wearing finished tie-dye spiral shirt"
					class="w-full rounded-sm object-cover aspect-square mt-4"
					loading="lazy"
				/>
			</div>
		</div>

		<div>
			<p class="text-xs font-medium uppercase tracking-[0.2em] text-accent-purple mb-4">
				About the Artist
			</p>
			<h2 class="text-2xl lg:text-3xl font-light text-charcoal leading-snug">
				Every piece is made by hand,<br />start to finish.
			</h2>
			<div class="mt-6 space-y-4 text-muted text-sm leading-relaxed">
				<p>
					I'm Austen, a Chicago-based artist, circus performer, and dyer. I started Orion Cloud Creations because I wanted to push tie-dye past what most people think it can be.
				</p>
				<p>
					I use Procion MX fiber reactive dyes exclusively. They form a permanent covalent bond with cotton fiber. The colors don't fade, don't bleed, and don't wash out. This is chemistry, not craft paint.
				</p>
				<p>
					Every shirt, hoodie, tank, and pair of leggings is folded, bound, dyed, and rinsed by me. No two pieces are identical because no two ice melts are identical.
				</p>
			</div>
			<a
				href="/about"
				class="inline-flex items-center gap-2 mt-8 text-sm font-medium uppercase tracking-wider text-accent-purple hover:text-charcoal transition-colors no-underline"
			>
				Read More
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
					<path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
				</svg>
			</a>
		</div>
	</div>
</section>

<!-- Newsletter / CTA -->
<section class="bg-charcoal text-white py-20 lg:py-24">
	<div class="mx-auto max-w-2xl px-6 lg:px-8 text-center">
		<h2 class="text-2xl lg:text-3xl font-light">
			New pieces drop regularly.
		</h2>
		<p class="mt-4 text-white/60 text-sm">
			Follow along to see new work as it comes out of the dye bath.
		</p>
		<div class="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
			<input
				type="email"
				placeholder="Your email"
				class="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/50"
			/>
			<button
				class="px-6 py-3 bg-white text-charcoal text-sm font-semibold uppercase tracking-wider hover:bg-white/90 transition-colors"
			>
				Notify Me
			</button>
		</div>
	</div>
</section>
