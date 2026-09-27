# Getting Started Guide

Welcome to SLO Web Design! This guide will help you get up and running quickly.

## Quick Start (5 Minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration (see Environment Variables section below).

### 3. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

### 4. Make Changes

Edit components in `src/components/` and pages in `src/pages/`

Changes auto-reload in browser.

## File Structure Overview

```
slo-web-design/
├── src/
│   ├── components/          # Reusable React components
│   ├── pages/               # Next.js pages & routes
│   ├── styles/              # Global CSS
│   ├── data/                # Editable data files (testimonials, etc)
│   └── lib/                 # Utilities (analytics, schema, etc)
├── public/                  # Static assets
│   ├── comparison/          # Before/after comparison images
│   └── site.webmanifest     # PWA config
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── tailwind.config.ts       # Tailwind CSS config
├── next.config.js           # Next.js config
└── netlify.toml             # Netlify deployment config
```

## Environment Variables

Create `.env.local` with these variables:

```env
# Google Analytics
NEXT_PUBLIC_GA_ID=G-3SD2928MVG

# Calendly Booking
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/contact-slowebdesign/30min

# Stripe Payment Links
NEXT_PUBLIC_STRIPE_ESSENTIAL_LINK=https://buy.stripe.com/aFa3cvckDftkbPbeSGfMA00
NEXT_PUBLIC_STRIPE_GROWTH_LINK=https://buy.stripe.com/bJe00jgAT0yq2eBcKyfMA01
NEXT_PUBLIC_STRIPE_PRIORITY_LINK=https://buy.stripe.com/8x26oHbgz1Cu7yVbGufMA02
```

## Key Features

### Hero Section
- Premium marketing copy
- Two CTA buttons
- Responsive heading
- Location information

**Edit in**: `src/components/Hero.tsx`

### Services
- 6 service cards with icons
- Description for each service
- Lucide icons

**Edit in**: `src/components/Services.tsx`

### Before/After Comparison Slider
- Drag to compare images
- Touch support for mobile
- Professional styling
- No code changes needed to swap images

**Edit in**: `src/components/ImageComparison.tsx`

**Replace images**: 
- `/public/comparison/before.png` (or .jpg)
- `/public/comparison/after.png` (or .jpg)

### Pricing
- 3 project pricing tiers
- Feature list for each
- Explanatory copy

**Edit in**: `src/components/Pricing.tsx`

### Maintenance Plans
- 3 subscription tiers
- Stripe checkout links
- Feature comparisons

**Edit in**: `src/components/MaintenancePlans.tsx`

### Process Timeline
- 6-step process
- Step numbers and icons
- Professional styling

**Edit in**: `src/components/Process.tsx`

### Testimonials
- 3 client testimonials
- Star ratings
- Easy to update

**Edit in**: `src/data/testimonials.ts`

### Contact Form
- 10 fields
- Netlify Forms integration
- Form validation
- Success/error messages

**Edit in**: `src/components/ContactForm.tsx`

**Deploy to enable**: Forms only work on deployed Netlify site

### Calendly Booking
- Embedded calendar widget
- Google Meet integration
- Professional intro text

**Edit in**: `src/components/Calendly.tsx`

### Footer
- Contact information
- Quick links
- Social links
- Copyright year (auto-updates)

**Edit in**: `src/components/Footer.tsx`

## Common Tasks

### Update Business Information

Search and replace in these files:
- `src/components/Header.tsx` - Phone number
- `src/components/Hero.tsx` - Location
- `src/components/Footer.tsx` - All contact info
- `src/pages/index.tsx` - Email in schema
- `src/lib/schema.ts` - Business details

### Change Colors

**File**: `tailwind.config.ts`

```typescript
colors: {
  primary: {
    500: '#3d5e3f',  // Deep forest green - change this
    700: '#2d4630',  // Darker shade
    // ...
  },
}
```

### Update Testimonials

**File**: `src/data/testimonials.ts`

```typescript
export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Your Client Name',
    business: 'Their Business Name',
    text: 'What they said about you...',
  },
  // Add more
];
```

### Replace Comparison Images

1. Delete old images:
   - `/public/comparison/before.png`
   - `/public/comparison/after.png`

2. Add new images with same names

3. Ensure same dimensions (1200x800px recommended)

4. No code changes needed!

### Change Pricing

**File**: `src/components/Pricing.tsx`

```typescript
const pricingPlans: PricingPlan[] = [
  {
    id: '1',
    title: 'Plan Name',
    price: '$1,500',
    features: ['Feature 1', 'Feature 2'],
  },
];
```

