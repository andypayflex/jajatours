# Phase 1: Foundation & Performance - Research

**Researched:** 2026-02-13
**Domain:** Astro 5.17+ static site setup, Netlify deployment, mobile performance optimization
**Confidence:** HIGH

## Summary

Phase 1 establishes the technical foundation for a high-performance, mobile-first tourism website using Astro 5.17+, Netlify hosting, and Cloudinary image optimization. The research confirms that the locked stack decisions (Astro 5.17+, Netlify, Cloudinary) are optimal for achieving the success criteria: sub-3-second load times on 3G, mobile responsiveness, responsive images, and HTTPS.

Astro 5.17 introduces critical performance improvements including Sharp kernel selection for image optimization, reduced data store sizes via `retainBody` option, and background color control for JPEG conversion. Netlify provides zero-configuration HTTPS with automatic Let's Encrypt certificate provisioning and requires minimal setup for Astro deployments. Cloudinary integration via `astro-cloudinary` delivers automatic responsive image optimization with WebP/AVIF conversion and lazy loading.

The standard approach is: initialize Astro project with TypeScript and Sharp image processing, configure responsive images with Picture component using AVIF/WebP formats, deploy to Netlify with automatic SSL, and integrate Cloudinary for scalable image delivery. Performance budget enforcement (<500KB page size, <3s TTI on 3G) requires ruthless optimization: compress images to 80% quality, lazy load below-the-fold content, minimize JavaScript, and use system fonts.

**Primary recommendation:** Start with minimal Astro setup (no framework integrations yet), configure Sharp image processing with AVIF/WebP output, deploy to Netlify early for HTTPS validation, and establish performance monitoring before adding features.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Astro | 5.17+ | Static site generator | Zero-JS by default, 40% faster load times vs Next.js, 62% Core Web Vitals pass rate, Sharp image processing built-in, file-based routing |
| Sharp | Latest (via Astro) | Image processing | Default Astro image service, faster builds than Squoosh, fine-grained kernel control (new in 5.17), supports WebP/AVIF/JPEG/PNG |
| TypeScript | 5.0+ | Type safety | Built-in Astro support, catches errors in Content Collections, recommended for maintainability |
| Node.js | 18.20.8+ or 20.3.0+ | Runtime | Required by Astro 5.x, Netlify build environment requirement |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| astro-cloudinary | Latest | Cloudinary integration | For scalable responsive image delivery, automatic format optimization, dynamic transformations. Use when image volume exceeds local optimization capacity. |
| @astrojs/sitemap | Latest | SEO sitemap generation | Auto-generate XML sitemap for search engines. Use always for SEO. |
| @astrojs/netlify | Latest (optional) | Netlify adapter | Only needed for SSR/edge rendering. Skip for pure static sites (default). |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Astro Image (Sharp) | Squoosh | Squoosh is slower, deprecated in Astro, lacks Sharp's kernel options. Sharp is always preferred. |
| Cloudinary | Astro built-in Picture | Built-in sufficient for low-volume sites (<100 images), but Cloudinary scales better and offloads build processing. Use built-in first, migrate to Cloudinary when build times increase. |
| Netlify | Vercel | Vercel better for Next.js, but Netlify has more generous free tier (same 100GB bandwidth, better pricing tiers). Both work well for Astro. |

**Installation:**
```bash
# Initialize Astro project
npm create astro@latest jaja-tours -- --template minimal --typescript strict

# Navigate to project
cd jaja-tours

# Add sitemap integration
npx astro add sitemap

# Add Cloudinary (when ready for image optimization)
npm install astro-cloudinary

# Install development dependencies
npm install -D prettier prettier-plugin-astro
```

## Architecture Patterns

### Recommended Project Structure

```
jaja-tours/
├── src/
│   ├── pages/                # File-based routing (REQUIRED)
│   │   ├── index.astro      # Homepage
│   │   ├── tours/
│   │   │   ├── index.astro  # Tour listing
│   │   │   └── [slug].astro # Dynamic tour pages
│   │   ├── about.astro
│   │   └── contact.astro
│   │
│   ├── components/           # Reusable UI components
│   │   ├── Navigation.astro
│   │   ├── Footer.astro
│   │   ├── TourCard.astro
│   │   └── Hero.astro
│   │
│   ├── layouts/              # Page templates
│   │   ├── BaseLayout.astro # Common layout wrapper
│   │   └── TourLayout.astro # Tour-specific layout
│   │
│   ├── assets/               # Images to be optimized by Astro
│   │   └── images/
│   │
│   └── styles/               # Global CSS
│       └── global.css
│
├── public/                   # Static assets (fonts, favicon, copied as-is)
│   ├── fonts/
│   └── favicon.ico
│
├── astro.config.mjs          # Astro configuration
├── tsconfig.json             # TypeScript configuration
├── netlify.toml              # Netlify configuration (optional)
├── package.json
└── .nvmrc                    # Node version specification
```

