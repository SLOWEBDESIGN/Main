import React from 'react';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import AtelierHome from '@/src/components/atelier/AtelierHome';
import { studioSchema } from '@/src/lib/studioContent';
import {
  getBrandCopy,
  getRequestBrandVariant,
  type BrandVariant,
} from '@/src/lib/schema';

export const getServerSideProps: GetServerSideProps<{ variant: BrandVariant }> = async ({ req }) => {
  return { props: { variant: getRequestBrandVariant(req.headers) } };
};

export default function Home({ variant }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const copy = getBrandCopy(variant);

  return (
    <>
      <Head>
        <title>{copy.siteName + ' | Independent web design in ' + copy.city}</title>
        <meta
          name="description"
          content={copy.description + ' Local, professional, responsive design.'}
        />
        <meta
          name="keywords"
          content={copy.keywords}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#26323f" />
        <link rel="alternate" type="text/markdown" href="/llms-full.txt" title="Plain-text studio information" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(studioSchema(variant)).replace(/</g, '\\u003c') }} />

        <meta property="og:title" content={copy.shareTitle} />
        <meta property="og:description" content={copy.shareDescription} />
        <meta property="og:site_name" content={copy.siteName} />
        <meta property="og:image" content={copy.canonical + copy.shareImage} />
        <meta property="og:image:secure_url" content={copy.canonical + copy.shareImage} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={`${copy.siteName}: We make the impossible possible, with an architectural staircase in a white constellation sky.`} />
        <meta property="og:url" content={copy.ogUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={copy.shareTitle} />
        <meta name="twitter:description" content={copy.shareDescription} />
        <meta name="twitter:image" content={copy.canonical + copy.shareImage} />
        <meta name="twitter:image:alt" content={`${copy.siteName}: We make the impossible possible.`} />
        <link rel="canonical" href={copy.canonical} />
      </Head>
      <AtelierHome variant={variant} />
    </>
  );
}
