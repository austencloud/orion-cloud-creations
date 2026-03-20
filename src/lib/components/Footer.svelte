<footer class="footer">
	<div class="footer-inner">
		<div class="footer-grid">
			<div>
				<img
					src="/images/logo.png"
					alt="Orion Cloud Creations"
					class="footer-logo"
				/>
				<p class="brand-desc">
					Handmade tie-dye clothing from Chicago. Professional Procion fiber reactive dyes on 100% cotton. Every piece dyed by hand, one at a time.
				</p>
			</div>

			<div>
				<h3 class="footer-heading">Explore</h3>
				<div class="footer-links">
					<a href="/shop">Shop All</a>
					<a href="/gallery">Gallery</a>
					<a href="/techniques">Techniques</a>
					<a href="/about">About the Artist</a>
				</div>
			</div>

			<div>
				<h3 class="footer-heading">Info</h3>
				<div class="footer-links">
					<p>Handmade in Chicago, IL</p>
					<a href="mailto:austencloud@gmail.com">austencloud@gmail.com</a>
					<p class="copyright">
						&copy; {new Date().getFullYear()} Orion Cloud Creations
					</p>
				</div>
			</div>
		</div>
	</div>
</footer>

<style>
	.footer {
		background: var(--occ-glass-bg);
		backdrop-filter: blur(var(--occ-glass-blur));
		-webkit-backdrop-filter: blur(var(--occ-glass-blur));
		border-top: 1px solid var(--occ-glass-border);
		border-radius: var(--occ-glass-radius) var(--occ-glass-radius) 0 0;
		color: var(--occ-glass-text-dim);
		margin-top: 2rem;
	}

	.footer-inner {
		max-width: 80rem;
		margin: 0 auto;
		padding: 4rem var(--spacing-md);
	}

	.footer-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 3rem;
	}

	.footer-logo {
		height: 2rem;
		width: auto;
		filter: invert(1) brightness(2);
		margin-bottom: 1rem;
	}

	.brand-desc {
		font-size: var(--font-size-sm);
		line-height: 1.625;
		max-width: 20rem;
	}

	.footer-heading {
		color: var(--occ-glass-text);
		font-size: var(--font-size-sm);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 1rem;
	}

	.footer-links {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.footer-links a,
	.footer-links p {
		font-size: var(--font-size-sm);
	}

	.footer-links a {
		transition: color var(--duration-normal) var(--ease-out);
	}

	.footer-links a:hover {
		color: white;
	}

	.copyright {
		margin-top: 1rem;
		color: var(--occ-glass-text-muted);
	}

	@media (min-width: 768px) {
		.footer-grid {
			grid-template-columns: repeat(3, 1fr);
			gap: 4rem;
		}
	}

	@media (min-width: 1024px) {
		.footer-inner {
			padding: 5rem var(--spacing-lg);
		}
	}
</style>
