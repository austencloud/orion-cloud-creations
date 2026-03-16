<script lang="ts">
	import { browser } from '$app/environment';
	import type { MediaTag, MediaItem, TagCategory, TagColor } from '$lib/types/media';
	import { TAG_COLORS } from '$lib/types/media';
	import { mediaTagService, mediaItemService } from '$lib/services/media';

	interface CatalogEntry {
		filename: string;
		garmentType?: string;
		technique?: string;
		colors?: string[];
		colorFamily?: string;
		photoType?: string;
		size?: string;
		suggestedName?: string;
		description?: string;
		[key: string]: unknown;
	}

	interface Props {
		data: {
			catalog: CatalogEntry[] | null;
			catalogPath: string;
			error?: string;
		};
	}

	const { data }: Props = $props();

	let catalog = $state<CatalogEntry[] | null>(data.catalog);
	let logs = $state<string[]>([]);
	let seedingTags = $state(false);
	let seedingItems = $state(false);
	let progress = $state(0);
	let progressTotal = $state(0);
	let fileError = $state<string | null>(data.error ?? null);

	const r2BaseUrl = import.meta.env.VITE_R2_PUBLIC_URL ?? '';

	// Color assignment — cycle through tag colors for each category
	const colorsByCategory: Record<string, number> = {};
	function nextColor(category: string): TagColor {
		if (!(category in colorsByCategory)) colorsByCategory[category] = 0;
		const idx = colorsByCategory[category] % TAG_COLORS.length;
		colorsByCategory[category]++;
		return TAG_COLORS[idx].value;
	}

	// Extract unique tag values from catalog
	let extractedTags = $derived.by(() => {
		if (!catalog) return [];

		const tagMap = new Map<string, { name: string; category: TagCategory }>();

		for (const entry of catalog) {
			if (entry.garmentType) {
				tagMap.set(`garment:${entry.garmentType}`, {
					name: entry.garmentType,
					category: 'garment'
				});
			}
			if (entry.technique) {
				tagMap.set(`technique:${entry.technique}`, {
					name: entry.technique,
					category: 'technique'
				});
			}
			if (entry.colors) {
				for (const color of entry.colors) {
					tagMap.set(`color:${color}`, { name: color, category: 'color' });
				}
			}
			if (entry.colorFamily) {
				tagMap.set(`colorFamily:${entry.colorFamily}`, {
					name: entry.colorFamily,
					category: 'colorFamily'
				});
			}
			if (entry.photoType) {
				tagMap.set(`photoType:${entry.photoType}`, {
					name: entry.photoType,
					category: 'photoType'
				});
			}
			if (entry.size) {
				tagMap.set(`size:${entry.size}`, { name: entry.size, category: 'size' });
			}
		}

		return [...tagMap.values()];
	});

	function log(msg: string) {
		logs = [...logs, `[${new Date().toLocaleTimeString()}] ${msg}`];
	}

	// Handle file upload as fallback
	function handleFileSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = () => {
			try {
				catalog = JSON.parse(reader.result as string);
				fileError = null;
				log(`Loaded ${catalog!.length} entries from uploaded file`);
			} catch {
				fileError = 'Invalid JSON file';
				log('ERROR: Failed to parse uploaded file');
			}
		};
		reader.readAsText(file);
	}

	async function seedTags() {
		if (!catalog) return;
		seedingTags = true;
		progress = 0;
		progressTotal = extractedTags.length;

		log(`Seeding ${extractedTags.length} tags...`);

		// Reset color counters
		for (const key in colorsByCategory) delete colorsByCategory[key];

		const tagIdMap = new Map<string, string>();

		for (const tagDef of extractedTags) {
			try {
				const tag: Omit<MediaTag, 'id' | 'createdAt' | 'updatedAt'> = {
					name: tagDef.name,
					category: tagDef.category,
					color: nextColor(tagDef.category)
				};
				const id = await mediaTagService.add(tag);
				tagIdMap.set(`${tagDef.category}:${tagDef.name}`, id);
				progress++;
				log(`  Created tag: ${tagDef.category}/${tagDef.name} (${id})`);
			} catch (e) {
				log(`  ERROR creating tag ${tagDef.category}/${tagDef.name}: ${e}`);
			}
		}

		// Store tag map in sessionStorage for item seeding
		if (browser) {
			sessionStorage.setItem('seedTagMap', JSON.stringify([...tagIdMap.entries()]));
		}

		log(`Done seeding tags. ${progress}/${progressTotal} created.`);
		seedingTags = false;
	}

	async function seedItems() {
		if (!catalog) return;
		seedingItems = true;
		progress = 0;
		progressTotal = catalog.length;

		log(`Seeding ${catalog.length} items...`);

		// Load tag map — either from session or by fetching all tags
		let tagIdMap = new Map<string, string>();
		if (browser) {
			const stored = sessionStorage.getItem('seedTagMap');
			if (stored) {
				tagIdMap = new Map(JSON.parse(stored));
			}
		}

		// If no map, fetch tags and build it
		if (tagIdMap.size === 0) {
			log('  No tag map in session, fetching tags from Firestore...');
			const existingTags = await mediaTagService.getAll();
			for (const t of existingTags) {
				tagIdMap.set(`${t.category}:${t.name}`, t.id);
			}
			log(`  Found ${existingTags.length} existing tags`);
		}

		for (const entry of catalog) {
			try {
				// Resolve tag IDs
				const tagIds: string[] = [];
				if (entry.garmentType) {
					const id = tagIdMap.get(`garment:${entry.garmentType}`);
					if (id) tagIds.push(id);
				}
				if (entry.technique) {
					const id = tagIdMap.get(`technique:${entry.technique}`);
					if (id) tagIds.push(id);
				}
				if (entry.colors) {
					for (const c of entry.colors) {
						const id = tagIdMap.get(`color:${c}`);
						if (id) tagIds.push(id);
					}
				}
				if (entry.colorFamily) {
					const id = tagIdMap.get(`colorFamily:${entry.colorFamily}`);
					if (id) tagIds.push(id);
				}
				if (entry.photoType) {
					const id = tagIdMap.get(`photoType:${entry.photoType}`);
					if (id) tagIds.push(id);
				}
				if (entry.size) {
					const id = tagIdMap.get(`size:${entry.size}`);
					if (id) tagIds.push(id);
				}

				const item: Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'> = {
					filename: entry.filename,
					tags: tagIds,
					r2Key: `originals/${entry.filename}`,
					r2ThumbnailKey: `thumbnails/${entry.filename}`,
					thumbnailUrl: r2BaseUrl ? `${r2BaseUrl}/thumbnails/${entry.filename}` : '',
					fullUrl: r2BaseUrl ? `${r2BaseUrl}/originals/${entry.filename}` : '',
					description: entry.description ?? '',
					suggestedName: entry.suggestedName ?? entry.filename,
					sizeFromFilename: entry.size,
					needsReview: true
				};

				await mediaItemService.add(item);
				progress++;

				if (progress % 25 === 0) {
					log(`  Progress: ${progress}/${progressTotal}`);
				}
			} catch (e) {
				log(`  ERROR creating item ${entry.filename}: ${e}`);
			}
		}

		log(`Done seeding items. ${progress}/${progressTotal} created.`);
		seedingItems = false;
	}

	let isSeeding = $derived(seedingTags || seedingItems);
	let progressPct = $derived(progressTotal > 0 ? Math.round((progress / progressTotal) * 100) : 0);
