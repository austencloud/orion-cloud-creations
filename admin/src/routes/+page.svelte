<script lang="ts">
	import { goto } from '$app/navigation';

	$effect(() => {
		goto('/media', { replaceState: true });
	});
</script>
