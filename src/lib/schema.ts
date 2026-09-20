export type BrandVariant = 'slowebdesign' | 'sdwebdesign';

export const getBrandVariant = (host?: string): BrandVariant => {
  const value = (host ?? '').toLowerCase();
  if (value.includes('sdwebdesign.tech')) return 'sdwebdesign';
  return 'slowebdesign';
};

export const getBrandCopy = (variant: BrandVariant) => {
  const isSanDiego = variant === 'sdwebdesign';
  return {
    siteName: isSanDiego ? 'San Diego Web Design' : 'SLO Web Design',
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
    locationLine: isSanDiego ? 'San Diego, California • 530-215-5987' : 'San Luis Obispo, California • 530-215-5987',
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

// Local Business Schema Markup
export const generateLocalBusinessSchema = (variant: BrandVariant = 'slowebdesign') => {
  const copy = getBrandCopy(variant);
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: copy.siteName,
    image: `${copy.canonical}/logo.png`,
    description: copy.description,
    url: copy.canonical,
    telephone: '530-215-5987',
    email: 'contact@slowebdesign.com',
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
    priceRange: '$$',
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
    logo: `${copy.canonical}/logo.png`,
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
