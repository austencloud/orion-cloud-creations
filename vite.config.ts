import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	ssr: {
		noExternal: [
			'@austencloud/media-manager',
			'@austencloud/media-spotlight',
			'@austencloud/sidebar',
			'@austencloud/backgrounds',
			'@austencloud/theme'
		]
	}
});
