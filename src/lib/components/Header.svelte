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

<header class="fixed top-0 left-0 right-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-border-light">
	<nav class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between lg:h-20">
			<!-- Logo -->
			<a href="/" class="flex items-center gap-3 no-underline">
				<img
					src="/images/logo.png"
					alt="Orion Cloud Creations"
					class="h-8 lg:h-10 w-auto"
				/>
			</a>

			<!-- Desktop Nav -->
			<div class="hidden lg:flex items-center gap-10">
				{#each navLinks as link}
					<a
						href={link.href}
						class="text-sm font-medium tracking-wide uppercase text-muted hover:text-charcoal transition-colors duration-200"
					>
						{link.label}
					</a>
				{/each}
			</div>

			<!-- Cart (placeholder) -->
			<div class="flex items-center gap-4">
				<button
					class="relative p-2 text-muted hover:text-charcoal transition-colors"
					aria-label="Shopping cart"
				>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
						<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
					</svg>
				</button>

				<!-- Mobile menu button -->
				<button
					class="lg:hidden p-2 text-muted hover:text-charcoal"
					onclick={toggleMenu}
					aria-label="Toggle menu"
					aria-expanded={mobileMenuOpen}
				>
					{#if mobileMenuOpen}
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
						</svg>
					{:else}
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
							<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
						</svg>
					{/if}
				</button>
			</div>
		</div>

		<!-- Mobile menu -->
		{#if mobileMenuOpen}
			<div class="lg:hidden border-t border-border-light pb-6 pt-4">
				<div class="flex flex-col gap-4">
					{#each navLinks as link}
						<a
							href={link.href}
							class="text-base font-medium tracking-wide uppercase text-muted hover:text-charcoal transition-colors px-2 py-2"
							onclick={() => mobileMenuOpen = false}
						>
							{link.label}
						</a>
					{/each}
				</div>
			</div>
		{/if}
	</nav>
</header>
