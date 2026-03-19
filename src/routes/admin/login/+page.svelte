<script lang="ts">
	import { signInWithGoogle } from '$lib/admin/services/auth';
	import { goto } from '$app/navigation';

	let loading = $state(false);
	let error = $state<string | null>(null);

	async function handleSignIn() {
		loading = true;
		error = null;
		try {
			const user = await signInWithGoogle();
			if (user) goto('/admin');
		} catch (e) {
			error = e instanceof Error ? e.message : 'Sign in failed';
		} finally {
			loading = false;
		}
	}
</script>

<div class="login-page">
	<div class="login-card">
		<div class="login-brand">
			<span class="login-badge">OCC</span>
			<h1 class="login-title">Admin</h1>
		</div>
		<p class="login-subtitle">Sign in to manage your store</p>
		{#if error}<div class="login-error">{error}</div>{/if}
		<button class="google-btn" onclick={handleSignIn} disabled={loading}>
			{loading ? 'Signing in...' : 'Sign in with Google'}
		</button>
		<a href="/" class="back-link">&larr; Back to storefront</a>
	</div>
</div>

<style>
	.login-page { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: var(--color-surface); }
	.login-card { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 40px; background: var(--color-surface-raised); border: 1px solid var(--color-border); border-radius: 16px; width: 360px; max-width: 90vw; }
	.login-brand { display: flex; align-items: center; gap: 12px; }
	.login-badge { display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, var(--color-accent) 0%, #208070 100%); color: white; font-size: 14px; font-weight: 800; }
	.login-title { font-size: 24px; font-weight: 700; color: var(--color-text); margin: 0; }
	.login-subtitle { font-size: 14px; color: var(--color-text-muted); margin: 0; }
	.login-error { padding: 10px 16px; font-size: 13px; color: var(--color-danger); background: color-mix(in srgb, var(--color-danger) 10%, transparent); border: 1px solid color-mix(in srgb, var(--color-danger) 25%, transparent); border-radius: 8px; width: 100%; text-align: center; }
	.google-btn { width: 100%; padding: 12px; font-size: 14px; font-weight: 600; background: var(--color-accent); color: white; border: none; border-radius: 10px; cursor: pointer; transition: background 0.15s; }
	.google-btn:hover:not(:disabled) { background: var(--color-accent-hover); }
	.google-btn:disabled { opacity: 0.6; cursor: not-allowed; }
	.back-link { font-size: 13px; color: var(--color-text-dim); text-decoration: none; }
	.back-link:hover { color: var(--color-text-muted); }
</style>
