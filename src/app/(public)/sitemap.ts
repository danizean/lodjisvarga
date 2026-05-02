import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants/site";
import { createStaticClient } from "@/lib/supabase/static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createStaticClient();
  const { data: villas, error } = await supabase
    .from("villas")
    .select("slug")
    .in("status", ["active", "coming_soon"]);

  if (error) {
    console.error("Sitemap villas query error:", error.message);
  }

  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/villas`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];

  const villaRoutes: MetadataRoute.Sitemap = (villas ?? []).map((villa) => ({
    url: `${SITE_URL}/villas/${villa.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [...staticRoutes, ...villaRoutes];
}

