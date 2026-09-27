# SEO Documentation

This document covers the SEO setup and optimization for the SLO Web Design website.

## SEO Overview

The site is optimized for:
- Local search (San Luis Obispo, California)
- Web design industry keywords
- Mobile-first indexing
- Core Web Vitals

## Meta Tags & Metadata

### Location: `src/pages/index.tsx`

```typescript
<Head>
  <title>SLO Web Design | Premium Web Design Agency San Luis Obispo</title>
  <meta name="description" content="..." />
  <meta name="keywords" content="..." />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta property="og:title" content="..." />
  <meta property="og:description" content="..." />
  <meta property="og:image" content="..." />
  <meta name="twitter:card" content="summary_large_image" />
</Head>
```

### Best Practices

- **Title**: 50-60 characters, include primary keyword
- **Description**: 150-160 characters, compelling, includes call-to-action
- **Keywords**: Target 5-10 relevant keywords (less important now)

## JSON-LD Schema Markup

### Location: `src/lib/schema.ts`

Three main schemas are implemented:

1. **LocalBusinessSchema** - Identifies business as local service
2. **OrganizationSchema** - General company information
3. **WebsiteSchema** - Site-wide metadata

### Validation

Validate schema at: https://schema.org/validator

```bash
# Check generated schema
curl -X POST https://schema.org/validator \
  -d '{"codeContent":"<your-json-ld>"}'
```

### Common Schemas to Add

**FAQSchema** - For FAQ section:

```typescript
export const generateFAQSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How long does a website project take?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Most projects take 4-8 weeks depending on scope.',
        },
      },
    ],
  };
};
```

**ReviewSchema** - For testimonials:

```typescript
{
  '@context': 'https://schema.org',
  '@type': 'Review',
  reviewRating: {
    '@type': 'Rating',
    ratingValue: '5',
    bestRating: '5',
  },
  reviewBody: 'Testimonial text...',
  author: {
    '@type': 'Person',
    name: 'Client Name',
  },
}
```

**ServiceSchema** - For services:

```typescript
{
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Website Modernization',
  description: 'Service description...',
  provider: {
    '@type': 'LocalBusiness',
    name: 'SLO Web Design',
  },
}
```

## Sitemaps & Robots

### Sitemap

Location: `/sitemap.xml`

Generated dynamically at `src/pages/sitemap.xml.ts`

Includes:
- Homepage (priority: 1.0)
- Service sections (priority: 0.8)
- Contact page (priority: 0.9)

Update sitemap change frequency as needed:
- `weekly` - For pages that change often
- `monthly` - For pages that change occasionally
- `yearly` - For static pages

### Robots.txt

Location: `/robots.txt`

Generated dynamically at `src/pages/robots.tsx`

Disallows:
- `/api/` - API routes
- `/admin/` - Admin pages

Allows crawlers to index everything else.

### Submit to Search Engines

**Google Search Console**:

1. Go to https://search.google.com/search-console
2. Add property: https://slowebdesign.com
3. Verify ownership (via DNS or HTML file)
4. Submit sitemap: https://slowebdesign.com/sitemap.xml
5. Monitor indexation status

**Bing Webmaster Tools**:

1. Go to https://www.bing.com/webmasters
2. Add site URL
3. Submit sitemap
4. Monitor crawl stats

## Open Graph & Twitter Cards

### Open Graph

Enables rich previews when sharing on social media:

```html
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:image" content="https://slowebdesign.com/og-image.jpg" />
<meta property="og:url" content="https://slowebdesign.com" />
<meta property="og:type" content="website" />
```

### Twitter Card

