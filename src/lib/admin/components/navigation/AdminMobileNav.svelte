<script lang="ts">
	import { adminModules, moduleRoutes } from './admin-modules';
	import { goto } from '$app/navigation';

	interface Props {
		isOpen: boolean;
		currentModule: string;
		onClose: () => void;
	}

	let { isOpen, currentModule, onClose }: Props = $props();

	function handleNav(moduleId: string) {
		const route = moduleRoutes[moduleId];
		if (route) goto(route);
		onClose();
	}
</script>

{#if isOpen}
	<div class="mobile-nav-backdrop" onclick={onClose} role="presentation"></div>
	<nav class="mobile-nav" aria-label="Admin navigation">
		<div class="mobile-nav-header">
			<span class="mobile-nav-title">OCC Admin</span>
			<button class="mobile-nav-close" onclick={onClose} aria-label="Close navigation">&times;</button>
		</div>
		<div class="mobile-nav-items">
			{#each adminModules.filter(m => m.isMain) as mod}
				<button
					class="mobile-nav-item"
					class:active={mod.id === currentModule}
					onclick={() => handleNav(mod.id)}
				>
					<span class="mobile-nav-dot" style="background: {mod.color}"></span>
					<span>{mod.label}</span>
				</button>
			{/each}
		</div>
		<div class="mobile-nav-footer">
			<a href="/" class="mobile-nav-item">&#8599; Storefront</a>
		</div>
	</nav>
{/if}

<style>
	.mobile-nav-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
		z-index: 199;
	}

	.mobile-nav {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		width: 280px;
		background: var(--color-surface-raised, #232340);
		border-right: 1px solid var(--color-border, #3a3a5c);
		z-index: 200;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
	}

	.mobile-nav-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px;
		border-bottom: 1px solid var(--color-border, #3a3a5c);
	}

	.mobile-nav-title {
		font-size: 15px;
		font-weight: 700;
		color: var(--color-text, #e8e8f0);
	}

	.mobile-nav-close {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		background: transparent;
		color: var(--color-text-muted, #9090b0);
		font-size: 24px;
		cursor: pointer;
		border-radius: 6px;
	}

	.mobile-nav-close:hover {
		background: var(--color-surface-hover, #303055);
		color: var(--color-text, #e8e8f0);
	}

	.mobile-nav-items {
		flex: 1;
		padding: 8px;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.mobile-nav-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		font-size: 14px;
		font-weight: 500;
		color: var(--color-text-muted, #9090b0);
		text-decoration: none;
		border: none;
		background: none;
		border-radius: 8px;
		cursor: pointer;
		width: 100%;
		text-align: left;
		transition: color 0.15s, background 0.15s;
	}

	.mobile-nav-item:hover {
		color: var(--color-text, #e8e8f0);
		background: var(--color-surface-hover, #303055);
	}

	.mobile-nav-item.active {
		color: var(--color-text, #e8e8f0);
		background: var(--color-surface-overlay, #2a2a4a);
	}

	.mobile-nav-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.mobile-nav-footer {
		padding: 8px;
		border-top: 1px solid var(--color-border, #3a3a5c);
	}
</style>
