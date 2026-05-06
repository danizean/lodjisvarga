import { createClient } from "@/lib/supabase/server";

export async function getPublicPromos() {
  const supabase = await createClient();
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const { data, error } = await supabase
    .from("promos")
    .select(`
      id, title, slug, short_description, description, promo_badge,
      discount_code, discount_type, discount_value, discount_text,
      start_date, expired_at, image_url, banner_image_url
    `)
    .eq("status", "published")
    .or(`start_date.is.null,start_date.lte.${date}`)
    .or(`expired_at.is.null,expired_at.gte.${date}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching public promos:", error);
    return [];
  }

  return data ?? [];
}
