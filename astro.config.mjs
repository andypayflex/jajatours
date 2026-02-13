// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://jajatours.co.za',
  integrations: [sitemap()],
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        limitInputPixels: false,
        kernel: 'lanczos3',
        flatten: {
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
      }
    },
    domains: ['res.cloudinary.com'],
    remotePatterns: [{
      protocol: 'https',
    }]
  },
  build: {
    inlineStylesheets: 'auto',
    assets: '_astro'
  },
  vite: {
    build: {
      chunkSizeWarningLimit: 600
    }
  }
});