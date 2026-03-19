// src/lib/admin/services/media-tagging.svelte.ts
//
// Reactive tagging controller for the OCC media library.
// Uses optimistic updates: local state updates immediately, Firestore fires in background,
// rolls back on failure.

import { mediaService } from './media';
import type { MediaItem, MediaTag, TagColor, TagCategory } from '@austencloud/media-manager';

export interface MediaTaggingConfig {
	getMediaItems: () => MediaItem[];
	setMediaItems: (items: MediaItem[]) => void;
	getAllTags: () => MediaTag[];
	setAllTags: (tags: MediaTag[]) => void;
}

export interface MediaTaggingController {
	applyTagToItems(targets: MediaItem[], tag: MediaTag): Promise<void>;
	removeTagFromItems(targets: MediaItem[], tag: MediaTag): Promise<void>;
	toggleTagOnItems(targets: MediaItem[], tag: MediaTag): Promise<void>;
	selectionHasTag(targets: MediaItem[], tagId: string): boolean;
	selectionPartiallyHasTag(targets: MediaItem[], tagId: string): boolean;
	createTag(name: string, color: TagColor, category: TagCategory): Promise<void>;
	deleteTag(tag: MediaTag): Promise<void>;
	mergeTags(sourceId: string, targetId: string): Promise<void>;
}

export function createMediaTaggingController(
	config: MediaTaggingConfig
): MediaTaggingController {
	async function applyTagToItems(
		targets: MediaItem[],
		tag: MediaTag
	): Promise<void> {
		if (targets.length === 0) return;

		const mediaItems = config.getMediaItems();
		const updates: Array<{ id: string; newTags: string[]; oldTags: string[] }> = [];

		for (const item of targets) {
			if (!item.tags.includes(tag.id)) {
				const newTags = [...item.tags, tag.id];
				updates.push({ id: item.id, newTags, oldTags: item.tags });
				const idx = mediaItems.findIndex((m) => m.id === item.id);
				if (idx !== -1) mediaItems[idx].tags = newTags;
			}
		}
		config.setMediaItems(mediaItems);

		const results = await Promise.allSettled(
			updates.map((u) => mediaService.items.update(u.id, { tags: u.newTags }))
		);

		// Rollback failures
		let hasFailure = false;
		for (let i = 0; i < results.length; i++) {
			if (results[i].status === 'rejected') {
				hasFailure = true;
				const idx = mediaItems.findIndex((m) => m.id === updates[i].id);
				if (idx !== -1) mediaItems[idx].tags = updates[i].oldTags;
			}
		}
		if (hasFailure) config.setMediaItems(mediaItems);
	}

	async function removeTagFromItems(
		targets: MediaItem[],
		tag: MediaTag
	): Promise<void> {
		if (targets.length === 0) return;

		const mediaItems = config.getMediaItems();
		const updates: Array<{ id: string; newTags: string[]; oldTags: string[] }> = [];

		for (const item of targets) {
			if (item.tags.includes(tag.id)) {
				const newTags = item.tags.filter((id) => id !== tag.id);
				updates.push({ id: item.id, newTags, oldTags: item.tags });
				const idx = mediaItems.findIndex((m) => m.id === item.id);
				if (idx !== -1) mediaItems[idx].tags = newTags;
			}
		}
		config.setMediaItems(mediaItems);

		const results = await Promise.allSettled(
			updates.map((u) => mediaService.items.update(u.id, { tags: u.newTags }))
		);

		let hasFailure = false;
		for (let i = 0; i < results.length; i++) {
			if (results[i].status === 'rejected') {
				hasFailure = true;
				const idx = mediaItems.findIndex((m) => m.id === updates[i].id);
				if (idx !== -1) mediaItems[idx].tags = updates[i].oldTags;
			}
		}
		if (hasFailure) config.setMediaItems(mediaItems);
	}

	async function toggleTagOnItems(
		targets: MediaItem[],
		tag: MediaTag
	): Promise<void> {
		if (targets.length === 0) return;
		const anyHasTag = targets.some((item) => item.tags.includes(tag.id));
		if (anyHasTag) {
			await removeTagFromItems(targets, tag);
		} else {
			await applyTagToItems(targets, tag);
		}
	}

	function selectionHasTag(targets: MediaItem[], tagId: string): boolean {
		if (targets.length === 0) return false;
		return targets.every((item) => item.tags.includes(tagId));
	}

	function selectionPartiallyHasTag(
		targets: MediaItem[],
		tagId: string
	): boolean {
		if (targets.length === 0) return false;
		const count = targets.filter((item) => item.tags.includes(tagId)).length;
		return count > 0 && count < targets.length;
	}

	async function createTag(
		name: string,
		color: TagColor,
		category: TagCategory
	): Promise<void> {
		if (!name.trim()) return;

		const normalized = name
			.trim()
			.replace(/(^|\s)\w/g, (c) => c.toUpperCase());

		const existing = await mediaService.tags.findByName(normalized);
		if (existing) return;

		const id = await mediaService.tags.add({
			name: normalized,
			color,
			category
		});

		const newTag: MediaTag = {
			id,
			name: normalized,
			color,
			category,
			createdAt: new Date(),
			updatedAt: new Date()
		};

		const allTags = config.getAllTags();
		config.setAllTags(
			[...allTags, newTag].sort((a, b) => a.name.localeCompare(b.name))
		);
	}

	async function deleteTag(tag: MediaTag): Promise<void> {
		const mediaItems = config.getMediaItems();
		const allTags = config.getAllTags();

		// Optimistic: remove tag from local state immediately
		const affectedItems = mediaItems.filter((item) =>
			item.tags.includes(tag.id)
		);
		for (const item of affectedItems) {
			const idx = mediaItems.findIndex((m) => m.id === item.id);
			if (idx !== -1) {
				mediaItems[idx] = {
					...mediaItems[idx],
					tags: mediaItems[idx].tags.filter((t) => t !== tag.id)
				};
			}
		}
		config.setAllTags(allTags.filter((t) => t.id !== tag.id));
		config.setMediaItems(mediaItems);

		// Fire Firestore updates, then delete the tag doc
		await Promise.allSettled(
			affectedItems.map((item) => {
				const newTags = item.tags.filter((t) => t !== tag.id);
				return mediaService.items.update(item.id, { tags: newTags });
			})
		);
		await mediaService.tags.delete(tag.id);
	}

	async function mergeTags(
		sourceId: string,
		targetId: string
	): Promise<void> {
		if (sourceId === targetId) return;
		await mediaService.tags.merge(sourceId, targetId);
		// Reload from Firestore to get authoritative state
		config.setAllTags(await mediaService.tags.getAll());
		config.setMediaItems(await mediaService.items.getAll());
	}

	return {
		applyTagToItems,
		removeTagFromItems,
		toggleTagOnItems,
		selectionHasTag,
		selectionPartiallyHasTag,
		createTag,
		deleteTag,
		mergeTags
	};
}
