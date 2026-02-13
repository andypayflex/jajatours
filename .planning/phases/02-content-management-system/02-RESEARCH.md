# Phase 02: Content Management System - Research

**Researched:** 2026-02-13
**Domain:** Headless CMS integration with Sanity and Astro
**Confidence:** MEDIUM

## Summary

This research investigates implementing a headless CMS using Sanity with Astro 5.17+ for a tour guide business. The standard approach combines Sanity Studio v4 for content management with Astro's static site generation, leveraging GROQ queries at build time and Netlify webhooks for automated deployments.

Sanity provides enterprise-grade structured content management with TypeScript support, visual editing capabilities, and powerful image optimization through its CDN. The integration with Astro is officially supported via `@sanity/astro`, enabling zero-JavaScript content delivery while maintaining developer flexibility through TypeScript-generated schemas and GROQ's precise data fetching.

Key challenges include proper content modeling (avoiding "lift and shift" from unstructured content), security considerations (never exposing tokens client-side), and performance optimization (using `useCdn: false` for static builds and optimizable GROQ filters).

**Primary recommendation:** Use Sanity Studio v4 with `@sanity/astro` integration, TypeGen for type safety, Portable Text for rich content, and build-time GROQ queries with Netlify webhooks for content updates.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `sanity` | v4+ | Sanity Studio and CLI | Official CMS platform, requires Node v20+, industry standard for structured content |
| `@sanity/astro` | ^3.2.11 | Official Astro integration | Maintained by Sanity, ensures compatibility with every Astro release |
| `@sanity/client` | latest | JavaScript client for API calls | Official client for retrieving/creating/patching data from Sanity |
| `@sanity/image-url` | latest | Image URL builder | Generates optimized image URLs respecting crops/hotspots, integrates with Sanity CDN |
| `astro-portabletext` | latest | Portable Text renderer for Astro | Recommended library for converting Portable Text to Astro components |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@sanity/vision` | latest | GROQ query testing tool | Development plugin for testing queries in Studio |
| `sanity-plugin-dashboard-widget-netlify` | latest | Netlify deployment widget | When editors need manual deploy control from Studio |
| `sanity-plugin-asset-source-cloudinary` | v1.4.0 | Cloudinary integration | When using Cloudinary as additional asset source in Studio |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Sanity | Contentful | Contentful has more enterprise pricing tiers but less flexible schema modeling |
| Sanity | Strapi | Strapi is self-hosted (more control) but requires infrastructure management |
| Sanity | Cosmic | Cosmic has simpler pricing but less mature TypeScript/developer tooling |
| GROQ | GraphQL | Sanity supports both; GROQ is more precise for specific queries, GraphQL better for known patterns |

**Installation:**
```bash
# Initialize new Sanity project
npm create sanity@latest

# Add Astro integration
npm install @sanity/astro @sanity/client @sanity/image-url astro-portabletext

