import type { Timestamp } from 'firebase-admin/firestore';

export interface CommissionRequest {
	id: string;
	sourceProductId: string;
	sourceProductTitle: string;
	name: string;
	email: string;
	notes: string;
	budgetRange: string;
	preferredSize: string;
	status: 'new' | 'contacted' | 'in_progress' | 'completed' | 'declined';
	createdAt: Timestamp;
	updatedAt: Timestamp;
}

export const BUDGET_RANGES = [
	'$75–100',
	'$100–150',
	'$150–200',
	'$200+'
] as const;
