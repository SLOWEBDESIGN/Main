# Deployment Guide

## Quick Start: Deploy to Netlify in 5 Minutes

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Initial commit: SLO Web Design website"
git push origin main
```

### Step 2: Connect to Netlify

1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click "New site from Git"
3. Choose GitHub
4. Select repository: `SLOWEBDESIGN/Main`
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`

### Step 3: Set Environment Variables

In Netlify dashboard:

1. Go to **Site settings → Build & deploy → Environment**
2. Add variables:

```
NEXT_PUBLIC_GA_ID=G-3SD2928MVG
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/contact-slowebdesign/30min
NEXT_PUBLIC_STRIPE_ESSENTIAL_LINK=https://buy.stripe.com/aFa3cvckDftkbPbeSGfMA00
NEXT_PUBLIC_STRIPE_GROWTH_LINK=https://buy.stripe.com/bJe00jgAT0yq2eBcKyfMA01
NEXT_PUBLIC_STRIPE_PRIORITY_LINK=https://buy.stripe.com/8x26oHbgz1Cu7yVbGufMA02
```

### Step 4: Configure Domain

1. Go to **Site settings → Domain management**
2. Click "Add custom domain"
3. Enter: `slowebdesign.com`
4. Update DNS records (Netlify will provide instructions)

### Step 5: Setup Form Notifications

1. Go to **Site settings → Forms**
2. Click "Form notifications"
3. Add email to receive submissions: `contact@slowebdesign.com`
4. Choose notification format

### Step 6: Enable Analytics

1. Go to **Site settings → Analytics**
2. Enable Netlify Analytics (optional, we use Google Analytics)

## Detailed Setup Instructions

### Prerequisites

- GitHub account with SLOWEBDESIGN organization access
- Netlify account
- Domain registered (slowebdesign.com)
- Google Analytics account
- Stripe account (for payment links)
- Calendly account

### Local Development Setup

1. **Clone repository**

```bash
git clone https://github.com/SLOWEBDESIGN/Main.git
cd slo-web-design
```

2. **Install dependencies**

```bash
npm install
```

3. **Create .env.local**

```bash
cp .env.local.example .env.local
```

4. **Run development server**

```bash
npm run dev
```

Visit http://localhost:3000

### Build for Production

```bash
# Build the site
npm run build

# Test production build locally
npm start

# Type check
npm run type-check

# Lint
npm run lint
```

## Netlify Forms Configuration

### Automatic Detection

Netlify automatically detects forms with the `netlify` attribute:

```jsx
<form name="contact" method="POST" netlify>
  {/* form fields */}
</form>
```

### Form Submission Handling

After deployment:

1. Forms are automatically available at `https://yoursite.com/forms/contact`
2. Submissions appear in **Site settings → Forms**
3. Set up notifications to receive emails

### Spam Prevention

The form includes:

- CAPTCHA (hidden by default, can be enabled with `netlify-honeypot`)
- Rate limiting via Netlify
- Validation on form fields

To add honeypot field:

```jsx
<input type="hidden" name="bot-field" />
```

## Calendly Integration

### Setup