# Add Astro integration via CLI (alternative)
npx astro add @sanity/astro
```

## Architecture Patterns

### Recommended Project Structure

```
project-root/
├── src/
│   ├── sanity/
│   │   ├── schemaTypes/
│   │   │   ├── index.ts           # Schema type exports
│   │   │   ├── tour.ts            # Tour document type
│   │   │   ├── blogPost.ts        # Blog post document type
│   │   │   ├── galleryImage.ts    # Gallery image document type
│   │   │   ├── testimonial.ts     # Testimonial document type
│   │   │   ├── author.ts          # Author document type
│   │   │   └── blockContent.ts    # Reusable rich text type
│   │   ├── lib/
│   │   │   ├── client.ts          # Sanity client configuration
│   │   │   ├── queries.ts         # GROQ query definitions
│   │   │   ├── image.ts           # Image URL builder helpers
│   │   │   └── resolve.ts         # Document location resolvers
│   │   └── config.ts              # Sanity configuration
│   ├── components/
│   │   ├── PortableText.astro     # Portable Text renderer
│   │   └── PortableTextImage.astro # Custom image component
│   ├── layouts/
│   │   └── Layout.astro           # With VisualEditing component
│   └── pages/
│       ├── tours/[slug].astro     # Dynamic tour pages
│       ├── blog/[slug].astro      # Dynamic blog pages
│       └── gallery.astro          # Gallery listing
├── sanity/                         # Separate Sanity Studio root
│   ├── schemaTypes/               # Same schemas as src/sanity/schemaTypes
│   ├── sanity.config.ts           # Studio configuration
│   ├── sanity.cli.ts              # CLI configuration with TypeGen
│   └── package.json               # Studio dependencies
├── .env                           # Environment variables
└── astro.config.mjs               # Astro + Sanity integration config
```

### Pattern 1: Static Build with Webhook Rebuilds

**What:** Query Sanity at build time using `useCdn: false`, trigger Netlify rebuilds via webhooks when content changes

**When to use:** Static sites (like this project) where performance matters more than instant content updates

**Example:**
```typescript
// src/sanity/lib/client.ts
// Source: Sanity official documentation
import { createClient } from '@sanity/client';

export const client = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: import.meta.env.PUBLIC_SANITY_DATASET,
  apiVersion: '2026-02-13', // Use current date format
  useCdn: false, // CRITICAL: false for static builds to get latest content
  perspective: 'published', // Only fetch published documents
});
```

**Webhook configuration:**
```typescript
// In Sanity Studio > API > Webhooks
// Name: Netlify Deploy
// URL: https://api.netlify.com/build_hooks/{YOUR_BUILD_HOOK_ID}
// Dataset: production
// Trigger on: Create, Update, Delete, Publish
// Filter: _type in ["tour", "blogPost", "galleryImage", "testimonial"]
```

### Pattern 2: Type-Safe Content Modeling with TypeGen

**What:** Generate TypeScript types from Sanity schemas for end-to-end type safety

**When to use:** All projects using TypeScript (this project uses strict mode)

**Example:**
```typescript
// sanity.cli.ts
// Source: Sanity TypeGen documentation
import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_API_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_API_DATASET,
  },
  studioHost: 'your-studio-name',
  // TypeGen configuration
  schema: {
    extract: {
      path: './schema.json', // Extracted schema
    },
  },
});
```

**Generate types:**
```bash
# Extract schema and generate types
sanity schema extract
sanity typegen generate
```

This creates `sanity.types.ts` with full TypeScript definitions for all schemas and GROQ query results.

### Pattern 3: Optimized Image Delivery

**What:** Use `@sanity/image-url` to generate optimized URLs with Sanity CDN, allowing Astro's Image component to handle final optimization

**When to use:** All image rendering from Sanity assets

**Example:**
```typescript
// src/sanity/lib/image.ts
// Source: Sanity Astro blog guide
import imageUrlBuilder from '@sanity/image-url';
import { client } from './client';
import type { Image } from '@sanity/types';

const builder = imageUrlBuilder(client);

export function urlForImage(source: Image) {
  return builder.image(source).auto('format').fit('max');
}

// Generate WebP and fallback URLs
export function getImageUrls(source: Image, width?: number) {
  const base = urlForImage(source);

  return {
    webp: base.format('webp').width(width || 1200).url(),
    fallback: base.width(width || 1200).url(),
  };
}
```

**Usage in Astro:**
```astro
---
// src/components/OptimizedImage.astro
import { Image } from 'astro:assets';
import { urlForImage } from '../sanity/lib/image';

interface Props {
  image: SanityImage;
  alt: string;
  width?: number;
}

const { image, alt, width = 1200 } = Astro.props;
const imageUrl = urlForImage(image).width(width).url();
---

