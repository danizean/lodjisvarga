"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// ─── Schema Validation ────────────────────────────────────────────────────────
const promoSchema = z.object({
  title: z.string().min(3, "Judul promo minimal 3 karakter"),
  slug: z.string().min(3, "Slug minimal 3 karakter").optional().nullable(),
  description: z.string().optional().nullable(),
  short_description: z.string().optional().nullable(),
  promo_badge: z.string().optional().nullable(),
  discount_code: z.string().min(3, "Kode diskon minimal 3 karakter"),
  discount_type: z.enum(["percentage", "fixed_amount", "textual"]).default("percentage"),
  discount_value: z.coerce.number().min(0).optional().nullable(),
  discount_text: z.string().optional().nullable(),
  start_date: z.string().optional().nullable(),
  expired_at: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  banner_image_url: z.string().optional().nullable(),
  status: z.enum(["draft", "published", "disabled"]).default("draft"),
  associated_villa_ids: z.array(z.string()).optional(),
});

// ─── Helper: Gunakan is_admin() DB function ────────────
async function getAdminClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, isAdmin: false };

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

  const { associated_villa_ids, ...promoData } = parsed.data;

  const { data: promo, error } = await supabase
    .from("promos")
    .insert(promoData)
    .select()
    .single();

  if (error) return { error: error.message };

  if (promo && associated_villa_ids && associated_villa_ids.length > 0) {
    const pivotData = associated_villa_ids.map((villa_id) => ({
      promo_id: promo.id,
      villa_id,
    }));
    await supabase.from("promo_villas").insert(pivotData);
  }

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

  const { associated_villa_ids, ...promoData } = parsed.data;

  const { error } = await supabase.from("promos").update(promoData).eq("id", id);
  if (error) return { error: error.message };

  if (associated_villa_ids !== undefined) {
    // Delete old
    await supabase.from("promo_villas").delete().eq("promo_id", id);
    // Insert new
    if (associated_villa_ids.length > 0) {
      const pivotData = associated_villa_ids.map((villa_id) => ({
        promo_id: id,
        villa_id,
      }));
      await supabase.from("promo_villas").insert(pivotData);
    }
  }

  revalidatePath("/admin/promos");
  return { success: true };
}

// ─── Toggle Promo Status ──────────────────────────────────────────────────────
export async function togglePromoStatus(id: string, status: "draft" | "published" | "disabled") {
  const { supabase, user, isAdmin } = await getAdminClient();
  if (!user || !isAdmin) return { error: "Unauthorized" };

  const { error } = await supabase.from("promos").update({ status }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/promos");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

// ─── Delete Promo ─────────────────────────────────────────────────────────────
export async function deletePromo(id: string) {
  const { supabase, user, isAdmin } = await getAdminClient();
  if (!user || !isAdmin) return { error: "Unauthorized" };

  // associated promo_villas should be deleted by ON DELETE CASCADE
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
    .select(`
      *,
      promo_villas(
        villa_id
      )
    `)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}
