<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { getBackgroundController, BackgroundType } from '@austencloud/backgrounds';
	import type { IBackgroundController } from '@austencloud/backgrounds';

	let container: HTMLDivElement;
	let controller: IBackgroundController | null = null;

	onMount(() => {
		if (!browser) return;
		controller = getBackgroundController();
		controller.mount(container);
		controller.setBackground(BackgroundType.DEEP_OCEAN);
	});

	onDestroy(() => {
		controller?.unmount();
	});
</script>

<div class="background-canvas-container" bind:this={container}></div>
