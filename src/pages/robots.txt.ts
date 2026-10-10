import type { GetServerSideProps } from 'next';
import { getBrandCopy, getRequestBrandVariant } from '@/src/lib/schema';

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const { canonical } = getBrandCopy(getRequestBrandVariant(req.headers));
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Vary', 'Host, X-Forwarded-Host');
  res.end(`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin\nDisallow: /admin/\n\nSitemap: ${canonical}/sitemap.xml\nHost: ${canonical}\n`);
  return { props: {} };
};

export default function Robots() { return null; }
