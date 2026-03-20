<script lang="ts">
	import ProductCard from '$lib/components/ProductCard.svelte';

	let { data } = $props();
	const featured = data.featured;

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
<section class="hero">
	<div class="hero-content">
		<p class="hero-label">Handmade in Chicago</p>
		<h1 class="hero-title">
			Wearable art,<br />
			<span class="hero-title-accent">dyed by hand.</span>
		</h1>
		<p class="hero-desc">
			Professional Procion fiber reactive dyes on 100% cotton. Every piece is unique. Every color is permanent.
		</p>
		<div class="hero-actions">
			<a href="/shop" class="btn-primary">Shop Collection</a>
			<a href="/techniques" class="btn-outline">Learn More</a>
		</div>
	</div>
</section>

<!-- Featured Products -->
<section class="glass-section">
	<div class="section-header">
		<h2 class="section-title">Featured Pieces</h2>
		<p class="section-subtitle">Each piece is one of a kind. When it's gone, it's gone.</p>
	</div>

	<div class="product-grid-3">
		{#each featured as product}
			<ProductCard {product} />
		{/each}
	</div>

	<div class="section-cta">
		<a href="/shop" class="link-arrow">
			View All Pieces
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="link-arrow-icon">
				<path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
			</svg>
		</a>
	</div>
</section>

<!-- Technique Highlights -->
<section class="glass-section">
	<div class="section-header">
		<h2 class="section-title">The Techniques</h2>
		<p class="section-subtitle wide">
			Not all tie-dye is created equal. These are professional techniques using fiber reactive dyes that bond permanently to the cotton fiber.
		</p>
	</div>

	<div class="technique-grid">
		{#each techniques as technique}
			<a href="/techniques" class="technique-card">
				<div class="technique-img-wrap">
					<img
						src={technique.image}
						alt={technique.name}
						class="technique-img"
						loading="lazy"
					/>
					<div class="technique-gradient"></div>
					<h3 class="technique-name">{technique.name}</h3>
				</div>
				<p class="technique-desc">{technique.description}</p>
			</a>
		{/each}
	</div>
</section>

<!-- About Teaser -->
<section class="glass-section">
	<div class="about-grid">
		<div class="about-images">
			<div class="about-col">
				<img
					src="/images/process/procion-dyes.jpg"
					alt="Collection of Procion fiber reactive dye powders"
					class="about-img square"
					loading="lazy"
				/>
				<img
					src="/images/process/dye-rack.jpg"
					alt="Tied garments on dye rack with fresh dye applied"
					class="about-img portrait"
					loading="lazy"
				/>
			</div>
			<div class="about-col offset">
				<img
					src="/images/process/pre-dye-prep.jpg"
					alt="Shirts tied and prepared for ice dye process"
					class="about-img portrait"
					loading="lazy"
				/>
				<img
					src="/images/products/spiral-on-body.jpg"
					alt="Model wearing finished tie-dye spiral shirt"
					class="about-img square"
					loading="lazy"
				/>
			</div>
		</div>

		<div class="about-text">
			<p class="label">About the Artist</p>
			<h2 class="section-title snug">
				Every piece is made by hand,<br />start to finish.
			</h2>
			<div class="about-body">
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
			<a href="/about" class="link-arrow">
				Read More
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="link-arrow-icon">
					<path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
				</svg>
			</a>
		</div>
	</div>
</section>

<!-- Newsletter / CTA -->
<section class="glass-section newsletter-section">
	<h2 class="newsletter-title">New pieces drop regularly.</h2>
	<p class="newsletter-subtitle">Follow along to see new work as it comes out of the dye bath.</p>
	<div class="newsletter-form">
		<input type="email" placeholder="Your email" class="newsletter-input" />
		<button class="newsletter-btn">Notify Me</button>
	</div>
</section>

<style>
	/* ── Hero ── */
	.hero {
		min-height: 60vh;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 4rem var(--spacing-md);
	}

	.hero-content {
		max-width: 40rem;
	}

	.hero-label {
		color: var(--occ-glass-text-dim);
		font-size: var(--font-size-sm);
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		margin-bottom: 1rem;
	}

	.hero-title {
		font-size: 2.25rem;
		font-weight: 300;
		color: white;
		line-height: 1.25;
	}

	.hero-title-accent {
		font-weight: 400;
	}

	.hero-desc {
		margin-top: 1.5rem;
		font-size: 1.125rem;
		color: rgba(255, 255, 255, 0.8);
		line-height: 1.625;
		max-width: 28rem;
		margin-left: auto;
		margin-right: auto;
	}

	.hero-actions {
		margin-top: 2.5rem;
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.btn-primary {
		display: inline-flex;
		align-items: center;
		padding: 0.75rem 2rem;
		background: var(--occ-glass-bg);
		color: var(--occ-glass-text);
		border: 1px solid var(--occ-glass-border-hover);
		backdrop-filter: blur(var(--occ-glass-blur));
		-webkit-backdrop-filter: blur(var(--occ-glass-blur));
		font-size: var(--font-size-sm);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		transition: background var(--duration-normal) var(--ease-out);
	}

	.btn-primary:hover {
		background: var(--occ-glass-bg-hover);
	}

	.btn-outline {
		display: inline-flex;
		align-items: center;
		padding: 0.75rem 2rem;
		border: 1px solid var(--occ-glass-border-hover);
		color: var(--occ-glass-text);
		font-size: var(--font-size-sm);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		transition: background var(--duration-normal) var(--ease-out);
	}

	.btn-outline:hover {
		background: rgba(255, 255, 255, 0.05);
	}

	@media (min-width: 640px) {
		.hero-title { font-size: 3rem; }
	}

	@media (min-width: 1024px) {
		.hero-title { font-size: 3.75rem; }
	}

	/* ── Glass Section ── */
	.glass-section {
		max-width: 80rem;
		margin: 2rem auto;
		padding: 3rem var(--spacing-md);
		background: var(--occ-glass-bg);
		backdrop-filter: blur(var(--occ-glass-blur));
		-webkit-backdrop-filter: blur(var(--occ-glass-blur));
		border: 1px solid var(--occ-glass-border);
		border-radius: var(--occ-glass-radius);
	}

	@media (min-width: 1024px) {
		.glass-section {
			padding: 4rem var(--spacing-lg);
			margin: 2.5rem auto;
		}
	}

	/* ── Shared Section ── */
	.section-header {
		text-align: center;
		margin-bottom: 3.5rem;
	}

	.section-title {
		font-size: 1.5rem;
		font-weight: 300;
		color: var(--occ-glass-text);
	}

	.section-title.snug {
		line-height: 1.375;
	}

	.section-subtitle {
		margin-top: 0.75rem;
		color: var(--occ-glass-text-dim);
		font-size: var(--font-size-sm);
		max-width: 28rem;
		margin-left: auto;
		margin-right: auto;
	}

	.section-subtitle.wide {
		max-width: 32rem;
	}

	.section-cta {
		text-align: center;
		margin-top: 3rem;
	}

	.label {
		font-size: var(--font-size-compact);
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		color: var(--occ-purple);
		margin-bottom: 1rem;
	}

	.link-arrow {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: var(--font-size-sm);
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--occ-purple);
		transition: color var(--duration-normal) var(--ease-out);
	}

	.link-arrow:hover {
		color: var(--occ-glass-text);
	}

	.link-arrow-icon {
		width: 1rem;
		height: 1rem;
	}

	@media (min-width: 1024px) {
		.section-title { font-size: var(--font-size-3xl); }
	}

	/* ── Product Grid ── */
	.product-grid-3 {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1.5rem;
	}

	@media (min-width: 1024px) {
		.product-grid-3 {
			grid-template-columns: repeat(3, 1fr);
			gap: 2rem;
		}
	}

	/* ── Technique Highlights ── */
	.technique-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
	}

	.technique-card {
		display: block;
	}

	.technique-img-wrap {
		position: relative;
		overflow: hidden;
		border-radius: 2px;
		aspect-ratio: 4/3;
	}

	.technique-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform var(--duration-dramatic) var(--ease-out);
	}

	.technique-card:hover .technique-img {
		transform: scale(1.05);
	}

	.technique-gradient {
		position: absolute;
		inset: 0;
		background: linear-gradient(to top, rgba(26, 26, 26, 0.6), transparent);
	}

	.technique-name {
		position: absolute;
		bottom: 1rem;
		left: 1rem;
		color: white;
		font-size: 1.125rem;
		font-weight: 500;
	}

	.technique-desc {
		margin-top: 0.75rem;
		font-size: var(--font-size-sm);
		color: var(--occ-glass-text-dim);
		line-height: 1.625;
	}

	@media (min-width: 768px) {
		.technique-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	/* ── About Teaser ── */
	.about-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 3rem;
		align-items: center;
	}

	.about-images {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	.about-col {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.about-col.offset {
		padding-top: 2rem;
	}

	.about-img {
		width: 100%;
		border-radius: 2px;
		object-fit: cover;
	}

	.about-img.square { aspect-ratio: 1; }
	.about-img.portrait { aspect-ratio: 3/4; }

	.about-body {
		margin-top: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		color: var(--occ-glass-text-dim);
		font-size: var(--font-size-sm);
		line-height: 1.625;
	}

	.about-text .link-arrow {
		margin-top: 2rem;
	}

	@media (min-width: 1024px) {
		.about-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 5rem;
		}
	}

	/* ── Newsletter ── */
	.newsletter-section {
		text-align: center;
	}

	.newsletter-title {
		font-size: 1.5rem;
		font-weight: 300;
		color: var(--occ-glass-text);
	}

	.newsletter-subtitle {
		margin-top: 1rem;
		color: var(--occ-glass-text-dim);
		font-size: var(--font-size-sm);
	}

	.newsletter-form {
		margin-top: 2rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		max-width: 28rem;
		margin-left: auto;
		margin-right: auto;
	}

	.newsletter-input {
		flex: 1;
		padding: 0.75rem 1rem;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: white;
		font-size: var(--font-size-sm);
		font-family: inherit;
	}

	.newsletter-input::placeholder {
		color: rgba(255, 255, 255, 0.4);
	}

	.newsletter-input:focus {
		outline: none;
		border-color: rgba(255, 255, 255, 0.5);
	}

	.newsletter-btn {
		padding: 0.75rem 1.5rem;
		background: var(--occ-purple);
		color: white;
		font-size: var(--font-size-sm);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		transition: background var(--duration-normal) var(--ease-out);
	}

	.newsletter-btn:hover {
		background: var(--occ-purple-hover);
	}

	@media (min-width: 640px) {
		.newsletter-form {
			flex-direction: row;
		}
	}

	@media (min-width: 1024px) {
		.newsletter-title { font-size: var(--font-size-3xl); }
	}
</style>
