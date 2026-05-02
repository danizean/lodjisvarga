"use client";

import { use, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Save, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { saveVillaAmenities } from "@/lib/actions/villas";
import { AmenitiesSelect } from "@/components/admin/AmenitiesSelect";

export default function VillaAmenitiesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [initialIds, setInitialIds] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("villa_amenities")
        .select("amenity_id")
        .eq("villa_id", id);

      if (error) {
        toast.error("Gagal memuat fasilitas properti");
        setLoading(false);
        return;
      }

      const ids = (data ?? []).map((item) => item.amenity_id);
      setSelectedIds(ids);
      setInitialIds(ids);
      setLoading(false);
    }
    load();
  }, [id]);

  const hasChanges = JSON.stringify(selectedIds.sort()) !== JSON.stringify(initialIds.sort());

  const handleSave = () => {
    startTransition(async () => {
      const res = await saveVillaAmenities(id, selectedIds);
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      
      setInitialIds([...selectedIds]);
      toast.success("Fasilitas properti berhasil disimpan");
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#3A4A1F]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <div className="rounded-xl bg-[#3A4A1F]/10 p-2 text-[#3A4A1F]">
            <Star className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Property Amenities</h2>
            <p className="text-sm text-slate-500">Pilih fasilitas yang tersedia di seluruh area properti.</p>
          </div>
        </div>

        <div className="max-w-2xl">
          <AmenitiesSelect
            selectedIds={selectedIds}
            onChange={setSelectedIds}
            label="Daftar Fasilitas"
          />
        </div>
      </section>

      <div className="flex justify-end pt-4">
        <Button 
          type="button"
          onClick={handleSave}
          disabled={isPending || !hasChanges} 
          className="h-12 px-8 rounded-xl bg-[#3A4A1F] text-white hover:bg-[#2E3C18] font-bold shadow-lg shadow-[#3A4A1F]/20"
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {hasChanges ? "Save Changes" : "Saved"}
        </Button>
      </div>
    </div>
  );
}
