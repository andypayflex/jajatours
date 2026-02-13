# Phase 3: Tour Content - Research

**Researched:** 2026-02-13
**Domain:** Travel/Tour Website Content Presentation, Astro Dynamic Routing, Static PDF Generation
**Confidence:** HIGH

## Summary

Phase 3 focuses on building tour listing and detail pages with comprehensive content including day-by-day itineraries, transparent pricing, safety information, departure dates with availability indicators, and downloadable PDF itineraries. The research covered Astro's dynamic routing with getStaticPaths, tour website UX best practices, lightweight PDF generation options, form handling for inquiry submissions, and Sanity schema modeling for complex nested content.

**Key findings:**
- Astro's static site generation uses `getStaticPaths()` in dynamic routes (`[slug].astro`) to pre-render pages at build time
- Tour website best practices emphasize day-by-day itinerary structure, transparent all-inclusive pricing with clear inclusions/exclusions, and mobile-first responsive design
- PDF generation can be handled via Astro endpoints with PDFKit (Node.js server-side, vectorized output) or pdfmake (declarative, supports tables/lists)
- Netlify Forms integrate seamlessly with static Astro sites using the `netlify` attribute, no adapter required
- Sanity schemas support arrays of objects for itineraries/dates but cannot nest arrays within arrays (use object wrappers)
- CSS-only accordions using `<details>`/`<summary>` elements provide accessible, mobile-friendly collapsible content without JavaScript
- WhatsApp click-to-chat links with pre-filled messages (`wa.me/number?text=`) enable one-tap tour inquiries

**Primary recommendation:** Use Astro's built-in static generation with getStaticPaths for tour pages, extend Sanity tour schema with itinerary/safety/inclusions fields, create a static PDF endpoint for downloadable itineraries, implement Netlify Forms for custom trip inquiries, and use CSS `<details>` elements for collapsible day-by-day itinerary sections.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Astro | Latest | Static site generator, dynamic routing | Already in use, excellent SSG with getStaticPaths for tour pages |
| Sanity CMS | Latest | Content modeling with arrays/objects | Already in use, flexible schema for itineraries/dates |
| astro-portabletext | Latest | Render Sanity rich text | Already in use for body content |
| Netlify Forms | N/A (platform feature) | Form handling on static sites | Zero-config with Astro, no backend needed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| PDFKit | Latest | Server-side PDF generation | For generating downloadable itineraries at build time |
| pdfmake | Latest | Declarative PDF generation | Alternative to PDFKit if table/list layouts needed |
| date-fns | Latest (optional) | Date formatting/parsing | If complex date manipulation needed beyond toLocaleString() |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| PDFKit | Puppeteer | Puppeteer enables HTML-to-PDF with pixel-perfect rendering but requires headless Chrome (250MB+ bundle), much heavier for build-time generation |
| Netlify Forms | Netlify Functions + SendGrid | Functions offer more control (email notifications, custom logic) but add complexity; Forms sufficient for simple inquiry capture |
| CSS `<details>` | JavaScript accordion | JS enables smoother animations but violates no-JS constraint, adds bundle weight |

**Installation:**
```bash
# PDF generation (choose one)
npm install pdfkit @types/pdfkit
# OR
npm install pdfmake @types/pdfmake

# Optional: date utilities
npm install date-fns
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── pages/
│   ├── tours/
│   │   ├── index.astro           # Tour listing page
│   │   ├── [slug].astro          # Tour detail page (dynamic)
│   │   └── [slug].pdf.ts         # PDF endpoint (dynamic)
│   ├── inquiry.astro             # Custom trip inquiry form
│   └── inquiry-success.astro     # Form submission confirmation
├── components/
│   ├── TourCard.astro            # Tour listing card
│   ├── TourItinerary.astro       # Day-by-day itinerary section
│   ├── TourPricing.astro         # Pricing table with inclusions/exclusions
│   ├── TourDates.astro           # Departure dates with availability
│   ├── TourSafety.astro          # Safety info/disclosures
│   └── InquiryForm.astro         # Netlify form component
└── sanity/
    ├── schemaTypes/
    │   └── tour.ts               # Extended with new fields
    └── lib/
        └── queries.ts            # Extended with new projections
```

