# SLO Web Design - Premium Website

A production-ready Next.js website for SLO Web Design, a premium web design agency based in San Luis Obispo, California.

## Features

- ✨ **Premium Design**: Inspired by Apple, Linear, and Stripe
- 🎨 **Deep Forest Green Color Scheme**: Professional, trustworthy aesthetic
- 📱 **Fully Responsive**: Desktop-first design with mobile and tablet optimization
- ⚡ **High Performance**: Optimized for Lighthouse scores, lazy loading, semantic HTML
- 🎬 **Smooth Animations**: Subtle Framer Motion animations throughout
- 🔍 **SEO Optimized**: Schema markup, sitemap, robots.txt, Open Graph tags
- 📝 **Netlify Forms**: Contact form with validation and spam protection
- 💳 **Stripe Integration**: Pre-configured checkout links for pricing plans
- 📅 **Calendly Embedding**: Integrated consultation booking
- 🖼️ **Image Comparison Slider**: Before/after comparison with touch/drag support
- 📊 **Google Analytics**: Pre-configured with tracking ID G-3SD2928MVG
- ♿ **Accessibility**: WCAG compliant, semantic HTML, focus states
- 🚀 **Static Deployment**: Optimized for Netlify static deployment

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animations
- **Lucide Icons** - Icon library
- **Netlify Forms** - Form handling
- **Google Analytics** - Analytics tracking

## Getting Started

### Prerequisites

- Node.js 18+ or higher
- npm or yarn
- Git

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/SLOWEBDESIGN/Main.git
cd slo-web-design
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file based on `.env.local.example`:

```bash
cp .env.local.example .env.local
```

Then update the values in `.env.local` with your configuration:

```env
NEXT_PUBLIC_GA_ID=G-3SD2928MVG
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/contact-slowebdesign/30min
NEXT_PUBLIC_STRIPE_ESSENTIAL_LINK=https://buy.stripe.com/aFa3cvckDftkbPbeSGfMA00
NEXT_PUBLIC_STRIPE_GROWTH_LINK=https://buy.stripe.com/bJe00jgAT0yq2eBcKyfMA01
NEXT_PUBLIC_STRIPE_PRIORITY_LINK=https://buy.stripe.com/8x26oHbgz1Cu7yVbGufMA02
```

4. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the site.

## Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
slo-web-design/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── Services.tsx
│   │   ├── ImageComparison.tsx
│   │   ├── Pricing.tsx
│   │   ├── MaintenancePlans.tsx
│   │   ├── Process.tsx
│   │   ├── Testimonials.tsx
│   │   ├── ContactForm.tsx
│   │   ├── Calendly.tsx
│   │   └── Footer.tsx
│   ├── data/                # Editable data files
│   │   └── testimonials.ts  # Client testimonials
│   ├── lib/                 # Utility functions
│   │   ├── analytics.ts     # Google Analytics
│   │   └── schema.ts        # JSON-LD schemas
│   ├── pages/               # Next.js pages
│   │   ├── _app.tsx         # App wrapper
│   │   ├── _document.tsx    # Document wrapper
│   │   ├── index.tsx        # Home page
│   │   ├── robots.tsx       # robots.txt
│   │   └── sitemap.xml.ts   # sitemap.xml
│   └── styles/
│       └── globals.css      # Global styles
├── public/                  # Static assets
│   ├── comparison/          # Before/after images
│   │   ├── before.png
│   │   └── after.png
│   └── site.webmanifest
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
└── netlify.toml
```

## Customization

### Replacing the Logo

The logo is a text-based SVG styled with CSS. To change it:

Edit `src/components/Header.tsx` and the `styles/globals.css` `.logo` class:

```css
.logo {
  font-family: Georgia, serif;
  font-size: 1.5rem;
  font-weight: 600;
  font-style: italic;
  color: rgb(61, 94, 63);
  letter-spacing: -0.5px;
}
```

### Updating Colors

Colors are defined in `tailwind.config.ts`:

- **Primary**: `primary-500` = `#3d5e3f` (Deep Forest Green)
- **Secondary**: `secondary-100` = `#f5f5f0` (Cream/Off-white)
- **Accent**: `accent-slate` = `#64748b` (Muted Charcoal)

### Replacing Comparison Images

Replace the images in the `/public/comparison/` folder:

1. Remove `before.png` and `after.png`
2. Add new comparison images with the same names
3. Ensure images are the same dimensions
4. No code changes needed

### Editing Testimonials

Edit `src/data/testimonials.ts` to update client testimonials:

```typescript
export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Client Name',
    business: 'Business Name',
    text: 'Testimonial text...',
  },
  // ... add more testimonials
];
```

### Updating Business Information

Update contact details in:

- `src/components/Header.tsx` - Phone number
- `src/components/Hero.tsx` - Location
- `src/components/Calendly.tsx` - Phone/email
- `src/components/Footer.tsx` - Contact info

## Netlify Forms Setup

The contact form uses Netlify Forms. To enable it:

