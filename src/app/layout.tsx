import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { GoogleAnalytics } from "@/components/google-analytics";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const siteUrl = "https://slowebdesign.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SLO Web Design | Premium Website Design in San Luis Obispo",
    template: "%s | SLO Web Design",
  },
  description:
    "SLO Web Design creates modern, high-performing websites for California businesses. Local website modernization, custom design, and ongoing support in San Luis Obispo.",
  keywords: [
    "San Luis Obispo web design",
    "SLO web designer",
    "California web design agency",
    "website modernization",
    "local business website design",
    "website maintenance",
  ],
  authors: [{ name: "SLO Web Design", url: siteUrl }],
  creator: "SLO Web Design",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "SLO Web Design",
    title: "SLO Web Design | Modern Websites for California Businesses",
    description:
      "Premium website modernization and custom web design with personal, local service in San Luis Obispo.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SLO Web Design | Modern Websites for California Businesses",
    description:
      "Premium website modernization and custom web design with personal, local service in San Luis Obispo.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${cormorant.variable}`}>
      <body>
        {children}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
