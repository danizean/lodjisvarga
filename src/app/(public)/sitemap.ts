import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // TODO: fetch villas and blog posts from Supabase and add their slugs
  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/villas`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  ];
}
