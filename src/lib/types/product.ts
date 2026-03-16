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

export interface Product {
	id: string;
	slug: string;
	title: string;
	description: string;
	garmentType: GarmentType;
	techniques: Technique[];
	colorway: string[];
	colorFamily: ColorFamily;
	sizes: Size[];
	material: string;
	availability: 'available' | 'sold' | 'gallery_only';
	isOneOfAKind: boolean;
	price: number;
	images: ProductImage[];
	featured: boolean;
	tags: string[];
}

export interface ProductImage {
	url: string;
	alt: string;
	type: 'hero' | 'detail' | 'lifestyle' | 'flat_lay' | 'closeup';
}
