import type { PageServerLoad } from './$types';
import { getProductBySlug, getAvailableProducts } from '$lib/server/products';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const product = await getProductBySlug(params.slug);
	if (!product) throw error(404, 'Product not found');

	const available = await getAvailableProducts();
	const related = available
		.filter(p => p.id !== product.id)
		.slice(0, 4);

	return { product, related };
};
