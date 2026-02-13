export const sanityConfig = {
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || '',
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2026-02-13',
  useCdn: false, // false for static builds — get latest content at build time
};
