// src/lib/types/media.ts
//
// Re-exports shared types from @austencloud/media-manager,
// plus OCC-specific category definitions.

// Re-export everything from the shared package for backward compat
export type {
	TagColor,
	TagCategory,
	MediaTag,
	MediaItem,
	MediaLibraryState,
	CuratorProgress,
	CuratorConfig
} from '@austencloud/media-manager';

export {
	TAG_COLORS,
	CATEGORY_ORDER,
	DEFAULT_CATEGORY_LABELS,
	DEFAULT_LIBRARY_STATE,
	getTagHex,
	getCategoryLabel
} from '@austencloud/media-manager';

// ─── OCC-Specific Category Config ────────────────────────────────────────────

/** OCC-specific category display order. */
export const OCC_CATEGORY_ORDER: string[] = [
	'garment',
	'technique',
	'color',
	'colorFamily',
	'photoType',
	'size',
	'custom'
];

/** OCC-specific category labels. */
export const OCC_CATEGORY_LABELS: Record<string, string> = {
	garment: 'Garment Type',
	technique: 'Technique',
	color: 'Color',
	colorFamily: 'Color Family',
	photoType: 'Photo Type',
	size: 'Size',
	custom: 'Custom'
};
