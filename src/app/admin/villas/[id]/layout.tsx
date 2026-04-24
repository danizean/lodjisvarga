import { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/shared/Container";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { VillaTabs } from "@/components/admin/villas/VillaTabs";
import { Button } from "@/components/ui/button";

export default async function VillaManagementLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isCreate = id === "new";
  
  let villa = null;
  if (!isCreate) {
    const supabase = await createClient();
    const { data } = await supabase.from("villas").select("id, name, slug, status").eq("id", id).single();
    if (!data) notFound();
    villa = data;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Container className="max-w-[1500px] py-8 pb-28">
        {/* Header Section */}
        <div className="mb-2 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <Link href="/admin/villas">
              <Button variant="outline" size="icon" className="mt-1 size-10 rounded-full border-slate-200 bg-white">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-[#3A4A1F]/10 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-[#3A4A1F]">
                  <Building2 className="h-3.5 w-3.5" /> Property Editor
                </span>
                {!isCreate && <StatusBadge status={villa?.status || "Draft"} variant="villa" />}
              </div>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                {isCreate ? "Create New Property" : villa?.name || "Untitled Property"}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {isCreate ? "Fill in the basic details to create a new listing." : `Manage details, media, and rooms for /${villa?.slug}`}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation (only show if not creating new) */}
        {!isCreate && <VillaTabs villaId={id} />}

        {/* Content Area */}
        <div className={!isCreate ? "mt-6" : "mt-10"}>
          {children}
        </div>
      </Container>
    </div>
  );
}
