import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export const getAdminDashboardOverview = cache(async () => {
  const supabase = await createClient();

  const [
    activeVillasRes,
    totalVillasRes,
    pendingLeadsRes,
    activePromosRes,
    recentVillasRes,
    promosRes,
  ] = await Promise.all([
    supabase
      .from("villas")
      .select("id", { count: "exact", head: true })
      .or("status.eq.active,status.eq.published,status.eq.Published"),
    supabase.from("villas").select("id", { count: "exact", head: true }),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .or("status.eq.New,status.eq.new"),
    supabase.from("promos").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase
      .from("villas")
      .select("id, name, status, room_types(id)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("promos")
      .select("id, title, discount_code, discount_value, status, discount_type, discount_text")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return {
    stats: {
      activeVillas: activeVillasRes.count ?? 0,
      totalVillas: totalVillasRes.count ?? 0,
      pendingLeads: pendingLeadsRes.count ?? 0,
      activePromos: activePromosRes.count ?? 0,
    },
    recentVillas: recentVillasRes.data ?? [],
    activePromos: promosRes.data ?? [],
  };
});
