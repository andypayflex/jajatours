---
phase: 02-content-management-system
plan: 02
subsystem: sanity-cms
tags: [content-schemas, sanity-studio, validation, cms-configuration]
dependency-graph:
  requires:
    - 02-01-sanity-integration
  provides:
    - content-type-schemas
    - studio-desk-structure
    - rich-text-configuration
  affects:
    - content-authoring-workflow
    - cms-validation
tech-stack:
  added:
    - sanity-defineType
    - sanity-structureTool
  patterns:
    - portable-text-rich-content
    - document-schema-validation
    - reference-fields
key-files:
  created:
    - src/sanity/schemaTypes/blockContent.ts
    - src/sanity/schemaTypes/tour.ts
    - src/sanity/schemaTypes/blogPost.ts
    - src/sanity/schemaTypes/galleryImage.ts
    - src/sanity/schemaTypes/testimonial.ts
    - src/sanity/schemaTypes/index.ts
  modified:
    - src/sanity/config.ts
decisions: []
metrics:
  duration: 153
  completed: 2026-02-13T15:32:10Z
---

# Phase 02 Plan 02: Content Schemas and Studio Configuration Summary

Created all five content type schemas (tour, blog post, gallery image, testimonial, block content) with comprehensive validation rules and configured Sanity Studio with organized desk structure.

## What Was Built

### Schema Architecture

**blockContent (Reusable Rich Text)**
- Portable Text configuration with H2, H3, blockquote styles
- Strong and emphasis decorators
- External link annotations with URL validation
- Embedded image support with required alt text and optional captions
- Foundation for tour and blog post body content

**tour (Core Content Type)**
- Complete tour document schema with 11 fields
- Title and slug (auto-generated, max 96 chars)
- Excerpt with SEO-friendly 200 char limit warning
- Main image with hotspot and required alt text for accessibility
- Rich text body using blockContent type
- Category selection (Overlanding, Diving, Rafting, Camping, Adventure)
- Duration field with example guidance ("3 days / 2 nights")
- Group size object (min/max fields)
- Pricing object with amount (required, min 0), currency (ZAR/USD/EUR), and perPerson boolean
- Available dates array with date and spotsAvailable fields
- Published timestamp with auto-initialization
- Custom preview showing "R{amount}" for ZAR currency

**blogPost (Content Marketing)**
- Blog post document with 6 fields
- Title, slug (auto-generated), and excerpt (160 char SEO limit)
- Main image with hotspot and required alt text
- Rich text body using blockContent (required with warning)
- Published timestamp with auto-initialization
- Preview showing formatted date
- Default ordering by publishedAt desc

**galleryImage (Photo Gallery)**
- Gallery image document with 6 fields
- Image with hotspot and required validation
- Alt text (required) and caption (optional)
- Tour reference field for associating photos with tours
- Tags array for filtering (e.g., "diving", "landscape", "group")
- Published timestamp
- Preview using alt text as title

**testimonial (Social Proof)**
- Testimonial document with 6 fields
- Customer name (required) and photo with alt text
- Quote text (required, 4 rows, 500 char max warning)
- Rating (required, 1-5 integer with star list UI)
- Tour reference field for associating testimonials with tours
- Published timestamp
- Preview showing truncated quote

### Studio Configuration

**Desk Structure**
- Organized content by type using structureTool (NOT deprecated deskTool)
- Four content sections: Tours, Blog Posts, Gallery, Testimonials
- Each section filters by _type and displays appropriate document list
- Clean navigation for non-technical guide

**Configuration Exports**
- Maintained existing `sanityConfig` export for client.ts compatibility
- Added default `defineConfig` export for Studio with:
  - Project ID, dataset, and API version from sanityConfig
  - structureTool plugin with custom desk structure
  - visionTool plugin for GROQ query testing
  - Schema registration with all 5 content types

## Technical Implementation

### Validation Strategy