### Update Calendly URL

**File**: `src/components/Calendly.tsx`

Find the line with `data-url` and update:

```jsx
data-url="https://calendly.com/your-username/30min"
```

Also update in `.env.local`:

```env
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/your-username/30min
```

### Update Stripe Links

**File**: `src/components/MaintenancePlans.tsx`

```typescript
const plans: MaintenancePlan[] = [
  {
    id: '1',
    stripeLink: 'https://buy.stripe.com/YOUR-LINK-HERE',
  },
];
```

Also update in `.env.local`.

## Building & Deployment

### Build for Production

```bash
npm run build
npm start
```

### Type Check

```bash
npm run type-check
```

### Lint Code

```bash
npm run lint
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy (preview)
netlify deploy

# Deploy to production
netlify deploy --prod
```

## Customization Guides

For detailed customization instructions, see:

1. **CUSTOMIZATION_GUIDE.md** - How to customize designs, colors, content
2. **DEPLOYMENT_GUIDE.md** - How to deploy and configure services
3. **SETUP_CHECKLIST.md** - Pre-launch checklist
4. **SEO_DOCUMENTATION.md** - SEO setup and optimization
5. **ANALYTICS_DOCUMENTATION.md** - Google Analytics setup
6. **NETLIFY_FORMS_DOCUMENTATION.md** - Form configuration

## Documentation Reference

| Document | Purpose |
|----------|---------|
| README.md | Project overview and setup |
| GETTING_STARTED.md | This file - quick start |
| DEPLOYMENT_GUIDE.md | Deploying to Netlify |
| CUSTOMIZATION_GUIDE.md | Changing design and content |
| SETUP_CHECKLIST.md | Pre-launch checklist |
| SEO_DOCUMENTATION.md | SEO setup and optimization |
| ANALYTICS_DOCUMENTATION.md | Google Analytics |
| NETLIFY_FORMS_DOCUMENTATION.md | Contact form setup |

## Technology Stack

- **Next.js 14** - React framework
- **TypeScript** - Type-safe code
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide Icons** - Icons
- **Netlify** - Hosting & forms
- **Google Analytics** - Analytics
- **Calendly** - Booking
- **Stripe** - Payments

## Design System

### Colors

- **Primary**: Deep Forest Green `#3d5e3f`
- **Secondary**: Cream/Off-white `#f5f5f0`
- **Accent**: Muted Charcoal `#64748b`

### Typography

- **Sans Serif**: System fonts (Inter, SF Pro)
- **Serif**: Georgia (for logo and formal text)
- **Sizes**: Responsive scaling
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Spacing

Using Tailwind's default spacing scale (4px base unit).

### Animations

- **Duration**: 0.6-0.8s for most animations
- **Easing**: ease-out for smoothness
- **Respect Motion Preferences**: Auto-reduced for users with reduced motion

## Performance Targets

- **Lighthouse Performance**: 90+
- **Lighthouse Accessibility**: 95+
- **Lighthouse Best Practices**: 95+
- **Lighthouse SEO**: 95+

Check at: https://pagespeed.web.dev

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest 2 versions)
- iOS Safari
- Chrome Android

## Troubleshooting

### npm install fails

```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors

```bash
npm run type-check
```

### Build errors

```bash
npm run build
```

Check output for specific errors.

### Development server won't start

- Kill existing process: `lsof -i :3000` (macOS/Linux)
- Try different port: `npm run dev -- -p 3001`

### Styling not applying

- Clear .next folder: `rm -rf .next`
- Restart dev server
- Rebuild: `npm run build`

## Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind Docs**: https://tailwindcss.com/docs
- **Framer Motion**: https://www.framer.com/motion/
- **Lucide Icons**: https://lucide.dev
- **TypeScript**: https://www.typescriptlang.org/docs

## Getting Help

1. **Check documentation files** (see reference above)
2. **Search GitHub issues**: https://github.com/SLOWEBDESIGN/Main/issues
3. **Visit developer docs** for frameworks/tools
4. **Contact support**: contact@slowebdesign.com

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Setup environment: `cp .env.local.example .env.local`
3. ✅ Run dev server: `npm run dev`
4. ✅ Review CUSTOMIZATION_GUIDE.md
5. ✅ Make your changes
6. ✅ Follow SETUP_CHECKLIST.md before launch
7. ✅ Deploy with DEPLOYMENT_GUIDE.md

---

**Happy building!** 🚀

Last updated: 2024
