<script lang="ts">
	interface Props {
		open: boolean;
		title: string;
		message: string;
		confirmLabel?: string;
		danger?: boolean;
		onconfirm: () => void;
		oncancel: () => void;
	}

	const { open, title, message, confirmLabel = 'Confirm', danger = false, onconfirm, oncancel }: Props = $props();
</script>

{#if open}
	<div class="dialog-backdrop" onclick={oncancel} role="presentation"></div>
	<div class="dialog" role="alertdialog" aria-modal="true">
		<h3 class="dialog-title">{title}</h3>
		<p class="dialog-message">{message}</p>
		<div class="dialog-actions">
			<button class="btn btn-cancel" onclick={oncancel}>Cancel</button>
			<button class="btn" class:btn-danger={danger} class:btn-confirm={!danger} onclick={onconfirm}>{confirmLabel}</button>
		</div>
	</div>
{/if}

<style>
	.dialog-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 999; }
	.dialog { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 400px; max-width: 90vw; padding: 24px; background: var(--color-surface-raised, #232340); border: 1px solid var(--color-border, #3a3a5c); border-radius: 12px; z-index: 1000; }
	.dialog-title { font-size: 16px; font-weight: 700; color: var(--color-text, #e8e8f0); margin: 0 0 8px; }
	.dialog-message { font-size: 14px; color: var(--color-text-muted, #9090b0); margin: 0 0 20px; line-height: 1.5; }
	.dialog-actions { display: flex; justify-content: flex-end; gap: 8px; }
	.btn { padding: 8px 16px; font-size: 13px; font-weight: 600; border: none; border-radius: 8px; cursor: pointer; transition: background 0.15s; }
	.btn-cancel { background: var(--color-surface-hover, #303055); color: var(--color-text-muted, #9090b0); }
	.btn-cancel:hover { background: var(--color-surface-overlay, #2a2a4a); color: var(--color-text, #e8e8f0); }
	.btn-confirm { background: var(--color-accent, #7c5cbf); color: white; }
	.btn-confirm:hover { background: var(--color-accent-hover, #9070d0); }
	.btn-danger { background: var(--color-danger, #e04050); color: white; }
	.btn-danger:hover { background: var(--color-danger-hover, #f05060); }
</style>
