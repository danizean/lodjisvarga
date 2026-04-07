"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    let message = error.message;
    if (message.includes("Invalid login credentials")) {
      message = "Invalid email or password.";
    }
    return { error: message };
  }

  revalidatePath("/admin", "layout");
  redirect("/admin/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Logout error", error);
    return { error: error.message };
  }

  revalidatePath("/admin", "layout");
  redirect("/admin/login");
}