</script>

<div class="seed-page">
	<div class="seed-container">
		<h1 class="page-title">Seed Database</h1>
		<p class="page-description">
			Import photo-catalog.json into Firestore. Creates tags and media items.
		</p>

		<!-- Catalog source -->
		<section class="section">
			<h2 class="section-title">Catalog Source</h2>
			{#if catalog}
				<div class="source-info success">
					<span class="source-icon">&#10003;</span>
					<div>
						<p class="source-label">Loaded {catalog.length} entries</p>
						<p class="source-path">{data.catalogPath}</p>
					</div>
				</div>
				<p class="tag-summary">
					{extractedTags.length} unique tags will be created across
					{new Set(extractedTags.map((t) => t.category)).size} categories
				</p>
			{:else}
				<div class="source-info warning">
					<span class="source-icon">!</span>
					<div>
						<p class="source-label">
							{fileError ?? 'Catalog not found at known path'}
						</p>
						<p class="source-path">{data.catalogPath}</p>
					</div>
				</div>
				<div class="file-upload">
					<label class="upload-label">
						<span>Upload photo-catalog.json</span>
						<input type="file" accept=".json" onchange={handleFileSelect} />
					</label>
				</div>
			{/if}
		</section>

		<!-- Actions -->
		<section class="section">
			<h2 class="section-title">Actions</h2>
			<div class="actions">
				<button
					class="action-btn"
					onclick={seedTags}
					disabled={!catalog || isSeeding}
				>
					{seedingTags ? 'Seeding Tags...' : 'Seed Tags'}
				</button>
				<button
					class="action-btn"
					onclick={seedItems}
					disabled={!catalog || isSeeding}
				>
					{seedingItems ? 'Seeding Items...' : 'Seed Items'}
				</button>
			</div>

			{#if isSeeding}
				<div class="progress-bar-container">
					<div class="progress-bar" style="width: {progressPct}%"></div>
				</div>
				<p class="progress-text">{progress} / {progressTotal} ({progressPct}%)</p>
			{/if}
		</section>

		<!-- Env check -->
		{#if !r2BaseUrl}
			<div class="env-warning">
				VITE_R2_PUBLIC_URL is not set. Media item URLs will be empty.
				Set it in .env before seeding items.
			</div>
		{/if}

		<!-- Log -->
		<section class="section">
			<h2 class="section-title">Log</h2>
			<div class="log-container">
				{#if logs.length === 0}
					<p class="log-empty">No activity yet.</p>
				{:else}
					{#each logs as line}
						<p class="log-line">{line}</p>
					{/each}
				{/if}
			</div>
		</section>
	</div>
</div>

<style>
	.seed-page {
		height: calc(100vh - 48px);
		overflow-y: auto;
		padding: 32px;
	}

	.seed-container {
		max-width: 720px;
		margin: 0 auto;
	}

	.page-title {
		font-size: 22px;
		font-weight: 700;
		margin-bottom: 4px;
	}

	.page-description {
		color: var(--color-text-muted);
		font-size: 14px;
		margin-bottom: 32px;
	}

	.section {
		margin-bottom: 28px;
	}

	.section-title {
		font-size: 14px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
		margin-bottom: 12px;
	}

	.source-info {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		padding: 12px 16px;
		border-radius: 8px;
		border: 1px solid var(--color-border);
		background: var(--color-surface-raised);
	}

	.source-info.success {
		border-color: var(--color-success);
	}

	.source-info.warning {
		border-color: var(--color-warning);
	}

	.source-icon {
		font-size: 18px;
		line-height: 1;
		margin-top: 1px;
	}

	.success .source-icon {
		color: var(--color-success);
	}

	.warning .source-icon {
		color: var(--color-warning);
	}

	.source-label {
		font-size: 14px;
		font-weight: 500;
	}

	.source-path {
		font-size: 12px;
		color: var(--color-text-dim);
		font-family: monospace;
		margin-top: 2px;
	}

	.tag-summary {
		font-size: 13px;
		color: var(--color-text-muted);
		margin-top: 8px;
	}

	.file-upload {
		margin-top: 12px;
	}

	.upload-label {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 8px 16px;
		background: var(--color-surface-overlay);
		border: 1px solid var(--color-border);
		border-radius: 6px;
		color: var(--color-text);
		font-size: 13px;
		cursor: pointer;
	}

	.upload-label input {
		display: none;
	}

	.upload-label:hover {
		border-color: var(--color-text-muted);
	}

	.actions {
		display: flex;
		gap: 12px;
	}

	.action-btn {
		padding: 10px 24px;
		background: var(--color-accent);
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.15s;
	}

	.action-btn:hover:not(:disabled) {
		background: var(--color-accent-hover);
	}

	.action-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.progress-bar-container {
		margin-top: 16px;
		height: 6px;
		background: var(--color-surface-overlay);
		border-radius: 3px;
		overflow: hidden;
	}

	.progress-bar {
		height: 100%;
		background: var(--color-accent);
		border-radius: 3px;
		transition: width 0.2s;
	}

	.progress-text {
		font-size: 12px;
		color: var(--color-text-muted);
		margin-top: 4px;
		text-align: right;
	}

	.env-warning {
		padding: 10px 14px;
		background: color-mix(in srgb, var(--color-warning) 10%, transparent);
		border: 1px solid var(--color-warning);
		border-radius: 6px;
		font-size: 13px;
		color: var(--color-warning);
		margin-bottom: 20px;
	}

	.log-container {
		background: var(--color-surface-raised);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 12px 16px;
		max-height: 300px;
		overflow-y: auto;
		font-family: monospace;
		font-size: 12px;
	}

	.log-empty {
		color: var(--color-text-dim);
	}

	.log-line {
		color: var(--color-text-muted);
		line-height: 1.6;
		white-space: pre-wrap;
		word-break: break-all;
	}
</style>
