import type { ModuleDefinition } from '@austencloud/sidebar';

export const adminModules: ModuleDefinition[] = [
	{
		id: 'dashboard',
		label: 'Dashboard',
		icon: 'chart-line',
		color: '#7c5cbf',
		isMain: true,
		sections: []
	},
	{
		id: 'products',
		label: 'Products',
		icon: 'shirt',
		color: '#208070',
		isMain: true,
		sections: [
			{ id: 'all-products', label: 'All Products', icon: 'list', color: '#208070' },
			{ id: 'drafts', label: 'Drafts', icon: 'file-pen', color: '#9090b0' }
		]
	},
	{
		id: 'orders',
		label: 'Orders',
		icon: 'receipt',
		color: '#d0a020',
		isMain: true,
		sections: [
			{ id: 'all-orders', label: 'All Orders', icon: 'list', color: '#d0a020' },
			{ id: 'pending', label: 'Pending', icon: 'clock', color: '#e0a030' },
			{ id: 'fulfilled', label: 'Fulfilled', icon: 'circle-check', color: '#40b080' }
		]
	},
	{
		id: 'inventory',
		label: 'Inventory',
		icon: 'boxes-stacked',
		color: '#30a050',
		isMain: true,
		sections: [
			{ id: 'stock-levels', label: 'Stock Levels', icon: 'warehouse', color: '#30a050' },
			{ id: 'low-stock', label: 'Low Stock', icon: 'triangle-exclamation', color: '#e04050' }
		]
	},
	{
		id: 'media',
		label: 'Media',
		icon: 'images',
		color: '#20b0c0',
		isMain: true,
		sections: [
			{ id: 'library', label: 'Library', icon: 'photo-film', color: '#20b0c0' },
			{ id: 'curate', label: 'Curate', icon: 'wand-magic-sparkles', color: '#9040c0' }
		]
	},
	{
		id: 'tags',
		label: 'Tags',
		icon: 'tags',
		color: '#d060a0',
		isMain: true,
		sections: []
	},
	{
		id: 'settings',
		label: 'Settings',
		icon: 'gear',
		color: '#707080',
		isMain: true,
		sections: [
			{ id: 'general', label: 'General', icon: 'sliders', color: '#707080' },
			{ id: 'stripe', label: 'Stripe', icon: 'credit-card', color: '#635bff' },
			{ id: 'seed', label: 'Seed Data', icon: 'database', color: '#e0a030' }
		]
	}
];

export const moduleRoutes: Record<string, string> = {
	dashboard: '/admin',
	products: '/admin/products',
	orders: '/admin/orders',
	inventory: '/admin/inventory',
	media: '/admin/media',
	tags: '/admin/tags',
	settings: '/admin/settings'
};

export const sectionRoutes: Record<string, Record<string, string>> = {
	products: {
		'all-products': '/admin/products',
		drafts: '/admin/products/drafts'
	},
	orders: {
		'all-orders': '/admin/orders',
		pending: '/admin/orders/pending',
		fulfilled: '/admin/orders/fulfilled'
	},
	inventory: {
		'stock-levels': '/admin/inventory',
		'low-stock': '/admin/inventory/low'
	},
	media: {
		library: '/admin/media',
		curate: '/admin/media/curate'
	},
	settings: {
		general: '/admin/settings',
		stripe: '/admin/settings/stripe',
		seed: '/admin/settings/seed'
	}
};
