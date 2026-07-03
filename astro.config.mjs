// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import vercel from '@astrojs/vercel';

import mdx from '@astrojs/mdx';

import react from '@astrojs/react';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://theodorodev.com',

  output: 'static',

  vite: {
    plugins: [tailwindcss()]
  },

  adapter: vercel(),

  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Instrument Sans',
      cssVariable: '--font-instrument-sans',
      weights: ['400 700'],
      styles: ['normal']
    },
    {
      provider: fontProviders.google(),
      name: 'JetBrains Mono',
      cssVariable: '--font-jetbrains-mono',
      weights: [400, 500],
      styles: ['normal']
    }
  ],

  integrations: [mdx(), react(), sitemap({ filter: (page) => !page.includes('/og/') })]
});