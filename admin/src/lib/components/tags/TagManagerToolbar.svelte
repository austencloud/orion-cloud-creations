<script lang="ts">
	import { CATEGORY_ORDER, getCategoryLabel, type TagCategory } from '$lib/types/media';

	type SortOption = 'name' | 'usage' | 'date';

	interface Props {
		searchQuery: string;
		sortBy: SortOption;
		filterCategory: TagCategory | null;
		onsearchchange: (query: string) => void;
		onsortchange: (sort: SortOption) => void;
		oncategorychange: (category: TagCategory | null) => void;
	}

	const {
		searchQuery,
		sortBy,
		filterCategory,
		onsearchchange,
		onsortchange,
		oncategorychange
	}: Props = $props();

	let searchInputEl: HTMLInputElement | undefined = $state();

	function handleSearchKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && searchQuery) {
			e.stopPropagation();
			onsearchchange('');
		}
	}

	function clearSearch() {
		onsearchchange('');
		searchInputEl?.focus();
	}
</script>

<div class="toolbar">
	<div class="toolbar-top">
		<!-- Search -->
		<div class="search-container">
			<svg class="search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
				<circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.3" />
				<path d="M9.5 9.5L12.5 12.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
			</svg>
			<input
				bind:this={searchInputEl}
				type="text"
				class="search-input"
				placeholder="Search tags..."
				value={searchQuery}
				oninput={(e) => onsearchchange((e.target as HTMLInputElement).value)}
				onkeydown={handleSearchKeydown}
				aria-label="Search tags"
			/>
			{#if searchQuery}
				<button class="clear-btn" onclick={clearSearch} aria-label="Clear search">
					<svg width="10" height="10" viewBox="0 0 10 10" fill="none">
						<path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
					</svg>
				</button>
			{/if}
		</div>

		<!-- Sort -->
		<select
			class="sort-select"
			value={sortBy}
			onchange={(e) => onsortchange((e.target as HTMLSelectElement).value as SortOption)}
			aria-label="Sort tags by"
		>
			<option value="name">Name</option>
			<option value="usage">Usage</option>
			<option value="date">Date</option>
		</select>
	</div>

	<!-- Category filters -->
	<div class="filter-chips">
		<button
			class="filter-chip"
			class:active={filterCategory === null}
			onclick={() => oncategorychange(null)}
		>
			All
		</button>
		{#each CATEGORY_ORDER as category}
			<button
				class="filter-chip"
				class:active={filterCategory === category}
				onclick={() => oncategorychange(category)}
			>
				{getCategoryLabel(category)}
			</button>
		{/each}
	</div>
</div>

<style>
	.toolbar {
		padding: 10px 16px;
		border-bottom: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.toolbar-top {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	/* Search */
	.search-container {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 0 12px;
		height: 36px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		color: var(--color-text-dim);
		transition: border-color 0.15s;
		flex: 1;
		min-width: 0;
	}

	.search-container:focus-within {
		border-color: var(--color-accent);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-accent) 20%, transparent);
	}

	.search-icon {
		flex-shrink: 0;
	}

	.search-input {
		flex: 1;
		background: none;
		border: none;
		outline: none;
		color: var(--color-text);
		font-size: 14px;
		font-family: inherit;
		min-width: 0;
	}

	.search-input::placeholder {
		color: var(--color-text-dim);
	}

	.clear-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
		background: var(--color-surface-overlay);
		border: none;
		border-radius: 50%;
		color: var(--color-text-muted);
		cursor: pointer;
		flex-shrink: 0;
		transition: background 0.15s, color 0.15s;
	}

	.clear-btn:hover {
		background: var(--color-border);
		color: var(--color-text);
	}

	/* Sort dropdown */
	.sort-select {
		padding: 6px 12px;
		height: 36px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		color: var(--color-text);
		font-size: 13px;
		font-family: inherit;
		cursor: pointer;
		flex-shrink: 0;
	}

	.sort-select:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	/* Filter chips */
	.filter-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.filter-chip {
		padding: 4px 12px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 9999px;
		color: var(--color-text-muted);
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.15s, border-color 0.15s, color 0.15s;
		white-space: nowrap;
	}

	.filter-chip:hover {
		border-color: var(--color-text-muted);
		color: var(--color-text);
	}

	.filter-chip:active {
		transform: scale(0.95);
	}

	.filter-chip.active {
		background: var(--color-accent);
		border-color: var(--color-accent);
		color: white;
	}

	.filter-chip:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}
</style>