<Image src={imageUrl} alt={alt} width={width} loading="lazy" />
```

### Pattern 4: GROQ Query Organization

**What:** Centralize GROQ queries in a dedicated file with TypeScript types, use query parameters for safe dynamic values

**When to use:** All content fetching

**Example:**
```typescript
// src/sanity/lib/queries.ts
// Source: Sanity best practices
import { groq } from '@sanity/client';

// Tour queries
export const allToursQuery = groq`
  *[_type == "tour" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    pricing,
    publishedAt
  }
`;

export const tourBySlugQuery = groq`
  *[_type == "tour" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    body,
    mainImage,
    pricing,
    availableDates,
    "author": author->{name, image, bio}
  }
`;

// Use with parameters (safe from injection)
// const tour = await client.fetch(tourBySlugQuery, { slug: 'example-tour' });
```

### Pattern 5: Portable Text Rendering

**What:** Convert Sanity's Portable Text format to HTML using `astro-portabletext` with custom components

**When to use:** All rich text content (blog posts, tour descriptions)

**Example:**
```astro
---
// src/components/PortableText.astro
import { PortableText as PT } from 'astro-portabletext';
import PortableTextImage from './PortableTextImage.astro';

interface Props {
  value: any[];
}

const { value } = Astro.props;

const components = {
  types: {
    image: PortableTextImage,
  },
  marks: {
    link: ({ children, value }) => {
      const { href } = value;
      return `<a href="${href}" rel="noopener noreferrer">${children}</a>`;
    },
  },
};
---

