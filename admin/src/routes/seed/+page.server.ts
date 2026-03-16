import type { PageServerLoad } from './$types';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';

const CATALOG_PATH = 'F:/orion-cloud-creations/PHOTOS/photo-catalog.json';

export const load: PageServerLoad = async () => {
	if (!existsSync(CATALOG_PATH)) {
		return { catalog: null, catalogPath: CATALOG_PATH };
	}

	try {
		const raw = await readFile(CATALOG_PATH, 'utf-8');
		const catalog = JSON.parse(raw);
		return { catalog, catalogPath: CATALOG_PATH };
	} catch (e) {
		console.error('Failed to read photo-catalog.json:', e);
		return { catalog: null, catalogPath: CATALOG_PATH, error: 'Failed to parse catalog file' };
	}
};
