import type { PageServerLoad } from './$types';
import { getAvailableProducts } from '$lib/server/products';

export const load: PageServerLoad = async () => {
	const products = await getAvailableProducts();
	return { products };
};
