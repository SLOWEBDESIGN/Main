# Quick Start Checklist

Before deploying your SLO Web Design website, complete this checklist:

## Pre-Launch Checklist

### 1. Local Setup ✓
- [ ] Cloned repository from GitHub
- [ ] Ran `npm install` successfully
- [ ] Created `.env.local` file
- [ ] Ran `npm run dev` and verified site works
- [ ] No build or TypeScript errors

### 2. Content Updates ✓
- [ ] Updated hero section copy
- [ ] Updated services descriptions (if needed)
- [ ] Added testimonials in `src/data/testimonials.ts`
- [ ] Updated pricing (if different from default)
- [ ] Updated maintenance plans pricing (if needed)
- [ ] Updated business contact information
- [ ] Updated process steps (if needed)

### 3. Images ✓
- [ ] Generated or added comparison images:
  - `public/comparison/before.png` (outdated design)
  - `public/comparison/after.png` (modernized design)
- [ ] Images are same dimensions (1200x800px recommended)
- [ ] Added favicon: `public/favicon.ico` (32x32)
- [ ] Added apple-touch-icon: `public/apple-touch-icon.png` (180x180)
- [ ] Compressed/optimized all images

### 4. External Services Setup ✓

#### Google Analytics
- [ ] Verified tracking ID: G-3SD2928MVG
- [ ] Added to `.env.local`
- [ ] Tested in DevTools (F12 → Console → type `gtag`)

#### Calendly
- [ ] Created Calendly account
- [ ] Set up 30-minute meeting type
- [ ] Enabled Google Meet integration
- [ ] Got your Calendly URL
- [ ] Updated in `src/components/Calendly.tsx`
- [ ] Added to `.env.local`

#### Stripe
- [ ] Created Stripe account
- [ ] Created 3 subscription products:
  - [ ] Essential Care - $49/month
  - [ ] Growth Care - $99/month
  - [ ] Priority Care - $199/month
- [ ] Generated checkout links for each
- [ ] Updated links in `src/components/MaintenancePlans.tsx`
- [ ] Added to `.env.local`

#### Domain
- [ ] Domain registered (slowebdesign.com)
- [ ] DNS accessible
- [ ] DNS configured for Netlify (if using custom domain)

### 5. SEO & Metadata ✓
- [ ] Updated page title in `src/pages/index.tsx`
- [ ] Updated meta description
- [ ] Updated schema markup in `src/lib/schema.ts`
- [ ] Updated Open Graph tags
- [ ] Verified sitemap at `/sitemap.xml`
- [ ] Verified robots.txt at `/robots.txt`

### 6. Code Quality ✓
- [ ] Ran `npm run type-check` - no errors
- [ ] Ran `npm run lint` - no errors
- [ ] Ran `npm run build` - successful build
- [ ] No console warnings or errors

### 7. Netlify Setup ✓

#### Netlify Account
- [ ] Created Netlify account
- [ ] Connected GitHub repository
- [ ] Authorized Netlify to access repository

#### Build Configuration
- [ ] Build command: `npm run build`
- [ ] Publish directory: `.next`

#### Environment Variables
- [ ] Added `NEXT_PUBLIC_GA_ID`
- [ ] Added `NEXT_PUBLIC_CALENDLY_URL`
- [ ] Added `NEXT_PUBLIC_STRIPE_ESSENTIAL_LINK`
- [ ] Added `NEXT_PUBLIC_STRIPE_GROWTH_LINK`
- [ ] Added `NEXT_PUBLIC_STRIPE_PRIORITY_LINK`

#### Domain Configuration
- [ ] Added custom domain: slowebdesign.com
- [ ] Updated DNS records (if needed)
- [ ] SSL certificate provisioned
- [ ] Site accessible at slowebdesign.com

### 8. Forms & Integrations ✓
- [ ] Deployed to Netlify (forms only work on production)
- [ ] Waited 5+ minutes for Netlify to detect form
- [ ] Verified form appears in Netlify dashboard → Forms
- [ ] Set up form notifications to receive emails
- [ ] Tested form submission (if possible)