<PT value={value} components={components} />
```

### Anti-Patterns to Avoid

- **Exposing tokens client-side:** Never bundle `SANITY_AUTH_TOKEN` in browser JavaScript; use public PROJECT_ID and DATASET for read-only queries
- **Lift-and-shift content modeling:** Don't copy unstructured content into Sanity; design proper document types with structured fields
- **Over-fetching with GROQ:** Avoid queries like `*[_type == "tour"]` without projections; specify exactly which fields you need
- **Using `useCdn: true` for SSG:** Static builds need `useCdn: false` to get latest content at build time
- **Skipping validation rules:** Always define validation to prevent content editors from publishing incomplete data
- **Monolithic schemas:** Break large document types into reusable objects; use references instead of nesting everything
- **Ignoring GROQ optimization:** Queries using unknown values ahead of time (like `references()` in filters) force full dataset scans

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Rich text editing | Custom WYSIWYG or Markdown editor | Portable Text with Sanity's block editor | Handles structured content, embeds, annotations; edge cases like nested lists, images, custom blocks already solved |
| Image optimization | Custom image processing pipeline | `@sanity/image-url` + Sanity CDN | Handles crops, hotspots, format conversion, responsive sizes, caching; battle-tested at scale |
| Content versioning | Custom history/revision system | Sanity's built-in version history | Every document change automatically tracked; can restore any version |
| Workflow/publishing | Custom draft/publish logic | Sanity's draft/publish system | Built-in with `_id` conventions (`drafts.xyz` vs `xyz`); proper conflict resolution |
| User authentication | Custom auth for CMS | Sanity's OAuth2 with Google/GitHub | GDPR-compliant, 2FA support, role-based access control already implemented |
| Content relationships | Manual reference tracking | Sanity references and `references()` function | Type-safe references, automatic backlink tracking, circular reference handling |
| Query language | REST endpoints or custom GraphQL | GROQ (or Sanity's auto-generated GraphQL) | Optimized for content queries, handles projections, filtering, joins efficiently |
| Asset management | Custom file upload/storage | Sanity asset pipeline | Handles metadata, image analysis, AI tagging, CDN delivery, deduplication |

**Key insight:** Sanity is a complete "Content Operating System" - building custom solutions for these problems introduces complexity, security risks, and maintenance burden. The platform has already solved edge cases around content management that aren't obvious until production.

## Common Pitfalls

### Pitfall 1: JavaScript Rendering and SEO Issues

**What goes wrong:** Search engines can't see content because it's rendered client-side or routing is misconfigured

**Why it happens:** Headless CMS decouples front-end, creating opportunities for improper SSG/SSR configuration

**How to avoid:**
- Use Astro's static generation (`getStaticPaths()`) to pre-render all content pages
- Verify meta tags and structured data are in initial HTML (not injected by JS)
- Test with "View Source" in browser - if content isn't visible, search engines can't see it

**Warning signs:**
- Blog posts don't appear in Google Search Console
- Lighthouse SEO score drops
- Social media previews show empty content

### Pitfall 2: Content Model "Lift and Shift"

**What goes wrong:** Content is dumped into Sanity as unstructured text/HTML, losing the benefits of structured content

**Why it happens:** Teams migrate from traditional CMS without rethinking content architecture

**How to avoid:**
- Design schemas around content components, not pages (e.g., `tourPricing` object with `price`, `currency`, `validFrom` fields instead of free text)
- Use Portable Text for rich content, not HTML strings
- Create reusable object types for repeated patterns (testimonials, FAQs, pricing tiers)
- Use references for relationships (author, related tours) instead of duplicating data

**Warning signs:**
- Schemas with many `text` fields and few structured types
- Content editors asking "where do I put X?" because schema doesn't match mental model
- Difficult to query specific data (e.g., "all tours under $100")

### Pitfall 3: API Token Exposure

**What goes wrong:** Authentication tokens are bundled in client-side JavaScript, exposing the API to unauthorized access

**Why it happens:** Developers copy server-side patterns to client-side code without considering security

**How to avoid:**
- Use `PUBLIC_SANITY_PROJECT_ID` and `PUBLIC_SANITY_DATASET` for public read queries
- Store `SANITY_API_READ_TOKEN` only in server-side code or build processes (Astro endpoints, SSG)
- Never add auth tokens to `astro.config.mjs` or components that run in browser
- For visual editing, use read-only tokens with minimal permissions

**Warning signs:**
- Environment variables without `PUBLIC_` prefix used in `.astro` files
- Tokens visible in browser DevTools Network tab
- API usage spikes from unknown sources

### Pitfall 4: Non-Optimizable GROQ Queries

**What goes wrong:** Queries take 5+ seconds because they scan entire dataset instead of using indexes

**Why it happens:** Filters use values not known ahead of time, forcing over-fetch and in-memory filtering

**How to avoid:**
- Use exact match filters on indexed fields: `*[_type == "tour" && _id > $lastId]` instead of `*[_type == "tour"][0..20]`
- Avoid `count(*[references(^._id)])` in projections - use field-based pagination instead
- Keep queries small (<100 lines); consolidate multiple queries using projections
- Use GROQ parameters (`$slug`) instead of string interpolation

**Warning signs:**
- Build times increase as content grows
- Sanity Vision shows query execution >500ms
- Rate limiting errors from API

### Pitfall 5: Missing Webhook Filtering

**What goes wrong:** Every small edit triggers full site rebuild, slowing down content editors and wasting build minutes

**Why it happens:** Default webhook configuration triggers on all document changes

**How to avoid:**
- Filter webhooks by document type: `_type in ["tour", "blogPost", "galleryImage", "testimonial"]`
- Only trigger on publish, not drafts: `!(_id in path("drafts.**"))`
- Use GROQ filters in webhook config to skip non-essential changes
- Consider debouncing with scheduled builds if editors make many rapid changes

**Warning signs:**
- Netlify build queue has 10+ pending builds
- Editors complain "site takes 10 minutes to update"
- Monthly build minutes exceed quota

### Pitfall 6: Developer Dependencies for Content Updates

**What goes wrong:** Content editors can't add new content types or fields without developer assistance, defeating the purpose of a CMS

**Why it happens:** Over-complicated schemas with too many required technical fields, or missing validation/defaults

**How to avoid:**
- Provide defaults for technical fields (slug auto-generation from title, publishedAt defaults to now)
- Use validation with helpful error messages: `Rule.required().error('Please add a tour title')`
- Add descriptions to schema fields explaining what they're for
- Create custom input components for complex fields (date ranges, pricing structures)
- Test content workflows with actual content editors before launch

**Warning signs:**
- Content editors send Slack messages asking "how do I add X?"
- Many fields are left empty because editors don't understand them
- Schemas change weekly to accommodate editor requests

### Pitfall 7: Ignoring Content Lake Governance

**What goes wrong:** Content becomes inconsistent (some tours have pricing, others don't), unpublishable, or conflicted

**Why it happens:** No validation rules, workflows, or roles defined; everyone can edit everything

**How to avoid:**
- Define required fields with validation: `Rule.required()` for critical data
- Use field-level vs document-level validation appropriately
- Create custom roles for different editor types (blog editor vs tour manager)
- Implement references for shared data (authors, categories) to avoid duplication
- Use warnings (`Rule.warning()`) for guidance without blocking publish

**Warning signs:**
- Published tours missing prices or dates
- Inconsistent category naming (Tours vs tours vs TOURS)
- Multiple people editing same document causing conflicts

## Code Examples

Verified patterns from official sources:

### Complete Tour Schema Example

```typescript
// src/sanity/schemaTypes/tour.ts
// Source: Sanity schema documentation + Astro blog guide patterns
import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'tour',
  title: 'Tour',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tour Title',
      type: 'string',
      validation: (Rule) => Rule.required().error('Please add a tour title'),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      description: 'Short description for tour listings and SEO',
      validation: (Rule) => Rule.max(160).warning('Keep under 160 characters for SEO'),
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true, // Enables intelligent cropping
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          validation: (Rule) => Rule.required().error('Alt text is required for accessibility'),
        },
      ],
    }),
    defineField({
      name: 'body',
      title: 'Tour Description',
      type: 'blockContent', // Reference to reusable Portable Text type
    }),
    defineField({
      name: 'pricing',
      title: 'Pricing',
      type: 'object',
      fields: [
        { name: 'amount', type: 'number', title: 'Price', validation: (Rule) => Rule.required().min(0) },
        {
          name: 'currency',
          type: 'string',
          title: 'Currency',
          options: { list: ['ZAR', 'USD', 'EUR'] },
          initialValue: 'ZAR',
        },
        { name: 'perPerson', type: 'boolean', title: 'Price per person', initialValue: true },
      ],
    }),
    defineField({
      name: 'availableDates',
      title: 'Available Dates',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'date', type: 'date', title: 'Date' },
            { name: 'spotsAvailable', type: 'number', title: 'Spots Available' },
          ],
        },
      ],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'mainImage',
      subtitle: 'pricing.amount',
    },
    prepare({ title, media, subtitle }) {
      return {
        title,
        media,
        subtitle: subtitle ? `R${subtitle}` : 'No price set',
      };
    },
  },
});
```

### Reusable Block Content Type

```typescript
// src/sanity/schemaTypes/blockContent.ts
// Source: Sanity Astro blog guide
import { defineType, defineArrayMember } from 'sanity';

