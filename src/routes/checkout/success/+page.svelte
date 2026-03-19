<script lang="ts">
	import { cart } from '$lib/stores/cart.svelte';
	import { browser } from '$app/environment';
	if (browser) cart.clear();
</script>

<div class="success-page">
	<div class="success-card">
		<div class="success-icon">&#10003;</div>
		<h1>Thank you for your order!</h1>
		<p>You'll receive a confirmation email shortly.</p>
		<a href="/shop" class="continue-btn">Continue Shopping</a>
	</div>
</div>

<style>
	.success-page { display: flex; align-items: center; justify-content: center; min-height: 60vh; padding: 24px; }
	.success-card { text-align: center; max-width: 400px; }
	.success-icon { width: 64px; height: 64px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 32px; background: #40b080; color: white; border-radius: 50%; }
	h1 { font-size: 24px; margin: 0 0 8px; }
	p { color: #666; margin: 0 0 24px; }
	.continue-btn { display: inline-block; padding: 12px 24px; background: #333; color: white; text-decoration: none; border-radius: 8px; }
</style>
