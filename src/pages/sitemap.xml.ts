import type { GetServerSideProps } from 'next';
import { getBrandCopy, getRequestBrandVariant } from '@/src/lib/schema';
export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const { canonical } = getBrandCopy(getRequestBrandVariant(req.headers));
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Vary', 'Host, X-Forwarded-Host');
  res.end(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/', '/machine'].map(path => `<url><loc>${canonical}${path}</loc></url>`).join('')}</urlset>`);
  return { props: {} };
};
export default function SiteMap() { return null; }
