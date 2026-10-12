export type BrandVariant = 'slowebdesign' | 'sdwebdesign';

// The studio has two public names, but one inbox and one shared application.
export const CONTACT_EMAIL = 'contact@slowebdesign.com';

type HostHeaders = Record<string, string | string[] | undefined>;

const hostname = (host?: string) => (host ?? '')
  .split(',')[0].trim().toLowerCase().replace(/:\d+$/, '').replace(/\.$/, '').replace(/^www\./, '');

export const getBrandVariant = (host?: string): BrandVariant => {
  const value = hostname(host);
  // A loopback-only preview address. Public branding still follows its domain.
  const localSanDiego = process.env.NODE_ENV === 'development' && value === 'sdwebdesign.localhost';
  return value === 'sdwebdesign.tech' || localSanDiego ? 'sdwebdesign' : 'slowebdesign';
};

export const getRequestBrandVariant = (headers: HostHeaders): BrandVariant => {
  const forwarded = headers['x-forwarded-host'];
  const publicHost = hostname(Array.isArray(forwarded) ? forwarded[0] : forwarded);
  // Netlify may pass an internal Host. Only trust a known public forwarded domain.
  if (publicHost === 'sdwebdesign.tech' || publicHost === 'slowebdesign.com') {
    return getBrandVariant(publicHost);
  }
  const host = headers.host;
  return getBrandVariant(Array.isArray(host) ? host[0] : host);
};

export const getBrandCopy = (variant: BrandVariant) => {
  const isSanDiego = variant === 'sdwebdesign';
  return {
    siteName: isSanDiego ? 'San Diego Web Design' : 'SLO Web Design',
    shortName: isSanDiego ? 'SD' : 'SLO',
    contactEmail: CONTACT_EMAIL,
    phone: isSanDiego ? null : '530-215-5987',
    phoneHref: isSanDiego ? null : 'tel:+15302155987',
    logo: isSanDiego ? '/brand/logo-sd.svg' : '/brand/logo-slo.svg',
    favicon: '/brand/studio-mark-v2.svg',
    shareTitle: isSanDiego ? 'San Diego Web Design' : 'SLO Web Design',
    shareDescription: 'Distinctive websites. Reels worth watching. We make the impossible possible.',
    shareImage: isSanDiego ? '/brand/share-sd-v2.jpg' : '/brand/share-slo-v2.jpg',
    city: isSanDiego ? 'San Diego' : 'San Luis Obispo',
    state: 'CA',
    description: isSanDiego
      ? 'Premium web design agency in San Diego. We modernize outdated websites and build custom websites for California businesses.'
      : 'Premium web design agency in San Luis Obispo. We modernize outdated websites and build custom websites for California businesses.',
    heroTitle: isSanDiego
      ? 'Modern Websites for\nSan Diego Businesses'
      : 'Modern Websites for\nSan Luis Obispo Businesses',
    heroText: isSanDiego
      ? 'We modernize outdated websites and build beautiful, high-performing websites from scratch. Local service with personalized attention for San Diego businesses.'
      : 'We modernize outdated websites and build beautiful, high-performing websites from scratch. Local service with personalized attention.',
    locationLine: isSanDiego ? 'San Diego, California' : 'San Luis Obispo, California • 530-215-5987',
    footerCopy: isSanDiego
      ? 'Premium web design agency in San Diego, California.'
      : 'Premium web design agency in San Luis Obispo, California.',
    canonical: isSanDiego ? 'https://sdwebdesign.tech' : 'https://slowebdesign.com',
    ogUrl: isSanDiego ? 'https://sdwebdesign.tech' : 'https://slowebdesign.com',
    keywords: isSanDiego
      ? 'web design, San Diego, website design, website modernization, web development, local business'
      : 'web design, San Luis Obispo, SLO, website design, website modernization, web development, local business',
  };
};

// Keep personal SLO copy intact; SD speaks as the studio on every device and state.
export const getBrandContactCopy = (variant: BrandVariant = 'slowebdesign') => {
  const sd = variant === 'sdwebdesign';
  return {
    next: sd ? 'We read your note and reply by email.' : 'Ben reads your note and replies by email.',
    emailPlaceholder: sd ? 'Where we can reply' : 'Where Ben can reply',
    emailError: sd ? 'Check your email address so we can reply.' : 'Check your email address so Ben can reply.',
    sentPrefix: sd ? 'We will read your note and reply to' : 'Ben will read your note and reply to',
    note: sd ? 'Your note goes directly to our studio. No commitment, no payment.' : 'Your note goes directly to Ben. No commitment, no payment.',
    expired: 'Your one-hour visit has ended. You can use your access code again if you have a visit left. Otherwise, ' + (sd ? 'email us for a new code.' : 'email Ben for a new code.'),
    visitCta: sd ? 'Talk to us' : 'Talk to Ben',
    accessIntro: 'A private, independent concept you can explore. Enter the four-digit access code ' + (sd ? 'we sent you.' : 'Ben sent you.'),
    requestCode: sd ? 'Need an access code? Email us.' : 'Need an access code? Email Ben.',
  };
};

// Local Business Schema Markup
export const generateLocalBusinessSchema = (variant: BrandVariant = 'slowebdesign') => {
  const copy = getBrandCopy(variant);
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: copy.siteName,
    image: `${copy.canonical}${copy.logo}`,
    description: copy.description,
    url: copy.canonical,
    ...(copy.phone ? { telephone: copy.phone } : {}),
    email: CONTACT_EMAIL,
    address: {
      '@type': 'PostalAddress',
      addressLocality: copy.city,
      addressRegion: 'CA',
      addressCountry: 'US',
    },
    areaServed: {
      '@type': 'State',
      name: 'California',
    },
    sameAs: [
      'https://github.com/SLOWEBDESIGN',
    ],
  };
};

// Organization Schema
export const generateOrganizationSchema = (variant: BrandVariant = 'slowebdesign') => {
  const copy = getBrandCopy(variant);
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: copy.siteName,
    url: copy.canonical,
    logo: `${copy.canonical}${copy.logo}`,
    description: `Premium web design agency based in ${copy.city}`,
    sameAs: [
      'https://github.com/SLOWEBDESIGN',
    ],
  };
};

// WebSite Schema
export const generateWebsiteSchema = (variant: BrandVariant = 'slowebdesign') => {
  const copy = getBrandCopy(variant);
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: copy.canonical,
    name: copy.siteName,
    description: `Premium web design agency in ${copy.city}`,
  };
};
