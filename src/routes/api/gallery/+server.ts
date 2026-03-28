import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDisplayableProductsPage } from '$lib/server/products';

export const GET: RequestHandler = async ({ url }) => {
	const afterCreatedAt = url.searchParams.get('after') ?? undefined;
	const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '24', 10), 48);

	const result = await getDisplayableProductsPage(limit, afterCreatedAt);
	return json(result);
};