### Pattern 1: Dynamic Tour Pages with Static Generation
**What:** Use `[slug].astro` with `getStaticPaths()` to pre-render all tour detail pages at build time
**When to use:** Always for tour listing and detail pages in SSG mode
**Example:**
```typescript
// src/pages/tours/[slug].astro
// Source: https://docs.astro.build/en/guides/routing/
import { sanityClient } from '@/sanity/lib/client';
import { allToursQuery, tourBySlugQuery } from '@/sanity/lib/queries';

export async function getStaticPaths() {
  const tours = await sanityClient.fetch(allToursQuery);
  return tours.map((tour) => ({
    params: { slug: tour.slug },
    props: { tour }, // Pass full tour data as props
  }));
}

const { tour } = Astro.props;
```

### Pattern 2: Static PDF Endpoint
**What:** Use Astro endpoints (`.pdf.ts`) with `getStaticPaths()` to generate downloadable PDFs at build time
**When to use:** For tour itinerary PDFs that don't change frequently
**Example:**
```typescript
// src/pages/tours/[slug].pdf.ts
// Source: https://docs.astro.build/en/guides/endpoints/
import type { APIRoute } from 'astro';
import PDFDocument from 'pdfkit';

export const GET: APIRoute = async ({ params }) => {
  const tour = await sanityClient.fetch(tourBySlugQuery, { slug: params.slug });

  const doc = new PDFDocument();
  const chunks: Uint8Array[] = [];

  doc.on('data', (chunk) => chunks.push(chunk));
  doc.on('end', () => {});

  doc.fontSize(20).text(tour.title, { align: 'center' });
  doc.fontSize(12).text(tour.excerpt);
  // ... add itinerary content
  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      resolve(new Response(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${params.slug}-itinerary.pdf"`,
        },
      }));
    });
  });
};

export async function getStaticPaths() {
  const tours = await sanityClient.fetch(allToursQuery);
  return tours.map((tour) => ({ params: { slug: tour.slug } }));
}
```

### Pattern 3: Netlify Forms with Astro
**What:** HTML forms with `netlify` attribute for static site form handling
**When to use:** For contact/inquiry forms on static sites hosted on Netlify
**Example:**
```astro
<!-- src/components/InquiryForm.astro -->
<!-- Source: https://www.netlify.com/blog/deploy-an-astro-site-with-forms-serverless-functions-and-redirects/ -->
<form
  name="custom-trip-inquiry"
  method="POST"
  action="/inquiry-success"
  netlify
  netlify-honeypot="bot-field"
>
  <!-- Hidden honeypot for spam prevention -->
  <p class="hidden">
    <label>
      Don't fill this out if you're human: <input name="bot-field" />
    </label>
  </p>

  <!-- Required for JavaScript-rendered forms -->
  <input type="hidden" name="form-name" value="custom-trip-inquiry" />

  <label>
    Name <span aria-label="required">*</span>
    <input type="text" name="name" required />
  </label>

  <label>
    Email <span aria-label="required">*</span>
    <input type="email" name="email" required />
  </label>

  <label>
    Tour Interest
    <select name="tour">
      <option value="">Select a tour...</option>
      <!-- Populated from Sanity -->
    </select>
  </label>

  <label>
    Group Size
    <input type="number" name="groupSize" min="1" />
  </label>

  <label>
    Preferred Dates
    <input type="text" name="dates" placeholder="e.g. June 2026" />
  </label>

  <label>
    Message
    <textarea name="message" rows="5"></textarea>
  </label>

  <button type="submit">Submit Inquiry</button>
</form>

<style>
  .hidden {
    position: absolute;
    left: -9999px;
  }
