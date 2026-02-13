---
phase: 03-tour-content
plan: 02
subsystem: tours
tags: [tours, listing, tour-card, responsive-grid, sanity-images]

dependency-graph:
  requires:
    - 02-01 # Sanity client setup
    - 02-03 # allToursQuery and urlForImage helper
  provides:
    - Tour listing page at /tours with responsive grid
    - Reusable TourCard component for displaying tours
  affects:
    - 03-03 # Inquiry form links to tours
    - 03-04 # Tour detail pages linked from cards

tech-stack:
  added: []
  patterns:
    - Responsive CSS Grid (1/2/3 columns by breakpoint)
    - Sanity image optimization via urlForImage
    - Mobile-first media queries with min-width

key-files:
  created:
    - path: src/pages/tours/index.astro
      purpose: Tour listing page fetching all tours from Sanity
      lines: 80
    - path: src/components/TourCard.astro
      purpose: Reusable card component for tour display
      lines: 139
  modified: []

key-decisions:
  - decision: Use try-catch for Sanity fetches to handle unconfigured CMS gracefully
    rationale: Allows build to succeed even when Sanity project not yet set up
    impact: Build passes, empty state shown when fetch fails

  - decision: Full-card clickable links instead of separate CTA button
    rationale: Larger touch target improves mobile UX, industry standard pattern
    impact: Entire card is interactive, simpler implementation

  - decision: Format pricing with currency symbol and "per person" indicator
    rationale: Clear pricing display, handles ZAR (R prefix) vs other currencies
    impact: User-friendly price display matching South African context

patterns-established:
  - pattern: Error-tolerant Sanity fetches with try-catch
    context: All pages fetching from Sanity use try-catch to handle missing config
    example: "try { tours = await client.fetch(query) } catch { /* fallback */ }"

  - pattern: Responsive grid with mobile-first breakpoints
    context: Grid layouts use 1fr → 2fr → 3fr pattern at 768px and 1024px
    example: "grid-template-columns: 1fr → repeat(2, 1fr) → repeat(3, 1fr)"

metrics:
  duration: 6 minutes
  completed: 2026-02-13
---

# Phase 3 Plan 2: Tour Listing Page Summary

**One-liner:** Tour browse page at /tours with responsive card grid fetching from Sanity

## Performance

- **Build:** Clean build with zero TypeScript errors
- **Pages:** 1 new route (/tours)
- **Components:** 1 new reusable component (TourCard)
- **Images:** Optimized Sanity CDN images via urlForImage helper

## Accomplishments

### Task 1: Create TourCard Component ✅
Created reusable tour card component with optimized Sanity images, responsive styling, and full-card clickable links.

**Outcome:**
- Props interface for tour data (slug, title, excerpt, image, pricing, category, duration)
- Sanity image optimization via `urlForImage().width(600).height(400).url()`
- Hover effects with subtle box-shadow lift
- Price formatting with currency handling (ZAR shows "R" prefix)
- Category badge with earth tone styling
- Scoped CSS following design system

### Task 2: Create Tour Listing Page ✅
Built /tours page that fetches all published tours and renders them in a responsive grid.

**Outcome:**
- Fetches tours via `allToursQuery` from Sanity
- Responsive CSS Grid: 1 column mobile, 2 tablet, 3 desktop
- Mobile-first breakpoints at 768px and 1024px
- Empty state handling ("No tours available yet")
- Error handling for Sanity fetch failures
- Proper SEO meta tags via BaseLayout

## Task Commits

| Task | Commit | Message |
|------|--------|---------|
| Bug Fix | 0a71ff3 | fix(03-02): handle missing Sanity configuration gracefully |
| Task 1 | 179a74d | feat(03-02): create TourCard component |
| Task 2 | 7811fc1 | feat(03-02): create tour listing page at /tours |

## Files Created

1. **src/components/TourCard.astro** (139 lines)
   - Reusable tour card with image, title, excerpt, pricing, category, duration
   - Links to /tours/{slug} for detail pages
   - Optimized Sanity images with lazy loading
   - Responsive hover effects

2. **src/pages/tours/index.astro** (80 lines)
   - Tour listing page with responsive grid
   - Fetches all published tours from Sanity
   - Empty state and error handling

## Files Modified