export default defineType({
  name: 'blockContent',
  title: 'Block Content',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'Heading 2', value: 'h2' },
        { title: 'Heading 3', value: 'h3' },
        { title: 'Quote', value: 'blockquote' },
      ],
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'External Link',
            fields: [
              { name: 'href', type: 'url', title: 'URL' },
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
        },
      ],
    }),
  ],
});
```

### Testimonial Schema

```typescript
// src/sanity/schemaTypes/testimonial.ts
// Source: Schema best practices research
import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({
      name: 'customerName',
      title: 'Customer Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'customerPhoto',
      title: 'Customer Photo',
      type: 'image',
      options: { hotspot: true },
      fields: [
        { name: 'alt', type: 'string', title: 'Alt Text' },
      ],
    }),
    defineField({
      name: 'quote',
      title: 'Testimonial Quote',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required().max(300),
    }),
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      validation: (Rule) => Rule.required().min(1).max(5).integer(),
      options: {
        list: [
          { title: '⭐ 1 Star', value: 1 },
          { title: '⭐⭐ 2 Stars', value: 2 },
          { title: '⭐⭐⭐ 3 Stars', value: 3 },
          { title: '⭐⭐⭐⭐ 4 Stars', value: 4 },
          { title: '⭐⭐⭐⭐⭐ 5 Stars', value: 5 },
        ],
      },
    }),
    defineField({
      name: 'tour',
      title: 'Related Tour',
      type: 'reference',
      to: [{ type: 'tour' }],
      description: 'Which tour is this testimonial about?',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
});
```

### Astro Integration Configuration

```typescript
// astro.config.mjs
// Source: Sanity Astro documentation
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import sanity from '@sanity/astro';

