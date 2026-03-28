import type { PageServerLoad } from './$types';
import { getDisplayableProductsPage, getAvailableProducts } from '$lib/server/products';

export const load: PageServerLoad = async () => {
	const [firstPage, available] = await Promise.all([
		getDisplayableProductsPage(24),
		getAvailableProducts()
	]);

	return {
		products: firstPage.products,
		hasMore: firstPage.hasMore,
		availableProducts: available
	};
};