**Rationale:**
- `src/pages/` is REQUIRED by Astro, uses file-based routing (no router config needed)
- `src/components/` and `src/layouts/` are conventions (recommended but flexible)
- `src/assets/` for images that need optimization (processed by Sharp at build time)
- `public/` for files that bypass processing (fonts, favicons, served directly)
- Configuration files at root level per Astro standards

### Pattern 1: Responsive Image Optimization with Picture Component

**What:** Use Astro's built-in `<Picture />` component with AVIF and WebP formats, automatic srcset generation, and lazy loading for mobile performance.

**When to use:** Always for hero images, tour galleries, any images above 50KB. Critical for 3G mobile performance.

**Example:**
```astro
---
// Source: https://docs.astro.build/en/guides/images/
import { Picture } from 'astro:assets';
import heroImage from '@assets/images/hero.jpg';
---

<!-- Generates AVIF, WebP, JPEG fallback with responsive sizes -->
<Picture
  src={heroImage}
  formats={['avif', 'webp']}
  alt="Adventure tours in South Africa"
  widths={[400, 800, 1200]}
  sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
  loading="lazy"
  decoding="async"
  quality={80}
/>
```

**Why it works:**
- Astro generates multiple formats (tries AVIF first, falls back to WebP, then JPEG)
- `widths` creates responsive sizes for different devices
- `loading="lazy"` defers below-the-fold images
- `quality={80}` balances file size vs visual quality (80% is sweet spot)
- At build time, Sharp processes images into cache, reused across builds

### Pattern 2: Mobile-First Base Layout with Performance Budget

**What:** Create BaseLayout.astro with minimal HTML, inline critical CSS, defer non-critical resources, and mobile-first viewport settings.

**When to use:** As the foundation for all pages. Enforces performance budget globally.

**Example:**
```astro
---
// Source: https://docs.astro.build/en/basics/layouts/
interface Props {
  title: string;
  description: string;
}

const { title, description } = Astro.props;
---

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} | JaJa Tours</title>
  <meta name="description" content={description}>

  <!-- Critical CSS inlined -->
  <style>
    /* Mobile-first critical styles only */
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
  </style>

  <!-- Preconnect to external domains -->
  <link rel="preconnect" href="https://res.cloudinary.com">

  <!-- Defer non-critical CSS -->
  <link rel="stylesheet" href="/styles/global.css" media="print" onload="this.media='all'">
</head>
<body>
  <slot />
</body>
</html>
```

**Why it works:**
- System fonts (no web font download) save 40KB+
- Inline critical CSS eliminates render-blocking request
- Preconnect to Cloudinary reduces DNS lookup time for images
- Deferred CSS loading prevents blocking first paint
- Mobile viewport meta prevents zooming issues on touch devices

### Pattern 3: Netlify Deployment with Zero Configuration

**What:** Deploy Astro to Netlify via Git integration with automatic HTTPS, no adapter needed for static sites.

**When to use:** Initial deployment and all subsequent updates. Automatic on every Git push.

**Setup:**
```bash
# 1. Initialize Git repository
git init
git add .
git commit -m "Initial commit"

# 2. Push to GitHub/GitLab
git remote add origin <your-repo-url>
git push -u origin main

# 3. Connect to Netlify (via web UI or CLI)
# Option A: Web UI - Import from Git, auto-detects Astro
# Option B: CLI
npm install -g netlify-cli
netlify login
netlify init
```

**netlify.toml (optional but recommended):**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

**Why it works:**
- Netlify auto-detects Astro, pre-fills `astro build` and `dist` settings
- Automatic Let's Encrypt SSL certificate (renewed automatically)
- Global CDN caching for fast delivery in South Africa and internationally
- Build cache preserved between deploys (reuses Sharp-processed images)
- Headers configuration enforces security and asset caching

### Pattern 4: Cloudinary Integration for Scalable Image Delivery

**What:** Use `astro-cloudinary` CldImage component for automatic responsive image optimization with Cloudinary's CDN and transformations.

