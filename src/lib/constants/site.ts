export const SITE_NAME = "Lodji Svarga Villa";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lodjisvarga.com";
export const SITE_DESCRIPTION = "Experience luxury villa rentals with breathtaking views and world-class amenities.";
export const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? "6281234567890";

export const NAV_LINKS = [
  { label: "Villas", href: "/villas" },
  { label: "Blog", href: "/blog" },
] as const;
