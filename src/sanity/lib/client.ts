import { createClient } from '@sanity/client';
import { sanityConfig } from '../config';

export const client = createClient({
  ...sanityConfig,
  perspective: 'published', // Only fetch published documents
});