export default defineConfig({
  site: 'https://jajatours.co.za',
  integrations: [
    sitemap(),
    sanity({
      projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
      dataset: import.meta.env.PUBLIC_SANITY_DATASET,
      apiVersion: '2026-02-13',
      useCdn: false, // Critical for static builds
      // Enable visual editing (optional)
      stega: {
        studioUrl: '/studio', // If hosting Studio at /studio path
      },
    }),
  ],
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        limitInputPixels: false,
        kernel: 'lanczos3',
      },
    },
    domains: ['cdn.sanity.io', 'res.cloudinary.com'],
    remotePatterns: [{ protocol: 'https' }],
  },
});
```

### Environment Variables Setup

```bash
# .env
# Source: Sanity environment variable documentation

# Public variables (safe for client-side code)
PUBLIC_SANITY_PROJECT_ID=your_project_id
PUBLIC_SANITY_DATASET=production

# Private variables (server-side only)
SANITY_API_READ_TOKEN=your_read_token_here

# For Sanity Studio (separate .env if hosting Studio separately)
# Must be prefixed with SANITY_STUDIO_
SANITY_STUDIO_API_PROJECT_ID=your_project_id
SANITY_STUDIO_API_DATASET=production

# For CI/CD deployments
SANITY_AUTH_TOKEN=your_auth_token_here
```

### Dynamic Route with GROQ Query

```astro
---
// src/pages/tours/[slug].astro
// Source: Sanity Astro blog guide patterns
import { client } from '../../sanity/lib/client';
import { tourBySlugQuery, allToursQuery } from '../../sanity/lib/queries';
import { urlForImage } from '../../sanity/lib/image';
import Layout from '../../layouts/Layout.astro';
import PortableText from '../../components/PortableText.astro';

export async function getStaticPaths() {
  const tours = await client.fetch(allToursQuery);

  return tours.map((tour) => ({
    params: { slug: tour.slug.current },
  }));
}

const { slug } = Astro.params;
const tour = await client.fetch(tourBySlugQuery, { slug });

if (!tour) {
  return Astro.redirect('/404');
}

const imageUrl = tour.mainImage ? urlForImage(tour.mainImage).width(1200).url() : null;
---

<Layout title={tour.title}>
  <article>
    <h1>{tour.title}</h1>
    {imageUrl && (
      <img
        src={imageUrl}
        alt={tour.mainImage.alt || tour.title}
        loading="eager"
      />
    )}
    <div class="pricing">
      <span>R{tour.pricing.amount}</span>
      {tour.pricing.perPerson && <span>per person</span>}
    </div>
    <PortableText value={tour.body} />
  </article>
