# SLO Web Design

Premium single-page agency website for [slowebdesign.com](https://slowebdesign.com).
The site is built with Next.js, TypeScript, Tailwind CSS, Framer Motion, Lucide
icons, Netlify Forms, Stripe Checkout Links, and Calendly. It exports to static
files for fast, low-maintenance Netlify hosting without a database or custom
backend.

## Folder Structure

```text
.
|-- public/
|   `-- comparison/
|       |-- outdated-site.svg
|       |-- modernized-site.svg
|       `-- README.md
|-- src/
|   |-- app/
|   |   |-- icon.svg
|   |   |-- layout.tsx
|   |   |-- page.tsx
|   |   |-- robots.ts
|   |   |-- sitemap.ts
|   |   |-- opengraph-image.tsx
|   |   `-- twitter-image.tsx
|   |-- components/
|   |   |-- calendly-embed.tsx
|   |   |-- comparison-slider.tsx
|   |   |-- contact-form.tsx
|   |   |-- google-analytics.tsx
|   |   |-- motion-reveal.tsx
|   |   |-- section-heading.tsx
|   |   `-- social-image.tsx
|   `-- data/
|       |-- site-data.ts
|       `-- testimonials.ts
|-- .env.example
|-- netlify.toml
|-- next.config.ts
`-- package.json
```

## Local Setup

Requirements: Node.js 24 and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). On PowerShell, use:

```powershell
Copy-Item .env.example .env.local
```

Run the production checks before deploying:

```bash
npm run lint
npm run build
```

`npm run build` writes the deployable static site to `out/`.

## Environment Variables

Google Analytics is loaded only when this public build-time variable exists:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-3SD2928MVG
```

The local `.env.local` file is intentionally ignored by Git. `.env.example`
documents the required value. Add the same variable in Netlify under
**Site configuration > Environment variables** so analytics is included in the
deployed static build.

## Netlify Deployment

1. Import the GitHub repository into Netlify.
2. Confirm the build command is `npm run build`.
3. Confirm the publish directory is `out`.
4. Add `NEXT_PUBLIC_GA_MEASUREMENT_ID` in the Netlify environment variables.
5. Deploy the site.
6. Point `slowebdesign.com` to Netlify using the DNS instructions shown in the
   Netlify domain setup screen.

`netlify.toml` already includes the build settings, Node version, static asset
caching, and baseline security headers.

## Netlify Forms

The quote form is named `project-inquiry`. It uses Netlify Forms markup, a
honeypot field, accessible labels, client-side success and error states, and no
custom backend.

After the first deploy:

1. Open **Forms** in the Netlify dashboard.
2. Confirm `project-inquiry` appears.
3. Submit a real test inquiry from the deployed site.
4. Configure email notifications for `contact@slowebdesign.com`.

Form submission only works after deployment to Netlify. A local static server
cannot emulate Netlify's form endpoint.

## Comparison Images

The comparison slider uses:

```text
public/comparison/outdated-site.svg
public/comparison/modernized-site.svg
```

Replace both files with real before-and-after assets using the same filenames.
The placeholders are both `1600 x 1000`; keep replacement dimensions identical
for the best result. If you prefer PNG, JPG, or WebP, update the two file
extensions in `src/components/comparison-slider.tsx`.

The slider supports mouse, touch, and keyboard input through an accessible
native range control.

## Testimonials

Edit the three placeholder testimonials in:

```text
src/data/testimonials.ts
```

Keep exactly three entries unless the testimonial layout is intentionally
redesigned.

## Calendly Setup

The scheduling embed points to:

```text
https://calendly.com/contact-slowebdesign/30min
```

In Calendly:

1. Open the `30min` event type.
2. Confirm the event is active and publicly bookable.
3. Connect Google Calendar to prevent scheduling conflicts.
4. Set the meeting location to Google Meet.
5. Review availability, buffer time, reminders, and confirmation email copy.

The site loads Calendly's official inline widget script after the page becomes
interactive.

## Stripe Checkout Links

Maintenance checkout buttons use the supplied Stripe Payment Links:

| Plan | Price | Link |
| --- | --- | --- |
| Essential Care | $49/month | `https://buy.stripe.com/aFa3cvckDftkbPbeSGfMA00` |
| Growth Care | $99/month | `https://buy.stripe.com/bJe00jgAT0yq2eBcKyfMA01` |
| Priority Care | $199/month | `https://buy.stripe.com/8x26oHbgz1Cu7yVbGufMA02` |

Before launch, open each link in a private browser window and confirm the plan
name, recurring price, business name, support email, payment methods, tax
behavior, and post-checkout confirmation behavior in Stripe.

## SEO

The site includes:

- San Luis Obispo-focused title, description, keywords, and canonical URL
- Open Graph and Twitter card metadata with generated PNG social images
- `robots.txt` and `sitemap.xml`
- `LocalBusiness` and `ProfessionalService` JSON-LD schema
- Semantic HTML landmarks, headings, accessible labels, and descriptive links

Before launch:

1. Add the deployed site to Google Search Console.
2. Submit `https://slowebdesign.com/sitemap.xml`.
3. Validate the homepage with Google's Rich Results Test.
4. Confirm the social preview after DNS propagation.
5. Replace placeholder testimonials and comparison assets with approved client
   content.

## Main Editing Points

- Page layout and marketing copy: `src/app/page.tsx`
- Services, pricing, maintenance plans, and process: `src/data/site-data.ts`
- Testimonials: `src/data/testimonials.ts`
- Contact fields and submission states: `src/components/contact-form.tsx`
- Brand colors and shared styles: `src/app/globals.css`
- SEO metadata and schema: `src/app/layout.tsx` and `src/app/page.tsx`
