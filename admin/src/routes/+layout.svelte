<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';

	interface Props {
		children: import('svelte').Snippet;
	}

	const { children }: Props = $props();

	const navLinks = [
		{ href: '/media', label: 'Media' },
		{ href: '/tags', label: 'Tags' },
		{ href: '/seed', label: 'Seed' }
	];
</script>

<div class="app-layout">
	<header class="app-header">
		<a href="/" class="app-title">OCC Admin</a>
		<nav class="app-nav">
			{#each navLinks as link}
				<a
					href={link.href}
					class="nav-link"
					class:active={page.url.pathname.startsWith(link.href)}
				>
					{link.label}
				</a>
			{/each}
		</nav>
	</header>

	<main class="app-main">
		{@render children()}
	</main>
</div>

<style>
	.app-layout {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.app-header {
		display: flex;
		align-items: center;
		gap: 24px;
		padding: 0 20px;
		height: 48px;
		background: var(--color-surface-raised);
		border-bottom: 1px solid var(--color-border);
		flex-shrink: 0;
	}

	.app-title {
		font-size: 15px;
		font-weight: 700;
		color: var(--color-text);
		text-decoration: none;
		letter-spacing: 0.02em;
	}

	.app-nav {
		display: flex;
		gap: 4px;
	}

	.nav-link {
		padding: 6px 14px;
		font-size: 13px;
		font-weight: 500;
		color: var(--color-text-muted);
		text-decoration: none;
		border-radius: 6px;
		transition: color 0.15s, background 0.15s;
	}

	.nav-link:hover {
		color: var(--color-text);
		background: var(--color-surface-hover);
	}

	.nav-link.active {
		color: var(--color-text);
		background: var(--color-surface-overlay);
	}

	.app-main {
		flex: 1;
		overflow: auto;
	}
</style>
