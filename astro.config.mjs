// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import sanity from '@sanity/astro';

const sanityProjectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
const sanityDataset = import.meta.env.PUBLIC_SANITY_DATASET;
const hasValidSanityConfig =
  typeof sanityProjectId === 'string' &&
  /^[a-z0-9][a-z0-9-]*$/i.test(sanityProjectId) &&
  typeof sanityDataset === 'string' &&
  sanityDataset.trim().length > 0;

// https://astro.build/config
export default defineConfig({
  site: 'https://jajatours.co.za',
  integrations: [
    sitemap(),
    ...(hasValidSanityConfig
      ? [
          sanity({
            projectId: sanityProjectId,
            dataset: sanityDataset,
            apiVersion: '2026-02-13',
            useCdn: false,
          }),
        ]
      : []),
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
