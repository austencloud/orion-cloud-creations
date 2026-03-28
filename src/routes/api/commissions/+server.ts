import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { adminDb } from '$lib/server/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const POST: RequestHandler = async ({ request }) => {
	if (!adminDb) throw error(500, 'Firebase not configured');

	const body = await request.json();

	// Honeypot spam protection — if "website" field is filled, silently reject
	if (body.website) {
		return json({ success: true });
	}

	const { sourceProductId, sourceProductTitle, name, email, notes, budgetRange, preferredSize } = body;

	if (!name || typeof name !== 'string' || name.trim().length === 0) {
		throw error(400, 'Name is required');
	}
	if (!email || typeof email !== 'string' || !email.includes('@')) {
		throw error(400, 'Valid email is required');
	}
	if (!sourceProductId || typeof sourceProductId !== 'string') {
		throw error(400, 'Source product is required');
	}

	const doc = await adminDb.collection('commissionRequests').add({
		sourceProductId,
		sourceProductTitle: sourceProductTitle ?? '',
		name: name.trim(),
		email: email.trim().toLowerCase(),
		notes: (notes ?? '').trim(),
		budgetRange: budgetRange ?? '',
		preferredSize: (preferredSize ?? '').trim(),
		status: 'new',
		createdAt: FieldValue.serverTimestamp(),
		updatedAt: FieldValue.serverTimestamp()
	});

	return json({ success: true, id: doc.id });
};