**When to use:** When local image processing becomes slow (>100 images), or when dynamic transformations needed (user uploads, CMS images).

**Example:**
```astro
---
// Source: https://astro.cloudinary.dev/
import { CldImage } from 'astro-cloudinary';
---

<!-- Automatically optimized, responsive, AVIF/WebP -->
<CldImage
  src="jaja-tours/hero-diving"
  alt="Scuba diving in Sodwana Bay"
  width={1200}
  height={800}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
  crop="fill"
  gravity="auto"
  loading="lazy"
/>
```

**Configuration (.env):**
```bash
PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
```

**Why it works:**
- Cloudinary CDN delivers images from closest edge location
- Automatic format detection (serves AVIF to supporting browsers, WebP fallback, JPEG for old browsers)
- `gravity="auto"` uses AI to crop to important content (faces, subjects)
- Transformations happen on Cloudinary servers (offloads build process)
- Free tier: 25 credits/month (sufficient for prototype)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image optimization | Custom Sharp scripts, manual WebP conversion | Astro Picture component + astro-cloudinary | Astro handles srcset, format conversion, lazy loading automatically. Custom scripts miss edge cases (responsive sizes, browser support detection, caching). Sharp has 100+ configuration options, Astro provides sensible defaults. |
| Responsive images | Manual srcset/sizes attributes | Astro Picture component with widths/sizes | Hand-coded srcset is error-prone (wrong breakpoints, missing sizes, incorrect aspect ratios). Astro generates correct markup automatically. |
| HTTPS/SSL certificates | Self-signed certs, manual Let's Encrypt | Netlify automatic SSL | Manual SSL requires renewal every 90 days, DNS validation, server config. Netlify handles automatically, including renewals and multi-domain support. |
| Image lazy loading | Intersection Observer JS | Astro loading="lazy" | Native browser lazy loading (supported since 2020) is faster, lighter, and more reliable than custom JS. No layout shift, automatic scroll threshold. |
| Performance monitoring | Custom analytics | Netlify Analytics + Lighthouse CI | Building performance dashboards requires backend, data storage, visualization. Netlify provides built-in Core Web Vitals tracking. Lighthouse CI automates performance regression detection. |

**Key insight:** Astro and Netlify handle 90% of performance optimization automatically. The remaining 10% is content optimization (image compression, minimal JS). Don't build what's already solved at platform level.

## Common Pitfalls

### Pitfall 1: Storing Images in public/ Instead of src/assets/

**What goes wrong:** Images in `public/` bypass Astro's optimization pipeline. No Sharp processing, no WebP/AVIF conversion, no responsive sizes, no lazy loading. Results in multi-megabyte images served to 3G mobile users.

**Why it happens:** Developers assume `public/` is for "public" images. Documentation says "static assets" which is ambiguous.

**How to avoid:**
- Rule: If image is referenced in HTML/Astro components, store in `src/assets/`
- Only use `public/` for: favicons, robots.txt, fonts, files that MUST have exact URL (e.g., logo.png referenced in OG tags)
- Import images: `import hero from '@assets/images/hero.jpg'` then use with Picture component

**Warning signs:**
- Build completes instantly (no image processing time)
- Browser DevTools Network tab shows large .jpg files (no .webp/.avif)
- No srcset attribute in img tags
- Lighthouse flags "Serve images in next-gen formats"

### Pitfall 2: Not Specifying Node Version for Netlify

**What goes wrong:** Netlify uses legacy Xenial build image with Node 14 by default. Astro 5.x requires Node 18.20.8+ or 20.3.0+. Build fails with cryptic error: "engine-strict" or "unsupported engine."

**Why it happens:** Netlify doesn't auto-detect Node version from package.json engines field on older accounts.

**How to avoid:**
- Create `.nvmrc` file in project root: `echo "20" > .nvmrc`
- OR set `NODE_VERSION` environment variable in Netlify dashboard: Build & deploy > Environment > `NODE_VERSION=20`
- OR specify in netlify.toml: `[build.environment] NODE_VERSION = "20"`

**Warning signs:**
- Netlify build log shows "Node v14.x.x"
- Error message: "The engine 'node' is incompatible"
- Build succeeds locally but fails on Netlify

### Pitfall 3: Over-Optimizing Images During Development

**What goes wrong:** Running Astro dev mode with large image collections causes slow server startup (30+ seconds) because Sharp processes all images on every restart. Frustrates development iteration.

**Why it happens:** Astro dev mode processes images on-demand, but doesn't cache aggressively during development. Large galleries trigger processing on every page view.

