export interface ShippingRate {
	label: string;
	price: number;
	estimatedDays: string;
}

export interface StoreSettings {
	storeName: string;
	storeEmail: string;
	currency: string;
	stripePublishableKey?: string;
	shippingRates: ShippingRate[];
	taxRate: number;
	lowStockThreshold: number;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
	storeName: 'Orion Cloud Creations',
	storeEmail: '',
	currency: 'usd',
	shippingRates: [
		{ label: 'Standard', price: 599, estimatedDays: '5-7 business days' },
		{ label: 'Priority', price: 1299, estimatedDays: '2-3 business days' }
	],
	taxRate: 0,
	lowStockThreshold: 1
};
