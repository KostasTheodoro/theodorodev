import { OGImageRoute } from 'astro-og-canvas';
import { getOgPages } from '@/data/ogPages';

const pages = await getOgPages();

// Colors pinned to the Aegean Petrol dark palette in src/styles/global.css — do not edit here.
export const { getStaticPaths, GET } = await OGImageRoute({
	pages,
	getImageOptions: (_path, page) => ({
		title: page.title,
		description: page.description,
		bgGradient: [[0x0b, 0x1b, 0x20]], // --bg
		border: { color: [0x4f, 0xb3, 0xc6], width: 6, side: 'block-start' }, // --primary
		padding: 80,
		logo: { path: './public/android-chrome-512x512.png', size: [96] },
		font: {
			title: {
				color: [0xed, 0xe7, 0xda], // --text
				size: 64,
				weight: 'Bold',
				families: ['Instrument Sans', 'Noto Sans'],
			},
			description: {
				color: [0x8f, 0xa3, 0xa8], // --text-muted
				size: 32,
				families: ['Instrument Sans', 'Noto Sans'],
			},
		},
		// Noto Sans is a fallback for Greek glyphs, which Instrument Sans doesn't cover.
		fonts: ['./src/assets/fonts/InstrumentSans-Variable.ttf', './src/assets/fonts/NotoSans-Variable.ttf'],
	}),
});
