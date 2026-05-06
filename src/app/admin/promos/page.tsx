"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { getPromos, deletePromo, togglePromoStatus } from "@/lib/actions/promos";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Container } from "@/components/shared/Container";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Loader2, Tag, Percent, Calendar } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format as formatDate } from "date-fns";
import { PromoEditorPanel } from "@/components/admin/promos/PromoEditorPanel";
import { Database } from "@/types/database";

type Promo = Database["public"]["Tables"]["promos"]["Row"] & {
  promo_villas?: { villa_id: string }[];
};

function getEffectiveStatus(promo: Promo) {
  if (promo.status === "disabled") return "disabled";
  if (promo.status === "draft") return "draft";
  
  const now = new Date();
  if (promo.start_date && new Date(promo.start_date) > now) return "scheduled";
  if (promo.expired_at && new Date(promo.expired_at) < now) return "expired";
  
  return "active";
}

export default function PromosPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [villas, setVillas] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [editPromo, setEditPromo] = useState<Promo | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "scheduled" | "expired" | "disabled" | "draft">("all");

  const load = async () => {
    setLoading(true);
    const [fetchedPromos, fetchedVillas] = await Promise.all([
      getPromos(),
      createClient().from("villas").select("id, name").order("name")
    ]);
    setPromos(fetchedPromos as Promo[]);
    setVillas(fetchedVillas.data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditPromo(null);
    setPanelOpen(true);
  };

  const openEdit = (p: Promo) => {
    setEditPromo(p);
    setPanelOpen(true);
  };

  const handleToggle = (id: string, currentStatus: string | null) => {
    startTransition(async () => {
      const newStatus = currentStatus === "published" ? "disabled" : "published";
      const res = await togglePromoStatus(id, newStatus);
      if (res?.error) toast.error(res.error);
      else {
        toast.success(`Promo diperbarui menjadi ${newStatus}`);
        load();
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deletePromo(id);
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Promo dihapus");
        load();
      }
    });
  };

  const filteredPromos = promos.filter(p => {
    if (filter === "all") return true;
    return getEffectiveStatus(p) === filter;
  });

  return (
    <Container className="py-8 bg-[#F7F6F2] min-h-screen space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="bg-amber-100 p-3 rounded-xl">
            <Tag className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Manajemen Promo CMS</h1>
            <p className="text-sm text-slate-400">Kelola diskon, kampanye, dan penawaran khusus</p>
          </div>
        </div>
        <Button onClick={openCreate} className="bg-[#3A4A1F] hover:bg-[#2A3A1F] text-white rounded-xl font-bold shadow-md shadow-[#3A4A1F]/20">
          <Plus className="w-4 h-4 mr-2" /> Buat Promo Baru
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {["all", "active", "scheduled", "draft", "expired", "disabled"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
              filter === f 
                ? "bg-[#3A4A1F] text-white shadow-md shadow-[#3A4A1F]/20" 
                : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {f === "all" ? "Semua Promo" : f}
          </button>
        ))}
      </div>

      {/* Promo grid */}
      {loading ? (
        <div className="flex justify-center pt-12"><Loader2 className="w-8 h-8 animate-spin text-[#3A4A1F]" /></div>
      ) : filteredPromos.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center">
          <Tag className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="font-bold text-slate-600">Tidak ada promo ditemukan</p>
          <p className="text-sm text-slate-400 mt-1">Ganti filter atau buat promo baru.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPromos.map(promo => {
            const effectiveStatus = getEffectiveStatus(promo);
            
            return (
              <div key={promo.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col">
                <div className="relative">
                  {promo.image_url ? (
                    <img src={promo.image_url} alt={promo.title} className="w-full h-36 object-cover" />
                  ) : (
                    <div className="w-full h-36 bg-slate-100 flex items-center justify-center">
                      <Percent className="w-8 h-8 text-slate-300" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={effectiveStatus} variant="promo" />
                  </div>
                  {promo.promo_badge && (
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md shadow-sm">
                      {promo.promo_badge}
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <div className="mb-3">
                    <h3 className="font-bold text-slate-900 leading-tight mb-1">{promo.title}</h3>
                    {promo.short_description && (
                      <p className="text-xs text-slate-500 line-clamp-2">{promo.short_description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-4 bg-[#3A4A1F]/5 p-2.5 rounded-xl border border-[#3A4A1F]/10">
                    <div className="bg-white px-2.5 py-1 rounded-md shadow-sm font-mono text-sm font-bold text-[#3A4A1F] border border-slate-100">
                      {promo.discount_code}
                    </div>
                    <span className="text-sm font-bold text-slate-700">
                      {promo.discount_type === "percentage" ? `${promo.discount_value}% OFF` 
                       : promo.discount_type === "fixed_amount" ? `Rp ${promo.discount_value?.toLocaleString()}`
                       : promo.discount_text}
                    </span>
                  </div>

                  <div className="mt-auto pt-4 space-y-2">
                    <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {promo.start_date ? formatDate(new Date(promo.start_date), "dd MMM yy") : "Sekarang"} 
                        {" - "} 
                        {promo.expired_at ? formatDate(new Date(promo.expired_at), "dd MMM yy") : "Selamanya"}
                      </span>
                    </div>

                    {promo.promo_villas && promo.promo_villas.length > 0 && (
                      <div className="text-[10px] text-slate-400 font-medium">
                        Berlaku di: {promo.promo_villas.length} Villa
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => handleToggle(promo.id, promo.status)}
                      disabled={isPending}
                      className={promo.status === "published"
                        ? "text-slate-500 hover:bg-slate-100"
                        : "text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                      }
                    >
                      {promo.status === "published" ? "Nonaktifkan" : "Publish"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => openEdit(promo)}
                      className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 ml-auto"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit
                    </Button>
                    <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          type="button"
                          className="text-red-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      }
                    />
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
            );
          })}
        </div>
      )}

      {/* Editor Panel */}
      <PromoEditorPanel 
        open={panelOpen} 
        onOpenChange={setPanelOpen} 
        promo={editPromo} 
        villas={villas}
        onSuccess={load}
      />
    </Container>
  );
}
