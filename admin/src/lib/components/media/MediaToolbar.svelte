<!--
	MediaToolbar.svelte — Top toolbar with search, grid size, counts, filter mode, selection controls.
-->
<script lang="ts">
	interface Props {
		searchQuery: string;
		gridSize: number;
		totalCount: number;
		selectedCount: number;
		filterMode: 'and' | 'or';
		onsearchchange: (query: string) => void;
		ongridsizechange: (size: number) => void;
		onfiltermodechange: (mode: 'and' | 'or') => void;
		onselectall: () => void;
		ondeselectall: () => void;
	}

	const {
		searchQuery,
		gridSize,
		totalCount,
		selectedCount,
		filterMode,
		onsearchchange,
		ongridsizechange,
		onfiltermodechange,
		onselectall,
		ondeselectall
	}: Props = $props();

	let searchTimer: ReturnType<typeof setTimeout>;

	function handleSearchInput(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		clearTimeout(searchTimer);
		searchTimer = setTimeout(() => {
			onsearchchange(value);
		}, 200);
	}

	function clearSearch() {
		onsearchchange('');
	}
</script>

<header class="flex flex-wrap items-center gap-3 border-b border-border bg-surface-raised px-4 py-2">
	<!-- Search -->
	<div class="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 transition-colors focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20">
		<svg class="h-4 w-4 shrink-0 text-text-muted" viewBox="0 0 20 20" fill="currentColor">
			<path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.45 4.39l4.26 4.26a.75.75 0 11-1.06 1.06l-4.26-4.26A7 7 0 012 9z" clip-rule="evenodd" />
		</svg>
		<input
			type="search"
			class="min-w-0 flex-1 border-none bg-transparent text-sm text-text outline-none placeholder:text-text-dim"
			placeholder="Search media..."
			value={searchQuery}
			oninput={handleSearchInput}
		/>
		{#if searchQuery}
			<button
				class="flex h-5 w-5 items-center justify-center rounded-full bg-surface-overlay text-text-muted hover:bg-surface-hover hover:text-text"
				onclick={clearSearch}
				aria-label="Clear search"
			>
				<svg class="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M2 2l8 8M10 2l-8 8" />
				</svg>
			</button>
		{/if}
	</div>

	<!-- Grid size slider -->
	<div class="flex items-center gap-2">
		<svg class="h-4 w-4 text-text-muted" viewBox="0 0 20 20" fill="currentColor">
			<path fill-rule="evenodd" d="M4.25 2A2.25 2.25 0 002 4.25v2.5A2.25 2.25 0 004.25 9h2.5A2.25 2.25 0 009 6.75v-2.5A2.25 2.25 0 006.75 2h-2.5zm0 9A2.25 2.25 0 002 13.25v2.5A2.25 2.25 0 004.25 18h2.5A2.25 2.25 0 009 15.75v-2.5A2.25 2.25 0 006.75 11h-2.5zm9-9A2.25 2.25 0 0011 4.25v2.5A2.25 2.25 0 0013.25 9h2.5A2.25 2.25 0 0018 6.75v-2.5A2.25 2.25 0 0015.75 2h-2.5zm0 9A2.25 2.25 0 0011 13.25v2.5A2.25 2.25 0 0013.25 18h2.5A2.25 2.25 0 0018 15.75v-2.5A2.25 2.25 0 0015.75 11h-2.5z" clip-rule="evenodd" />
		</svg>
		<input
			type="range"
			min="2"
			max="8"
			value={gridSize}
			class="h-1.5 w-20 cursor-pointer appearance-none rounded-full bg-border accent-accent"
			oninput={(e) => ongridsizechange(parseInt((e.target as HTMLInputElement).value))}
			aria-label="Grid columns"
		/>
		<span class="w-4 text-center text-xs text-text-dim">{gridSize}</span>
	</div>

	<!-- Item count -->
	<span class="text-xs text-text-dim whitespace-nowrap" aria-live="polite">
		{totalCount} item{totalCount !== 1 ? 's' : ''}
	</span>

	<!-- Selected count -->
	{#if selectedCount > 0}
		<span class="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-semibold text-accent whitespace-nowrap">
			{selectedCount} selected
		</span>
	{/if}

	<!-- Filter mode toggle -->
	<div class="flex overflow-hidden rounded-md border border-border text-xs">
		<button
			class="px-2.5 py-1 transition-colors {filterMode === 'and' ? 'bg-accent text-white' : 'bg-surface text-text-muted hover:bg-surface-hover'}"
			onclick={() => onfiltermodechange('and')}
		>
			AND
		</button>
		<button
			class="px-2.5 py-1 transition-colors {filterMode === 'or' ? 'bg-accent text-white' : 'bg-surface text-text-muted hover:bg-surface-hover'}"
			onclick={() => onfiltermodechange('or')}
		>
			OR
		</button>
	</div>

	<!-- Select / Deselect all -->
	<div class="flex gap-1">
		<button
			class="rounded-md border border-border px-2.5 py-1 text-xs text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
			onclick={onselectall}
		>
			Select All
		</button>
		{#if selectedCount > 0}
			<button
				class="rounded-md border border-border px-2.5 py-1 text-xs text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
				onclick={ondeselectall}
			>
				Deselect All
			</button>
		{/if}
	</div>
</header>
