<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import BackgroundCanvas from '$lib/components/BackgroundCanvas.svelte';
	import { page } from '$app/state';

	let { children } = $props();

	let isAdmin = $derived(page.url.pathname.startsWith('/admin'));
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

{#if isAdmin}
	{@render children()}
{:else}
	<BackgroundCanvas />
	<div class="shell">
		<Header />
		<main class="main">
			{@render children()}
		</main>
		<Footer />
	</div>
{/if}

<style>
	.shell {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		position: relative;
		z-index: 0;
	}

	.main {
		flex: 1;
		padding-top: 4rem;
	}

	@media (min-width: 1024px) {
		.main {
			padding-top: 5rem;
		}
	}
</style>
