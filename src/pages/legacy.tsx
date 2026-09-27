import React from 'react';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { Header } from '@/src/components/Header';
import { Hero } from '@/src/components/Hero';
import { Services } from '@/src/components/Services';
import { WebsiteComparison } from '@/src/components/WebsiteComparison';
import { Pricing } from '@/src/components/Pricing';
import { MaintenancePlans } from '@/src/components/MaintenancePlans';
import { Process } from '@/src/components/Process';
import { Testimonials } from '@/src/components/Testimonials';
import { ContactForm } from '@/src/components/ContactForm';
import { BookingScheduler } from '@/src/components/BookingScheduler';
import { Footer } from '@/src/components/Footer';
import { getBrandCopy, getBrandVariant, type BrandVariant } from '@/src/lib/schema';

export const getServerSideProps: GetServerSideProps<{ variant: BrandVariant }> = async ({ req }) => {
  const host = Array.isArray(req.headers.host) ? req.headers.host[0] : req.headers.host ?? '';
  return { props: { variant: getBrandVariant(host) } };
};

export default function Legacy({ variant }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const copy = getBrandCopy(variant);
  return (
    <>
      <Head>
        <title>{copy.siteName} | Original site</title>
        <meta name="description" content={copy.description} />
        <link rel="canonical" href={`${copy.canonical}/legacy`} />
      </Head>
      <main>
        <Header variant={variant} />
        <Hero variant={variant} />
        <Services />
        <WebsiteComparison />
        <Pricing />
        <MaintenancePlans />
        <Process />
        <Testimonials />
        <ContactForm />
        <BookingScheduler />
        <Footer variant={variant} />
      </main>
    </>
  );
}
