import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ConditionalFooter } from "@/components/ConditionalFooter";
import { JsonLd } from "@/components/JsonLd";
import {
  DEFAULT_OG_IMAGE_PATH,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  getSiteUrl,
} from "@/lib/site-config";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [...SITE_KEYWORDS],
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: siteUrl,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: "Sportchain Padel — ranking y torneos de pádel (eventos Sportchain)",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE_PATH],
  },
  category: "sports",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9fafb" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  url: siteUrl,
  inLanguage: "es",
  about: {
    "@type": "Thing",
    name: "Pádel",
    description: "Deporte de raqueta, torneos y ranking competitivo con sistema ELO (eventos Sportchain).",
  },
  publisher: {
    "@type": "Organization",
    name: "Sportchain",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <JsonLd data={websiteJsonLd} />
        <div className="flex min-h-full flex-1 flex-col">{children}</div>
        <ConditionalFooter />
      </body>
    </html>
  );
}