**Required Fields with Clear Error Messages**
- Tour title: "Please add a tour title"
- Image alt text: "Alt text is required for accessibility"
- Blog post body: "A blog post needs content"
- All required fields prevent incomplete content creation

**SEO and UX Warnings**
- Tour excerpt: max 200 chars (warning, not error)
- Blog excerpt: max 160 chars (warning, not error)
- Testimonial quote: max 500 chars (warning for readability)
- Warnings guide content quality without blocking

**Field-Level Validation**
- Pricing amount: min 0 (no negative prices)
- Rating: min 1, max 5, integer only
- Slug: max 96 chars
- URL validation for external links in blockContent

### Reference Architecture

**Tour References**
- Gallery images can reference tours (which tour is photo from?)
- Testimonials can reference tours (which tour is testimonial about?)
- Enables filtered queries and content relationships

**Content Relationships**
- blockContent → used by tour.body and blogPost.body
- tour → referenced by galleryImage.tour and testimonial.tour
- Enables content graph queries and related content features

## Deviations from Plan

None - plan executed exactly as written. All schemas created with specified fields, validation rules, and preview configurations. Studio configured with organized desk structure using structureTool.

## Verification Results

1. All 5 schema files exist in `src/sanity/schemaTypes/`
2. Schema index exports array of all 5 types
3. Tour schema has all 11 fields with validation
4. Blog post schema has all 6 fields with body validation
5. Gallery image schema has image, alt, caption, tour reference, tags
6. Testimonial schema has customerName, customerPhoto, quote, rating (1-5), tour reference
7. BlockContent has 4 block styles, 2 decorators, 1 annotation type, image support
8. Studio config registers all schema types with organized desk structure
9. TypeScript compilation passes with `tsc --noEmit --skipLibCheck`

**Build Status Note:** Full `npm run build` requires Sanity project configuration (PUBLIC_SANITY_PROJECT_ID in .env). Schemas are syntactically correct and TypeScript validates successfully. Build will pass once guide completes Sanity project setup (next plan).

## Self-Check: PASSED

**Created files verification:**
```
✓ src/sanity/schemaTypes/blockContent.ts (1593 bytes)
✓ src/sanity/schemaTypes/tour.ts (4120 bytes)
✓ src/sanity/schemaTypes/blogPost.ts (2007 bytes)
✓ src/sanity/schemaTypes/galleryImage.ts (1530 bytes)
✓ src/sanity/schemaTypes/testimonial.ts (1928 bytes)
✓ src/sanity/schemaTypes/index.ts (276 bytes)
```

**Commits verification:**
```
✓ 2cd9cd4 - feat(02-02): create blockContent, tour, and blogPost schemas
✓ e240d01 - feat(02-02): create galleryImage, testimonial schemas and Studio config
```

**Schema exports verification:**
```
✓ All 5 schemas export default defineType(...)
✓ Index exports schemaTypes array
✓ Studio config imports and registers schemaTypes
```

## Files Changed

**Created (6 files):**
- `src/sanity/schemaTypes/blockContent.ts` - Reusable Portable Text configuration
- `src/sanity/schemaTypes/tour.ts` - Tour document schema
- `src/sanity/schemaTypes/blogPost.ts` - Blog post document schema
- `src/sanity/schemaTypes/galleryImage.ts` - Gallery image document schema
- `src/sanity/schemaTypes/testimonial.ts` - Testimonial document schema
- `src/sanity/schemaTypes/index.ts` - Schema type registry

**Modified (1 file):**
- `src/sanity/config.ts` - Added Studio configuration with desk structure

## Next Steps

With content schemas defined, the guide can:
1. Complete Sanity project setup (project ID configuration)
2. Start Sanity Studio and see organized content sections
3. Create tours with pricing, dates, and rich text descriptions
4. Write blog posts with embedded images
5. Upload gallery photos tagged to tours
6. Add customer testimonials with ratings

Content validation ensures quality without requiring developer oversight. Reference fields enable content relationships. Rich text configuration supports professional content authoring.
