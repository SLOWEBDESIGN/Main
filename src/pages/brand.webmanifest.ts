import type { GetServerSideProps } from 'next';
import { getBrandCopy, getRequestBrandVariant } from '@/src/lib/schema';

// One manifest endpoint, resolved from the same hostname as the human website.
export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const copy = getBrandCopy(getRequestBrandVariant(req.headers));
  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.setHeader('Vary', 'Host, X-Forwarded-Host');
  res.end(JSON.stringify({
    id: '/',
    name: copy.siteName,
    short_name: `${copy.shortName} Web Design`,
    description: copy.description,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#343d49',
    theme_color: '#343d49',
    lang: 'en-US',
    icons: [{ src: copy.favicon, sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
  }));
  return { props: {} };
};

export default function BrandManifest() { return null; }