</Layout>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Sanity Studio v2 | Sanity Studio v3/v4 | v3 released 2022, v4+ current | Single-page plugin API, React 18, improved performance, requires Node 20+ |
| `sanity-typegen.json` config | `sanity.cli.ts` TypeGen config | 2025-2026 | Centralized CLI configuration, experimental feature moving to GA |
| Manual schema type definitions | TypeGen auto-generation | v3.35.0+ | End-to-end type safety from schemas to GROQ queries |
| `next-sanity` package | Framework-specific packages (`@sanity/astro`) | 2023-2024 | Better framework integration, official support for each framework |
| Self-managed image optimization | `@sanity/image-url` + CDN | Always recommended | Sanity CDN handles optimization, developers just build URLs |
| GraphQL only | GROQ as primary, GraphQL optional | GROQ always preferred | More precise queries, better performance for content-specific fetches |
| Studio hosted separately | Embedded Studio option | v3+ | Can host Studio at `/studio` route in same app for simpler deployment |

**Deprecated/outdated:**
- **Sanity Studio v2**: No longer maintained; v3/v4 required for latest features, security updates
- **String-based schema types**: Use `defineType` and `defineField` helpers for better TypeScript support
- **GROQ query strings without parameters**: Use `client.fetch(query, { params })` to prevent injection issues
- **Client-side token exposure**: Never was correct, but increasingly enforced by security audits

## Open Questions

1. **Visual Editing Requirements**
   - What we know: Sanity offers Presentation Tool for live preview; requires v3.40.0+ Studio and front-end integration
   - What's unclear: Whether guide needs this feature for Phase 2, or if simple preview links suffice
   - Recommendation: Defer to Phase 2 planning; implement basic preview first, add visual editing if guide requests it

2. **Cloudinary vs Sanity CDN**
   - What we know: Cloudinary domain already configured in `astro.config.mjs`; Sanity has own image CDN via `@sanity/image-url`
   - What's unclear: Whether to use both (Cloudinary as asset source, Sanity for delivery) or consolidate to one
   - Recommendation: Use Sanity CDN for all Sanity-managed images; reserve Cloudinary for images uploaded outside CMS (if any). Can install `sanity-plugin-asset-source-cloudinary` if guide wants to access existing Cloudinary library from Studio

3. **Studio Hosting Location**
   - What we know: Studio can be hosted at `/studio` route in same Astro app or deployed separately
   - What's unclear: Security preference (separate domain for Studio?) and whether guide has multiple editors
   - Recommendation: Start with `/studio` route in same app for simplicity; can separate later if security requirements emerge

4. **Multi-language Support**
   - What we know: Sanity supports internationalization with plugins and field-level translation
   - What's unclear: Whether tours need multi-language content now or in future
   - Recommendation: Design schemas without i18n initially; if needed, Sanity's i18n plugin can add language fields to existing schemas non-destructively

5. **Content Migration Strategy**
   - What we know: Phase 1 complete, but no visibility into existing content (if any) to migrate
   - What's unclear: Is there existing tour data in spreadsheets, old site, or other sources?
   - Recommendation: Plan should include content modeling first, then provide import scripts if migration data exists

## Sources

### Primary (HIGH confidence)

