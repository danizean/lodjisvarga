export const SITE_NAME = "Lodjisvarga";
export const SITE_TITLE = "Lodjisvarga | Villa Premium & Estetik di Yogyakarta";
export const TAGLINE = "Experience Luxury Villa in Yogyakarta";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lodjisvarga.com";
export const SITE_DESCRIPTION = "Temukan pengalaman menginap tak terlupakan di Lodjisvarga. Nikmati sewa villa mewah eksklusif di Yogyakarta dengan fasilitas premium, desain estetik yang menawan, dan kenyamanan maksimal untuk liburan keluarga atau staycation Anda.";
export const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? "6285184779808";

export const NAV_LINKS = [
  { label: "Villas", href: "/villas" },
  { label: "Blog", href: "/blog" },
] as const;
