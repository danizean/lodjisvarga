import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const rawBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const baseUrl =
    rawBaseUrl && !rawBaseUrl.includes("localhost")
      ? rawBaseUrl.replace(/\/$/, "")
      : "https://www.lodjisvarga.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
