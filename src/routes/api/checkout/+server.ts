import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Stripe from 'stripe';
import { adminDb } from '$lib/server/firebase-admin';

export const POST: RequestHandler = async ({ request }) => {
	if (!adminDb) throw error(500, 'Server-side Firebase not configured');

	const secretKey = process.env.STRIPE_SECRET_KEY;
	if (!secretKey) throw error(500, 'Stripe not configured');

	const stripe = new Stripe(secretKey);
	const { items } = await request.json();

	if (!items || !Array.isArray(items) || items.length === 0) {
		throw error(400, 'Cart is empty');
	}

	const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
	const metadata: Record<string, string> = { itemCount: String(items.length) };

	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		const doc = await adminDb.collection('products').doc(item.productId).get();
		if (!doc.exists) throw error(400, 'Product ' + item.productId + ' not found');

		const product = doc.data()!;
		if (!product.stripePriceId) {
			throw error(400, 'Product "' + product.title + '" is not yet available for purchase');
		}
		if (product.availability !== 'available') {
			throw error(400, 'Product "' + product.title + '" is not available');
		}

		const size = item.size;
		const sizeData = product.sizes?.[size];
		if (!sizeData || sizeData.stock < (item.quantity || 1)) {
			throw error(400, '"' + product.title + '" size ' + size + ' is out of stock');
		}

		lineItems.push({
			price: product.stripePriceId,
			quantity: item.quantity || 1
		});

		metadata[`item_${i}_productId`] = item.productId;
		metadata[`item_${i}_size`] = size;
		metadata[`item_${i}_quantity`] = String(item.quantity || 1);
	}

	const origin = request.headers.get('origin') || '';
	const session = await stripe.checkout.sessions.create({
		mode: 'payment',
		line_items: lineItems,
		metadata,
		shipping_address_collection: { allowed_countries: ['US'] },
		success_url: origin + '/checkout/success?session_id={CHECKOUT_SESSION_ID}',
		cancel_url: origin + '/checkout/cancel'
	});

	return json({ url: session.url });
};
