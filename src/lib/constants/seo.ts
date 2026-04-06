import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from "./site";

export const DEFAULT_SEO = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_URL,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image" as const,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
};
