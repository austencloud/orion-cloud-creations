import { productService } from './products';
import { orderService } from './orders';
import { mediaItemService } from './media';
import { getTotalStock } from '$lib/types/product';

export interface DashboardStats {
	monthlyRevenue: number;
	monthlyOrders: number;
	totalProducts: number;
	needsReviewCount: number;
}

export const dashboardService = {
	async getStats(): Promise<DashboardStats> {
		const [orders, products, items] = await Promise.all([
			orderService.getAll(),
			productService.getAll(),
			mediaItemService.getAll()
		]);

		const now = new Date();
		const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

		const monthlyOrders = orders.filter(o =>
			o.createdAt >= monthStart && (o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered')
		);

		return {
			monthlyRevenue: monthlyOrders.reduce((sum, o) => sum + o.total, 0),
			monthlyOrders: monthlyOrders.length,
			totalProducts: products.filter(p => p.availability === 'available').length,
			needsReviewCount: items.filter((i: any) => i.needsReview).length
		};
	}
};
