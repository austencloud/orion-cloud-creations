import type { Product } from '$lib/types/product';

const now = new Date('2026-01-01');

export const products: Product[] = [
	{
		id: '001',
		slug: 'blue-mandala-tee',
		title: 'Blue Mandala Tee',
		description:
			'Ice-dyed mandala with a radiant cyan center that fades through deep blue into purple edges. Each fold creates the geometric symmetry by hand. Procion fiber reactive dyes on 100% cotton.',
		garmentType: 'shirt',
		techniques: ['ice_dye', 'mandala'],
		colorway: ['cyan', 'deep blue', 'purple'],
		colorFamily: 'cool',
		sizes: { S: { stock: 1 }, M: { stock: 1 }, L: { stock: 1 }, XL: { stock: 1 } },
		material: '100% cotton, Gildan Softstyle',
		availability: 'available',
		isOneOfAKind: true,
		price: 5500,
		mediaItemIds: [],
		heroImageIndex: 0,
		featured: true,
		createdAt: now,
		updatedAt: now
	},
	{
		id: '002',
		slug: 'fire-mandala-tee',
		title: 'Fire Mandala Tee',
		description:
			'Blazing mandala with a golden-orange center radiating through crimson and magenta into deep purple edges. The ice dye technique creates organic crystalline patterns within the geometric fold structure.',
		garmentType: 'shirt',
		techniques: ['ice_dye', 'mandala'],
		colorway: ['gold', 'orange', 'crimson', 'magenta', 'purple'],
		colorFamily: 'warm',
		sizes: { S: { stock: 1 }, M: { stock: 1 }, L: { stock: 1 }, XL: { stock: 1 } },
		material: '100% cotton, Gildan Softstyle',
		availability: 'available',
		isOneOfAKind: true,
		price: 5500,
		mediaItemIds: [],
		heroImageIndex: 0,
		featured: true,
		createdAt: now,
		updatedAt: now
	},
	{
		id: '003',
		slug: 'ice-dye-kaleidoscope-tee',
		title: 'Ice Dye Kaleidoscope Tee',
		description:
			'Dense kaleidoscope pattern created through precise accordion folding and ice dye application. Purple, gold, teal, and orange blend through the crystalline ice melt process.',
		garmentType: 'shirt',
		techniques: ['ice_dye', 'shibori'],
		colorway: ['purple', 'gold', 'teal', 'orange'],
		colorFamily: 'rainbow',
		sizes: { M: { stock: 1 }, L: { stock: 1 }, XL: { stock: 1 } },
		material: '100% cotton, Gildan Softstyle',
		availability: 'available',
		isOneOfAKind: true,
		price: 5500,
		mediaItemIds: [],
		heroImageIndex: 0,
		featured: true,
		createdAt: now,
		updatedAt: now
	},
	{
		id: '004',
		slug: 'psychedelic-ripple-tee',
		title: 'Psychedelic Ripple Tee',
		description:
			'Concentric ripple pattern radiating from the center in neon teal, with rainbow-spectrum accents along each wave. Achieved through precise accordion fan-folding before the dye application.',
		garmentType: 'shirt',
		techniques: ['shibori'],
		colorway: ['neon teal', 'rainbow', 'black'],
		colorFamily: 'cool',
		sizes: { S: { stock: 1 }, M: { stock: 1 }, L: { stock: 1 }, XL: { stock: 1 } },
		material: '100% cotton, Gildan Softstyle',
		availability: 'available',
		isOneOfAKind: true,
		price: 5500,
		mediaItemIds: [],
		heroImageIndex: 0,
		featured: true,
		createdAt: now,
		updatedAt: now
	},
	{
		id: '005',
		slug: 'rainbow-starburst-tee',
		title: 'Rainbow Starburst Tee',
		description:
			'Bold starburst pattern with rays of color shooting out from a bright yellow center. Full rainbow spectrum against black channels creates high contrast and visual impact.',
		garmentType: 'shirt',
		techniques: ['starburst'],
		colorway: ['yellow', 'green', 'orange', 'red', 'purple', 'black'],
		colorFamily: 'rainbow',
		sizes: { M: { stock: 1 }, L: { stock: 1 }, XL: { stock: 1 }, '2XL': { stock: 1 } },
		material: '100% cotton, Gildan Heavy Cotton',
		availability: 'available',
		isOneOfAKind: true,
		price: 5000,
		mediaItemIds: [],
		heroImageIndex: 0,
		featured: false,
		createdAt: now,
		updatedAt: now
	},
	{
		id: '006',
		slug: 'reverse-spiral-rainbow-tee',
		title: 'Reverse Spiral Rainbow Tee',
		description:
			'Classic spiral done with reverse dye technique. The black channels create depth while rainbow colors burst through each spiral arm. Every section a different hue.',
		garmentType: 'shirt',
		techniques: ['spiral', 'reverse'],
		colorway: ['rainbow', 'black'],
		colorFamily: 'rainbow',
		sizes: { S: { stock: 1 }, M: { stock: 1 }, L: { stock: 1 }, XL: { stock: 1 } },
		material: '100% cotton, Gildan Softstyle',
		availability: 'available',
		isOneOfAKind: true,
		price: 5000,
		mediaItemIds: [],
		heroImageIndex: 0,
		featured: false,
		createdAt: now,
		updatedAt: now
	},
	{
		id: '007',
		slug: 'classic-spiral-rainbow-tee',
		title: 'Classic Spiral Rainbow Tee',
		description:
			'Full-spectrum rainbow spiral with bold, saturated colors. Orange, yellow, green, blue, purple, and magenta spin from the center with black crackle texture throughout.',
		garmentType: 'shirt',
		techniques: ['spiral'],
		colorway: ['rainbow', 'black'],
		colorFamily: 'rainbow',
		sizes: { M: { stock: 1 }, L: { stock: 1 }, XL: { stock: 1 } },
		material: '100% cotton, Gildan Softstyle',
		availability: 'available',
		isOneOfAKind: true,
		price: 5000,
		mediaItemIds: [],
		heroImageIndex: 0,
		featured: false,
		createdAt: now,
		updatedAt: now
	},
	{
		id: '008',
		slug: 'ocean-spiral-hoodie',
		title: 'Ocean Spiral Hoodie',
		description:
			'Lightweight hoodie with a double spiral in ocean blues and purples. Cool cyan tones dominate with purple undertones creating depth. Perfect for cool evenings.',
		garmentType: 'hoodie',
		techniques: ['spiral'],
		colorway: ['cyan', 'blue', 'purple', 'lavender'],
		colorFamily: 'cool',
		sizes: { M: { stock: 1 }, L: { stock: 1 }, XL: { stock: 1 } },
		material: '100% cotton, lightweight',
		availability: 'available',
		isOneOfAKind: true,
		price: 7500,
		mediaItemIds: [],
		heroImageIndex: 0,
		featured: true,
		createdAt: now,
		updatedAt: now
	},
	{
		id: '009',
		slug: 'golden-shibori-grid-tee',
		title: 'Golden Shibori Grid Tee',
		description:
			'Geometric grid pattern achieved through precise shibori binding technique. Gold and orange bars intersect with purple and blue channels in a structured, almost architectural design.',
		garmentType: 'shirt',
		techniques: ['shibori'],
		colorway: ['gold', 'orange', 'purple', 'blue'],
		colorFamily: 'warm',
		sizes: { S: { stock: 1 }, M: { stock: 1 }, L: { stock: 1 } },
		material: '100% cotton, Gildan Softstyle',
		availability: 'available',
		isOneOfAKind: true,
		price: 5500,
		mediaItemIds: [],
		heroImageIndex: 0,
		featured: false,
		createdAt: now,
		updatedAt: now
	},
	{
		id: '010',
		slug: 'rose-ice-dye-tank',
		title: 'Rose Ice Dye Tank',
		description:
			"Women's racerback tank with rich rose and magenta ice dye crumple pattern. Deep purples and greens emerge organically through the ice melt process. Ribbed cotton for a fitted silhouette.",
		garmentType: 'tank',
		techniques: ['ice_dye', 'crumple'],
		colorway: ['rose', 'magenta', 'purple', 'green'],
		colorFamily: 'warm',
		sizes: { S: { stock: 1 }, M: { stock: 1 }, L: { stock: 1 } },
		material: '100% cotton, ribbed',
		availability: 'available',
		isOneOfAKind: true,
		price: 4500,
		mediaItemIds: [],
		heroImageIndex: 0,
		featured: false,
		createdAt: now,
		updatedAt: now
	},
	{
		id: '011',
		slug: 'owl-shibori-longsleeve',
		title: 'Owl Shibori Long Sleeve',
		description:
			'Long sleeve with a dramatic symmetric shibori pattern that creates an owl-like face. Vivid green center flanked by purple and blue with precise ripple rays extending to the edges.',
		garmentType: 'long_sleeve',
		techniques: ['shibori'],
		colorway: ['green', 'purple', 'blue', 'gold'],
		colorFamily: 'cool',
		sizes: { M: { stock: 1 }, L: { stock: 1 }, XL: { stock: 1 } },
		material: '100% cotton, Gildan Long Sleeve',
		availability: 'available',
		isOneOfAKind: true,
		price: 6000,
		mediaItemIds: [],
		heroImageIndex: 0,
		featured: false,
		createdAt: now,
		updatedAt: now
	},
	{
		id: '012',
		slug: 'sunset-ice-crackle-tee',
		title: 'Sunset Ice Crackle Tee',
		description:
			'Split-palette design with a warm sunset gradient top half and cool ice crackle bottom. Gold and orange shibori stripes dissolve into deep blue and purple crystalline ice dye textures.',
		garmentType: 'shirt',
		techniques: ['ice_dye', 'shibori'],
		colorway: ['gold', 'orange', 'magenta', 'blue', 'purple'],
		colorFamily: 'rainbow',
		sizes: { M: { stock: 1 }, L: { stock: 1 }, XL: { stock: 1 }, '2XL': { stock: 1 } },
		material: '100% cotton, Gildan Softstyle',
		availability: 'available',
		isOneOfAKind: true,
		price: 5500,
		mediaItemIds: [],
		heroImageIndex: 0,
		featured: true,
		createdAt: now,
		updatedAt: now
	},
	{
		id: '013',
		slug: 'spiral-on-body-tee',
		title: 'Dark Spiral Tee',
		description:
			'Reverse spiral in deep forest green, magenta, and black. Moody, rich tones with the spiral radiating from the chest. Looks incredible on.',
		garmentType: 'shirt',
		techniques: ['spiral', 'reverse'],
		colorway: ['forest green', 'magenta', 'teal', 'black'],
		colorFamily: 'cool',
		sizes: { S: { stock: 0 }, M: { stock: 0 }, L: { stock: 0 } },
		material: '100% cotton',
		availability: 'sold',
		isOneOfAKind: true,
		price: 5000,
		mediaItemIds: [],
		heroImageIndex: 0,
		featured: false,
		createdAt: now,
		updatedAt: now
	}
];

export function getProductBySlug(slug: string): Product | undefined {
	return products.find((p) => p.slug === slug);
}

export function getFeaturedProducts(): Product[] {
	return products.filter((p) => p.featured);
}

export function getAvailableProducts(): Product[] {
	return products.filter((p) => p.availability === 'available');
}

export function getAllProducts(): Product[] {
	return products;
}

export function getProductsByTechnique(technique: string): Product[] {
	return products.filter((p) => p.techniques.includes(technique as any));
}

export function getProductsByGarmentType(type: string): Product[] {
	return products.filter((p) => p.garmentType === type);
}

export function formatPrice(cents: number): string {
	return `$${(cents / 100).toFixed(0)}`;
}
