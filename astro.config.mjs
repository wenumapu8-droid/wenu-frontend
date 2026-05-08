// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// SSG (static) — WooCommerce calls happen at build time.
export default defineConfig({
  output: 'static',
  site: 'https://wenumapuonline.com',
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/admin/'),
    }),
  ],
});
