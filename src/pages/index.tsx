import React from 'react';
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
import {
  generateLocalBusinessSchema,
  generateOrganizationSchema,
  generateWebsiteSchema,
} from '@/src/lib/schema';

export default function Home() {
  const localBusinessSchema = generateLocalBusinessSchema();
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebsiteSchema();

  return (
    <>
      <Head>
        <title>SLO Web Design | Premium Web Design Agency San Luis Obispo</title>
        <meta
          name="description"
          content="Premium web design agency in San Luis Obispo. We modernize outdated websites and build custom websites for California businesses. Local, professional, responsive design."
        />
        <meta
          name="keywords"
          content="web design, San Luis Obispo, SLO, website design, website modernization, web development, local business"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3d5e3f" />

        {/* Open Graph */}
        <meta
          property="og:title"
          content="SLO Web Design | Premium Web Design Agency San Luis Obispo"
        />
        <meta
          property="og:description"
          content="We modernize outdated websites and build beautiful, high-performing websites for San Luis Obispo businesses."
        />
        <meta property="og:url" content="https://slowebdesign.com" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="SLO Web Design | Premium Web Design Agency San Luis Obispo"
        />
        <meta
          name="twitter:description"
          content="We modernize outdated websites and build beautiful, high-performing websites for San Luis Obispo businesses."
        />

        {/* Canonical */}
        <link rel="canonical" href="https://slowebdesign.com" />

        {/* Schema Markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />

        {/* Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Manifest */}
        <link rel="manifest" href="/site.webmanifest" />
      </Head>

      <main>
        <Header />
        <Hero />
        <Services />
        <WebsiteComparison />
        <Pricing />
        <MaintenancePlans />
        <Process />
        <Testimonials />
        <ContactForm />
        <BookingScheduler />
        <Footer />
      </main>
    </>
  );
}
