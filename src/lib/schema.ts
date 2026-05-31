// Local Business Schema Markup
export const generateLocalBusinessSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'SLO Web Design',
    image: 'https://slowebdesign.com/logo.png',
    description: 'Premium web design agency in San Luis Obispo. We modernize outdated websites and build custom websites from scratch.',
    url: 'https://slowebdesign.com',
    telephone: '530-215-5987',
    email: 'contact@slowebdesign.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'San Luis Obispo',
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
export const generateOrganizationSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SLO Web Design',
    url: 'https://slowebdesign.com',
    logo: 'https://slowebdesign.com/logo.png',
    description: 'Premium web design agency based in San Luis Obispo',
    sameAs: [
      'https://github.com/SLOWEBDESIGN',
    ],
  };
};

// WebSite Schema
export const generateWebsiteSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: 'https://slowebdesign.com',
    name: 'SLO Web Design',
    description: 'Premium web design agency in San Luis Obispo',
  };
};
