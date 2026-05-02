export const SITE_NAME = "Lodjisvarga";
export const TAGLINE = "Luxury Villa Experience";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lodjisvarga.com";
export const SITE_DESCRIPTION = `${SITE_NAME} - ${TAGLINE}`;
export const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? "6285184779808";

export const NAV_LINKS = [
  { label: "Villas", href: "/villas" },
  { label: "Blog", href: "/blog" },
] as const;