</style>
```

### Pattern 4: CSS-Only Accordions for Itineraries
**What:** Use HTML5 `<details>` and `<summary>` elements for collapsible day-by-day itinerary
**When to use:** For long itineraries, FAQ sections, or any collapsible content
**Example:**
```astro
<!-- Source: https://prismic.io/blog/css-accordions -->
<!-- Source: https://medium.com/front-end-world/accessible-accordions-component-without-javascript-pure-html-css-db12e209c3d8 -->
<div class="itinerary">
  {itinerary.map((day, index) => (
    <details>
      <summary>
        <h3>Day {index + 1}: {day.title}</h3>
      </summary>
      <div class="day-content">
        <p>{day.description}</p>
        {day.activities && (
          <ul>
            {day.activities.map((activity) => (
              <li>{activity}</li>
            ))}
          </ul>
        )}
      </div>
    </details>
  ))}
</div>

<style>
  details {
    border: 1px solid var(--color-border);
    border-radius: 4px;
    margin-bottom: 1rem;
    padding: 1rem;
  }

  summary {
    cursor: pointer;
    font-weight: 600;
    user-select: none;
    min-height: 44px; /* Touch target */
    display: flex;
    align-items: center;
  }

  summary:hover {
    color: var(--color-primary);
  }

  summary:focus {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  .day-content {
    padding-top: 1rem;
  }

  /* Accessible by default: Tab to navigate, Enter/Space to toggle */
</style>
```

### Pattern 5: WhatsApp Click-to-Chat Links
**What:** Pre-filled WhatsApp message links for quick tour inquiries
**When to use:** As a secondary CTA alongside inquiry form for mobile users
**Example:**
```astro
<!-- Source: https://quadlayers.com/how-to-create-a-whatsapp-link-wa-me-with-a-pre-filled-message/ -->
---
const whatsappNumber = '27XXXXXXXXX'; // +27 = South Africa
const tourTitle = tour.title;
const message = `Hi, I'm interested in the ${tourTitle} tour. Can you provide more information?`;
const encodedMessage = encodeURIComponent(message);
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
---

<a
  href={whatsappUrl}
  class="whatsapp-cta"
  target="_blank"
  rel="noopener noreferrer"
>
  WhatsApp Inquiry
</a>
```

### Pattern 6: Sanity Schema for Complex Tour Content
**What:** Extend tour schema with arrays of objects for itinerary, inclusions/exclusions, safety info
**When to use:** When modeling structured content with repeating sections
**Example:**
```typescript
// Source: https://www.sanity.io/docs/array-type
// Source: https://www.sanity.io/answers/array-schema-types-and-options-in-sanity-io-discussed--including-multi-select-and-custom-object-types-

// Itinerary field (array of day objects)
defineField({
  name: 'itinerary',
  type: 'array',
  title: 'Day-by-Day Itinerary',
  of: [
    {
      type: 'object',
      title: 'Day',
      fields: [
        {
          name: 'dayNumber',
          type: 'number',
          title: 'Day Number',
          validation: (Rule) => Rule.required().min(1),
        },
        {
          name: 'title',
          type: 'string',
          title: 'Day Title',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'description',
          type: 'text',
          title: 'Description',
          rows: 4,
        },
        {
          name: 'activities',
          type: 'array',
          title: 'Activities',
          of: [{ type: 'string' }],
        },
        {
          name: 'meals',
          type: 'object',
          title: 'Meals Included',
          fields: [
            { name: 'breakfast', type: 'boolean', title: 'Breakfast' },
            { name: 'lunch', type: 'boolean', title: 'Lunch' },
            { name: 'dinner', type: 'boolean', title: 'Dinner' },
          ],
        },
        {
          name: 'accommodation',
          type: 'string',
          title: 'Accommodation',
        },
      ],
      preview: {
        select: {
          title: 'title',
          dayNumber: 'dayNumber',
        },
        prepare({ title, dayNumber }) {
          return {
            title: `Day ${dayNumber}: ${title}`,
          };
        },
      },
    },
  ],
}),

// Inclusions/Exclusions
defineField({
  name: 'inclusions',
  type: 'array',
  title: 'What\'s Included',
  of: [{ type: 'string' }],
  description: 'List what is included in the tour price',
}),
defineField({
  name: 'exclusions',
  type: 'array',
  title: 'What\'s Excluded',
  of: [{ type: 'string' }],
  description: 'List what is NOT included in the tour price',
}),

// Safety and Requirements
defineField({
  name: 'safetyInfo',
  type: 'object',
  title: 'Safety Information',
  fields: [
    {
      name: 'difficultyLevel',
      type: 'string',
      title: 'Difficulty Level',
      options: {
        list: [
          { title: 'Easy - All fitness levels', value: 'easy' },
          { title: 'Moderate - Regular exercise helpful', value: 'moderate' },
          { title: 'Challenging - Good fitness required', value: 'challenging' },
          { title: 'Strenuous - Excellent fitness required', value: 'strenuous' },
        ],
      },
    },
    {
      name: 'fitnessRequirements',
      type: 'text',
      title: 'Fitness Requirements',
      rows: 3,
    },
    {
      name: 'risks',
      type: 'array',
      title: 'Risks and Disclosures',
      of: [{ type: 'string' }],
      description: 'List inherent risks (remote areas, wildlife, weather, etc.)',
    },
    {
      name: 'equipmentProvided',
      type: 'array',
      title: 'Equipment Provided',
      of: [{ type: 'string' }],
    },
    {
      name: 'whatToBring',
      type: 'array',
      title: 'What to Bring',
      of: [{ type: 'string' }],
    },
    {
      name: 'guideCertifications',
      type: 'text',
      title: 'Guide Certifications',
      rows: 2,
      description: 'e.g. PADI Divemaster, Wilderness First Responder, etc.',
    },
  ],
}),
```

### Anti-Patterns to Avoid
- **Nested arrays in Sanity:** Cannot nest arrays within arrays directly; wrap inner array in an object type
- **Client-side PDF generation:** Generates PDFs in browser, bloats bundle, degrades on slow mobile; use server-side endpoints
- **JavaScript-dependent forms:** Netlify Forms work without JS; avoid React/Svelte form libraries that break without hydration
- **Color-only availability indicators:** Use text labels ("Available", "Limited", "Sold Out") alongside color for accessibility
- **Vague pricing:** Don't use "from $XX" without context; show base price + clearly list inclusions/exclusions
- **Hidden safety disclaimers:** Make risks/requirements visible before booking, not buried in fine print

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PDF generation from scratch | Custom binary PDF writer | PDFKit or pdfmake | PDF spec is 700+ pages, font embedding/compression/layout are complex |
| Form spam prevention | Custom honeypot/CAPTCHA | Netlify Forms honeypot | Built-in, zero config, no user friction |
| Date formatting/localization | String manipulation for dates | `Date.toLocaleString()` or date-fns | Handles timezones, locales, edge cases (DST, leap years) |
| Accessible accordions | Custom div + JS toggle | HTML5 `<details>`/`<summary>` | Native keyboard nav, screen reader support, no JS needed |
| URL encoding for WhatsApp | Manual string replacement | `encodeURIComponent()` | Handles special chars, emojis, unicode correctly |
| Dynamic routing | Manual slug matching | Astro's `[slug].astro` + getStaticPaths | Built-in, optimized, handles 404s |

**Key insight:** Tour websites have unique requirements (itineraries, availability, safety disclosures) but standard web patterns apply. Use native platform features (HTML5 elements, Astro SSG, Netlify Forms) over custom solutions to reduce bundle size and maintenance burden while meeting the 500KB performance budget.

## Common Pitfalls

### Pitfall 1: Forgetting `form-name` Hidden Field in Netlify Forms
**What goes wrong:** Form submissions fail silently or return "Form not found" error
**Why it happens:** Netlify's build bots scan HTML for forms at build time; Astro components are JavaScript-rendered, so bots miss them without explicit `form-name` field
**How to avoid:** Always include `<input type="hidden" name="form-name" value="your-form-name" />` in Astro forms with `netlify` attribute
**Warning signs:** Form submissions don't appear in Netlify dashboard; 404 errors on form submission

### Pitfall 2: Nested Arrays in Sanity Schemas
**What goes wrong:** Schema validation errors: "Arrays cannot contain arrays"
**Why it happens:** Sanity's data store limitation prevents direct array nesting
**How to avoid:** Wrap nested arrays in object types (e.g. `itinerary` array contains day objects, each day object has `activities` array)
**Warning signs:** "array-of-array" error in Sanity Studio console

### Pitfall 3: Missing `getStaticPaths` in Dynamic Routes
**What goes wrong:** Build fails with "getStaticPaths() function required for dynamic routes"
**Why it happens:** In `output: 'static'` mode (default), Astro needs all dynamic routes defined at build time
**How to avoid:** Export `getStaticPaths()` from all `[param].astro` and `[param].pdf.ts` files
**Warning signs:** Build error mentioning getStaticPaths; route works in dev but fails in production build

### Pitfall 4: Blocking PDF Generation in Build Process
**What goes wrong:** Build times balloon to 5+ minutes; Netlify build timeouts
**Why it happens:** Synchronous PDF generation for 10+ tours blocks build; Puppeteer downloads Chromium (250MB+)
**How to avoid:** Use lightweight PDFKit/pdfmake, not Puppeteer; keep PDF content simple; consider generating PDFs on-demand if build times exceed 2 minutes
**Warning signs:** Netlify build logs show "Downloading Chromium"; build times increase linearly with tour count

### Pitfall 5: Hardcoding Dates Without Localization
**What goes wrong:** Dates display in US format (MM/DD/YYYY) for international visitors; timezone mismatches
**Why it happens:** Using `new Date().toString()` or manual formatting instead of locale-aware methods
**How to avoid:** Use `date.toLocaleDateString('en-ZA', { dateStyle: 'long' })` for South African format, or date-fns with explicit locale
**Warning signs:** Dates show as "02/13/2026" instead of "13 February 2026"; complaints from non-US visitors

### Pitfall 6: Incomplete Pricing Transparency
**What goes wrong:** Visitors abandon before inquiry due to unclear pricing; increased support questions about costs
**Why it happens:** Showing base price without context; burying exclusions in fine print
**How to avoid:** Display price with clear "Starting from" label + separate inclusions/exclusions lists; show currency options upfront
**Warning signs:** High bounce rate on tour detail pages; repetitive "What's included?" inquiries

### Pitfall 7: Mobile-Unfriendly Touch Targets
**What goes wrong:** Users can't tap summary elements, form labels, or CTA buttons on mobile
**Why it happens:** Forgetting 44px minimum tap target size; clickable areas too small or too close together
**How to avoid:** Set `min-height: 44px` on `<summary>`, buttons, and form labels; test on physical mobile device
**Warning signs:** User reports of "can't click" on mobile; low mobile conversion rates

### Pitfall 8: Accessibility Issues with Details/Summary
**What goes wrong:** Screen readers don't announce expanded/collapsed state properly
**Why it happens:** Overriding default `<details>` behavior with custom CSS that breaks semantics
**How to avoid:** Keep default browser behavior; add visual styling without removing semantic meaning; test with screen reader
**Warning signs:** Lighthouse accessibility score drops; keyboard navigation breaks

## Code Examples

Verified patterns from official sources:

### Date Formatting for Tour Dates
```typescript
// Source: https://docs.astro.build/en/recipes/i18n/
// Display departure dates in South African locale
const date = new Date(departureDate);
const formattedDate = date.toLocaleDateString('en-ZA', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
// Output: "15 June 2026"
```

### GROQ Query for Tour Detail with New Fields
```typescript
// src/sanity/lib/queries.ts
export const tourBySlugQuery = `*[_type == "tour" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  mainImage,
  body,
  category,
  duration,
  groupSize,
  pricing,
  inclusions,
  exclusions,
  itinerary[] {
    dayNumber,
    title,
    description,
    activities,
    meals,
    accommodation
  },
  safetyInfo {
    difficultyLevel,
    fitnessRequirements,
    risks,
    equipmentProvided,
    whatToBring,
    guideCertifications
  },
  availableDates[] {
    date,
    spotsAvailable
  },
  publishedAt
}`;
```

### Availability Indicator Component
```astro
---
// src/components/AvailabilityBadge.astro
interface Props {
  spotsAvailable: number;
}

const { spotsAvailable } = Astro.props;

let status: 'available' | 'limited' | 'soldout';
let label: string;

if (spotsAvailable === 0) {
  status = 'soldout';
  label = 'Sold Out';
} else if (spotsAvailable <= 3) {
  status = 'limited';
  label = `Limited (${spotsAvailable} spots)`;
} else {
  status = 'available';
  label = `Available (${spotsAvailable} spots)`;
}
---

<span class={`badge badge-${status}`}>
  {label}
</span>

<style>
  .badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .badge-available {
    background-color: #d4f4dd;
    color: #166534;
  }

  .badge-limited {
    background-color: #fef3c7;
    color: #854d0e;
  }

  .badge-soldout {
    background-color: #fee2e2;
    color: #991b1b;
  }
</style>
```

### Tour Listing Page
```astro
---
// src/pages/tours/index.astro
import BaseLayout from '@layouts/BaseLayout.astro';
import { sanityClient } from '@/sanity/lib/client';
import { allToursQuery } from '@/sanity/lib/queries';

const tours = await sanityClient.fetch(allToursQuery);
---

<BaseLayout title="Our Tours" description="Explore our South African adventure tours">
  <section class="container">
    <h1>Our Tours</h1>

    <div class="tour-grid">
      {tours.map((tour) => (
        <article class="tour-card">
          <a href={`/tours/${tour.slug}`}>
            {tour.mainImage && (
              <img
                src={tour.mainImage.asset.url}
                alt={tour.mainImage.alt}
                loading="lazy"
              />
            )}
            <h2>{tour.title}</h2>
            <p>{tour.excerpt}</p>
            <div class="tour-meta">
              <span class="category">{tour.category}</span>
              <span class="duration">{tour.duration}</span>
              <span class="price">
                {tour.pricing.currency === 'ZAR' ? 'R' : tour.pricing.currency}
                {tour.pricing.amount}
                {tour.pricing.perPerson ? ' per person' : ''}
              </span>
            </div>
          </a>
        </article>
      ))}
    </div>
  </section>
</BaseLayout>

<style>
  .tour-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  @media (min-width: 768px) {
    .tour-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .tour-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .tour-card {
    border: 1px solid var(--color-border);
    border-radius: 8px;
    overflow: hidden;
    transition: box-shadow 0.2s;
  }

  .tour-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .tour-card a {
    text-decoration: none;
    color: inherit;
  }

  .tour-card img {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }

  .tour-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    padding: 1rem;
    font-size: 0.875rem;
  }

  .price {
    font-weight: 700;
    color: var(--color-primary);
  }
</style>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Server-side forms with PHP/Node backend | Netlify Forms (serverless) | ~2020 | Zero backend maintenance, automatic spam filtering, no server costs |
| Client-side PDF generation (jsPDF in browser) | Build-time server-side PDF (PDFKit/endpoints) | 2023+ (Astro 2.0+) | Smaller bundles, faster page loads, SEO-friendly static files |
| JavaScript accordions | Native `<details>`/`<summary>` | 2020+ (browser support stabilized) | No JS bundle, accessible by default, works without hydration |
| Manual form encoding/validation | HTML5 native validation + Netlify | 2015+ (HTML5 wide support) | Less JS, better UX, progressive enhancement |
| Puppeteer for all PDFs | PDFKit for programmatic, Puppeteer for HTML-to-PDF | 2022+ | Lighter builds when layout is simple, reserve Puppeteer for complex designs |

**Deprecated/outdated:**
- **wkhtmltopdf:** Unmaintained since 2020, replaced by Puppeteer for HTML-to-PDF or PDFKit for programmatic generation
- **jQuery-based accordions:** Modern CSS `<details>` replaces need for JavaScript toggle libraries
- **Separate contact form backend services (FormSpree, etc.):** Netlify/Vercel have built-in form handling for static sites

## Open Questions

Things that couldn't be fully resolved:

1. **PDF generation performance at scale**
   - What we know: PDFKit is lighter than Puppeteer; build time scales linearly with tour count
   - What's unclear: Exact build time impact for 10-20 tours with multi-page itineraries; Netlify build timeout threshold
   - Recommendation: Implement PDFs early, monitor build times; if >2 minutes, consider on-demand generation via Netlify Functions instead of static endpoints

2. **Optimal itinerary content structure**
   - What we know: Day-by-day structure is standard; activities as array of strings is simple
   - What's unclear: Whether activities should be objects with time/duration fields, or keep as simple strings
   - Recommendation: Start with simple string array; upgrade to objects if client needs time-based scheduling (unlikely for multi-day tours)

3. **Availability date updates frequency**
   - What we know: Sanity CMS allows real-time updates; Astro static site requires rebuild/redeploy
   - What's unclear: How often availability changes; whether static generation is acceptable or if SSR needed
   - Recommendation: Static generation acceptable for inquiry-based model (not instant booking); guide can trigger Netlify rebuild via webhook when availability changes

4. **Multi-currency display**
   - What we know: Requirements explicitly defer multi-currency until 20%+ international traffic confirmed
   - What's unclear: Whether to model schema for future multi-currency or keep simple for now
   - Recommendation: Keep current single-currency pricing; schema already supports currency field, easy to extend later

## Sources

### Primary (HIGH confidence)
- [Astro Routing Documentation](https://docs.astro.build/en/guides/routing/) - Dynamic routes, getStaticPaths
- [Astro Endpoints Documentation](https://docs.astro.build/en/guides/endpoints/) - Static file generation, API routes
- [Netlify + Astro Forms Blog](https://www.netlify.com/blog/deploy-an-astro-site-with-forms-serverless-functions-and-redirects/) - Form implementation
- [PDFKit Official Site](https://pdfkit.org/) - PDF generation features and API
- [Sanity Array Type Docs](https://www.sanity.io/docs/array-type) - Schema array patterns
- [Astro i18n Documentation](https://docs.astro.build/en/recipes/i18n/) - Date formatting and localization

### Secondary (MEDIUM confidence)
- [Tour Itinerary Best Practices - Xola](https://www.xola.com/articles/tour-itinerary/) - Content structure verified with multiple sources
- [Pricing Transparency - Peek Pro](https://www.peekpro.com/blog/transparent-pricing-for-tour-operators) - Tour operator pricing patterns
- [Travel Website Design 2026 - MediaBoom](https://mediaboom.com/news/travel-website-design/) - UX patterns verified across multiple tour sites
- [CSS Accordions Tutorial - Prismic](https://prismic.io/blog/css-accordions) - Details/summary patterns verified with official HTML5 spec
- [WhatsApp Link Guide - Quadlayers](https://quadlayers.com/how-to-create-a-whatsapp-link-wa-me-with-a-pre-filled-message/) - wa.me URL format verified
- [Top JavaScript PDF Libraries 2025 - Nutrient](https://www.nutrient.io/blog/top-js-pdf-libraries/) - PDFKit/pdfmake comparison verified with npm stats

### Tertiary (LOW confidence)
- [Tour Operator Apps 2026 - Vamoos](https://www.vamoos.com/the-best-tour-operator-apps-2026/) - Platform reviews, not applicable to static sites
- [Travel Waivers - Host Agency Reviews](https://hostagencyreviews.com/blog/travel-waivers-protect-your-travel-agency) - Safety/liability content ideas

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use or official Netlify/Astro features with comprehensive documentation
- Architecture: HIGH - Astro patterns verified with official docs; Sanity schema patterns verified with official schema docs
- Pitfalls: HIGH - Common issues documented in Astro/Netlify forums and GitHub issues; PDF generation pitfalls from direct experience reported in community
- UX patterns: MEDIUM - Tour website best practices from industry sources verified across multiple tour operator sites; no single authoritative source
- Legal/safety content: MEDIUM - General guidance from travel industry sources; specific liability language should be reviewed by legal counsel

**Research date:** 2026-02-13
**Valid until:** 2026-03-15 (30 days) - Stack is stable; Astro/Sanity patterns unlikely to change; tour UX best practices evolve slowly
