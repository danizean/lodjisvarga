"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// ─── Schema Validation ────────────────────────────────────────────────────────
const promoSchema = z.object({
  title: z.string().min(3, "Judul promo minimal 3 karakter"),
  description: z.string().optional().nullable(),
  discount_code: z.string().min(3, "Kode diskon minimal 3 karakter"),
  discount_value: z.coerce.number().min(1, "Nilai diskon minimal 1").max(100),
  // Accept null/undefined/empty string for optional fields
  expired_at: z.string().nullable().optional(),
  image_url: z
    .string()
    .nullable()
    .optional()
    .refine(
      (v) => !v || v === "" || v.startsWith("http"),
      { message: "URL gambar harus diawali dengan http/https" }
    ),
  is_active: z.boolean().default(true),
});

// ─── Helper: Gunakan is_admin() DB function (hindari circular RLS) ────────────
async function getAdminClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, isAdmin: false };

  // Gunakan DB function is_admin() yang mengevaluasi role via auth.uid()
  const { data: isAdminResult, error } = await supabase.rpc("is_admin");
  const isAdmin = !error && isAdminResult === true;

  return { supabase, user, isAdmin };
}

// ─── Create Promo ─────────────────────────────────────────────────────────────
export async function createPromo(data: unknown) {
  const { supabase, user, isAdmin } = await getAdminClient();
  if (!user || !isAdmin) return { error: "Unauthorized" };

  const parsed = promoSchema.safeParse(data);
  if (!parsed.success)
    return { error: "Validasi gagal", details: parsed.error.flatten().fieldErrors };

  const { data: promo, error } = await supabase.from("promos").insert(parsed.data).select().single();
  if (error) return { error: error.message };

  revalidatePath("/admin/promos");
  revalidatePath("/admin/dashboard");
  return { success: true, data: promo };
}

// ─── Update Promo ─────────────────────────────────────────────────────────────
export async function updatePromo(id: string, data: unknown) {
  const { supabase, user, isAdmin } = await getAdminClient();
  if (!user || !isAdmin) return { error: "Unauthorized" };

  const parsed = promoSchema.partial().safeParse(data);
  if (!parsed.success)
    return { error: "Validasi gagal", details: parsed.error.flatten().fieldErrors };

  const { error } = await supabase.from("promos").update(parsed.data).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/promos");
  return { success: true };
}

// ─── Toggle Promo Active ──────────────────────────────────────────────────────
export async function togglePromoStatus(id: string, isActive: boolean) {
  const { supabase, user, isAdmin } = await getAdminClient();
  if (!user || !isAdmin) return { error: "Unauthorized" };

  const { error } = await supabase.from("promos").update({ is_active: isActive }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/promos");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

// ─── Delete Promo ─────────────────────────────────────────────────────────────
export async function deletePromo(id: string) {
  const { supabase, user, isAdmin } = await getAdminClient();
  if (!user || !isAdmin) return { error: "Unauthorized" };

  const { error } = await supabase.from("promos").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/promos");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

// ─── Get all promos ───────────────────────────────────────────────────────────
export async function getPromos() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("promos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}
