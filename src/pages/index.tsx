import React from 'react';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { RedesignHome } from '@/src/components/RedesignHome';
import {
  getBrandCopy,
  getBrandVariant,
  type BrandVariant,
} from '@/src/lib/schema';

export const getServerSideProps: GetServerSideProps<{ variant: BrandVariant }> = async ({ req }) => {
  const host = Array.isArray(req.headers.host) ? req.headers.host[0] : req.headers.host ?? '';
  return { props: { variant: getBrandVariant(host) } };
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
        <meta name="theme-color" content="#3d5e3f" />

        <meta property="og:title" content={copy.siteName + ' | Independent web design in ' + copy.city} />
        <meta property="og:description" content={copy.description} />
        <meta property="og:url" content={copy.ogUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={copy.siteName + ' | Independent web design in ' + copy.city} />
        <meta name="twitter:description" content={copy.description} />
        <link rel="canonical" href={copy.canonical} />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <RedesignHome variant={variant} />
    </>
  );
}
