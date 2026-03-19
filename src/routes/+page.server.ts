import type { PageServerLoad } from './$types';
import { getFeaturedProducts } from '$lib/server/products';

export const load: PageServerLoad = async () => {
	const featured = await getFeaturedProducts();
	return { featured };
};
