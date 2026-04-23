"use server";

import { createClient } from "@/lib/supabase/server";

export async function requireAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: isAdminResult, error: isAdminError } = await supabase.rpc("is_admin");
  if (!isAdminError && isAdminResult === true) {
    return { supabase, user };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role?.toLowerCase();
  if (role !== "admin" && role !== "superadmin") {
    throw new Error("Unauthorized");
  }

  return { supabase, user };
}