### 9. Testing ✓

#### Performance
- [ ] Tested on desktop (Chrome, Firefox, Safari)
- [ ] Tested on tablet (iPad, Android tablet)
- [ ] Tested on mobile (iPhone, Android phone)
- [ ] All buttons and links work
- [ ] Forms submit successfully (on production)
- [ ] Image comparison slider works with mouse
- [ ] Image comparison slider works with touch
- [ ] Calendly embed loads and is interactive
- [ ] Stripe links work and open in new tab

#### Lighthouse Audit
- [ ] Run Lighthouse (F12 → Lighthouse → Analyze)
- [ ] Performance: 90+
- [ ] Accessibility: 95+
- [ ] Best Practices: 90+
- [ ] SEO: 95+

#### SEO Testing
- [ ] Verified at https://pagespeed.web.dev
- [ ] Schema markup validated at https://schema.org/validator
- [ ] Meta tags tested at https://www.seobility.net/en/seocheck/

### 10. Backup & Documentation ✓
- [ ] Created git tag for launch: `git tag v1.0.0`
- [ ] Pushed tag to GitHub: `git push origin v1.0.0`
- [ ] Created backup branch: `git checkout -b backup/2024-01-01`
- [ ] Documented any custom changes
- [ ] Printed or saved CUSTOMIZATION_GUIDE.md
- [ ] Printed or saved DEPLOYMENT_GUIDE.md

### 11. Final Launch ✓
- [ ] All checklist items completed
- [ ] Site tested thoroughly
- [ ] Team reviewed site
- [ ] Ready for public launch
- [ ] Announced launch to clients/social media

## Post-Launch Checklist

### Monitor
- [ ] Check Google Analytics for traffic
- [ ] Monitor form submissions in Netlify
- [ ] Check Netlify deployment logs for errors
- [ ] Monitor site performance at pagespeed.web.dev

### Follow-up
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Set up Google Business Profile
- [ ] Share on social media
- [ ] Email announcement to client list

### Maintenance
- [ ] Weekly: Check analytics and form submissions
- [ ] Monthly: Verify all links still work
- [ ] Monthly: Review Lighthouse scores
- [ ] Quarterly: Update testimonials
- [ ] Quarterly: Review and update pricing if needed
- [ ] Annually: Security audit and dependency updates

## Troubleshooting

### Build Fails
- [ ] Check build logs in Netlify dashboard
- [ ] Run `npm run build` locally to debug
- [ ] Look for missing environment variables
- [ ] Check for TypeScript errors: `npm run type-check`

### Forms Not Working
- [ ] Verify site is deployed to Netlify (not localhost)
- [ ] Wait 5+ minutes after first deployment
- [ ] Check form has `name="contact"` and `netlify` attribute
- [ ] Check Netlify Forms settings

### Images Not Displaying
- [ ] Verify image files exist in `/public/` folder
- [ ] Check file names and paths (case-sensitive)
- [ ] Verify file formats are supported (jpg, png, webp)
- [ ] Check file sizes (compress if needed)

### Analytics Not Tracking
- [ ] Verify tracking ID in `.env.local`
- [ ] Check Google Analytics account
- [ ] Open DevTools → Console, type `gtag` to verify function exists
- [ ] Wait 24 hours for data to appear in GA

### Calendly Not Loading
- [ ] Check calendar URL is correct
- [ ] Verify Calendly account is active
- [ ] Test in incognito mode
- [ ] Check browser console (F12) for errors

### Stripe Links Not Working
- [ ] Verify links are correct in code
- [ ] Test links open in new tab
- [ ] Check Stripe account is active
- [ ] Verify payment mode is enabled

## Need Help?

- **Documentation**: See README.md, DEPLOYMENT_GUIDE.md, CUSTOMIZATION_GUIDE.md
- **Next.js Issues**: https://github.com/vercel/next.js/issues
- **Netlify Support**: https://netlify.com/support
- **Stripe Support**: https://stripe.com/support
- **Calendly Help**: https://calendly.com/help

---

**Launch Status**: Ready for deployment! 🚀

Last updated: 2024
