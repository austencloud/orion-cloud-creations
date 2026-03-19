import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Stripe from 'stripe';
import { adminDb } from '$lib/server/firebase-admin';

export const POST: RequestHandler = async ({ request }) => {
	if (!adminDb) throw error(500, 'Server-side Firebase not configured');

	const secretKey = process.env.STRIPE_SECRET_KEY;
	if (!secretKey) throw error(500, 'Stripe not configured');

	const stripe = new Stripe(secretKey);
	const { productId } = await request.json();
	if (!productId) throw error(400, 'productId required');

	const doc = await adminDb.collection('products').doc(productId).get();
	if (!doc.exists) throw error(404, 'Product not found');

	const product = doc.data()!;

	let stripeProduct: Stripe.Product;
	if (product.stripeProductId) {
		stripeProduct = await stripe.products.update(product.stripeProductId, {
			name: product.title,
			description: product.description,
			active: product.availability === 'available'
		});
	} else {
		stripeProduct = await stripe.products.create({
			name: product.title,
			description: product.description
		});
	}

	let stripePrice: Stripe.Price;
	if (product.stripePriceId) {
		const existing = await stripe.prices.retrieve(product.stripePriceId);
		if (existing.unit_amount !== product.price) {
			await stripe.prices.update(product.stripePriceId, { active: false });
			stripePrice = await stripe.prices.create({
				product: stripeProduct.id,
				unit_amount: product.price,
				currency: 'usd'
			});
		} else {
			stripePrice = existing;
		}
	} else {
		stripePrice = await stripe.prices.create({
			product: stripeProduct.id,
			unit_amount: product.price,
			currency: 'usd'
		});
	}

	await doc.ref.update({
		stripeProductId: stripeProduct.id,
		stripePriceId: stripePrice.id,
		updatedAt: new Date()
	});

	return json({ stripeProductId: stripeProduct.id, stripePriceId: stripePrice.id });
};