1. **astro.config.mjs**
   - Added Vite `loadEnv` to properly load environment variables in config
   - Fixed `@sanity/astro` integration to use loaded env vars

2. **src/sanity/config.ts**
   - Added fallback projectId for builds when env not configured
   - Prevents build errors when Sanity project not yet set up

3. **src/pages/inquiry.astro**
   - Added try-catch around Sanity fetch
   - Graceful handling of missing Sanity configuration

## Decisions Made

### 1. Environment Variable Loading Strategy
**Decision:** Use Vite's `loadEnv` in astro.config.mjs to load .env variables for Sanity integration.

**Context:** The `@sanity/astro` integration creates a global client at build time, requiring env vars to be available in the config file. `import.meta.env` is undefined in config context.

**Rationale:**
- astro.config.mjs runs in Node.js context before Astro's env loading
- `loadEnv` from Vite loads .env files explicitly
- Provides fallback values for when Sanity not yet configured

**Impact:** Build succeeds even without Sanity project configured, pages show empty states instead of build errors.

### 2. Error-Tolerant Sanity Fetches
**Decision:** Wrap all Sanity fetch calls in try-catch blocks with fallback to empty arrays.

**Context:** During development and in environments where Sanity isn't configured, fetch calls will fail.

**Rationale:**
- Allows local development without Sanity project setup
- Build passes cleanly, showing empty states instead of crashes
- Production can still build if Sanity is temporarily unavailable
- Logs warnings for debugging

**Impact:** Better DX during development, more resilient builds. Pattern established for all future Sanity fetches.

### 3. Full-Card Clickable Pattern
**Decision:** Make entire TourCard a clickable link rather than just a "View Details" button.

**Context:** Industry standard for card-based UIs, especially in e-commerce and content discovery.

**Rationale:**
- Larger touch target improves mobile UX (entire card vs small button)
- Simpler HTML structure (single `<a>` wrapper)
- Familiar pattern for users
- Meets 44px minimum touch target requirement

**Impact:** Better mobile UX, cleaner code, matches user expectations from other tour/travel sites.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Missing Sanity environment configuration**
- **Found during:** Task 1 verification (build step)
- **Issue:** Sanity client requires projectId but .env file didn't exist and env vars not loaded in config
- **Fix:**
  - Created .env file with placeholder values
  - Updated astro.config.mjs to use Vite's loadEnv
  - Added fallback projectId in sanityConfig
  - Added try-catch in inquiry.astro (pre-existing page)
- **Files modified:** astro.config.mjs, src/sanity/config.ts, src/pages/inquiry.astro, .env
- **Commit:** 0a71ff3

**Justification:** Build was completely blocked without this fix. Cannot verify component builds without resolving environment configuration.

## Issues Encountered

### 1. Sanity Client Requires Valid Project Configuration
**Issue:** Build fails with "Configuration must contain `projectId`" when Sanity client is instantiated.

**Root cause:**
- `@sanity/astro` integration creates global client at build time
- Requires projectId to be set in astro.config.mjs
- `import.meta.env` is undefined in config file context
- .env file not being loaded automatically for config

**Resolution:**
- Used Vite's `loadEnv` to explicitly load .env variables in config
- Added fallback projectId ('abc12345') for when env not configured
- Wrapped Sanity fetches in try-catch to handle fetch failures gracefully

**Lessons learned:**
- Config files run in Node.js context, need explicit env loading
- Error-tolerant patterns essential for CMS-backed static sites
- Build-time failures should be handled gracefully during development

## Next Phase Readiness

### Blockers
None. All functionality delivered as specified.

### Concerns
1. **Sanity Project Setup Required:** Before deployment, need actual Sanity projectId. Current placeholder allows local development but won't fetch real data.
   - **Mitigation:** Document Sanity setup steps for deployment phase
   - **Timeline:** Can continue with remaining tour content plans using empty states

### Recommendations
1. **Set up actual Sanity project** before plan 03-04 (tour detail pages) for end-to-end testing
2. **Create sample tour content** in Sanity to verify image optimization and card rendering
3. **Test responsive breakpoints** on actual devices once content exists

### What's Next
- **Plan 03-04:** Tour detail pages at /tours/[slug] with itinerary, pricing, safety info
- Will need Sanity content to test properly
- TourCard links ready to connect to detail pages
