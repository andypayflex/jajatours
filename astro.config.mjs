// @ts-check
import { defineConfig, envField } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import sanity from '@sanity/astro';
import { loadEnv } from 'vite';

const { PUBLIC_SANITY_PROJECT_ID = 'abc12345', PUBLIC_SANITY_DATASET = 'production' } = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');

// https://astro.build/config
export default defineConfig({
  site: 'https://jajatours.co.za',
  integrations: [
    sitemap(),
    sanity({
      projectId: PUBLIC_SANITY_PROJECT_ID,
      dataset: PUBLIC_SANITY_DATASET,
      apiVersion: '2026-02-13',
      useCdn: false,
    }),
  ],
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
    domains: ['res.cloudinary.com', 'cdn.sanity.io'],
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
    },
    preview: {
      allowedHosts: true
    }
  }
});