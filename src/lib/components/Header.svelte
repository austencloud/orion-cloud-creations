<script lang="ts">
	let mobileMenuOpen = $state(false);

	function toggleMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	const navLinks = [
		{ href: '/shop', label: 'Shop' },
		{ href: '/gallery', label: 'Gallery' },
		{ href: '/techniques', label: 'Techniques' },
		{ href: '/about', label: 'About' }
	];
</script>

<header class="header">
	<nav class="nav">
		<div class="nav-inner">
			<a href="/" class="logo-link">
				<img src="/images/logo.png" alt="Orion Cloud Creations" class="logo" />
			</a>

			<div class="desktop-nav">
				{#each navLinks as link}
					<a href={link.href} class="nav-link">{link.label}</a>
				{/each}
			</div>

			<div class="actions">
				<button class="cart-btn" aria-label="Shopping cart">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon">
						<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
					</svg>
				</button>

				<button
					class="menu-btn"
					onclick={toggleMenu}
					aria-label="Toggle menu"
					aria-expanded={mobileMenuOpen}
				>
					{#if mobileMenuOpen}
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon">
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
						</svg>
					{:else}
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon">
							<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
						</svg>
					{/if}
				</button>
			</div>
		</div>

		{#if mobileMenuOpen}
			<div class="mobile-menu">
				{#each navLinks as link}
					<a
						href={link.href}
						class="mobile-link"
						onclick={() => (mobileMenuOpen = false)}
					>
						{link.label}
					</a>
				{/each}
			</div>
		{/if}
	</nav>
</header>

<style>
	.header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 50;
		background: rgba(250, 249, 246, 0.95);
		backdrop-filter: blur(4px);
		border-bottom: 1px solid var(--occ-border-light);
	}

	.nav {
		max-width: 80rem;
		margin: 0 auto;
		padding: 0 var(--spacing-md);
	}

	.nav-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 4rem;
	}

	.logo-link {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.logo {
		height: 2rem;
		width: auto;
	}

	.desktop-nav {
		display: none;
		align-items: center;
		gap: 2.5rem;
	}

	.nav-link {
		font-size: var(--font-size-sm);
		font-weight: 500;
		letter-spacing: 0.025em;
		text-transform: uppercase;
		color: var(--occ-muted);
		transition: color var(--duration-normal) var(--ease-out);
	}

	.nav-link:hover {
		color: var(--occ-charcoal);
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.cart-btn,
	.menu-btn {
		position: relative;
		padding: 0.5rem;
		color: var(--occ-muted);
		transition: color var(--duration-normal) var(--ease-out);
	}

	.cart-btn:hover,
	.menu-btn:hover {
		color: var(--occ-charcoal);
	}

	.icon {
		width: 1.5rem;
		height: 1.5rem;
	}

	.menu-btn {
		display: block;
	}

	.mobile-menu {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		border-top: 1px solid var(--occ-border-light);
		padding: 1rem 0 1.5rem;
	}

	.mobile-link {
		font-size: 1rem;
		font-weight: 500;
		letter-spacing: 0.025em;
		text-transform: uppercase;
		color: var(--occ-muted);
		padding: 0.5rem;
		transition: color var(--duration-normal) var(--ease-out);
	}

	.mobile-link:hover {
		color: var(--occ-charcoal);
	}

	@media (min-width: 1024px) {
		.nav {
			padding: 0 var(--spacing-lg);
		}

		.nav-inner {
			height: 5rem;
		}

		.logo {
			height: 2.5rem;
		}

		.desktop-nav {
			display: flex;
		}

		.menu-btn {
			display: none;
		}

		.mobile-menu {
			display: none;
		}
	}
</style>
