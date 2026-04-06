import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Villa = Database["public"]["Tables"]["villas"]["Row"];

export async function getVillas(): Promise<Villa[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("villas")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getFeaturedVillas(): Promise<Villa[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("villas")
    .select("*")
    .eq("status", "active")
    .limit(6);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getVillaBySlug(slug: string): Promise<Villa | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("villas")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data;
}
