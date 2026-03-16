// src/lib/types/media.ts
//
// Core types for the OCC Admin media tagger.
// Simplified from Cirque Aflame — no hierarchy, prerequisites, or aliases.

export type TagColor =
	| 'flame'
	| 'gold'
	| 'royal'
	| 'cyan'
	| 'green'
	| 'red'
	| 'purple'
	| 'navy'
	| 'teal'
	| 'pink'
	| 'lime'
	| 'gray';

/** Hex colors for each TagColor value. */
export const TAG_COLORS: { value: TagColor; hex: string }[] = [
	{ value: 'flame', hex: '#f97316' },
	{ value: 'gold', hex: '#eab308' },
	{ value: 'royal', hex: '#8b5cf6' },
	{ value: 'cyan', hex: '#06b6d4' },
	{ value: 'green', hex: '#22c55e' },
	{ value: 'red', hex: '#ef4444' },
	{ value: 'purple', hex: '#a855f7' },
	{ value: 'navy', hex: '#1e40af' },
	{ value: 'teal', hex: '#0d9488' },
	{ value: 'pink', hex: '#ec4899' },
	{ value: 'lime', hex: '#84cc16' },
	{ value: 'gray', hex: '#6b7280' }
];

/** Look up the hex color for a tag. */
export function getTagHex(tag: MediaTag): string {
	return TAG_COLORS.find((c) => c.value === tag.color)?.hex ?? '#6b7280';
}

/** OCC-specific tag categories. */
export type TagCategory =
	| 'garment'
	| 'technique'
	| 'color'
	| 'colorFamily'
	| 'photoType'
	| 'size'
	| 'custom';

/** Built-in categories with human-readable labels. */
export const DEFAULT_CATEGORIES: Record<TagCategory, string> = {
	garment: 'Garment Type',
	technique: 'Technique',
	color: 'Color',
	colorFamily: 'Color Family',
	photoType: 'Photo Type',
	size: 'Size',
	custom: 'Custom'
};

/** Category display order. */
export const CATEGORY_ORDER: TagCategory[] = [
	'garment',
	'technique',
	'color',
	'colorFamily',
	'photoType',
	'size',
	'custom'
];

/** Get the display label for a category. Falls back to title-casing the key. */
export function getCategoryLabel(
	category: string,
	persistedLabels?: Record<string, string>
): string {
	if (persistedLabels?.[category]) return persistedLabels[category];
	if (category in DEFAULT_CATEGORIES) return DEFAULT_CATEGORIES[category as TagCategory];
	return category.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
}

export interface MediaTag {
	id: string;
	name: string;
	color: TagColor;
	category: TagCategory;
	description?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface MediaItem {
	id: string;
	filename: string;
	tags: string[]; // Tag IDs
	r2Key: string;
	r2ThumbnailKey: string;
	thumbnailUrl: string;
	fullUrl: string;
	description: string;
	suggestedName: string;
	sizeFromFilename?: string;
	notes?: string;
	needsReview: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface MediaLibraryState {
	gridSize: number;
	searchQuery: string;
	activeTags: string[]; // Tag IDs currently selected for filtering
	filterMode: 'and' | 'or';
	categoryLabels: Record<string, string>;
}

/** Default state for a fresh media library. */
export const DEFAULT_LIBRARY_STATE: MediaLibraryState = {
	gridSize: 4,
	searchQuery: '',
	activeTags: [],
	filterMode: 'or',
	categoryLabels: {}
};
