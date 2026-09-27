# Customization Guide

## Overview

This guide covers common customizations for the SLO Web Design website.

## Business Information

### Update Contact Details

Edit multiple files with your contact information:

**File: `src/components/Header.tsx`**
```typescript
// Line with phone number in nav
```

**File: `src/components/Hero.tsx`**
```typescript
// San Luis Obispo, California • 530-215-5987
```

**File: `src/components/Calendly.tsx`**
```typescript
// Links with phone and email
```

**File: `src/components/Footer.tsx`**
```typescript
// All contact details
```

**File: `src/pages/index.tsx`**
```typescript
// Email in schema markup
```

### Update Business Hours

Add to `src/components/Footer.tsx`:

```typescript
<div>
  <h4 className="font-semibold text-secondary-50 mb-4">Hours</h4>
  <p className="text-sm text-secondary-200">Monday - Friday: 9am - 5pm</p>
  <p className="text-sm text-secondary-200">Saturday: By appointment</p>
  <p className="text-sm text-secondary-200">Sunday: Closed</p>
</div>
```

## Colors & Design

### Change Primary Color

The primary color is Deep Forest Green: `#3d5e3f`

To change:

1. Edit `tailwind.config.ts`:

```typescript
colors: {
  primary: {
    500: '#YOUR-NEW-COLOR', // Main color
    700: '#DARKER-SHADE',   // Text color
    // ... other shades
  },
}
```

2. Update in `src/styles/globals.css`:

```css
.logo {
  color: #YOUR-NEW-COLOR;
}

.btn-primary {
  background-color: #YOUR-NEW-COLOR;
}
```

### Change Secondary Color

The secondary color is Cream/Off-white: `#f5f5f0`

Update in `tailwind.config.ts`:

```typescript
secondary: {
  100: '#YOUR-NEW-COLOR',
  // ... other shades
}
```

### Change Accent Color

The accent color is Muted Charcoal: `#64748b`

Update in `tailwind.config.ts`:

```typescript
accent: {
  slate: '#YOUR-NEW-COLOR',
  navy: '#YOUR-NAVY-COLOR',
}
```

### Use Dark Mode

Edit `tailwind.config.ts`:

```typescript
const config: Config = {
  darkMode: 'class', // Add this
  // ...
}
```

Then add dark mode styles where needed.

## Logo & Branding

### Update Text Logo

**File: `src/styles/globals.css`**

```css
.logo {
  font-family: Georgia, serif;  /* Change font */
  font-size: 1.5rem;            /* Adjust size */
  font-style: italic;           /* Remove for normal style */
  color: rgb(61, 94, 63);       /* Change color */
  letter-spacing: -0.5px;       /* Adjust spacing */
}
```

### Replace with Image Logo

**File: `src/components/Header.tsx`**

Replace:
```typescript
<div className="logo text-2xl">
  SLO Web Design
</div>
```

With:
```typescript
<Image
  src="/logo.png"
  alt="SLO Web Design"
  width={150}
  height={40}
/>
```

Then add your logo to `/public/logo.png`

### Add Favicon

Place these files in `/public/`:

- `favicon.ico` - 32x32 pixels
- `apple-touch-icon.png` - 180x180 pixels
- `android-chrome-192x192.png` - 192x192 pixels

They're automatically referenced in `src/pages/_document.tsx`.

## Content Updates

### Update Hero Section

**File: `src/components/Hero.tsx`**

```typescript
export const Hero: React.FC = () => {
  return (
    <section className="pt-32 pb-20 px-6 bg-secondary-100">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h1 className="...">
          UPDATE THIS HEADING
        </motion.h1>
        
        <motion.p className="...">
          UPDATE THIS DESCRIPTION
        </motion.p>
        
        {/* Button text can be updated */}
        <button>Schedule Consultation</button>
      </div>
    </section>
  );
};
```

### Update Services

**File: `src/components/Services.tsx`**

