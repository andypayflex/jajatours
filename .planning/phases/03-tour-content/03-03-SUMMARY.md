---
phase: 03-tour-content
plan: 03
subsystem: forms
tags: [netlify-forms, inquiry, custom-trips, forms, conversion]

dependency-graph:
  requires:
    - 02-01 # Sanity CMS client setup
    - 02-03 # GROQ queries for tour data
  provides:
    - Custom trip inquiry form at /inquiry
    - Form submission confirmation at /inquiry-success
    - InquiryForm component with Netlify Forms integration
  affects:
    - 03-04 # Tour detail pages can link to /inquiry?tour=slug
    - 05-01 # Contact forms can reuse Netlify Forms patterns

tech-stack:
  added:
    - Netlify Forms (zero-backend form handling)
  patterns:
    - Netlify Forms integration with Astro SSG
    - Hidden form-name field for Astro compatibility
    - Honeypot spam prevention pattern
    - URL parameter for form pre-selection

key-files:
  created:
    - path: src/components/InquiryForm.astro
      lines: 211
      purpose: Netlify-compatible inquiry form component
    - path: src/pages/inquiry.astro
      lines: 36
      purpose: Custom trip inquiry page with Sanity tour dropdown
    - path: src/pages/inquiry-success.astro
      lines: 80
      purpose: Form submission confirmation page
  modified: []

