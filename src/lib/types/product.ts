export type GarmentType =
	| 'shirt'
	| 'long_sleeve'
	| 'tank'
	| 'hoodie'
	| 'crewneck'
	| 'leggings'
	| 'bandana'
	| 'tapestry';

export type Technique =
	| 'ice_dye'
	| 'scrunch'
	| 'spiral'
	| 'geode'
	| 'crumple'
	| 'shibori'
	| 'bullseye'
	| 'mandala'
	| 'reverse'
	| 'starburst';

export type ColorFamily = 'warm' | 'cool' | 'neutral' | 'rainbow' | 'monochrome' | 'earth';

export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | '2XL' | '3XL';

export const ALL_SIZES: Size[] = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
export const ALL_GARMENT_TYPES: GarmentType[] = ['shirt', 'long_sleeve', 'tank', 'hoodie', 'crewneck', 'leggings', 'bandana', 'tapestry'];
export const ALL_COLOR_FAMILIES: ColorFamily[] = ['warm', 'cool', 'neutral', 'rainbow', 'monochrome', 'earth'];

export interface SizeVariant {
	stock: number;
	sku?: string;
}

export interface Product {
	id: string;
	slug: string;
	title: string;
	description: string;
	garmentType: GarmentType;
	techniques: string[];
	colorway: string[];
	colorFamily: ColorFamily;
	sizes: Record<string, SizeVariant>;
	material: string;
	price: number;
	compareAtPrice?: number;
	availability: 'available' | 'sold' | 'draft' | 'archived';
	isOneOfAKind: boolean;
	featured: boolean;
	mediaItemIds: string[];
	heroImageIndex: number;
	stripeProductId?: string;
	stripePriceId?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface ProductImage {
	thumbnailUrl: string;
	originalUrl: string;
}

export interface StorefrontProduct {
	id: string;
	slug: string;
	title: string;
	description: string;
	garmentType: GarmentType;
	techniques: string[];
	colorway: string[];
	colorFamily: ColorFamily;
	sizes: Record<string, SizeVariant>;
	material: string;
	price: number;
	compareAtPrice?: number;
	availability: 'available' | 'sold' | 'draft' | 'archived';
	isOneOfAKind: boolean;
	featured: boolean;
	images: ProductImage[];
	createdAt: string;
	updatedAt: string;
}

export function formatPrice(cents: number): string {
	return '$' + (cents / 100).toFixed(2);
}

export function generateSlug(title: string): string {
	return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function getTotalStock(sizes: Record<string, SizeVariant>): number {
	return Object.values(sizes).reduce((sum, v) => sum + v.stock, 0);
}
