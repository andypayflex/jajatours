---
phase: 01-foundation-and-performance
plan: 02
subsystem: layout-system
tags: [mobile-first, responsive-images, zero-js, performance, navigation, layout]
dependency_graph:
  requires: [01-01]
  provides: [base-layout, navigation, footer, homepage, responsive-images]
  affects: [all-future-pages]
tech_stack:
  added: [astro-picture-component, css-grid, system-fonts]
  patterns: [mobile-first-css, css-only-navigation, responsive-picture-element]
key_files:
  created:
    - src/layouts/BaseLayout.astro
    - src/styles/global.css
    - src/components/Navigation.astro
    - src/components/Footer.astro
    - src/assets/images/hero-placeholder.jpg
  modified:
    - src/pages/index.astro
    - public/favicon.svg
decisions:
  - "CSS-only hamburger navigation using checkbox pattern (zero JavaScript)"
  - "System fonts only via system-ui stack (saves 40KB+ over web fonts)"
  - "Astro Picture component with AVIF/WebP/JPEG formats for responsive images"
  - "Earth tone color scheme (deep forest green #2D5016, warm gold #D4A843)"
  - "44px minimum tap targets for mobile accessibility"
  - "Mobile-first CSS with min-width media queries"
metrics:
  duration: 214
  completed: 2026-02-13
  tasks: 2
  commits: 2
  files_created: 7
---

# Phase 1 Plan 2: Mobile-First Page Layout System and Homepage Summary

**One-liner:** Built mobile-first layout foundation with BaseLayout, CSS-only hamburger navigation, responsive hero images via Astro Picture component (AVIF/WebP), and zero-JavaScript homepage demonstrating performance patterns.

## Overview

Created the complete page layout system that all future pages will use. Established BaseLayout as the HTML shell with Navigation and Footer components, implemented mobile-first CSS with system fonts, and built a fully functional homepage showcasing responsive image optimization through Astro's Picture component. Delivered a zero-JavaScript site with touch-friendly navigation and earth-tone color scheme.

## What Was Built

### Task 1: BaseLayout, Global Styles, and Foundation
- **BaseLayout.astro**: Created HTML shell with mobile viewport, SEO meta tags, preconnect to Cloudinary, and slot for page content
- **global.css**: Implemented comprehensive mobile-first CSS with:
  - Minimal CSS reset (box-sizing, margin, max-width on images)
  - Earth tone color scheme using CSS custom properties (forest green, warm gold, off-white)
  - System font stack (system-ui, -apple-system, etc.) - no web fonts
  - Touch-friendly defaults with 44px minimum tap targets
  - Responsive typography scaling from mobile (2rem h1) to desktop (2.75rem h1)
  - Responsive container (max-width 1200px)
  - Accessibility focus styles
- **favicon.svg**: Created simple SVG favicon with "J" letter in brand green
- **Placeholder components**: Created Navigation and Footer stubs for BaseLayout integration

**Commit:** b7867ee

### Task 2: Navigation, Footer, and Homepage
- **Navigation.astro**: CSS-only hamburger menu implementation
  - Checkbox-based toggle pattern (no JavaScript required)
  - Mobile: vertical slide-out menu with smooth transitions
  - Desktop: horizontal navigation bar
  - Sticky positioning with box shadow
  - All tap targets 44px+
  - Links: Tours, About, Contact

- **Footer.astro**: Three-section footer with responsive layout
  - Section 1: Site name and tagline
  - Section 2: Quick links (Tours, About, Contact)
  - Section 3: Contact info (email, WhatsApp)
  - Dark background (var(--color-bg-dark)) with light text
  - Single column mobile, 3-column desktop grid
  - Copyright with current year

- **index.astro**: Complete homepage demonstrating performance patterns
  - Hero section with responsive image via Picture component
  - Formats: AVIF, WebP, JPEG fallback
  - Widths: 400px, 800px, 1200px
  - Loading: eager (above fold)
  - Quality: 80
  - Overlay with heading "Discover South Africa's Wild Side"
  - Intro section with welcome text and CTA button
  - Why JaJa section with 3 feature cards (Expert Guide, Stunning Locations, Small Groups)
  - All sections mobile-first with responsive enhancements

- **hero-placeholder.jpg**: Created minimal JPEG placeholder (907 bytes) for Picture component processing

**Commit:** 47fe19d

## Deviations from Plan

None - plan executed exactly as written. All components delivered as specified with mobile-first approach, zero JavaScript, system fonts, and responsive images.

