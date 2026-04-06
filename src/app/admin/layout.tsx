import { redirect } from "next/navigation";
// import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // const supabase = await createClient();
  // const { data: { session } } = await supabase.auth.getSession();
  // if (!session) redirect("/admin/login");

  return (
    <div className="flex h-screen">
      {/* TODO: Sidebar navigation */}
      <aside className="w-64 border-r" />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
