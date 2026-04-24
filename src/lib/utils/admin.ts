import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Json, TablesInsert } from "@/types/database";

export type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export async function getAuthenticatedAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return { supabase, user: null, isAdmin: false };

  const { data: isAdminResult, error: isAdminError } = await supabase.rpc("is_admin");
  if (!isAdminError && isAdminResult === true) {
    return { supabase, user, isAdmin: true };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role?.toLowerCase();
  return { supabase, user, isAdmin: role === "admin" || role === "superadmin" };
}

export async function logAudit(
  supabase: SupabaseServerClient,
  action: string,
  tableName: string,
  recordId: string,
  oldValues: Json | null,
  newValues: Json | null,
  userId: string
) {
  const payload: TablesInsert<"audit_logs"> = {
    action,
    table_name: tableName,
    record_id: recordId,
    old_values: oldValues,
    new_values: newValues,
    user_id: userId,
  };

  await supabase.from("audit_logs").insert(payload);
}

export function revalidateVillaPaths(params: {
  currentSlug?: string | null;
  previousSlug?: string | null;
  includeAdminEditId?: string | null;
}) {
  revalidatePath("/");
  revalidatePath("/admin/villas");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/calendar");

  if (params.includeAdminEditId) {
    revalidatePath(`/admin/villas/${params.includeAdminEditId}/edit`);
  }

  if (params.currentSlug) {
    revalidatePath(`/villas/${params.currentSlug}`);
  }

  if (params.previousSlug && params.previousSlug !== params.currentSlug) {
    revalidatePath(`/villas/${params.previousSlug}`);
  }
}

export function normalizeGalleryItems(
  items: Array<{
    image_url: string;
    is_primary?: boolean | null;
    display_order?: number | null;
  }>
) {
  const seen = new Set<string>();
  const deduped = items
    .filter((item) => {
      const imageUrl = item.image_url?.trim();
      if (!imageUrl || seen.has(imageUrl)) return false;
      seen.add(imageUrl);
      return true;
    })
    .sort((left, right) => (left.display_order ?? 0) - (right.display_order ?? 0))
    .map((item, index) => ({
      image_url: item.image_url.trim(),
      is_primary: Boolean(item.is_primary),
      display_order: index,
    }));

  if (deduped.length > 0 && !deduped.some((item) => item.is_primary)) {
    deduped[0].is_primary = true;
  }

  return deduped;
}
