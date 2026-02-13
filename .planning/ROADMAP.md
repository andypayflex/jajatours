# Roadmap: JaJa Tours

## Overview

This roadmap transforms JaJa Tours' existing content (photos, tour descriptions, pricing) into a high-performance website that converts browsers into booking inquiries. Starting with performance infrastructure and a non-technical CMS, we build out tour listings, visual galleries, communication channels, trust signals, and SEO content. Each phase delivers observable capabilities that bring the site closer to the core value: visitors find tours that excite them and easily inquire to book.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Performance** - Fast-loading infrastructure for SA mobile networks
- [x] **Phase 2: Content Management System** - Non-technical CMS for solo guide updates
- [x] **Phase 3: Tour Content** - Complete tour listings with itineraries, pricing, and booking flows
- [ ] **Phase 4: Visual Content & Media** - Photo galleries, videos, and social feeds
- [ ] **Phase 5: Communication & Inquiry** - WhatsApp integration and contact forms
- [ ] **Phase 6: Trust & Social Proof** - Testimonials, reviews, and guide story
- [ ] **Phase 7: SEO & Content Marketing** - Blog, destination pages, and search optimization

## Phase Details

### Phase 1: Foundation & Performance
**Goal**: Visitors experience fast page loads on slow mobile connections and see a functional site structure
**Depends on**: Nothing (first phase)
**Requirements**: PERF-01, PERF-02
**Success Criteria** (what must be TRUE):
  1. Visitor can load any page in under 3 seconds on a 3G mobile connection
  2. Visitor can navigate the site comfortably on a mobile phone with touch-friendly controls
  3. Visitor sees responsive images that adapt to their screen size and connection speed
  4. Visitor accesses the site over HTTPS with a valid SSL certificate
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Project initialization & configuration (Astro, Sharp, Netlify config)
- [x] 01-02-PLAN.md — Mobile-first layout & homepage (BaseLayout, Navigation, Footer, responsive hero)
- [x] 01-03-PLAN.md — Build verification & performance check (automated + human mobile verification)

### Phase 2: Content Management System
**Goal**: Guide can independently add and edit all site content without developer assistance
**Depends on**: Phase 1
**Requirements**: CMS-01, CMS-02, CMS-03, CMS-04
**Success Criteria** (what must be TRUE):
  1. Guide can log into a visual CMS and see all content organized by type (tours, blog, gallery, reviews)
  2. Guide can create a new tour with pricing, dates, and photos, then publish it to the live site
  3. Guide can write and publish a blog post with formatting and images
  4. Guide can upload photos to the gallery, and they automatically optimize for web delivery
  5. Guide can add customer testimonials with reviewer photos and tour references
**Plans**: 3 plans

Plans:
- [x] 02-01-PLAN.md — Sanity project setup & Astro integration (packages, client, image helpers, env config)
- [x] 02-02-PLAN.md — Content schemas & Studio organization (tour, blog, gallery, testimonial schemas + desk structure)
- [x] 02-03-PLAN.md — Query layer, PortableText & verification (GROQ queries, rendering components, webhook docs, human CMS verification)

### Phase 3: Tour Content
**Goal**: Visitors can browse complete tour offerings and understand what each experience includes
**Depends on**: Phase 2
**Requirements**: TOUR-01, TOUR-02, TOUR-03, TOUR-04, TOUR-05, TOUR-06
**Success Criteria** (what must be TRUE):
  1. Visitor can view a tour page with day-by-day itinerary, duration, and difficulty level clearly displayed
  2. Visitor can see transparent pricing with starting prices, what's included, and what's excluded on every tour
  3. Visitor can read safety information, risk disclosures, and guide certifications before booking
  4. Visitor can download a PDF itinerary for any tour to share or reference offline
  5. Visitor can see fixed-schedule group tour departure dates with availability indicators
  6. Visitor can request a custom/private trip through a dedicated inquiry form
**Plans**: 5 plans

Plans:
- [x] 03-01-PLAN.md — Extend tour schema and GROQ queries (itinerary, inclusions/exclusions, safety fields)
- [x] 03-02-PLAN.md — Tour listing page and TourCard component (responsive grid at /tours)
- [x] 03-03-PLAN.md — Custom trip inquiry form with Netlify Forms (/inquiry + success page)
- [x] 03-04-PLAN.md — Tour detail page with section components (itinerary, pricing, dates, safety)
- [x] 03-05-PLAN.md — PDF itinerary generation with PDFKit (downloadable /tours/{slug}.pdf)

### Phase 4: Visual Content & Media
**Goal**: Visitors experience tours visually through high-quality photos, videos, and social content
**Depends on**: Phase 3
**Requirements**: MEDIA-01, MEDIA-02, MEDIA-03, MEDIA-04
**Success Criteria** (what must be TRUE):
  1. Visitor can view a photo gallery on each tour page with 6+ optimized, responsive images
  2. Visitor can browse a dedicated gallery page with Instagram-style grid layout, filterable by tour or category
  3. Visitor can watch video content including tour previews, drone footage, and action shots
  4. Visitor can see a live Instagram or Facebook feed embedded on the site showing recent adventures
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

### Phase 5: Communication & Inquiry
**Goal**: Visitors can easily contact the guide and inquire about tours through their preferred channel
**Depends on**: Phase 3
**Requirements**: COMM-01, COMM-02, COMM-03
**Success Criteria** (what must be TRUE):
  1. Visitor can click a WhatsApp button from any tour page and start a chat with pre-filled tour details
  2. Visitor can submit an inquiry via contact form with their name, email, preferred dates, group size, and tour interest
  3. Visitor receives an automated email confirmation immediately after submitting an inquiry
**Plans**: TBD

Plans:
- [ ] 05-01: TBD

### Phase 6: Trust & Social Proof
**Goal**: Visitors trust JaJa Tours through authentic testimonials and guide credentials
**Depends on**: Phase 3
**Requirements**: TRUST-01, TRUST-02
**Success Criteria** (what must be TRUE):
  1. Visitor can read customer testimonials with photos on the homepage and relevant tour pages
  2. Visitor can read about the guide's personal story, credentials, experience, and what makes JaJa Tours unique
  3. Visitor sees trust signals (certifications, safety record, experience) prominently displayed
**Plans**: TBD

Plans:
- [ ] 06-01: TBD

### Phase 7: SEO & Content Marketing
**Goal**: Visitors discover JaJa Tours through organic search for South African adventure tourism
**Depends on**: Phase 3
**Requirements**: SEO-01, SEO-02, SEO-03
**Success Criteria** (what must be TRUE):
  1. Visitor can read blog posts with trip reports, destination guides, and travel tips that answer their questions
  2. Visitor can browse location/destination pages with maps, climate info, and what to expect
  3. Search engines can crawl the site with proper meta tags, structured data, and sitemap for tourism keywords
  4. Visitor discovers JaJa Tours when searching for terms like "South Africa overlanding tours" or "diving Cape Town"
**Plans**: TBD

Plans:
- [ ] 07-01: TBD
- [ ] 07-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Performance | 3/3 | Complete | 2026-02-13 |
| 2. Content Management System | 3/3 | Complete | 2026-02-13 |
| 3. Tour Content | 5/5 | Complete | 2026-02-13 |
| 4. Visual Content & Media | 0/TBD | Not started | - |
| 5. Communication & Inquiry | 0/TBD | Not started | - |
| 6. Trust & Social Proof | 0/TBD | Not started | - |
| 7. SEO & Content Marketing | 0/TBD | Not started | - |