1. Go to [calendly.com](https://calendly.com) and create an account
2. Create a 30-minute meeting type
3. Enable Google Meet integration
4. Get your Calendly URL: `https://calendly.com/your-username/30min`

### Update in Code

1. Edit `src/components/Calendly.tsx`
2. Replace the `data-url` in the embed:

```jsx
<div
  className="calendly-inline-widget"
  data-url="https://calendly.com/YOUR-URL/30min"
  style={{ minWidth: '320px', height: '700px' }}
/>
```

3. Update `.env.local`:

```
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/YOUR-URL/30min
```

## Stripe Setup

### Create Subscription Products

1. Go to [stripe.com](https://stripe.com) dashboard
2. Create products:
   - Essential Care ($49/month)
   - Growth Care ($99/month)
   - Priority Care ($199/month)

3. Create Checkout Links for each product

### Get Checkout Links

In Stripe dashboard:

1. Go to Products → Select product
2. Scroll to "Checkout link"
3. Click "Create checkout link"
4. Copy the link

### Update in Code

In `src/components/MaintenancePlans.tsx`, update the `stripeLink` for each plan:

```typescript
const plans: MaintenancePlan[] = [
  {
    id: '1',
    stripeLink: 'https://buy.stripe.com/YOUR-LINK-HERE',
    // ...
  },
];
```

Also update `.env.local`:

```
NEXT_PUBLIC_STRIPE_ESSENTIAL_LINK=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_GROWTH_LINK=https://buy.stripe.com/...
NEXT_PUBLIC_STRIPE_PRIORITY_LINK=https://buy.stripe.com/...
```

## Google Analytics Setup

### Current Setup

The site is pre-configured with Google Analytics tracking ID: `G-3SD2928MVG`

### Verify in Console

1. Open DevTools (F12)
2. Go to Console tab
3. Type: `gtag`
4. Should see gtag function

### View Analytics Data

1. Go to [analytics.google.com](https://analytics.google.com)
2. Select "SLO Web Design" property
3. Check Real-time data
4. View reports

### Update Tracking ID

If needed, update in `.env.local`:

```
NEXT_PUBLIC_GA_ID=G-YOUR-NEW-ID
```

## Continuous Deployment

### GitHub Actions Workflow

The site automatically deploys via GitHub Actions when code is pushed to `main` branch.

Workflow file: `.github/workflows/deploy.yml`

### Setup GitHub Actions

1. Go to GitHub repository
2. Go to **Settings → Secrets and variables → Actions**
3. Add secrets:
   - `NETLIFY_AUTH_TOKEN`: Get from Netlify dashboard → User settings → Auth tokens
   - `NETLIFY_SITE_ID`: Get from Netlify site dashboard → Site settings → General

4. Workflow will automatically run on push

### Manual Deployment

If GitHub Actions isn't set up:

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

## DNS Setup for Custom Domain

### Update Domain DNS Records

1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Update DNS to point to Netlify nameservers:
   - `dns1.p06.nsone.net`
   - `dns2.p06.nsone.net`
   - `dns3.p06.nsone.net`
   - `dns4.p06.nsone.net`

Or add CNAME record:
- Name: `www`
- Value: `slowebdesign.netlify.app`

3. Wait 24-48 hours for DNS propagation

### SSL/TLS Certificate

Netlify automatically provisions an SSL certificate from Let's Encrypt. No action needed.

## Monitoring & Maintenance

### Check Build Status

1. Go to Netlify dashboard
2. Click on site
3. Go to **Deploys** tab
4. View build logs

### View Analytics

1. Google Analytics: https://analytics.google.com
2. Netlify Analytics: Site dashboard → Analytics tab
3. Form submissions: Site dashboard → Forms tab

### Monitor Performance

1. Go to Netlify dashboard
2. Click "Analytics" tab
3. Check:
   - Build time
   - Deploy success rate
   - Requests
   - Bandwidth usage

## Troubleshooting

### Build Fails

Check build logs:

1. Netlify dashboard → Deploys
2. Click failed deploy
3. Scroll to "Deploy log"
4. Look for errors

Common issues:
- Missing environment variables
- TypeScript errors
- Missing dependencies

Solution: Run locally first:

```bash
npm run build
npm run type-check
```

### Form Submissions Not Working

1. Ensure form has `netlify` attribute
2. Deploy to Netlify (not localhost)
3. Wait a few minutes for Netlify to recognize form
4. Check Site settings → Forms

### Calendly Not Displaying

1. Check calendar URL is correct in code
2. Open in incognito mode (clears cache)
3. Check browser console for errors (F12 → Console)

### Images Not Loading

1. Check file paths are correct
2. Ensure images are in `/public` folder
3. Check file names (case-sensitive)

## Performance Optimization

### Image Optimization

1. Compress images before upload
2. Use WebP format when possible
3. Resize images to needed dimensions

Tools:
- TinyPNG: https://tinypng.com
- ImageOptim (Mac): https://imageoptim.com
- Squoosh (online): https://squoosh.app

### Core Web Vitals

Monitor at: https://pagespeed.web.dev

Enter: `slowebdesign.com`

Key metrics:
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1

### Lighthouse Audit

1. Open site in Chrome
2. Press F12 → Lighthouse tab
3. Click "Analyze page load"
4. Review recommendations

## Backup & Recovery

### Backup Code

```bash
# Clone backup to local machine
git clone https://github.com/SLOWEBDESIGN/Main.git SLO-Web-Design-Backup

# Or create backup branch
git checkout -b backup/$(date +%Y%m%d)
git push origin backup/$(date +%Y%m%d)
```

### Rollback Deployment

1. Go to Netlify dashboard
2. Go to Deploys tab
3. Find previous successful deploy
4. Click ... menu
5. Select "Publish deploy"

## Support

For deployment help:

- **Netlify Docs**: https://docs.netlify.com
- **Next.js Docs**: https://nextjs.org/docs
- **Contact**: contact@slowebdesign.com

---

Last updated: 2024
