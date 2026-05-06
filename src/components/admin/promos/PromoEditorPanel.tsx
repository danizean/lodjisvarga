"use client";

import { useState, useTransition, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, UploadCloud, X } from "lucide-react";
import { createPromo, updatePromo } from "@/lib/actions/promos";
import { toast } from "sonner";
import { Database } from "@/types/database";
import { useUpload } from "@/hooks/use-upload";

function ImageUploadField({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder: string }) {
  const { uploadFiles, isUploading } = useUpload();
  
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    try {
      const results = await uploadFiles([file], "global", "promo");
      if (results.length > 0) {
        onChange(results[0].publicUrl);
        toast.success("Gambar berhasil diunggah");
      }
    } catch (error) {
      toast.error("Gagal mengunggah gambar");
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-500 uppercase flex justify-between">
        {label}
        {value && (
          <button type="button" onClick={() => onChange("")} className="text-red-500 hover:underline">Hapus</button>
        )}
      </label>
      {value ? (
        <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
          <img src={value} className="w-full h-32 object-cover" alt="Preview" />
        </div>
      ) : (
        <div className="relative flex items-center justify-center h-24 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
          <div className="text-center space-y-1">
            <UploadCloud className="w-6 h-6 text-slate-400 mx-auto" />
            <div className="text-xs text-slate-500 font-semibold">Klik untuk upload gambar</div>
          </div>
          <input 
            type="file" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
            accept="image/*"
            onChange={handleUpload}
            disabled={isUploading}
          />
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80">
              <Loader2 className="w-6 h-6 animate-spin text-[#3A4A1F]" />
            </div>
          )}
        </div>
      )}
      <Input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="bg-slate-50 text-xs" />
    </div>
  );
}

type Promo = Database["public"]["Tables"]["promos"]["Row"] & {
  promo_villas?: { villa_id: string }[];
};

interface PromoEditorPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promo: Promo | null;
  villas: { id: string; name: string }[];
  onSuccess: () => void;
}