```typescript
const services: ServiceCard[] = [
  {
    id: '1',
    icon: <RefreshCw className="w-8 h-8" />,
    title: 'UPDATE TITLE',
    description: 'UPDATE DESCRIPTION',
  },
  // ... add or remove services
];
```

To use different icons from Lucide:

```typescript
import {
  RefreshCw,      // Current
  Code2,          // New
  Settings,       // New
  // Browse all at: https://lucide.dev
} from 'lucide-react';
```

### Update Testimonials

**File: `src/data/testimonials.ts`**

```typescript
export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Client Name',
    business: 'Their Business',
    text: 'What they said about you...',
  },
  // Add more testimonials
];
```

### Update Pricing

**File: `src/components/Pricing.tsx`**

```typescript
const pricingPlans: PricingPlan[] = [
  {
    id: '1',
    title: 'Plan Name',
    price: '$1,500',
    description: 'Plan description',
    features: ['Feature 1', 'Feature 2'],
  },
];
```

### Update Maintenance Plans

**File: `src/components/MaintenancePlans.tsx`**

```typescript
const plans: MaintenancePlan[] = [
  {
    id: '1',
    name: 'Plan Name',
    price: '$49',
    description: '/month',
    features: ['Feature 1', 'Feature 2'],
    stripeLink: 'https://buy.stripe.com/YOUR-LINK',
  },
];
```

### Update Process Steps

**File: `src/components/Process.tsx`**

```typescript
const steps: ProcessStep[] = [
  {
    id: 1,
    icon: <MessageSquare className="w-8 h-8" />,
    title: 'Step Name',
    description: 'Description of step',
  },
  // ... add or remove steps
];
```

## Images & Media

### Replace Comparison Images

1. Delete old images: `/public/comparison/before.png` and `/public/comparison/after.png`
2. Add new images with the same names
3. Ensure images are the same dimensions
4. No code changes needed

Tips:
- Use 1200x800px or similar aspect ratio
- Use high quality images
- Optimize before uploading

### Add Background Images

To add background images to sections:

1. Add image to `/public/images/`
2. Update component:

```typescript
<section
  className="bg-cover bg-center"
  style={{
    backgroundImage: 'url(/images/background.jpg)',
  }}
>
```

### Lazy Load Images

Images are already lazy-loaded, but to add more:

```typescript
<img
  src="/images/image.jpg"
  alt="Description"
  loading="lazy"
/>
```

## SEO & Meta Data

### Update Page Title & Description

**File: `src/pages/index.tsx`**

```typescript
<Head>
  <title>YOUR TITLE - up to 60 characters</title>
  <meta
    name="description"
    content="YOUR DESCRIPTION - up to 160 characters"
  />
  <meta name="keywords" content="keyword1, keyword2, keyword3" />
</Head>
```

### Update Schema Markup

**File: `src/lib/schema.ts`**

```typescript
export const generateLocalBusinessSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'YOUR BUSINESS NAME',
    // ... update fields
  };
};
```

### Add Structured Data

Add JSON-LD schema for:
- Reviews
- FAQs
- Events
- Products

Example:

```typescript
// In src/lib/schema.ts
export const generateFAQSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Question?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Answer',
        },
      },
    ],
  };
};
```

Then add to `src/pages/index.tsx`:

```typescript
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(generateFAQSchema()) }}
/>
```

### Update Open Graph Tags

**File: `src/pages/index.tsx`**

```typescript
<meta property="og:title" content="YOUR TITLE" />
<meta property="og:description" content="YOUR DESCRIPTION" />
<meta property="og:image" content="https://yoursite.com/og-image.jpg" />
<meta property="og:url" content="https://yoursite.com" />
```

## Forms

### Add Form Fields

**File: `src/components/ContactForm.tsx`**

