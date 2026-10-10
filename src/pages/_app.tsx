import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getBrandCopy, getBrandVariant, type BrandVariant } from '@/src/lib/schema';
import * as gtag from '@/src/lib/analytics';
import '@/src/styles/globals.css';
import '@/src/styles/redesign.css';
import '@/src/styles/studio.css';
import '@/src/styles/atelier.css';
import '@/src/styles/atelier-rework.css';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [browserBrand, setBrowserBrand] = useState<BrandVariant | null>(null);

  useEffect(() => {
    if (!pageProps.variant) return;
    // SSR brands the first response. The actual visited URL wins after hydration.
    // Static revision archives have no variant prop and deliberately stay SLO.
    const variant = getBrandVariant(window.location.hostname);
    setBrowserBrand(variant);
    const icon = document.getElementById('studio-favicon');
    icon?.setAttribute('href', getBrandCopy(variant).favicon);
  }, [pageProps.variant]);

  useEffect(() => {
    // Track page views
    const handleRouteChange = (url: string) => {
      gtag.pageview(url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return <Component {...pageProps} {...(pageProps.variant && browserBrand ? { variant: browserBrand } : {})} />;
}
