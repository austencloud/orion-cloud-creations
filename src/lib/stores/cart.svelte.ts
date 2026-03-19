import type { CartItem } from '$lib/types/cart';
import { browser } from '$app/environment';

const CART_KEY = 'occ-cart';

function loadCart(): CartItem[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem(CART_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

function saveCart(items: CartItem[]) {
	if (!browser) return;
	localStorage.setItem(CART_KEY, JSON.stringify(items));
}

let items = $state<CartItem[]>(loadCart());

export const cart = {
	get items() { return items; },
	get count() { return items.reduce((sum, i) => sum + i.quantity, 0); },
	get subtotal() { return items.reduce((sum, i) => sum + i.price * i.quantity, 0); },

	add(item: Omit<CartItem, 'quantity'>, maxStock: number = 1) {
		const existing = items.find(i => i.productId === item.productId && i.size === item.size);
		if (existing) {
			if (existing.quantity >= maxStock) return;
			existing.quantity++;
			items = [...items];
		} else {
			items = [...items, { ...item, quantity: 1 }];
		}
		saveCart(items);
	},

	remove(productId: string, size: string) {
		items = items.filter(i => !(i.productId === productId && i.size === size));
		saveCart(items);
	},

	clear() {
		items = [];
		saveCart(items);
	},

	async checkout() {
		const res = await fetch('/api/checkout', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				items: items.map(i => ({
					productId: i.productId,
					size: i.size,
					quantity: i.quantity
				}))
			})
		});

		if (!res.ok) {
			const data = await res.json();
			throw new Error(data.message || 'Checkout failed');
		}

		const { url } = await res.json();
		window.location.href = url;
	}
};
