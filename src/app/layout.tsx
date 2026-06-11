import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SITE_NAME, SITE_TITLE, SITE_DESCRIPTION, SITE_URL } from "@/lib/constants/site";

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
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: "/logo-lodjisvarga.png",
        width: 1200,
        height: 630,
        alt: "Lodjisvarga - Villa Premium dan Estetik di Yogyakarta",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/logo-lodjisvarga.png"],
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  name: SITE_NAME,
  image: `${SITE_URL}/logo-lodjisvarga.png`,
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" data-scroll-behavior="smooth" className="relative" suppressHydrationWarning>
      <body className={`${font.variable} font-sans min-h-screen flex flex-col antialiased bg-background text-foreground`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