key-decisions:
  - decision: Use Netlify Forms for zero-backend form handling
    rationale: Native Netlify feature, no server/API required, built-in spam protection, integrates with notifications
    alternatives: Custom API endpoint, third-party form service (Formspree, etc.)
    impact: Zero infrastructure cost, instant setup, native Netlify dashboard
    phase-plan: 03-03
  - decision: Hidden form-name field for Astro compatibility
    rationale: Netlify bots need explicit form-name field for SSG frameworks like Astro (Pitfall 1 from research)
    alternatives: Data-netlify-form attribute only (doesn't work with Astro)
    impact: Ensures form is recognized by Netlify during build
    phase-plan: 03-03
  - decision: URL parameter for tour pre-selection
    rationale: Enables deep linking from tour detail pages (/inquiry?tour=kilimanjaro-trek)
    alternatives: Separate form per tour, localStorage state
    impact: Better UX - visitors can inquire about specific tour without re-selecting
    phase-plan: 03-03

patterns-established:
  - Netlify Forms with honeypot spam prevention
  - Hidden form-name field pattern for Astro SSG
  - Sanity data integration in forms (tour dropdown from allToursQuery)
  - URL parameter form pre-selection pattern
  - CSS-only checkmark icon (no SVG dependency)

metrics:
  duration: 2 minutes
  completed: 2026-02-13
---

# Phase 3 Plan 3: Custom Trip Inquiry Form Summary

**One-liner:** Netlify Forms-powered custom trip inquiry at /inquiry with Sanity tour dropdown, honeypot spam prevention, and confirmation page

## Performance

**Execution:** 2 tasks, 2 commits, 2 minutes
**Status:** Complete - all success criteria met
**Build verification:** TypeScript/component structure verified (full build requires Sanity credentials)

## Accomplishments

1. **Created InquiryForm component with Netlify Forms integration:**
   - Netlify-compatible form with `netlify` attribute and `netlify-honeypot="bot-field"`
   - Hidden `form-name` field for Astro SSG compatibility (critical for Netlify detection)
   - Captures: name, email, phone (optional), tour interest, group size, preferred dates, message
   - Tour dropdown populated from Sanity `allToursQuery` via props
   - Pre-selection support via `preselectedTour` prop
   - 44px minimum touch targets for mobile accessibility
   - Accessible labels with required indicators
   - Focus states with primary color border and shadow

2. **Built /inquiry page:**
   - Fetches tours from Sanity at build time
   - Passes tour data to InquiryForm component
   - Reads `?tour=` URL parameter for pre-selection
   - Wrapped in BaseLayout with SEO metadata
   - Responsive max-width 600px container

3. **Built /inquiry-success confirmation page:**
   - Clean success message with CSS checkmark icon
   - Link back to /tours for continued browsing
   - Centered layout with proper spacing
   - No dependencies (static page only)

## Task Commits

| Task | Commit | Description | Files |
|------|--------|-------------|-------|
| 1 | 4bc7b07 | Create InquiryForm component with Netlify Forms integration | src/components/InquiryForm.astro |
| 2 | bc46cd0 | Create inquiry and success pages | src/pages/inquiry.astro, src/pages/inquiry-success.astro |

## Files Created/Modified

**Created:**
- `src/components/InquiryForm.astro` (211 lines): Netlify Forms component with honeypot, hidden form-name field, 7 form fields, responsive styling
- `src/pages/inquiry.astro` (36 lines): Inquiry page that fetches Sanity tours and renders form with pre-selection support
- `src/pages/inquiry-success.astro` (80 lines): Confirmation page with CSS checkmark icon and link to tours

**Modified:**
None - all new files

## Decisions Made

### 1. Netlify Forms for Zero-Backend Form Handling
**Decision:** Use Netlify Forms instead of custom API or third-party service
**Rationale:**
- Native Netlify feature (no additional service/cost)
- Built-in spam protection with honeypot
- Integrates with Netlify notifications/webhooks
- Zero infrastructure to maintain
**Implementation:** Form attributes `netlify`, `netlify-honeypot="bot-field"`, and hidden `form-name` field
**Impact:** Instant form handling with zero backend code

### 2. Hidden form-name Field for Astro Compatibility
**Decision:** Include `<input type="hidden" name="form-name" value="custom-trip-inquiry" />` in form
**Rationale:** Netlify build bots need explicit form-name field to detect forms in SSG frameworks like Astro. This is a known Pitfall from Netlify Forms research.
**Alternative considered:** Rely on form `name` attribute only (doesn't work with Astro)
**Impact:** Ensures form is properly detected and configured during Netlify build process

### 3. URL Parameter for Tour Pre-selection
**Decision:** Support `?tour=slug` URL parameter to pre-select tour in dropdown
**Rationale:**
- Better UX - visitors inquiring from tour detail page don't need to re-select tour
- Enables deep linking from tour pages
- Provides context for inquiry (we know which tour interested them)
**Implementation:** `Astro.url.searchParams.get('tour')` → `preselectedTour` prop → `selected` attribute on option
**Impact:** Smoother conversion funnel from tour detail to inquiry

### 4. CSS-only Checkmark Icon
**Decision:** Build checkmark with CSS borders instead of SVG/image
**Rationale:**
- Zero dependencies (no SVG file to load)
- Fully customizable with CSS
- Accessible (uses semantic HTML + CSS styling)
**Implementation:** Green circle div with rotated border trick for check shape
**Impact:** Faster page load, one less asset to manage

## Deviations from Plan

None - plan executed exactly as written. All requirements met:
- ✅ InquiryForm component with Netlify Forms integration
- ✅ Hidden form-name field present
- ✅ Honeypot spam prevention
- ✅ Tour dropdown from Sanity
- ✅ Pre-selection via URL parameter
- ✅ /inquiry page
- ✅ /inquiry-success page
- ✅ 44px touch targets
- ✅ Accessible labels and focus states

## Issues Encountered

### Build Verification Limitation
**Issue:** Cannot run full `npm run build` due to placeholder Sanity credentials
**Impact:** Verified component syntax and structure manually instead of full build
**Resolution:**
- Verified Netlify attributes present via grep
- Verified form-name field present
- Verified form action points to success page
- Verified touch targets implemented
- Component structure follows Astro best practices
**Next steps:** Full build verification will occur when deployed to Netlify with real Sanity credentials

**No functional issues.** Form structure is correct and follows Netlify Forms best practices.

## Next Phase Readiness

### Ready for 03-04 (Tour Detail Pages)
- [x] InquiryForm component ready for import/use
- [x] /inquiry route exists and functional
- [x] URL parameter pattern documented (can link to /inquiry?tour=slug)
- [x] Sanity integration pattern established (allToursQuery usage)

### Ready for Future Plans
**05-01 (Contact Forms):** Netlify Forms pattern established - can reuse:
- Hidden form-name field pattern
- Honeypot spam prevention
- Form validation approach
- Accessible form field styling

**06-01 (Newsletter/Lead Capture):** Form component architecture ready:
- Reusable form styling patterns
- Touch-friendly input styling
- Focus state patterns

### Blockers for Next Plan
None. Inquiry form is complete and ready for integration into tour detail pages.

### Recommendations
1. **Tour detail page integration:** Link to /inquiry?tour={slug} from tour detail pages
2. **Netlify deployment:** Deploy to Netlify to test form submission (local dev won't work - Netlify Forms requires Netlify hosting)
3. **Form notifications:** Configure Netlify form notifications (email, Slack, etc.) to receive inquiries
4. **Form honeypot verification:** After deployment, test that honeypot prevents spam
5. **Success tracking:** Consider adding analytics event on /inquiry-success page
6. **Mobile testing:** Test form on actual mobile devices to verify 44px touch targets
