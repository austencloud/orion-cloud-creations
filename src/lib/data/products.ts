import type { Product } from '$lib/types/product';

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
		sizes: ['S', 'M', 'L', 'XL'],
		material: '100% cotton, Gildan Softstyle',
		availability: 'available',
		isOneOfAKind: true,
		price: 5500,
		images: [
			{
				url: '/images/products/blue-mandala.jpg',
				alt: 'Ice dye mandala t-shirt with radiant cyan center fading to deep blue and purple',
				type: 'flat_lay'
			}
		],
		featured: true,
		tags: ['mandala', 'ice dye', 'blue', 'purple', 'geometric']
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
		sizes: ['S', 'M', 'L', 'XL'],
		material: '100% cotton, Gildan Softstyle',
		availability: 'available',
		isOneOfAKind: true,
		price: 5500,
		images: [
			{
				url: '/images/products/fire-mandala.jpg',
				alt: 'Ice dye mandala t-shirt with golden center radiating through crimson to purple edges',
				type: 'flat_lay'
			}
		],
		featured: true,
		tags: ['mandala', 'ice dye', 'fire', 'orange', 'red', 'warm']
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
		sizes: ['M', 'L', 'XL'],
		material: '100% cotton, Gildan Softstyle',
		availability: 'available',
		isOneOfAKind: true,
		price: 5500,
		images: [
			{
				url: '/images/products/ice-dye-kaleidoscope.jpg',
				alt: 'Ice dye kaleidoscope pattern t-shirt in purple, gold, teal, and orange',
				type: 'flat_lay'
			}
		],
		featured: true,
		tags: ['kaleidoscope', 'ice dye', 'symmetry', 'multicolor']
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
		sizes: ['S', 'M', 'L', 'XL'],
		material: '100% cotton, Gildan Softstyle',
		availability: 'available',
		isOneOfAKind: true,
		price: 5500,
		images: [
			{
				url: '/images/products/psychedelic-ripple.jpg',
				alt: 'Psychedelic concentric ripple pattern t-shirt in neon teal with rainbow accents',
				type: 'flat_lay'
			}
		],
		featured: true,
		tags: ['ripple', 'shibori', 'psychedelic', 'teal', 'neon']
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
		sizes: ['M', 'L', 'XL', '2XL'],
		material: '100% cotton, Gildan Heavy Cotton',
		availability: 'available',
		isOneOfAKind: true,
		price: 5000,
		images: [
			{
				url: '/images/products/rainbow-starburst.jpg',
				alt: 'Rainbow starburst pattern t-shirt with bold color rays against black',
				type: 'flat_lay'
			}
		],
		featured: false,
		tags: ['starburst', 'rainbow', 'bold', 'high contrast']
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
		sizes: ['S', 'M', 'L', 'XL'],
		material: '100% cotton, Gildan Softstyle',
		availability: 'available',
		isOneOfAKind: true,
		price: 5000,
		images: [
			{
				url: '/images/products/reverse-spiral-rainbow.jpg',
				alt: 'Reverse dye spiral t-shirt with rainbow colors on black',
				type: 'flat_lay'
			}
		],
		featured: false,
		tags: ['spiral', 'reverse dye', 'rainbow', 'classic']
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
		sizes: ['M', 'L', 'XL'],
		material: '100% cotton, Gildan Softstyle',
		availability: 'available',
		isOneOfAKind: true,
		price: 5000,
		images: [
			{
				url: '/images/products/classic-spiral-rainbow.jpg',
				alt: 'Classic rainbow spiral t-shirt with full color spectrum',
				type: 'flat_lay'
			}
		],
		featured: false,
		tags: ['spiral', 'rainbow', 'classic', 'bold']
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
		sizes: ['M', 'L', 'XL'],
		material: '100% cotton, lightweight',
		availability: 'available',
		isOneOfAKind: true,
		price: 7500,
		images: [
			{
				url: '/images/products/ocean-spiral-hoodie.jpg',
				alt: 'Lightweight hoodie with ocean blue and purple double spiral pattern',
				type: 'flat_lay'
			}
		],
		featured: true,
		tags: ['hoodie', 'spiral', 'ocean', 'blue', 'outerwear']
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
		sizes: ['S', 'M', 'L'],
		material: '100% cotton, Gildan Softstyle',
		availability: 'available',
		isOneOfAKind: true,
		price: 5500,
		images: [
			{
				url: '/images/products/golden-shibori-grid.jpg',
				alt: 'Geometric shibori grid pattern t-shirt in gold, orange, purple, and blue',
				type: 'flat_lay'
			}
		],
		featured: false,
		tags: ['shibori', 'geometric', 'grid', 'gold', 'structured']
	},
	{
		id: '010',
		slug: 'rose-ice-dye-tank',
		title: 'Rose Ice Dye Tank',
		description:
			'Women\'s racerback tank with rich rose and magenta ice dye crumple pattern. Deep purples and greens emerge organically through the ice melt process. Ribbed cotton for a fitted silhouette.',
		garmentType: 'tank',
		techniques: ['ice_dye', 'crumple'],
		colorway: ['rose', 'magenta', 'purple', 'green'],
		colorFamily: 'warm',
		sizes: ['S', 'M', 'L'],
		material: '100% cotton, ribbed',
		availability: 'available',
		isOneOfAKind: true,
		price: 4500,
		images: [
			{
				url: '/images/products/rose-ice-dye-tank.jpg',
				alt: 'Rose and magenta ice dye crumple pattern tank top on mannequin',
				type: 'hero'
			},
			{
				url: '/images/products/rose-ice-dye-tank-alt.jpg',
				alt: 'Rose ice dye tank top alternate angle showing crumple pattern detail',
				type: 'detail'
			}
		],
		featured: false,
		tags: ['tank', 'ice dye', 'rose', 'women', 'fitted']
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
		sizes: ['M', 'L', 'XL'],
		material: '100% cotton, Gildan Long Sleeve',
		availability: 'available',
		isOneOfAKind: true,
		price: 6000,
		images: [
			{
				url: '/images/products/owl-shibori-longsleeve.jpg',
				alt: 'Long sleeve shirt with symmetric shibori pattern in green, purple, and blue',
				type: 'flat_lay'
			}
		],
		featured: false,
		tags: ['long sleeve', 'shibori', 'symmetric', 'green', 'purple']
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
		sizes: ['M', 'L', 'XL', '2XL'],
		material: '100% cotton, Gildan Softstyle',
		availability: 'available',
		isOneOfAKind: true,
		price: 5500,
		images: [
			{
				url: '/images/products/sunset-ice-crackle.jpg',
				alt: 'Sunset gradient ice crackle t-shirt with warm top and cool crystalline bottom',
				type: 'flat_lay'
			}
		],
		featured: true,
		tags: ['ice dye', 'shibori', 'sunset', 'gradient', 'split palette']
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
		sizes: ['S', 'M', 'L'],
		material: '100% cotton',
		availability: 'sold',
		isOneOfAKind: true,
		price: 5000,
		images: [
			{
				url: '/images/products/spiral-on-body.jpg',
				alt: 'Model wearing reverse spiral t-shirt in forest green, magenta, and black',
				type: 'lifestyle'
			}
		],
		featured: false,
		tags: ['spiral', 'reverse dye', 'dark', 'lifestyle', 'on body']
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
