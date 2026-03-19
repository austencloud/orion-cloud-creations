import type { Size } from './product';

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'refunded' | 'cancelled';

export interface Address {
	line1: string;
	line2?: string;
	city: string;
	state: string;
	zip: string;
	country: string;
}

export interface OrderItem {
	productId: string;
	productTitle: string;
	size: Size;
	price: number;
	quantity: number;
	thumbnailUrl?: string;
}

export interface Order {
	id: string;
	stripeSessionId: string;
	stripePaymentIntentId: string;
	customerEmail: string;
	customerName: string;
	shippingAddress: Address;
	items: OrderItem[];
	subtotal: number;
	shipping: number;
	tax: number;
	total: number;
	status: OrderStatus;
	trackingNumber?: string;
	trackingCarrier?: string;
	notes?: string;
	createdAt: Date;
	updatedAt: Date;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
	pending: 'Pending',
	paid: 'Paid',
	shipped: 'Shipped',
	delivered: 'Delivered',
	refunded: 'Refunded',
	cancelled: 'Cancelled'
};
