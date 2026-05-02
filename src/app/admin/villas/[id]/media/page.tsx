"use client";

import { use, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, ImageIcon, Info } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { saveVillaGallery } from "@/lib/actions/villas";
import { GalleryUploader, type GalleryItem } from "@/components/admin/GalleryUploader";

export default function VillaMediaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .eq("villa_id", id)
        .is("room_type_id", null)
        .order("display_order");

      if (error) {
        toast.error("Gagal memuat galeri properti");
        setLoading(false);
        return;
      }

      const items: GalleryItem[] = (data ?? []).map((item) => ({
        id: item.id,
        image_url: item.image_url,
        is_primary: item.is_primary ?? false,
        display_order: item.display_order ?? 0,
      }));
      
      setGallery(items);
      setLoading(false);
    }
    load();
  }, [id]);

  const handleGalleryChange = (newItems: GalleryItem[]) => {
    // Optimistic UI update
    setGallery(newItems);
    
    // Background save to DB
    startTransition(async () => {
      const res = await saveVillaGallery(id, newItems);
      if ("error" in res) {
        toast.error(res.error);
        // Optionally rollback if needed, but keeping it simple for now
      }
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
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 flex gap-3 text-sm text-blue-800">
        <Info className="h-5 w-5 flex-shrink-0 text-blue-500" />
        <p>
          Perubahan pada galeri disimpan secara otomatis. Tambahkan foto, jadikan foto utama, atau hapus foto tanpa perlu menekan tombol simpan.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-[#3A4A1F]/10 p-2 text-[#3A4A1F]">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Property Gallery</h2>
              <p className="text-sm text-slate-500">Kelola foto utama untuk properti ini. Maks 5MB per file.</p>
            </div>
          </div>
          {isPending && !isUploading && (
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Loader2 className="h-3 w-3 animate-spin" />
              Menyimpan urutan...
            </div>
          )}
        </div>

        <GalleryUploader
          villaId={id}
          items={gallery}
          onChange={handleGalleryChange}
          onUploadStatusChange={setIsUploading}
        />
      </section>
    </div>
  );
}