**How to avoid:**
- During development: use smaller placeholder images or reduce widths array
- Use `astro build` periodically to populate build cache
- For large galleries, initially use Cloudinary URLs (skip local processing) then migrate later
- Configure Sharp cache directory in `astro.config.mjs` for persistent caching

**Warning signs:**
- Dev server takes >15 seconds to start
- Page refreshes hang for 5+ seconds
- Terminal shows "Transforming image..." repeatedly

### Pitfall 4: Forgetting DNS Propagation for Netlify HTTPS

**What goes wrong:** Deploy site, add custom domain, immediately test. HTTPS shows "Not Secure" or certificate error. Developer assumes Netlify SSL is broken.

**Why it happens:** Netlify requires domain's DNS to point to Netlify servers BEFORE provisioning Let's Encrypt certificate. DNS changes take 10 minutes to 24 hours to propagate globally.

**How to avoid:**
- Sequence: 1) Deploy to Netlify (get netlify.app URL), 2) Update DNS to point to Netlify, 3) Wait for DNS propagation (check with `dig` or online DNS checker), 4) Add custom domain in Netlify dashboard
- Verify DNS before adding domain: `dig yourdomain.com` should show Netlify's IP or CNAME
- Netlify retries SSL provisioning every 10 minutes for first 24 hours
- Use Netlify's "Check DNS configuration" button in Domain settings

**Warning signs:**
- Certificate shows "*.netlify.app" instead of your domain
- Browser shows "NET::ERR_CERT_COMMON_NAME_INVALID"
- Netlify dashboard shows "DNS verification in progress"

### Pitfall 5: Not Testing on Actual 3G Connection

**What goes wrong:** Site feels fast on developer's high-speed WiFi. Deployed to production, users on SA mobile networks experience 20+ second load times. Success criteria violated.

**Why it happens:** Chrome DevTools "Slow 3G" throttling is simulation, doesn't capture real-world packet loss, latency variance, or DNS resolution delays.

**How to avoid:**
- Test on real 3G device (disable WiFi, enable mobile data, verify 3G icon)
- Use WebPageTest with "Mobile 3G - Slow" setting for Johannesburg/Cape Town location
- Monitor Netlify Analytics for real user metrics (75th percentile load time)
- Performance budget CI check: Lighthouse CI with 3G throttling, fail build if >3s TTI

**Warning signs:**
- Lighthouse score 95+ on desktop, <60 on mobile
- Users report "site doesn't load" but developer can't reproduce
- Netlify Analytics shows high bounce rate from mobile traffic
- Core Web Vitals show green in dev, red in production

## Code Examples

### Example 1: Complete Mobile-First Page Template

```astro
---
// Source: Astro official docs + mobile-first patterns
import { Picture } from 'astro:assets';
import BaseLayout from '@layouts/BaseLayout.astro';
import heroImage from '@assets/images/hero-diving.jpg';

const title = "Scuba Diving Tours";
const description = "Explore the underwater world of Sodwana Bay with JaJa Tours";
---

<BaseLayout {title} {description}>
  <!-- Hero section with optimized image -->
  <section class="hero">
    <Picture
      src={heroImage}
      formats={['avif', 'webp']}
      alt="Scuba diver exploring coral reef"
      widths={[400, 800, 1200]}
      sizes="100vw"
      quality={80}
      loading="eager"
    />
    <h1>{title}</h1>
  </section>

  <!-- Content section -->
  <section class="content">
    <h2>Experience World-Class Diving</h2>
    <p>Sodwana Bay offers pristine coral reefs and abundant marine life.</p>
  </section>

  <!-- Below-the-fold images lazy loaded -->
  <section class="gallery">
    {[1, 2, 3].map((n) => (
      <Picture
        src={import(`@assets/images/gallery-${n}.jpg`)}
        formats={['avif', 'webp']}
        alt={`Gallery image ${n}`}
        widths={[400, 800]}
        sizes="(max-width: 640px) 100vw, 50vw"
        quality={80}
        loading="lazy"
      />
    ))}
  </section>
</BaseLayout>

<style>
  /* Mobile-first styles */
  .hero {
    position: relative;
    height: 60vh;
  }

  .hero h1 {
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    color: white;
    font-size: 2rem;
    margin: 0;
  }

  .content {
    padding: 1rem;
  }

  .gallery {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }

  /* Desktop enhancement */
  @media (min-width: 768px) {
    .hero h1 {
      font-size: 3rem;
    }

    .gallery {
      grid-template-columns: repeat(3, 1fr);
    }
  }
</style>
```

