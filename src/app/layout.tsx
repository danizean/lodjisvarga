import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/next";
import { GoogleTagManager } from "@next/third-parties/google";
import { AnalyticsTracker } from "@/components/analytics/AnalyticsTracker";
import {
  SITE_NAME,
  SITE_TITLE,
  SITE_DESCRIPTION,
  SITE_URL,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_URL,
} from "@/lib/constants/site";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Lodjisvarga Villa private pool di Yogyakarta",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  name: SITE_NAME,
  image: DEFAULT_OG_IMAGE_URL,
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  telephone: "+6285184779808",
  email: "lodjisvargavilla@gmail.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Sleman",
    addressLocality: "Yogyakarta",
    addressRegion: "DI Yogyakarta",
    addressCountry: "ID",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -7.713442013907945,
    longitude: 110.35711967349991,
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "00:00",
    closes: "23:59",
  },
};

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "GTM-WBRHHGJV";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" data-scroll-behavior="smooth" className="relative" suppressHydrationWarning>
      <GoogleTagManager gtmId={GTM_ID} />
      <body className={`${font.variable} font-sans min-h-screen flex flex-col antialiased bg-background text-foreground`}>
        <AnalyticsTracker />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        {children}
        <Analytics />
        <Toaster />
      </body>
    </html>
  );
}
