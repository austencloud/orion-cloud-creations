import type { Product } from '$lib/types/product';
import { productService } from './products';

export interface StockEntry {
	productId: string;
	productTitle: string;
	garmentType: string;
	size: string;
	stock: number;
	sku?: string;
}

export const inventoryService = {
	async getAllStockEntries(): Promise<StockEntry[]> {
		const products = await productService.getAll();
		const entries: StockEntry[] = [];
		for (const product of products) {
			if (!product.sizes) continue;
			for (const [size, variant] of Object.entries(product.sizes)) {
				entries.push({
					productId: product.id,
					productTitle: product.title,
					garmentType: product.garmentType,
					size,
					stock: variant.stock,
					sku: variant.sku
				});
			}
		}
		return entries;
	},

	async getLowStock(threshold: number): Promise<StockEntry[]> {
		const all = await this.getAllStockEntries();
		return all.filter(e => e.stock <= threshold);
	},

	async updateStock(productId: string, size: string, newStock: number): Promise<void> {
		const product = await productService.get(productId);
		if (!product) throw new Error('Product not found');
		const updatedSizes = { ...product.sizes, [size]: { ...product.sizes[size], stock: newStock } };
		await productService.update(productId, { sizes: updatedSizes } as any);
	}
};
