
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/" | "/about" | "/gallery" | "/product" | "/product/[slug]" | "/shop" | "/techniques";
		RouteParams(): {
			"/product/[slug]": { slug: string }
		};
		LayoutParams(): {
			"/": { slug?: string };
			"/about": Record<string, never>;
			"/gallery": Record<string, never>;
			"/product": { slug?: string };
			"/product/[slug]": { slug: string };
			"/shop": Record<string, never>;
			"/techniques": Record<string, never>
		};
		Pathname(): "/" | "/about" | "/gallery" | `/product/${string}` & {} | "/shop" | "/techniques";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/images/hero/hero-fire.jpg" | "/images/hero/hero-mandala.jpg" | "/images/logo.png" | "/images/process/dye-rack.jpg" | "/images/process/pre-dye-prep.jpg" | "/images/process/procion-dyes.jpg" | "/images/products/blue-mandala.jpg" | "/images/products/classic-spiral-rainbow.jpg" | "/images/products/fire-mandala.jpg" | "/images/products/golden-shibori-grid.jpg" | "/images/products/ice-dye-kaleidoscope.jpg" | "/images/products/ocean-spiral-hoodie.jpg" | "/images/products/owl-shibori-longsleeve.jpg" | "/images/products/psychedelic-ripple.jpg" | "/images/products/rainbow-starburst.jpg" | "/images/products/reverse-spiral-rainbow.jpg" | "/images/products/rose-ice-dye-tank-alt.jpg" | "/images/products/rose-ice-dye-tank.jpg" | "/images/products/spiral-on-body.jpg" | "/images/products/sunset-ice-crackle.jpg" | string & {};
	}
}