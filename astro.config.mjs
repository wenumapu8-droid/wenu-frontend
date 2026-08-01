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
      changefreq: 'weekly',
      priority: 0.6,
      lastmod: new Date(),
      serialize(item) {
        const url = item.url;
        // Curated priorities by section
        if (url === 'https://wenumapuonline.com/' || url === 'https://wenumapuonline.com')   { item.priority = 1.0; item.changefreq = 'daily'; }
        else if (url.includes('/shop/'))                  { item.priority = 0.9; item.changefreq = 'daily'; }
        else if (url.includes('/p/'))                     { item.priority = 0.8; item.changefreq = 'weekly'; }
        else if (url.includes('/custom-orders/'))         { item.priority = 0.85; item.changefreq = 'monthly'; }
        else if (url.includes('/care-guide/'))            { item.priority = 0.7;  item.changefreq = 'monthly'; }
        else if (url.includes('/about/') || url.includes('/materials/') || url.includes('/artistry/')) { item.priority = 0.6; item.changefreq = 'monthly'; }
        else if (url.includes('/contact/') || url.includes('/local/') || url.includes('/stockists/')) { item.priority = 0.6; item.changefreq = 'monthly'; }
        else if (url.includes('/faq/') || url.includes('/sizing-guide/') || url.includes('/shipping-returns/')) { item.priority = 0.5; item.changefreq = 'monthly'; }
        else if (url.includes('/journal/'))               { item.priority = 0.5; item.changefreq = 'weekly'; }
        else if (url.includes('/terms/') || url.includes('/privacy/') || url.includes('/accessibility/')) { item.priority = 0.3; item.changefreq = 'yearly'; }
        else                                              { item.priority = 0.5; item.changefreq = 'monthly'; }
        return item;
      },
    }),
  ],
});
