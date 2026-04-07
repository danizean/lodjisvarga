"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { createPromo, updatePromo, deletePromo, togglePromoStatus } from "@/lib/actions/promos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Container } from "@/components/shared/Container";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Loader2, Tag, ToggleLeft, ToggleRight, X } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatIDR } from "@/lib/utils/format";
import { format as formatDate } from "date-fns";

interface Promo {
  id: string;
  title: string;
  description: string | null;
  discount_code: string;
  discount_value: number | null;
  expired_at: string | null;
  image_url: string | null;
  is_active: boolean | null;
  created_at: string | null;
}

const EMPTY_FORM = {
  title: "",
  description: "",
  discount_code: "",
  discount_value: "10",
  expired_at: "",
  image_url: "",
  is_active: true,
};

export default function PromosPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = async () => {
    const supabase = createClient();
    const { data } = await supabase.from("promos").select("*").order("created_at", { ascending: false });
    setPromos(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setDialogOpen(true);
  };

  const openEdit = (p: Promo) => {
    setForm({
      title: p.title,
      description: p.description ?? "",
      discount_code: p.discount_code,
      discount_value: String(p.discount_value ?? 10),
      expired_at: p.expired_at ? p.expired_at.split("T")[0] : "",
      image_url: p.image_url ?? "",
      is_active: p.is_active ?? true,
    });
    setEditId(p.id);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    startTransition(async () => {
      // Kirim payload yang sudah di-type dengan benar — hindari spread ...form yang bisa bawa tipe salah
      const payload = {
        title: form.title,
        description: form.description || null,
        discount_code: form.discount_code.toUpperCase(),
        discount_value: Number(form.discount_value),
        expired_at: form.expired_at || null,
        image_url: form.image_url || null,
        is_active: form.is_active,
      };

      const res = editId
        ? await updatePromo(editId, payload)
        : await createPromo(payload);


      if (res?.error) {
        // Show field-level validation detail if available
        const details = (res as any)?.details;
        if (details) {
          const firstField = Object.keys(details)[0];
          const firstMsg = details[firstField]?.[0];
          toast.error(`${res.error}: ${firstField} — ${firstMsg}`);
        } else {
          toast.error(res.error);
        }
      } else {
        toast.success(editId ? "Promo diperbarui!" : "Promo berhasil dibuat!");
        setDialogOpen(false);
        load();
      }

    });
  };

  const handleToggle = (id: string, current: boolean | null) => {
    startTransition(async () => {
      const res = await togglePromoStatus(id, !current);
      if (res?.error) toast.error(res.error);
      else {
        toast.success(`Promo ${!current ? "diaktifkan" : "dinonaktifkan"}`);
        setPromos(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p));
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deletePromo(id);
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Promo dihapus");
        setPromos(prev => prev.filter(p => p.id !== id));
      }
    });
  };

  return (
    <Container className="py-8 bg-[#F7F6F2] min-h-screen space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="bg-amber-100 p-3 rounded-xl">
            <Tag className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Manajemen Promo</h1>
            <p className="text-sm text-slate-400">Kelola kode diskon dan promosi aktif</p>
          </div>
        </div>
        <Button onClick={openCreate} className="bg-[#3A4A1F] hover:bg-[#2A3A1F] text-white rounded-xl font-bold">
          <Plus className="w-4 h-4 mr-2" /> Buat Promo
        </Button>
      </div>

      {/* Promo grid */}
      {loading ? (
        <div className="flex justify-center pt-12"><Loader2 className="w-8 h-8 animate-spin text-[#3A4A1F]" /></div>
      ) : promos.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center">
          <Tag className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="font-bold text-slate-600">Belum ada promo</p>
          <Button onClick={openCreate} className="mt-4 bg-[#3A4A1F] text-white rounded-xl font-bold text-sm">
            <Plus className="w-4 h-4 mr-2" /> Buat Promo Pertama
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {promos.map(promo => (
            <div key={promo.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
              {promo.image_url && (
                <img src={promo.image_url} alt={promo.title} className="w-full h-32 object-cover" />
              )}
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-slate-900 leading-tight">{promo.title}</h3>
                  <StatusBadge status={String(promo.is_active)} variant="promo" />
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-[#3A4A1F] bg-[#3A4A1F]/10 px-3 py-1 rounded-lg">
                    {promo.discount_code}
                  </span>
                  <span className="text-sm font-bold text-slate-700">{promo.discount_value}% OFF</span>
                </div>

                {promo.description && (
                  <p className="text-xs text-slate-500 line-clamp-2">{promo.description}</p>
                )}

                {promo.expired_at && (
                  <p className="text-[10px] text-slate-400">
                    Berlaku hingga: {formatDate(new Date(promo.expired_at), "dd MMM yyyy")}
                  </p>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleToggle(promo.id, promo.is_active)}
                    disabled={isPending}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                      promo.is_active ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100" : "text-slate-500 bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    {promo.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    {promo.is_active ? "Aktif" : "Nonaktif"}
                  </button>
                  <button type="button" onClick={() => openEdit(promo)} className="text-xs font-bold px-3 py-1.5 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">
                    <Edit2 className="w-3 h-3 inline mr-1" /> Edit
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button type="button" className="text-xs font-bold px-3 py-1.5 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors ml-auto">
                        <Trash2 className="w-3 h-3 inline" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Promo?</AlertDialogTitle>
                        <AlertDialogDescription>Promo "{promo.title}" akan dihapus permanen dan tidak bisa dikembalikan.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(promo.id)} className="bg-red-600 hover:bg-red-700">Hapus</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-black">{editId ? "Edit Promo" : "Buat Promo Baru"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Judul Promo *</label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Promo Lebaran 2025" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Kode Diskon *</label>
                <Input value={form.discount_code} onChange={e => setForm(f => ({ ...f, discount_code: e.target.value.toUpperCase() }))} placeholder="LEBARAN25" className="font-mono font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Nilai Diskon (%)*</label>
                <Input type="number" min={1} max={100} value={form.discount_value} onChange={e => setForm(f => ({ ...f, discount_value: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Deskripsi</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Deskripsi singkat promo..." />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Berlaku Hingga</label>
                <Input type="date" value={form.expired_at} onChange={e => setForm(f => ({ ...f, expired_at: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                <select value={form.is_active ? "true" : "false"} onChange={e => setForm(f => ({ ...f, is_active: e.target.value === "true" }))} className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="true">✅ Aktif</option>
                  <option value="false">🔴 Nonaktif</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">URL Thumbnail</label>
              <Input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://..." className="text-xs" />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">Batal</Button>
              <Button onClick={handleSubmit} disabled={isPending} className="flex-1 bg-[#3A4A1F] hover:bg-[#2A3A1F] text-white font-bold">
                {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editId ? "Simpan Perubahan" : "Buat Promo"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Container>
  );
}
