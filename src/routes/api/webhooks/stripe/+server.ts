import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Stripe from 'stripe';
import { adminDb } from '$lib/server/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const POST: RequestHandler = async ({ request }) => {
	if (!adminDb) throw error(500, 'Server-side Firebase not configured');

	const secretKey = process.env.STRIPE_SECRET_KEY;
	const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
	if (!secretKey || !webhookSecret) throw error(500, 'Stripe not configured');

	const stripe = new Stripe(secretKey);
	const rawBody = await request.text();
	const sig = request.headers.get('stripe-signature');

	if (!sig) throw error(400, 'Missing stripe-signature header');

	let event: Stripe.Event;
	try {
		event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
	} catch {
		throw error(400, 'Invalid webhook signature');
	}

	if (event.type === 'checkout.session.completed') {
		const session = event.data.object as Stripe.Checkout.Session;
		await handleCheckoutComplete(stripe, session);
	}

	if (event.type === 'charge.refunded') {
		const charge = event.data.object as Stripe.Charge;
		await handleRefund(charge);
	}

	return json({ received: true });
};

async function handleCheckoutComplete(stripe: Stripe, session: Stripe.Checkout.Session) {
	if (!adminDb) return;

	const metadata = session.metadata ?? {};
	const itemCount = parseInt(metadata.itemCount ?? '0', 10);
	const orderItems = [];

	for (let i = 0; i < itemCount; i++) {
		const productId = metadata[`item_${i}_productId`];
		const size = metadata[`item_${i}_size`];
		const quantity = parseInt(metadata[`item_${i}_quantity`] ?? '1', 10);

		if (!productId || !size) continue;

		const productDoc = await adminDb!.collection('products').doc(productId).get();
		const productData = productDoc.exists ? productDoc.data()! : null;

		orderItems.push({
			productId,
			productTitle: productData?.title ?? 'Unknown',
			size,
			price: productData?.price ?? 0,
			quantity
		});

		if (productDoc.exists) {
			await productDoc.ref.update({
				[`sizes.${size}.stock`]: FieldValue.increment(-quantity),
				updatedAt: new Date()
			});

			const freshDoc = await productDoc.ref.get();
			const freshData = freshDoc.data();
			if (freshData?.sizes) {
				const totalStock = Object.values(freshData.sizes as Record<string, { stock: number }>)
					.reduce((sum, v) => sum + v.stock, 0);
				if (totalStock <= 0) {
					await productDoc.ref.update({ availability: 'sold', updatedAt: new Date() });
				}
			}
		}
	}

	const shipping = session.shipping_details;
	await adminDb!.collection('orders').add({
		stripeSessionId: session.id,
		stripePaymentIntentId: session.payment_intent,
		customerEmail: session.customer_details?.email ?? '',
		customerName: session.customer_details?.name ?? '',
		shippingAddress: shipping?.address ? {
			line1: shipping.address.line1 ?? '',
			line2: shipping.address.line2 ?? '',
			city: shipping.address.city ?? '',
			state: shipping.address.state ?? '',
			zip: shipping.address.postal_code ?? '',
			country: shipping.address.country ?? ''
		} : {},
		items: orderItems,
		subtotal: session.amount_subtotal ?? 0,
		shipping: session.total_details?.amount_shipping ?? 0,
		tax: session.total_details?.amount_tax ?? 0,
		total: session.amount_total ?? 0,
		status: 'paid',
		createdAt: new Date(),
		updatedAt: new Date()
	});
}

async function handleRefund(charge: Stripe.Charge) {
	if (!adminDb) return;

	const snap = await adminDb.collection('orders')
		.where('stripePaymentIntentId', '==', charge.payment_intent)
		.limit(1)
		.get();

	if (!snap.empty) {
		await snap.docs[0].ref.update({ status: 'refunded', updatedAt: new Date() });
	}
}
