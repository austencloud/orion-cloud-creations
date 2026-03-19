<script lang="ts">
	import '../../app.css';
	import '$lib/admin/admin.css';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { onAuthStateChanged } from '$lib/admin/services/auth';
	import AdminSidebar from '$lib/admin/components/navigation/AdminSidebar.svelte';
	import AdminMobileNav from '$lib/admin/components/navigation/AdminMobileNav.svelte';
	import { moduleRoutes, sectionRoutes } from '$lib/admin/components/navigation/admin-modules';
	import type { User } from 'firebase/auth';

	interface Props {
		children: import('svelte').Snippet;
	}

	const { children }: Props = $props();

	let user = $state<User | null>(null);
	let authChecked = $state(false);
	let sidebarCollapsed = $state(false);
	let showMobileMenu = $state(false);
	let currentModule = $state('dashboard');
	let currentSection = $state('');

	$effect(() => {
		if (!browser) return;
		const unsubscribe = onAuthStateChanged((u) => {
			user = u;
			authChecked = true;
			if (!u && !page.url.pathname.includes('/admin/login')) {
				goto('/admin/login');
			}
		});
		return unsubscribe;
	});

	$effect(() => {
		const path = page.url.pathname;
		if (path === '/admin' || path === '/admin/') {
			currentModule = 'dashboard';
			currentSection = '';
		} else {
			for (const [moduleId, route] of Object.entries(moduleRoutes)) {
				if (moduleId !== 'dashboard' && path.startsWith(route)) {
					currentModule = moduleId;
					const sections = sectionRoutes[moduleId];
					if (sections) {
						let matched = false;
						for (const [sectionId, sectionRoute] of Object.entries(sections)) {
							if (path === sectionRoute || path.startsWith(sectionRoute + '/')) {
								currentSection = sectionId;
								matched = true;
								break;
							}
						}
						if (!matched) currentSection = Object.keys(sections)[0] || '';
					} else {
						currentSection = '';
					}
					break;
				}
			}
		}
		showMobileMenu = false;
	});

	let isLoginPage = $derived(page.url.pathname.includes('/admin/login'));
</script>

<div class="admin-theme">
	{#if isLoginPage}
		{@render children()}
	{:else if !authChecked}
		<div class="auth-loading"><div class="spinner"></div></div>
	{:else if user}
		<div class="admin-layout" class:sidebar-collapsed={sidebarCollapsed}>
			<header class="mobile-header">
				<button class="hamburger" onclick={() => showMobileMenu = true} aria-label="Open menu">
					<span></span><span></span><span></span>
				</button>
				<span class="mobile-title">OCC Admin</span>
			</header>
			<div class="sidebar-wrapper">
				<AdminSidebar {currentModule} {currentSection} bind:collapsed={sidebarCollapsed} />
			</div>
			<AdminMobileNav isOpen={showMobileMenu} {currentModule} onClose={() => showMobileMenu = false} />
			<main class="admin-main">{@render children()}</main>
		</div>
	{/if}
</div>

<style>
	.admin-layout { display: flex; min-height: 100vh; }
	.sidebar-wrapper { position: fixed; left: 0; top: 0; bottom: 0; z-index: 150; display: none; }
	.admin-main { flex: 1; overflow-y: auto; min-height: 100vh; }
	.mobile-header { display: flex; align-items: center; gap: 12px; padding: 0 16px; height: 48px; background: var(--color-surface-raised); border-bottom: 1px solid var(--color-border); }
	.hamburger { display: flex; flex-direction: column; gap: 4px; padding: 8px; background: none; border: none; cursor: pointer; }
	.hamburger span { display: block; width: 18px; height: 2px; background: var(--color-text-muted); border-radius: 1px; }
	.mobile-title { font-size: 14px; font-weight: 700; color: var(--color-text); }
	.auth-loading { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: var(--color-surface); }
	.spinner { width: 32px; height: 32px; border: 3px solid var(--color-border); border-top-color: var(--color-accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
	@keyframes spin { to { transform: rotate(360deg); } }
	@media (min-width: 1024px) {
		.mobile-header { display: none; }
		.sidebar-wrapper { display: block; }
		.admin-main { margin-left: var(--sidebar-width, 220px); transition: margin-left 280ms cubic-bezier(0.16, 1, 0.3, 1); }
		.sidebar-collapsed .admin-main { margin-left: var(--sidebar-collapsed-width, 64px); }
	}
</style>
