<!--
	WizardStepHeader.svelte — Instruction bar for each wizard step.
	Shows "Select all [tag]" with progress and action buttons.
-->
<script lang="ts">
	import type { MediaTag } from '@austencloud/media-manager';
	import { getTagHex } from '@austencloud/media-manager';

	interface Props {
		tag: MediaTag;
		categoryLabel: string;
		stepIndex: number;
		totalSteps: number;
		selectedCount: number;
		totalItems: number;
		alreadyTaggedCount: number;
		onapply: () => void;
		onskip: () => void;
		onskipcategory: () => void;
		onselectall: () => void;
		ondeselectall: () => void;
		onexit: () => void;
	}

	const {
		tag, categoryLabel, stepIndex, totalSteps,
		selectedCount, totalItems, alreadyTaggedCount,
		onapply, onskip, onskipcategory,
		onselectall, ondeselectall, onexit
	}: Props = $props();

	let hex = $derived(getTagHex(tag));
	let progressPercent = $derived(Math.round(((stepIndex + 1) / totalSteps) * 100));
</script>

<div class="step-header">
	<div class="progress-track">
		<div class="progress-fill" style="width: {progressPercent}%"></div>
	</div>

	<div class="step-content">
		<div class="step-instruction">
			<span class="step-category">{categoryLabel}</span>
			<span class="step-prompt">Select all</span>
			<span class="step-chip" style="--chip-hex: {hex}">
				<span class="chip-dot" style="background: {hex}"></span>
				{tag.name}
			</span>
		</div>

		<div class="step-counts">
			<span class="count-selected">{selectedCount} selected</span>
			<span class="count-sep">&middot;</span>
			<span class="count-total">{totalItems - alreadyTaggedCount} remaining</span>
			{#if alreadyTaggedCount > 0}
				<span class="count-sep">&middot;</span>
				<span class="count-tagged">{alreadyTaggedCount} already tagged</span>
			{/if}
		</div>

		<div class="step-actions">
			<button class="btn-text" onclick={onselectall}>Select All</button>
			<button class="btn-text" onclick={ondeselectall}>Deselect All</button>
			<button class="btn-text" onclick={onskipcategory}>Skip Category</button>
			<button class="btn-secondary" onclick={onskip}>Skip</button>
			<button
				class="btn-primary"
				onclick={onapply}
				disabled={selectedCount === 0}
				style="--accent: {hex}"
			>
				Apply & Next
			</button>
		</div>
	</div>

	<div class="step-meta">
		<span class="step-counter">{stepIndex + 1} / {totalSteps}</span>
		<button class="btn-exit" onclick={onexit}>
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M4 4l8 8M12 4l-8 8" />
			</svg>
		</button>
	</div>
</div>

<style>
	.step-header {
		position: relative;
		background: var(--color-surface-raised, #222240);
		border-bottom: 1px solid var(--color-border, #333355);
	}

	.progress-track {
		height: 3px;
		background: rgba(255,255,255,0.08);
	}

	.progress-fill {
		height: 100%;
		background: var(--color-accent, #6366f1);
		transition: width 0.3s ease-out;
	}

	.step-content {
		display: flex;
		align-items: center;
		gap: 20px;
		padding: 12px 16px;
		flex-wrap: wrap;
	}

	.step-instruction {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 15px;
		font-weight: 600;
		color: var(--color-text, #e8e8f0);
	}

	.step-category {
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--color-text-muted, #9999b0);
		padding: 3px 8px;
		border: 1px solid var(--color-border, #333355);
		border-radius: 4px;
	}

	.step-prompt {
		color: var(--color-text-muted, #9999b0);
		font-weight: 400;
	}

	.step-chip {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 4px 12px;
		border-radius: 9999px;
		background: color-mix(in srgb, var(--chip-hex) 20%, transparent);
		border: 1px solid color-mix(in srgb, var(--chip-hex) 40%, transparent);
		font-size: 14px;
		font-weight: 600;
	}

	.chip-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}

	.step-counts {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 12px;
		color: var(--color-text-muted, #9999b0);
	}

	.count-selected { font-weight: 600; color: var(--color-text, #e8e8f0); }
	.count-sep { opacity: 0.4; }
	.count-tagged { font-style: italic; opacity: 0.7; }

	.step-actions {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-left: auto;
	}

	.btn-text {
		padding: 6px 10px;
		border: none;
		border-radius: 6px;
		background: transparent;
		color: var(--color-text-muted, #9999b0);
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
		transition: color 0.12s, background 0.12s;
	}

	.btn-text:hover {
		color: var(--color-text, #e8e8f0);
		background: rgba(255,255,255,0.06);
	}

	.btn-secondary {
		padding: 7px 14px;
		border: 1px solid var(--color-border, #333355);
		border-radius: 6px;
		background: transparent;
		color: var(--color-text-muted, #9999b0);
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.12s;
	}

	.btn-secondary:hover {
		border-color: var(--color-text-muted, #9999b0);
		color: var(--color-text, #e8e8f0);
	}

	.btn-primary {
		padding: 7px 16px;
		border: none;
		border-radius: 6px;
		background: var(--accent, var(--color-accent, #6366f1));
		color: white;
		font-size: 12px;
		font-weight: 700;
		cursor: pointer;
		transition: opacity 0.12s;
	}

	.btn-primary:hover { opacity: 0.9; }
	.btn-primary:disabled { opacity: 0.4; cursor: default; }

	.step-meta {
		position: absolute;
		top: 12px;
		right: 16px;
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.step-counter {
		font-size: 11px;
		color: var(--color-text-dim, #66668a);
		font-variant-numeric: tabular-nums;
	}

	.btn-exit {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border: none;
		border-radius: 6px;
		background: transparent;
		color: var(--color-text-muted, #9999b0);
		cursor: pointer;
		transition: background 0.12s;
	}

	.btn-exit:hover {
		background: rgba(255,255,255,0.08);
		color: var(--color-text, #e8e8f0);
	}
</style>
