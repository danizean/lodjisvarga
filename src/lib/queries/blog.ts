import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Article = Database["public"]["Tables"]["articles"]["Row"];

export async function getArticles(): Promise<Article[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data;
}
