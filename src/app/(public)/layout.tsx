import type { Metadata } from "next";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { SITE_URL } from "@/lib/constants/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s | Lodjisvarga Villa Jogja",
    default: "Lodjisvarga Villa – Jagonya Nyaman Villa di Jogja",
  },
  description: "Cari penginapan yang Jagonya Nyaman? Lodjisvarga Villa Jogja menawarkan villa private pool mewah di lokasi strategis Sleman dan Seturan. Pilihan terbaik untuk staycation keluarga dan rombongan di Yogyakarta.",
  keywords: [
    "lodjisvarga villa jogja",
    "villa private pool jogja",
    "penginapan private pool jogja",
    "lodjisvarga jagonya nyaman",
    "villa kolam renang pribadi jogja",
    "staycation jogja private pool",
    "villa mewah yogyakarta",
    "penginapan keluarga jogja",
    "sewa villa harian jogja",
    "luxury villa jogja",
    "villa estetik jogja",
    "villa rombongan jogja",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Lodjisvarga Villa Jogja – Jagonya Nyaman",
    description: "Nikmati ketenangan staycation dengan private pool di Sleman dan Seturan. Lodjisvarga, Jagonya Nyaman untuk liburan Anda di Yogyakarta.",
    url: "/",
    siteName: "Lodjisvarga Villa",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lodjisvarga Villa Jogja – Jagonya Nyaman",
    description: "Nikmati ketenangan staycation dengan private pool di Sleman dan Seturan.",
  },
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Lodjisvarga Villa",
    url: SITE_URL,
    logo: `${SITE_URL}/apple-touch-icon.png`,
    description: "Jagonya Nyaman Villa di Jogja",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Yogyakarta",
      addressCountry: "ID"
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["Indonesian", "English"]
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
      />
      <Navbar />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  );
}