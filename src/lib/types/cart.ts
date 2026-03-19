import type { Size } from './product';

export interface CartItem {
	productId: string;
	title: string;
	size: Size;
	price: number;
	thumbnailUrl: string;
	quantity: number;
}
