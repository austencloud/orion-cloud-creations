<svelte:head>
	<title>About | Orion Cloud Creations</title>
	<meta name="description" content="Meet Austen Cloud, the artist behind Orion Cloud Creations. Chicago-based circus artist and professional dyer." />
</svelte:head>

<div class="page">
	<div class="page-header">
		<p class="label">About the Artist</p>
		<h1 class="page-title">Circus artist. Fire dancer. Dyer.</h1>
	</div>

	<div class="content-grid">
		<div class="story">
			<p>
				I'm Austen Cloud, based in Chicago. I started dyeing in 2017 because I wanted clothes that matched what I saw in my head while spinning fire. Nothing on the rack came close, so I made my own.
			</p>
			<p>
				What started as personal pieces turned into Orion Cloud Creations. The name comes from looking up at the night sky after a long dye session and seeing Orion's belt. Felt right for something made with patience and attention to the universe's color palette.
			</p>
			<p>
				I use Procion MX fiber reactive dyes exclusively. These aren't the dyes from a kit at the craft store. Procion MX forms a covalent bond with cellulose fiber at the molecular level. The dye becomes part of the cotton. It won't fade in the wash, won't bleed onto other clothes, and won't crack or peel. Twenty years from now, the colors will still be there.
			</p>
			<p>
				Every piece is 100% cotton. I use garment blanks from Gildan, Dharma Trading, and a few other suppliers I trust. The cotton quality matters because the dye can only bond with natural fiber. Polyester blends won't take the dye properly. I'm particular about this.
			</p>
			<p>
				I'm also a circus performer and choreographer with my company Cirque Aflame. Fire dancing, partner acrobatics, aerial work. The overlap between circus and dye work isn't obvious, but it's real. Both require precision, patience, and comfort with things you can't fully control.
			</p>

			<div class="differentiators">
				<h3 class="diff-heading">What Makes This Different</h3>
				<ul class="diff-list">
					<li>
						<span class="check-icon">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
							</svg>
						</span>
						<span><strong>Procion MX dyes</strong> form a permanent molecular bond with cotton. No fading, no bleeding.</span>
					</li>
					<li>
						<span class="check-icon">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
							</svg>
						</span>
						<span><strong>100% cotton only.</strong> Natural fiber takes dye completely. The color goes all the way through.</span>
					</li>
					<li>
						<span class="check-icon">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
							</svg>
						</span>
						<span><strong>One person, start to finish.</strong> Folding, binding, dyeing, rinsing, washing, drying. All me.</span>
					</li>
					<li>
						<span class="check-icon">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
							</svg>
						</span>
						<span><strong>Ice dye technique.</strong> Dye powder applied over ice. The melt creates patterns no human hand could replicate.</span>
					</li>
				</ul>
			</div>
		</div>

		<div class="images">
			<img
				src="/images/process/procion-dyes.jpg"
				alt="Collection of labeled Procion MX fiber reactive dye powders in containers"
				class="img landscape"
				loading="lazy"
			/>
			<div class="image-pair">
				<img
					src="/images/process/pre-dye-prep.jpg"
					alt="Cotton shirts tied, bound, and prepared for ice dye application"
					class="img square"
					loading="lazy"
				/>
				<img
					src="/images/process/dye-rack.jpg"
					alt="Freshly dyed garments on a wire rack with vibrant blue and green dyes"
					class="img square"
					loading="lazy"
				/>
			</div>
			<img
				src="/images/products/sunset-ice-crackle.jpg"
				alt="Finished sunset gradient ice crackle t-shirt showing the final result"
				class="img landscape"
				loading="lazy"
			/>
		</div>
	</div>
</div>

<style>
	.page {
		max-width: 80rem;
		margin: 0 auto;
		padding: 3rem var(--spacing-md);
	}

	.page-header {
		max-width: 42rem;
		margin-bottom: 4rem;
	}

	.label {
		font-size: var(--font-size-compact);
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		color: var(--occ-purple);
		margin-bottom: 1rem;
	}

	.page-title {
		font-size: var(--font-size-3xl);
		font-weight: 300;
		color: var(--occ-charcoal);
		line-height: 1.375;
	}

	.content-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 4rem;
	}

	.story {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		color: var(--occ-muted);
		line-height: 1.625;
	}

	.differentiators {
		padding-top: 1.5rem;
		border-top: 1px solid var(--occ-border-light);
	}

	.diff-heading {
		color: var(--occ-charcoal);
		font-weight: 500;
		font-size: var(--font-size-sm);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 1rem;
	}

	.diff-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		font-size: var(--font-size-sm);
	}

	.diff-list li {
		display: flex;
		gap: 0.75rem;
	}

	.check-icon {
		color: var(--occ-purple);
		margin-top: 0.125rem;
		flex-shrink: 0;
	}

	.check-icon svg {
		width: 1rem;
		height: 1rem;
	}

	.diff-list strong {
		color: var(--occ-charcoal);
	}

	.images {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.image-pair {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	.img {
		width: 100%;
		border-radius: 2px;
		object-fit: cover;
	}

	.img.landscape { aspect-ratio: 4/3; }
	.img.square { aspect-ratio: 1; }

	@media (min-width: 1024px) {
		.page {
			padding: 4rem var(--spacing-lg);
		}

		.page-title {
			font-size: 2.25rem;
		}

		.content-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 6rem;
		}
	}
</style>