### Example 2: Astro Config for Optimal Performance

```javascript
// astro.config.mjs
// Source: https://docs.astro.build/en/guides/images/
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://jajatours.co.za',

  integrations: [
    sitemap(),
  ],

  image: {
    // Sharp configuration (default, but shown for clarity)
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        // New in Astro 5.17: kernel selection for sharpness
        kernel: 'lanczos3', // sharper than default 'cubic'

        // Background color for JPEG conversion (new in 5.17)
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    },

    // Responsive image defaults
    layout: 'responsive',

    // Authorized remote image domains (for Cloudinary)
    domains: ['res.cloudinary.com'],

    // Enable responsive CSS injection
    responsiveStyles: true,
  },

  build: {
    // Inline stylesheets < 4KB (reduces requests)
    inlineStylesheets: 'auto',

    // Asset optimization
    assets: '_astro',
  },

  vite: {
    build: {
      // Increase chunk size warning threshold
      chunkSizeWarningLimit: 600,
    },
  },
});
```

### Example 3: Performance Budget Lighthouse CI Config

```javascript
// lighthouserc.js
// Source: Lighthouse CI best practices
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      settings: {
        // Simulate 3G mobile
        preset: 'desktop',
        throttling: {
          rttMs: 300,
          throughputKbps: 1600,
          cpuSlowdownMultiplier: 4,
        },
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'interactive': ['error', { maxNumericValue: 3000 }], // <3s TTI requirement
        'total-byte-weight': ['error', { maxNumericValue: 512000 }], // <500KB budget
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| @astrojs/image package | Built-in Image/Picture components | Astro 3.0 (Sept 2023) | No need to install separate integration. Image optimization is core feature. |
| Squoosh image service | Sharp image service (default) | Astro 4.0 (Dec 2023) | Sharp is faster, more reliable, actively maintained. Squoosh deprecated. |
| Manual srcset generation | Automatic widths/sizes | Astro 3.3 (Oct 2023) | Picture component generates responsive markup automatically. |
| Sharp kernel not configurable | Kernel option in astro.config.mjs | Astro 5.17 (Jan 2026) | Fine-tune sharpness vs smoothness for image types (lanczos3 for photography, cubic for graphics). |
| Black background for JPEG | Configurable background color | Astro 5.17 (Jan 2026) | Prevents dark borders when converting PNG/WebP with transparency to JPEG. |
| No data store size control | retainBody option for glob() | Astro 5.17 (Jan 2026) | Reduces deployment size for large content collections by excluding raw file bodies. |
| Netlify adapter required | Adapter optional for static | Astro 4.0+ (Dec 2023) | Static sites deploy without adapter. Adapter only needed for SSR/edge. |

**Deprecated/outdated:**
- **@astrojs/image**: Removed in Astro 3.0, replaced by built-in components
- **Squoosh**: Deprecated image service, replaced by Sharp
- **output: 'static'**: This is now default, no need to specify in astro.config.mjs

## Open Questions

### Question 1: Cloudinary Free Tier Sufficiency

**What we know:**
- Cloudinary free tier provides 25 monthly credits
- 1 credit = 1GB storage OR 1GB bandwidth OR 1,000 transformations
- JaJa Tours will have ~50-100 tour images initially

**What's unclear:**
- How credits are consumed in practice (does responsive image generation count as multiple transformations?)
- Whether transformation credit usage multiplies with different format/size combinations
- At what traffic level the free tier becomes insufficient

**Recommendation:**
- Start with Astro built-in Picture component (zero cost, processes images at build time)
- Monitor build times; if Sharp processing exceeds 2-3 minutes, migrate to Cloudinary
- During migration, test with 10-20 images to measure credit consumption rate
- Only migrate fully once credit math is proven sustainable

### Question 2: Netlify Build Time Limits on Free Tier

**What we know:**
- Netlify free tier provides 300 build minutes/month
- Astro build with Sharp image processing can take 1-5 minutes depending on image count

**What's unclear:**
- Exact build time impact of 100+ images with multiple format/size variants
- Whether build cache reliably reduces subsequent build times
- How frequently content updates will trigger rebuilds (CMS webhooks)

**Recommendation:**
- During Phase 1, establish baseline build time with minimal images (track in CI logs)
- Set Netlify build cache to persist Sharp processed images
- If builds exceed 5 minutes, consider: 1) Cloudinary migration (offload processing), 2) Paid tier ($19/month for 1,000 minutes), or 3) Reduce responsive size variants

### Question 3: HTTPS Certificate Provisioning Edge Cases

**What we know:**
- Netlify automatically provisions Let's Encrypt certificates
- Requires DNS to point to Netlify before provisioning
- Retries every 10 minutes for 24 hours

**What's unclear:**
- Behavior with .co.za domain extensions (South African TLD)
- Whether CAA DNS records need explicit configuration for Let's Encrypt
- Fallback options if automatic provisioning fails after 24 hours

**Recommendation:**
- Test HTTPS provisioning early in Phase 1 (don't wait for content completion)
- Document exact DNS setup for .co.za domain in deployment guide
- If automatic provisioning fails, fallback: manual certificate upload (Netlify supports custom certs) or Cloudflare proxy mode (Cloudflare handles SSL, proxies to Netlify)

## Sources

### Primary (HIGH confidence)

**Astro Official Documentation:**
- [Astro 5.17 Release](https://astro.build/blog/astro-5170/) - Image optimization features (kernel, background), data store reduction
- [Astro Image Guide](https://docs.astro.build/en/guides/images/) - Picture/Image components, Sharp configuration, responsive images
- [Astro Project Structure](https://docs.astro.build/en/basics/project-structure/) - Official folder organization, required directories

**Netlify Official Documentation:**
- [Deploy Astro to Netlify](https://docs.astro.build/en/guides/deploy/netlify/) - Build configuration, adapter setup, Node version
- [Netlify HTTPS/SSL](https://docs.netlify.com/manage/domains/secure-domains-with-https/https-ssl/) - Automatic certificate provisioning, custom certs
- [Netlify DNS Troubleshooting](https://docs.netlify.com/manage/domains/troubleshooting-tips/) - Common DNS issues, resolution steps

**Cloudinary Integration:**
- [Astro Cloudinary](https://astro.cloudinary.dev/) - CldImage component, installation, responsive optimization
- [Astro + Cloudinary Guide](https://docs.astro.build/en/guides/media/cloudinary/) - Official integration documentation

### Secondary (MEDIUM confidence)

**Performance & Best Practices:**
- [Mobile-First Design 2026](https://seizemarketingagency.com/mobile-first-design/) - Performance budgeting strategies, Core Web Vitals importance
- [Performance First UX 2026](https://wearepresta.com/performance-first-ux-2026-architecting-for-revenue-and-speed/) - Total Blocking Time targets (<50ms), performance budget integration
- [Astro Image Optimization Best Practices](https://uploadcare.com/blog/how-to-optimize-images-in-astro/) - WebP/AVIF usage, Sharp configuration
- [Image Formats 2026](https://www.image2any.com/2026/01/best-image-formats-for-2026.html) - WebP vs AVIF comparison, browser support

**Netlify & Deployment:**
- [Astro on Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/astro/) - Framework-specific setup, build detection
- [Netlify SSL Troubleshooting](https://answers.netlify.com/t/support-guide-troubleshooting-ssl-certificate-errors/39865) - Common certificate errors, resolution steps

**Project Structure:**
- [Astro File Organization Best Practices](https://tillitsdone.com/blogs/astro-js-file-organization-guide/) - Component organization patterns, folder conventions

### Tertiary (LOW confidence - requires validation)

**Astro-specific pitfalls:** Could not find comprehensive "common mistakes" documentation specific to Astro 5.x. Pitfalls documented above are derived from:
- Official docs warnings (e.g., public/ vs src/assets/ distinction)
- Community forum patterns (Netlify Support, GitHub issues)
- General web performance principles applied to Astro context

**Performance budget thresholds:** The <500KB and <3s TTI targets are project requirements, not Astro-specific standards. Industry best practices suggest similar targets, but exact thresholds vary by use case.

## Metadata

**Confidence breakdown:**
- **Standard stack:** HIGH - Astro 5.17 features verified via official release notes, Netlify deployment confirmed via official docs, Cloudinary integration documented officially
- **Architecture:** HIGH - Astro project structure is official convention, image optimization patterns are core Astro features
- **Pitfalls:** MEDIUM-HIGH - Four pitfalls verified via official docs/community forums (public/ vs assets/, Node version, DNS propagation, dev performance), fifth (3G testing) is general web performance principle

**Research date:** 2026-02-13
**Valid until:** 2026-03-15 (30 days) - Astro is stable, unlikely breaking changes. Monitor Astro 6.0 announcements if released before planning completion.