```typescript
// Add to state
const [formData, setFormData] = useState({
  // ... existing fields
  newField: '', // Add new field
});

// Add input in form
<input
  type="text"
  name="newField"
  value={formData.newField}
  onChange={handleChange}
  placeholder="New Field"
/>
```

### Change Form Styling

Update Tailwind classes in form inputs:

```typescript
<input
  className="w-full px-4 py-3 border border-secondary-200 rounded-lg
             bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
/>
```

### Add Custom Form Validation

```typescript
const [errors, setErrors] = useState<Record<string, string>>({});

const validateForm = () => {
  const newErrors: Record<string, string> = {};
  
  if (!formData.name) {
    newErrors.name = 'Name is required';
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  // Submit form
};
```

## Animations

### Adjust Animation Timing

**File: `tailwind.config.ts`**

```typescript
animation: {
  fadeIn: 'fadeIn 0.6s ease-out', // Adjust duration
  slideUp: 'slideUp 0.8s ease-out',
}
```

### Add New Animations

```typescript
keyframes: {
  fadeIn: {
    from: { opacity: '0' },
    to: { opacity: '1' },
  },
  myCustomAnimation: {
    '0%': { transform: 'translateY(20px)' },
    '100%': { transform: 'translateY(0)' },
  },
}
```

### Control Framer Motion Animations

**In any component:**

```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}  // Starting state
  animate={{ opacity: 1, y: 0 }}   // Final state
  transition={{ duration: 0.8, delay: 0.1 }} // Timing
>
  Content
</motion.div>
```

## Responsive Design

### Adjust Breakpoints

Tailwind uses these breakpoints:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

Use in classes:

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  // 1 column on mobile, 2 on tablet, 3 on desktop
</div>
```

### Mobile-First Development

Always design mobile first, then add desktop styles:

```typescript
className="text-sm md:text-base lg:text-lg"
// Small on mobile, larger on tablet, even larger on desktop
```

## Performance

### Code Splitting

Components are automatically code-split. To optimize:

```typescript
// Dynamic import for large components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />,
  ssr: false, // Optional: disable server-side rendering
});
```

### Bundle Analysis

```bash
npm install --save-dev @next/bundle-analyzer

# Add to next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)

# Run
ANALYZE=true npm run build
```

## Accessibility

### Add ARIA Labels

```typescript
<button aria-label="Close menu" onClick={closeMenu}>
  ✕
</button>
```

### Improve Color Contrast

Ensure text has sufficient contrast:

```css
/* WCAG AA requires 4.5:1 for normal text */
/* Check at: https://webaim.org/resources/contrastchecker/
```

### Add Skip Links

```typescript
<a href="#main-content" className="sr-only">
  Skip to main content
</a>
```

## Advanced

### Add a Blog Section

Create `src/components/Blog.tsx`:

```typescript
export const Blog: React.FC = () => {
  return (
    <section id="blog" className="py-20 px-6 bg-secondary-100">
      <div className="max-w-6xl mx-auto">
        <h2>Blog Posts</h2>
        {/* Blog post cards */}
      </div>
    </section>
  );
};
```

Then add to `src/pages/index.tsx`:

```typescript
<Blog />
```

### Add FAQ Section

Create `src/components/FAQ.tsx`:

```typescript
export const FAQ: React.FC = () => {
  const [open, setOpen] = useState<string | null>(null);
  
  return (
    <section id="faq" className="py-20 px-6 bg-white">
      {/* FAQ accordion */}
    </section>
  );
};
```

### Add Newsletter Signup

Create `src/components/Newsletter.tsx`:

```typescript
export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Send to Netlify Forms or email service
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
      />
      <button type="submit">Subscribe</button>
    </form>
  );
};
```

## Need Help?

For more advanced customizations:

- Next.js Docs: https://nextjs.org/docs
- Tailwind Docs: https://tailwindcss.com/docs
- Framer Motion: https://www.framer.com/motion/
- Lucide Icons: https://lucide.dev

---

Last updated: 2024
