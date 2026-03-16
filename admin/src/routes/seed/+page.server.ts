import type { PageServerLoad } from './$types';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { resolve } from 'path';

const CATALOG_PATH = resolve('F:\\orion-cloud-creations\\PHOTOS\\photo-catalog.json');

export const load: PageServerLoad = async () => {
	try {
		if (!existsSync(CATALOG_PATH)) {
			return { catalog: null, catalogPath: CATALOG_PATH };
		}

		const raw = await readFile(CATALOG_PATH, 'utf-8');
		const data = JSON.parse(raw);
		const photos = data.photos || data;
		return { catalog: { photos, totalPhotos: photos.length }, catalogPath: CATALOG_PATH };
	} catch (e) {
		console.error('Failed to read photo-catalog.json:', e);
		return { catalog: null, catalogPath: CATALOG_PATH };
	}
};