1. Deploy to Netlify (see deployment section)
2. Netlify will automatically detect the form
3. Go to your Netlify site dashboard → Forms to view submissions
4. Set up form notifications in Settings → Forms

Form name is `contact` and is automatically handled.

## Calendly Setup

The site uses Calendly for booking consultations. The embed is configured in `src/components/Calendly.tsx`:

To update:

1. Go to your Calendly account
2. Create a 30-minute meeting type
3. Get your Calendly URL (format: `https://calendly.com/username/meeting-type`)
4. Update the URL in `src/components/Calendly.tsx` and `.env.local`

Current setup includes Google Meet integration.

## Stripe Checkout Links

Maintenance plan buttons link directly to Stripe. The links are configured in `src/components/MaintenancePlans.tsx`.

To update pricing:

1. Create or update subscription products in your Stripe account
2. Generate checkout links
3. Replace the links in:
   - `src/components/MaintenancePlans.tsx`
   - `.env.local`

## Google Analytics Setup

Google Analytics is pre-configured with tracking ID `G-3SD2928MVG`.

To update:

1. Replace the tracking ID in `.env.local`:
   ```
   NEXT_PUBLIC_GA_ID=G-YOUR-ID
   ```
2. Ensure the environment variable is loaded

## SEO Configuration

### Sitemap

- Automatically generated at `/sitemap.xml`
- Includes all main sections
- Updates on each deployment

### Robots.txt

- Automatically generated at `/robots.txt`
- Allows all crawlers
- Points to sitemap

### Schema Markup

- **Local Business Schema**: Business information for search engines
- **Organization Schema**: Company structure
- **Website Schema**: Site-wide metadata

Edit schemas in `src/lib/schema.ts`.

### Meta Tags

Edit `src/pages/index.tsx` to update:

- Page title
- Meta description
- Open Graph tags
- Twitter Card tags
- Canonical URL

## Deployment to Netlify

### Option 1: Direct Integration

1. Push code to GitHub
2. Login to [Netlify](https://netlify.com)
3. Click "New site from Git"
4. Select your GitHub repository
5. Build command: `npm run build`
6. Publish directory: `.next`
7. Set environment variables in Netlify dashboard
8. Deploy!

### Option 2: Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init
npm run build
netlify deploy --prod
```

### Environment Variables in Netlify

In your Netlify site dashboard:

1. Go to Site Settings → Build & Deploy → Environment
2. Add these variables:
   - `NEXT_PUBLIC_GA_ID`: G-3SD2928MVG
   - `NEXT_PUBLIC_CALENDLY_URL`: https://calendly.com/contact-slowebdesign/30min
   - `NEXT_PUBLIC_STRIPE_ESSENTIAL_LINK`: (your link)
   - `NEXT_PUBLIC_STRIPE_GROWTH_LINK`: (your link)
   - `NEXT_PUBLIC_STRIPE_PRIORITY_LINK`: (your link)

### Continuous Deployment

Push to `main` branch to auto-deploy via GitHub Actions workflow (configured in `.github/workflows/deploy.yml`).

## Performance Optimization

### Current Optimizations

- ✅ Image lazy loading
- ✅ Semantic HTML
- ✅ CSS minification
- ✅ JavaScript code splitting
- ✅ Lighthouse optimization
- ✅ Mobile-first responsive design
- ✅ Minimal animations for performance

### Lighthouse Targets

- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 95+

### Further Optimization

1. Compress images with TinyPNG or similar
2. Use WebP format for images
3. Implement image CDN (Netlify has built-in)
4. Monitor Core Web Vitals

## Accessibility

The site meets WCAG 2.1 Level AA standards:

- ✅ Semantic HTML structure
- ✅ Proper heading hierarchy
- ✅ Alt text on images
- ✅ Keyboard navigation support
- ✅ Focus visible states
- ✅ Form labels and validation
- ✅ Color contrast ratios
- ✅ Reduced motion support

## Maintenance

### Regular Tasks

1. **Update Testimonials**: Edit `src/data/testimonials.ts`
2. **Update Pricing**: Edit `src/components/Pricing.tsx` and `MaintenancePlans.tsx`
3. **Check Analytics**: Monitor Google Analytics dashboard
4. **Review Netlify Forms**: Check form submissions regularly
5. **Update Dependencies**: `npm update` and test thoroughly

### Dependencies

To update all dependencies:

```bash
npm update
npm run build
npm run type-check
```

## Security Headers

The site includes security headers configured in `netlify.toml`:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest 2 versions)
- iOS Safari
- Chrome Android

## License

This project is private. All rights reserved.

## Support

For issues or questions:

- **Email**: contact@slowebdesign.com
- **Phone**: 530-215-5987
- **GitHub**: https://github.com/SLOWEBDESIGN

## Quick Reference

| Task | Command |
|------|---------|
| Start development | `npm run dev` |
| Build for production | `npm run build` |
| Run production build | `npm start` |
| Type check | `npm run type-check` |
| Lint code | `npm run lint` |
| Deploy to Netlify | Push to `main` branch |

---

**SLO Web Design** | San Luis Obispo, California | Premium Web Design Agency
