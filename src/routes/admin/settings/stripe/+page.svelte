<script lang="ts">
	import { browser } from '$app/environment';
	import FormField from '$lib/admin/components/ui/FormField.svelte';
	import { settingsService } from '$lib/admin/services/settings';

	const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '';
	const hasSecretKey = !!import.meta.env.VITE_STRIPE_SECRET_KEY;

	let savedKey = $state(publishableKey);
	let saving = $state(false);
	let successMsg = $state<string | null>(null);
	let error = $state<string | null>(null);

	async function handleSave() {
		saving = true;
		error = null;
		successMsg = null;
		try {
			await settingsService.update({ stripePublishableKey: savedKey.trim() });
			successMsg = 'Stripe settings saved';
			setTimeout(() => successMsg = null, 3000);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to save';
		} finally {
			saving = false;
		}
	}
</script>

<div class="page">
	<div class="page-header">
		<a href="/admin/settings" class="back-btn">&larr; Settings</a>
		<h1 class="page-title">Stripe Integration</h1>
	</div>

	{#if error}<div class="error-banner">{error}</div>{/if}
	{#if successMsg}<div class="success-banner">{successMsg}</div>{/if}

	<!-- Key Status -->
	<section class="card">
		<h2 class="card-title">Key Status</h2>
		<div class="status-rows">
			<div class="status-row">
				<span class="status-label">Publishable Key</span>
				<span class="status-badge" class:configured={!!publishableKey}>
					{publishableKey ? 'Configured' : 'Not set'}
				</span>
			</div>
			<div class="status-row">
				<span class="status-label">Secret Key</span>
				<span class="status-badge" class:configured={hasSecretKey}>
					{hasSecretKey ? 'Configured' : 'Not set'}
				</span>
				<span class="status-hint">Server-side only — set in .env, never stored in DB</span>
			</div>
		</div>
	</section>

	<!-- Publishable Key Input -->
	<section class="card">
		<h2 class="card-title">Publishable Key</h2>
		<p class="card-description">
			The publishable key is safe to expose client-side. It starts with <code>pk_live_</code> or <code>pk_test_</code>.
		</p>
		<FormField label="VITE_STRIPE_PUBLISHABLE_KEY">
			<input
				class="input mono"
				type="text"
				bind:value={savedKey}
				placeholder="pk_live_..."
			/>
		</FormField>
		<button class="save-btn" onclick={handleSave} disabled={saving}>
			{saving ? 'Saving...' : 'Save Publishable Key'}
		</button>
	</section>

	<!-- Setup Instructions -->
	<section class="card">
		<h2 class="card-title">Setup Instructions</h2>
		<ol class="instructions">
			<li>Go to <a class="ext-link" href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener">Stripe Dashboard &rarr; API Keys</a></li>
			<li>Copy your <strong>Publishable key</strong> (starts with <code>pk_</code>) and paste it above.</li>
			<li>
				Add the following to your <code>.env</code> file in the project root:
				<pre class="code-block">VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...</pre>
			</li>
			<li>The secret key is never stored in Firestore — it stays only in your .env and is accessed server-side.</li>
			<li>Restart the dev server after editing .env.</li>
		</ol>
	</section>
</div>

<style>
	.page { padding: 24px; max-width: 720px; }
	.page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
	.back-btn { font-size: 13px; color: var(--color-text-muted); text-decoration: none; }
	.back-btn:hover { color: var(--color-text); }
	.page-title { font-size: 20px; font-weight: 700; color: var(--color-text); margin: 0; }
	.error-banner { padding: 10px 16px; font-size: 13px; color: var(--color-danger); background: color-mix(in srgb, var(--color-danger) 10%, transparent); border: 1px solid color-mix(in srgb, var(--color-danger) 25%, transparent); border-radius: 8px; margin-bottom: 16px; }
	.success-banner { padding: 10px 16px; font-size: 13px; color: var(--color-success); background: color-mix(in srgb, var(--color-success) 10%, transparent); border: 1px solid color-mix(in srgb, var(--color-success) 25%, transparent); border-radius: 8px; margin-bottom: 16px; }
	.card { background: var(--color-card-bg); border: 1px solid var(--color-card-border); border-radius: 12px; padding: 20px; margin-bottom: 16px; }
	.card-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); margin: 0 0 16px; }
	.card-description { font-size: 13px; color: var(--color-text-muted); margin: -8px 0 16px; line-height: 1.6; }
	.status-rows { display: flex; flex-direction: column; gap: 12px; }
	.status-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
	.status-label { font-size: 13px; font-weight: 500; color: var(--color-text); font-family: monospace; }
	.status-badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; background: color-mix(in srgb, var(--color-danger) 15%, transparent); color: var(--color-danger); }
	.status-badge.configured { background: color-mix(in srgb, var(--color-success) 15%, transparent); color: var(--color-success); }
	.status-hint { font-size: 11px; color: var(--color-text-dim); }
	.input { width: 100%; padding: 8px 12px; font-size: 13px; background: var(--color-surface-raised); border: 1px solid var(--color-border); border-radius: 8px; color: var(--color-text); outline: none; transition: border-color 0.15s; box-sizing: border-box; }
	.input:focus { border-color: var(--color-accent); }
	.mono { font-family: monospace; }
	.save-btn { margin-top: 12px; padding: 9px 24px; font-size: 13px; font-weight: 600; background: var(--color-accent); color: white; border: none; border-radius: 8px; cursor: pointer; transition: background 0.15s; }
	.save-btn:hover:not(:disabled) { background: var(--color-accent-hover); }
	.save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
	.instructions { padding-left: 20px; margin: 0; display: flex; flex-direction: column; gap: 10px; }
	.instructions li { font-size: 13px; color: var(--color-text-muted); line-height: 1.6; }
	.instructions strong { color: var(--color-text); }
	.ext-link { color: var(--color-accent); text-decoration: none; }
	.ext-link:hover { text-decoration: underline; }
	code { font-family: monospace; font-size: 12px; background: var(--color-surface-overlay); padding: 1px 5px; border-radius: 4px; color: var(--color-text-muted); }
	.code-block { font-family: monospace; font-size: 12px; background: var(--color-surface-raised); border: 1px solid var(--color-border); border-radius: 8px; padding: 12px; margin: 8px 0 0; color: var(--color-text-muted); white-space: pre; overflow-x: auto; }
</style>
