<script lang="ts">
	import '@fortawesome/fontawesome-free/css/all.min.css';
	import { Sidebar } from '@austencloud/sidebar';
	import { adminModules, moduleRoutes, sectionRoutes } from './admin-modules';
	import { goto } from '$app/navigation';
	import { signOut } from '$lib/admin/services/auth';

	/** Map kebab-case icon names to Font Awesome class format */
	function faClass(name: string): string {
		return `fa-solid fa-${name}`;
	}

	interface Props {
		currentModule: string;
		currentSection: string;
		collapsed?: boolean;
	}

	let {
		currentModule,
		currentSection,
		collapsed = $bindable(false)
	}: Props = $props();

	function handleModuleChange(moduleId: string) {
		const route = moduleRoutes[moduleId];
		if (route) goto(route);
	}

	function handleSectionChange(sectionId: string) {
		const route = sectionRoutes[currentModule]?.[sectionId];
		if (route) goto(route);
	}

	function toggleCollapse() {
		collapsed = !collapsed;
	}

	async function handleSignOut() {
		await signOut();
		goto('/admin/login');
	}
</script>

<Sidebar
	modules={adminModules}
	{currentModule}
	{currentSection}
	onModuleChange={handleModuleChange}
	onSectionChange={handleSectionChange}
	collapsible
	bind:collapsed
	collapseStorageKey="occ-admin-sidebar-collapsed"
	class="admin-sidebar"
>
	{#snippet renderIcon(name: string, size: number)}
		<i class={faClass(name)} style="font-size: {size}px"></i>
	{/snippet}

	{#snippet header(isCollapsed: boolean)}
		<div class="sidebar-header" class:collapsed={isCollapsed}>
			<div class="brand">
				<span class="logo-badge">OCC</span>
				{#if !isCollapsed}
					<span class="brand-name">Admin</span>
				{/if}
			</div>
			<button
				class="collapse-toggle"
				onclick={toggleCollapse}
				aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
			>
				<i class="fa-solid fa-chevron-left chevron" class:rotated={isCollapsed} style="font-size: 12px"></i>
			</button>
		</div>
	{/snippet}

	{#snippet footer(isCollapsed: boolean)}
		<div class="sidebar-footer" class:collapsed={isCollapsed}>
			<a href="/" class="footer-link">
				<i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 14px"></i>
				{#if !isCollapsed}<span>Storefront</span>{/if}
			</a>
			<button class="footer-link" onclick={handleSignOut}>
				<i class="fa-solid fa-right-from-bracket" style="font-size: 14px"></i>
				{#if !isCollapsed}<span>Sign Out</span>{/if}
			</button>
		</div>
	{/snippet}
</Sidebar>

<style>
	.sidebar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 12px 12px;
		border-bottom: 1px solid var(--sidebar-border, rgba(255, 255, 255, 0.08));
	}

	.sidebar-header.collapsed {
		flex-direction: column;
		gap: 8px;
		padding: 12px 4px;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.logo-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 10px;
		background: linear-gradient(135deg, #7c5cbf 0%, #208070 100%);
		color: white;
		font-size: 11px;
		font-weight: 800;
		letter-spacing: 0.04em;
		flex-shrink: 0;
	}

	.brand-name {
		font-size: 15px;
		font-weight: 700;
		color: var(--sidebar-text, rgba(255, 255, 255, 0.95));
		letter-spacing: 0.02em;
	}

	.collapse-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border: none;
		background: transparent;
		border-radius: 6px;
		color: var(--sidebar-text-dim, rgba(255, 255, 255, 0.5));
		cursor: pointer;
		font-size: 18px;
		transition: background 0.15s, color 0.15s;
	}

	.collapse-toggle:hover {
		background: var(--sidebar-hover-bg, rgba(255, 255, 255, 0.06));
		color: var(--sidebar-text, rgba(255, 255, 255, 0.95));
	}

	.chevron {
		display: inline-block;
		transition: transform 0.2s;
	}

	.chevron.rotated {
		transform: rotate(180deg);
	}

	.sidebar-footer {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 8px;
		border-top: 1px solid var(--sidebar-border, rgba(255, 255, 255, 0.08));
	}

	.sidebar-footer.collapsed {
		align-items: center;
		padding: 8px 4px;
	}

	.footer-link {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 12px;
		font-size: 13px;
		font-weight: 500;
		color: var(--sidebar-text-dim, rgba(255, 255, 255, 0.5));
		text-decoration: none;
		border: none;
		background: none;
		border-radius: 8px;
		cursor: pointer;
		transition: color 0.15s, background 0.15s;
		width: 100%;
	}

	.footer-link:hover {
		color: var(--sidebar-text, rgba(255, 255, 255, 0.95));
		background: var(--sidebar-hover-bg, rgba(255, 255, 255, 0.06));
	}

	.collapsed .footer-link {
		justify-content: center;
		padding: 8px;
	}

	.footer-icon {
		font-size: 16px;
		flex-shrink: 0;
	}
</style>