export function PromoEditorPanel({ open, onOpenChange, promo, villas, onSuccess }: PromoEditorPanelProps) {
  const [isPending, startTransition] = useTransition();

  const defaultForm = {
    title: "",
    slug: "",
    short_description: "",
    description: "",
    promo_badge: "",
    discount_code: "",
    discount_type: "percentage",
    discount_value: "10",
    discount_text: "",
    start_date: "",
    expired_at: "",
    image_url: "",
    banner_image_url: "",
    status: "draft",
    associated_villa_ids: [] as string[],
  };

  const [form, setForm] = useState(defaultForm);

  // When promo changes, update form state
  // We use key prop on Sheet or useEffect in parent to force re-render, but here we can just use an effect
  // Actually, better to initialize it when opened.
  useEffect(() => {
    if (open) {
      if (promo) {
        setForm({
          title: promo.title,
          slug: promo.slug || "",
          short_description: promo.short_description || "",
          description: promo.description || "",
          promo_badge: promo.promo_badge || "",
          discount_code: promo.discount_code,
          discount_type: promo.discount_type || "percentage",
          discount_value: String(promo.discount_value || ""),
          discount_text: promo.discount_text || "",
          start_date: promo.start_date ? new Date(promo.start_date).toISOString().slice(0, 16) : "",
          expired_at: promo.expired_at ? new Date(promo.expired_at).toISOString().slice(0, 16) : "",
          image_url: promo.image_url || "",
          banner_image_url: promo.banner_image_url || "",
          status: promo.status || "draft",
          associated_villa_ids: promo.promo_villas?.map(pv => pv.villa_id) || [],
        });
      } else {
        setForm(defaultForm);
      }
    }
  }, [open, promo]);

  const handleSubmit = () => {
    startTransition(async () => {
      const payload = {
        title: form.title,
        slug: form.slug || null,
        short_description: form.short_description || null,
        description: form.description || null,
        promo_badge: form.promo_badge || null,
        discount_code: form.discount_code.toUpperCase(),
        discount_type: form.discount_type,
        discount_value: form.discount_value ? Number(form.discount_value) : null,
        discount_text: form.discount_text || null,
        start_date: form.start_date ? new Date(form.start_date).toISOString() : null,
        expired_at: form.expired_at ? new Date(form.expired_at).toISOString() : null,
        image_url: form.image_url || null,
        banner_image_url: form.banner_image_url || null,
        status: form.status as "draft" | "published" | "disabled",
        associated_villa_ids: form.associated_villa_ids,
      };

      const res = promo ? await updatePromo(promo.id, payload) : await createPromo(payload);

      if (res?.error) {
        const details = (res as any)?.details;
        if (details) {
          const firstField = Object.keys(details)[0];
          const firstMsg = details[firstField]?.[0];
          toast.error(`${res.error}: ${firstField} — ${firstMsg}`);
        } else {
          toast.error(res.error);
        }
      } else {
        toast.success(promo ? "Promo diperbarui!" : "Promo berhasil dibuat!");
        onSuccess();
        onOpenChange(false);
      }
    });
  };

  const toggleVilla = (id: string) => {
    setForm(f => ({
      ...f,
      associated_villa_ids: f.associated_villa_ids.includes(id)
        ? f.associated_villa_ids.filter(v => v !== id)
        : [...f.associated_villa_ids, id]
    }));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-[#F7F6F2] p-0 border-l border-slate-200">
        <div className="p-6 bg-white border-b border-slate-100 sticky top-0 z-10">
          <SheetHeader>
            <SheetTitle className="text-xl font-black text-slate-900">
              {promo ? "Edit Promo" : "Buat Promo Baru"}
            </SheetTitle>
            <SheetDescription>
              {promo ? "Ubah detail promo yang sudah ada." : "Tambahkan promo baru untuk menarik pelanggan."}
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="p-6 space-y-8">
          {/* General Info */}
          <section className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Informasi Umum</h3>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Judul Promo *</label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Promo Lebaran 2025" className="bg-slate-50" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Slug</label>
                <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="promo-lebaran-2025" className="bg-slate-50" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Short Description</label>
                <Input value={form.short_description} onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))} placeholder="Diskon 20% khusus member" className="bg-slate-50" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Deskripsi Lengkap</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Syarat dan ketentuan promo..." />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Badge Promo</label>
                <Input value={form.promo_badge} onChange={e => setForm(f => ({ ...f, promo_badge: e.target.value }))} placeholder="Limited Offer" className="bg-slate-50" />
              </div>
            </div>
          </section>

          {/* Configuration */}
          <section className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Konfigurasi Diskon</h3>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Kode Diskon *</label>
                  <Input value={form.discount_code} onChange={e => setForm(f => ({ ...f, discount_code: e.target.value.toUpperCase() }))} placeholder="LEBARAN25" className="font-mono font-bold bg-emerald-50 text-emerald-900 border-emerald-200" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Tipe Diskon *</label>
                  <select value={form.discount_type} onChange={e => setForm(f => ({ ...f, discount_type: e.target.value }))} className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="percentage">Persentase (%)</option>
                    <option value="fixed_amount">Nominal (Rp)</option>
                    <option value="textual">Teks Saja</option>
                  </select>
                </div>
              </div>
              
              {form.discount_type !== "textual" ? (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Nilai Diskon {form.discount_type === "percentage" ? "(%)" : "(Rp)"}
                  </label>
                  <Input type="number" min={0} value={form.discount_value} onChange={e => setForm(f => ({ ...f, discount_value: e.target.value }))} className="bg-slate-50" />
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Teks Promo</label>
                  <Input value={form.discount_text} onChange={e => setForm(f => ({ ...f, discount_text: e.target.value }))} placeholder="e.g. Free Breakfast" className="bg-slate-50" />
                </div>
              )}
            </div>
          </section>

          {/* Scheduling & Status */}
          <section className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Jadwal & Status</h3>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Mulai Berlaku</label>
                  <Input type="datetime-local" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className="bg-slate-50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Kedaluwarsa Pada</label>
                  <Input type="datetime-local" value={form.expired_at} onChange={e => setForm(f => ({ ...f, expired_at: e.target.value }))} className="bg-slate-50" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Status Publikasi</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="draft">📝 Draft</option>
                  <option value="published">✅ Published</option>
                  <option value="disabled">🔴 Disabled</option>
                </select>
              </div>
            </div>
          </section>

          {/* Villa Assignment */}
          <section className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Pilih Villa (Opsional)</h3>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
              <p className="text-xs text-slate-500 mb-3">Jika kosong, promo berlaku untuk semua villa.</p>
              <div className="grid grid-cols-2 gap-2">
                {villas.map(villa => (
                  <label key={villa.id} className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={form.associated_villa_ids.includes(villa.id)}
                      onChange={() => toggleVilla(villa.id)}
                      className="rounded text-[#3A4A1F] focus:ring-[#3A4A1F]"
                    />
                    <span className="text-sm font-semibold text-slate-700">{villa.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* Media */}
          <section className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Media</h3>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-6">
              <ImageUploadField 
                label="Thumbnail Image URL" 
                value={form.image_url} 
                onChange={v => setForm(f => ({ ...f, image_url: v }))} 
                placeholder="https://..." 
              />
              <ImageUploadField 
                label="Banner Image URL" 
                value={form.banner_image_url} 
                onChange={v => setForm(f => ({ ...f, banner_image_url: v }))} 
                placeholder="https://..." 
              />
            </div>
          </section>

        </div>

        <div className="p-6 bg-white border-t border-slate-100 sticky bottom-0 z-10">
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Batal</Button>
            <Button onClick={handleSubmit} disabled={isPending} className="flex-1 bg-[#3A4A1F] hover:bg-[#2A3A1F] text-white font-bold">
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {promo ? "Simpan Perubahan" : "Buat Promo"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
