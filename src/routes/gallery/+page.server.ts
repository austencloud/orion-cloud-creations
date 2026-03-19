import type { PageServerLoad } from './$types';
import { getAllDisplayableProducts } from '$lib/server/products';

export const load: PageServerLoad = async () => {
	const products = await getAllDisplayableProducts();
	return { products };
};