Enables rich previews when sharing on Twitter:

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="..." />
<meta name="twitter:description" content="..." />
<meta name="twitter:image" content="..." />
```

Test at: https://cards-dev.twitter.com/validator

## Canonical URLs

Prevents duplicate content issues:

```html
<link rel="canonical" href="https://slowebdesign.com" />
```

Already implemented in `src/pages/index.tsx`.

## Local SEO

### Local Business Schema

The site includes LocalBusinessSchema targeting:
- Business name: SLO Web Design
- Location: San Luis Obispo, California
- Service area: California
- Business type: LocalBusiness

### Google Business Profile

Set up at: https://business.google.com

1. Create or claim business
2. Add business information
3. Add photos and videos
4. Get reviews
5. Monitor insights

### Local Keywords

Target these keywords:
- "web design San Luis Obispo"
- "website designer SLO"
- "web development California"
- "website modernization San Luis Obispo"

## Core Web Vitals

Monitor at: https://pagespeed.web.dev

### Metrics

1. **Largest Contentful Paint (LCP)** < 2.5s
   - How fast the page shows main content
   - Optimize images, fonts, scripts

2. **First Input Delay (FID)** < 100ms
   - How responsive the site is to user input
   - Minimize JavaScript, use async loading

3. **Cumulative Layout Shift (CLS)** < 0.1
   - How much the layout moves around
   - Set image dimensions, avoid unsized media

## Performance SEO

### Lighthouse Audit

Run in Chrome DevTools (F12 → Lighthouse → Analyze):

Target scores:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 95+

### Optimization Tips

1. **Images**: Compress, use modern formats (WebP)
2. **Fonts**: Use system fonts or preload web fonts
3. **CSS**: Minimize unused CSS, inline critical CSS
4. **JavaScript**: Code-split, lazy load, defer non-critical
5. **Caching**: Netlify handles cache headers automatically

## Mobile SEO

The site is mobile-first:
- Responsive design (mobile-first)
- Touch-friendly buttons (48x48px minimum)
- Readable text (16px minimum)
- Fast loading on 4G

Test at: https://search.google.com/test/mobile-friendly

## Keyword Strategy

### Primary Keywords
- web design San Luis Obispo
- website design SLO
- web development California

### Secondary Keywords
- website modernization
- responsive web design
- local business websites
- web design agency
- professional web design

### Long-tail Keywords
- "website redesign San Luis Obispo"
- "custom website design California"
- "affordable web design SLO"
- "website maintenance plans"

## Content Optimization

### Title Tags
- Include primary keyword
- Keep to 50-60 characters
- Make compelling and clickable

### Meta Descriptions
- Include primary keyword
- Keep to 150-160 characters
- Include call-to-action
- Write for clicks, not ranking

### Heading Hierarchy
- One H1 per page
- Use H2s for main sections
- Use H3s for subsections
- Include keywords naturally

### Content Guidelines
- Write for humans first, SEO second
- Natural keyword usage (2-3% keyword density)
- 300+ words minimum per section
- Use related keywords
- Internal linking to relevant pages

## Link Building

### Internal Links
Already implemented:
- Navigation links
- Section links in header
- Footer links

Add more internal links in content:
```markdown
Check out our [web design services](#services) or 
[maintenance plans](#maintenance).
```

### External Links
- Link to relevant resources
- Link to Google Business Profile
- Link to GitHub

## Monitoring & Maintenance

### Google Analytics

Track:
- Organic traffic
- Conversion rate
- Average session duration
- Bounce rate
- Top landing pages

Visit: https://analytics.google.com

### Google Search Console

Monitor:
- Impressions and clicks
- Average CTR
- Average position
- Indexed pages
- Crawl errors

Visit: https://search.google.com/search-console

### Monthly SEO Checklist

- [ ] Check analytics for traffic trends
- [ ] Monitor ranking for target keywords
- [ ] Check for crawl errors in GSC
- [ ] Verify all links are working
- [ ] Run Lighthouse audit
- [ ] Review Core Web Vitals
- [ ] Check Open Graph tags
- [ ] Verify schema markup

## Competitor Analysis

### Competitors to Monitor
- Other web design agencies in SLO
- California web design firms
- National web design companies

### What to Monitor
- Keywords they rank for
- Their backlink sources
- Their content strategy
- Their technical SEO

Tools:
- SEMrush: https://semrush.com
- Ahrefs: https://ahrefs.com
- Moz: https://moz.com

## Resources

- Google Search Central: https://developers.google.com/search
- Google Business Profile: https://business.google.com
- Lighthouse: https://developers.google.com/web/tools/lighthouse
- Schema.org: https://schema.org
- Yoast SEO Guide: https://yoast.com/seo

---

Last updated: 2024
