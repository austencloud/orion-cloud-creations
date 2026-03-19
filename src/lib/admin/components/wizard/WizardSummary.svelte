<!--
	WizardSummary.svelte — End-of-wizard summary showing tags applied.
-->
<script lang="ts">
	import { getTagHex, type MediaTag } from '@austencloud/media-manager';

	interface TagStat {
		tag: MediaTag;
		count: number;
	}

	interface Props {
		stats: TagStat[];
		totalItemsTagged: number;
		totalItems: number;
		onclose: () => void;
		oncurate: () => void;
	}

	const { stats, totalItemsTagged, totalItems, onclose, oncurate }: Props = $props();

	let sortedStats = $derived(stats.filter(s => s.count > 0).sort((a, b) => b.count - a.count));
	let untaggedRemaining = $derived(totalItems - totalItemsTagged);
</script>

<div class="summary-page">
	<div class="summary-card">
		<div class="summary-icon">&#10003;</div>
		<h2 class="summary-title">Quick Tag Complete</h2>
		<p class="summary-subtitle">
			Tagged {totalItemsTagged} item{totalItemsTagged !== 1 ? 's' : ''} across {sortedStats.length} tag{sortedStats.length !== 1 ? 's' : ''}
		</p>

		{#if sortedStats.length > 0}
			<div class="stat-list">
				{#each sortedStats as { tag, count } (tag.id)}
					{@const hex = getTagHex(tag)}
					<div class="stat-row">
						<span class="stat-chip" style="--chip-hex: {hex}">
							<span class="stat-dot" style="background: {hex}"></span>
							{tag.name}
						</span>
						<span class="stat-count">{count}</span>
					</div>
				{/each}
			</div>
		{/if}

		<div class="summary-actions">
			{#if untaggedRemaining > 0}
				<p class="remaining-note">{untaggedRemaining} item{untaggedRemaining !== 1 ? 's' : ''} still need review</p>
				<button class="btn-primary" onclick={oncurate}>Open Curator</button>
			{/if}
			<button class="btn-secondary" onclick={onclose}>Back to Media</button>
		</div>
	</div>
</div>

<style>
	.summary-page {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100%;
		padding: 40px;
	}

	.summary-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		max-width: 480px;
		width: 100%;
		text-align: center;
	}

	.summary-icon { font-size: 48px; color: var(--color-success, #22c55e); line-height: 1; }
	.summary-title { font-size: 22px; font-weight: 700; color: var(--color-text, #e8e8f0); margin: 0; }
	.summary-subtitle { font-size: 14px; color: var(--color-text-muted, #9999b0); margin: 0; }

	.stat-list {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 4px;
		max-height: 300px;
		overflow-y: auto;
		margin-top: 8px;
	}

	.stat-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 6px 12px;
		border-radius: 6px;
		background: rgba(255,255,255,0.03);
	}

	.stat-chip {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		font-size: 13px;
		font-weight: 500;
		color: var(--color-text, #e8e8f0);
	}

	.stat-dot { width: 8px; height: 8px; border-radius: 50%; }
	.stat-count { font-size: 13px; font-weight: 600; color: var(--color-text-muted, #9999b0); font-variant-numeric: tabular-nums; }

	.summary-actions { display: flex; flex-direction: column; align-items: center; gap: 10px; margin-top: 16px; }
	.remaining-note { font-size: 13px; color: var(--color-warning, #f59e0b); font-weight: 500; margin: 0; }

	.btn-primary {
		padding: 10px 28px;
		border: none;
		border-radius: 8px;
		background: var(--color-accent, #6366f1);
		color: white;
		font-size: 14px;
		font-weight: 700;
		cursor: pointer;
	}

	.btn-primary:hover { opacity: 0.9; }

	.btn-secondary {
		padding: 8px 20px;
		border: 1px solid var(--color-border, #333355);
		border-radius: 8px;
		background: transparent;
		color: var(--color-text-muted, #9999b0);
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
	}

	.btn-secondary:hover { border-color: var(--color-text-muted); color: var(--color-text, #e8e8f0); }
</style>