- [Astro + Sanity Official Guide](https://docs.astro.build/en/guides/cms/sanity/) - Official Astro documentation for Sanity integration
- [Build your blog with Astro and Sanity](https://www.sanity.io/docs/developer-guides/sanity-astro-blog) - Official Sanity guide with project structure, schemas, GROQ patterns
- [Sanity Installation Docs](https://www.sanity.io/docs/studio/installation) - Getting started, CLI requirements (Node 20+, latest versions)
- [Sanity TypeGen](https://www.sanity.io/docs/apis-and-sdks/sanity-typegen) - TypeScript type generation from schemas (experimental, CLI 3.35.0+)
- [High Performance GROQ](https://www.sanity.io/docs/developer-guides/high-performance-groq) - Query optimization techniques, optimizable vs non-optimizable filters
- [Sanity Schema Validation](https://www.sanity.io/docs/studio/validation) - Field-level and document-level validation rules
- [Sanity Environment Variables](https://www.sanity.io/docs/studio/environment-variables) - SANITY_STUDIO_ prefix requirements, token security
- [Client API CDN Configuration](https://www.sanity.io/docs/help/js-client-cdn-configuration) - useCdn true/false guidance for SSG vs SSR
- [Sanity Hosting and Deployment](https://www.sanity.io/docs/studio/deployment) - SPA routing, CORS settings, Netlify configuration
- [Presenting Images](https://www.sanity.io/docs/presenting-images) - Image pipeline, @sanity/image-url usage
- [Visual Editing Introduction](https://www.sanity.io/docs/visual-editing/introduction-to-visual-editing) - Presentation Tool, live preview capabilities
- [The Presentation Tool](https://www.sanity.io/docs/visual-editing/configuring-the-presentation-tool) - Configuration for visual editing (Studio v3.40.0+)
- [GROQ Security Best Practices](https://www.sanity.io/answers/groq-queries-and-security-in-sanity-io) - Token exposure, injection protection, query parameters
- [Keeping Your Data Safe](https://www.sanity.io/docs/content-lake/keeping-your-data-safe) - Dataset visibility, authentication methods

### Secondary (MEDIUM confidence)

- [@sanity/astro npm package](https://www.npmjs.com/package/@sanity/astro) - Version 3.2.11, peer dependencies (attempted fetch, received 403)
- [How to use Sanity CMS with Astro](https://developers.netlify.com/guides/how-to-use-sanity-cms-with-astro/) - Netlify developer guide for webhooks, deployment
- [How to use Sanity Portable Text with Astro](https://developers.netlify.com/guides/how-to-use-sanity-portable-text-with-astro/) - astro-portabletext library usage
- [@sanity/image-url npm](https://www.npmjs.com/package/@sanity/image-url) - Image URL builder library
- [Sanity Content Modeling Guide](https://www.sanity.io/content-modeling) - Modular schema design, reusable fields
- [Schema Best Practices](https://www.halo-lab.com/blog/creating-schema-in-sanity) - Flexible, scalable schema design patterns
- [Sanity SEO Guide](https://www.webstacks.com/blog/sanity-seo) - SEO considerations for headless CMS
- [Headless CMS Comparison 2026](https://www.cosmicjs.com/blog/headless-cms-comparison-2026-cosmic-contentful-strapi-sanity-prismic-hygraph) - Sanity vs alternatives

### Tertiary (LOW confidence)

- WebSearch results for "headless CMS common mistakes pitfalls 2026" - Community discussions on migration challenges, developer dependencies, API limits
- WebSearch results for "Sanity image optimization Cloudinary integration 2026" - Plugin version (v1.4.0), integration patterns
- Blog posts on Sanity + Astro from community developers (kristiannielsen.com, paulie.dev, medium.com authors) - Implementation examples, not official

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM - Official packages verified, but Context7 unavailable (Docker not running); versions from npm search and WebFetch (received 403 on npm.com)
- Architecture: HIGH - Patterns from official Sanity Astro blog guide and documentation; verified project structure, GROQ examples, TypeGen setup
- Pitfalls: MEDIUM - Combination of official docs (security, performance) and community reports (content modeling mistakes, webhook issues); cross-referenced multiple sources

**Research date:** 2026-02-13
**Valid until:** 2026-03-15 (30 days - Sanity is stable platform; Astro integration mature)

**Research limitations:**
- Context7 unavailable (Docker daemon not running) - relied on WebSearch + WebFetch for package versions
- npm.com WebFetch returned 403 - used WebSearch results for @sanity/astro version (3.2.11, published 2 months ago)
- Some official Sanity docs returned 403 on WebFetch - used WebSearch summaries and alternative doc URLs
- No access to project's existing content/data to assess migration needs
- Visual editing and Presentation Tool research based on docs, not hands-on testing

**Key assumptions:**
- Guide wants modern, maintainable CMS (Sanity v4+, not legacy systems)
- TypeScript type safety is valuable (project uses strict mode)
- Static site generation preferred over SSR (based on Phase 1 setup and Netlify deployment)
- Content editors are non-technical (requiring intuitive Studio UI, good defaults, helpful validation)