## Verification Results

**Build output:**
- `npm run build` completed successfully in ~1.1s
- dist/index.html generated: 5489 bytes
- Image optimization generated:
  - hero-placeholder AVIF: 356 bytes
  - hero-placeholder WebP: 136 bytes
  - hero-placeholder JPEG: 383 bytes (optimized from 907 bytes)
- Zero JavaScript files in dist/
- Zero script tags in HTML output

**Code verification:**
- global.css contains 'system-ui' font stack
- global.css contains '--color-primary' custom properties
- BaseLayout has viewport meta tag
- No @font-face or Google Fonts references found
- Navigation uses checkbox input (CSS-only toggle)
- index.astro imports Picture from 'astro:assets'
- All CSS uses min-width media queries (mobile-first)

**Performance characteristics:**
- Zero JavaScript shipped to client
- System fonts only (no web font downloads)
- Responsive images with modern formats (AVIF/WebP)
- CSS-only interactions (no JS for navigation)
- Touch-friendly 44px minimum tap targets throughout

## Files Changed

| File | Type | Description |
|------|------|-------------|
| src/layouts/BaseLayout.astro | Created | HTML shell with Navigation, Footer, meta tags, system fonts |
| src/styles/global.css | Created | Mobile-first CSS reset, typography, colors, utilities |
| src/components/Navigation.astro | Created | CSS-only hamburger nav with sticky positioning |
| src/components/Footer.astro | Created | Three-section footer with responsive grid |
| src/pages/index.astro | Modified | Complete homepage with hero, intro, features |
| src/assets/images/hero-placeholder.jpg | Created | Minimal JPEG for Picture component processing |
| public/favicon.svg | Modified | Simple "J" SVG favicon in brand green |

## Technical Details

**System Font Stack:**
```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

**Color Scheme (CSS Custom Properties):**
- Primary: #2D5016 (deep forest green)
- Primary Light: #4A7C2E
- Accent: #D4A843 (warm gold)
- Text: #1A1A1A
- Text Light: #555555
- Background: #FAFAF7 (warm off-white)
- Background Dark: #2D2D2D

**Responsive Breakpoint:**
- Mobile: base styles (320px+)
- Desktop: min-width 768px

**Image Optimization:**
- Original: 907 bytes JPEG
- Optimized AVIF: 356 bytes (61% reduction)
- Optimized WebP: 136 bytes (85% reduction)
- Optimized JPEG: 383 bytes (58% reduction)

**Navigation Pattern:**
```html
<input type="checkbox" id="nav-toggle" />
<label for="nav-toggle">Hamburger Icon</label>
<ul class="nav-menu">...</ul>
```
CSS controls visibility via `.nav-toggle:checked ~ .nav-menu`

## Dependencies

**Requires:** 01-01 (Astro project initialization with Sharp image processing)

**Provides:**
- BaseLayout component for all pages
- Navigation component for site-wide nav
- Footer component for site-wide footer
- Global CSS foundation (reset, typography, colors, utilities)
- Homepage demonstrating all patterns
- Responsive image processing pipeline (AVIF/WebP)

**Affects:** All future pages will use BaseLayout, Navigation, and Footer

## Next Steps

With the layout foundation in place, the next plan can:
1. Build additional pages (Tours, About, Contact) using BaseLayout
2. Add content and real images to homepage
3. Implement CMS integration (Phase 2) using established layout patterns
4. Enhance navigation with active states and sub-menus if needed

## Self-Check: PASSED

**Files created verification:**
```bash
FOUND: src/layouts/BaseLayout.astro
FOUND: src/styles/global.css
FOUND: src/components/Navigation.astro
FOUND: src/components/Footer.astro
FOUND: src/assets/images/hero-placeholder.jpg
FOUND: public/favicon.svg (modified)
FOUND: src/pages/index.astro (modified)
```

**Commits verification:**
```bash
FOUND: b7867ee (Task 1 commit)
FOUND: 47fe19d (Task 2 commit)
```

**Build verification:**
```bash
✓ npm run build succeeded
✓ dist/index.html exists (5489 bytes)
✓ AVIF/WebP/JPEG variants generated
✓ Zero JavaScript files in dist/
✓ Zero script tags in HTML
✓ System fonts only (no web fonts)
✓ CSS-only navigation (checkbox pattern)
✓ Mobile-first media queries (min-width)
```

All claims verified. Plan executed successfully.
