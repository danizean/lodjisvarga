import type { Metadata } from "next";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { SITE_URL } from "@/lib/constants/site";

export const metadata: Metadata = {
  title: {
    template: "%s | Lodjisvarga",
    default: "Penginapan Villa Yogyakarta & Private Pool Jogja | Lodjisvarga",
  },
  description:
    "Lodjisvarga Villa Jogja menawarkan penginapan villa private pool di lokasi strategis Sleman dan Seturan. Cocok untuk staycation keluarga, rombongan, dan liburan nyaman di Yogyakarta.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Lodjisvarga Villa Jogja – Villa Private Pool Jagonya Nyaman",
    description:
      "Nikmati staycation nyaman di villa private pool Lodjisvarga, berlokasi strategis di Sleman dan Seturan, Yogyakarta.",
    url: "/",
    siteName: "Lodjisvarga Villa",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/images/og-lodjisvarga.jpg",
        width: 1200,
        height: 630,
        alt: "Lodjisvarga Villa Jogja private pool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lodjisvarga Villa Jogja – Villa Private Pool Jagonya Nyaman",
    description:
      "Villa private pool nyaman di Jogja untuk staycation keluarga dan rombongan.",
    images: ["/images/og-lodjisvarga.jpg"],
  },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lodgingBusinessLd = {
    "@context": "https://schema.org",
    "@type": ["LodgingBusiness", "LocalBusiness", "Hotel"],
    "@id": `${SITE_URL}/#lodgingbusiness`,
    name: "Lodjisvarga Villa",
    url: SITE_URL,
    logo: `${SITE_URL}/logo-lodji.png`,
    image: [
      `${SITE_URL}/images/og-lodjisvarga.jpg`,
      `${SITE_URL}/images/villa-private-pool-jogja.jpg`,
    ],
    description:
      "Lodjisvarga Villa adalah penginapan villa private pool di Jogja yang cocok untuk staycation keluarga, rombongan, dan liburan nyaman di Yogyakarta.",
    slogan: "Jagonya Nyaman Villa di Jogja",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "24",
    },
    priceRange: "Rp",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Sleman",
      addressRegion: "Daerah Istimewa Yogyakarta",
      addressCountry: "ID",
    },
    areaServed: [
      {
        "@type": "Place",
        name: "Yogyakarta",
      },
      {
        "@type": "Place",
        name: "Sleman",
      },
      {
        "@type": "Place",
        name: "Seturan",
      },
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["Indonesian", "English"],
    },
    amenityFeature: [
      {
        "@type": "LocationFeatureSpecification",
        name: "Private Pool",
        value: true,
      },
      {
        "@type": "LocationFeatureSpecification",
        name: "WiFi",
        value: true,
      },
      {
        "@type": "LocationFeatureSpecification",
        name: "AC",
        value: true,
      },
      {
        "@type": "LocationFeatureSpecification",
        name: "Smart TV",
        value: true,
      },
    ],
  };

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: "Lodjisvarga Villa",
    description:
      "Website resmi Lodjisvarga Villa Jogja untuk informasi villa private pool, fasilitas, lokasi, dan reservasi.",
    publisher: {
      "@id": `${SITE_URL}/#lodgingbusiness`,
    },
    inLanguage: "id-ID",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(lodgingBusinessLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteLd),
        }}
      />

      <Navbar />

      <main className="min-h-screen">{children}</main>

      <Footer />
    </>
  );
}