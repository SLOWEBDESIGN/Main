import React from 'react';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { Header } from '@/src/components/Header';
import { Hero } from '@/src/components/Hero';
import { Services } from '@/src/components/Services';
import { WebsiteComparison } from '@/src/components/WebsiteComparison';
import { Process } from '@/src/components/Process';
import { Footer } from '@/src/components/Footer';
import { getBrandCopy, getRequestBrandVariant, type BrandVariant } from '@/src/lib/schema';

export const getServerSideProps: GetServerSideProps<{ variant: BrandVariant }> = async ({ req }) => {
  return { props: { variant: getRequestBrandVariant(req.headers) } };
};

// `inert` makes the archive view-only: nothing inside can be clicked or focused,
// so its old booking, pricing, and contact links are retired without editing the
// original components. React 18 has no typing for the attribute yet.
const viewOnly = { inert: '' } as Record<string, string>;

/**
 * The original website, kept as a view-only archive for the before-and-after.
 * Pricing, maintenance plans, booking, and the old intake form were retired on
 * purpose; inquiries now go through the application on the current site.
 */
export default function Legacy({ variant }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const copy = getBrandCopy(variant);
  return (
    <>
      <Head>
        <title>{copy.siteName} | Original site (archived)</title>
        <meta name="description" content={copy.description} />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href={`${copy.canonical}/legacy`} />
      </Head>
      <main {...viewOnly}>
        <Header variant={variant} />
        <Hero variant={variant} />
        <Services />
        <WebsiteComparison />
        <Process />
        <Footer variant={variant} />
      </main>
      <aside className="fixed bottom-0 inset-x-0 z-50 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 bg-black px-4 py-3 text-sm text-white">
        <span>This is the original site, archived as it was. It is view-only.</span>
        <a href="/" target="_top" className="text-white underline underline-offset-4">Back to the current site</a>
        <a href="/#queue" target="_top" className="text-white underline underline-offset-4">Apply for a slot</a>
      </aside>
    </>
  );
}
