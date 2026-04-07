"use client";

import { use, useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { saveFullVillaData, archiveVilla, checkSlugAvailability } from "@/lib/actions/villas";
import { AmenitiesSelect } from "@/components/admin/AmenitiesSelect";
import { GalleryUploader, type GalleryItem } from "@/components/admin/GalleryUploader";
import { PricingCalendar } from "@/components/admin/PricingCalendar";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Container } from "@/components/shared/Container";
import {
  ArrowLeft, Save, Loader2, Plus, Trash2, BedDouble,
  MapPin, ImageIcon, Settings2, MessageCircle, Globe, Phone,
  AlertTriangle, CheckCircle2
} from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
interface RoomTypeForm {
  id?: string;
  name: string;
  base_price: number;
  capacity_adult: number;
  capacity_child: number;
  description: string;
  amenity_ids: string[];
  gallery: GalleryItem[];
}

interface VillaForm {
  id?: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  gmaps_url: string;
  whatsapp_number: string;
  default_whatsapp_message: string;
  status: "active" | "coming_soon" | "inactive";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateSlug(name: string): string {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim().replace(/^-|-$/g, "");
}

const DEFAULT_ROOM: Omit<RoomTypeForm, "id"> = {
  name: "",
  base_price: 1500000,
  capacity_adult: 2,
  capacity_child: 0,
  description: "",
  amenity_ids: [],
  gallery: [],
};

const DEFAULT_VILLA: VillaForm = {
  name: "", slug: "", description: "", address: "",
  gmaps_url: "", whatsapp_number: "", default_whatsapp_message: "", status: "active",
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function VillaEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isCreate = id === "new";
  const router = useRouter();

  const [villa, setVilla] = useState<VillaForm>({ ...DEFAULT_VILLA, id: isCreate ? crypto.randomUUID() : id });
  const [amenityIds, setAmenityIds] = useState<string[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [rooms, setRooms] = useState<RoomTypeForm[]>([]);
  const [loading, setLoading] = useState(!isCreate);
  const [isPending, startTransition] = useTransition();
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "ok" | "taken">("idle");

  // ─ Load existing villa ─
  useEffect(() => {
    if (isCreate) return;
    async function load() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("villas")
        .select(`
          *, 
          villa_amenities(amenity_id), 
          gallery(*),
          room_types(*, room_type_amenities(amenity_id), gallery(*))
        `)
        .eq("id", id)
        .single();

      if (error || !data) { toast.error("Properti tidak ditemukan"); setLoading(false); return; }

      setVilla({
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description ?? "",
        address: data.address ?? "",
        gmaps_url: data.gmaps_url ?? "",
        whatsapp_number: data.whatsapp_number ?? "",
        default_whatsapp_message: (data as any).default_whatsapp_message ?? "",
        status: (data.status as any) ?? "active",
      });
      setAmenityIds(data.villa_amenities.map((a: any) => a.amenity_id));
      const villaGallery: GalleryItem[] = data.gallery
        .filter((g: any) => !g.room_type_id)
        .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
        .map((g: any) => ({ id: g.id, image_url: g.image_url, is_primary: g.is_primary ?? false, display_order: g.display_order ?? 0 }));
      setGallery(villaGallery);
      setRooms(
        data.room_types
          .filter((rt: any) => rt.status !== "inactive")
          .map((rt: any) => ({
            id: rt.id,
            name: rt.name,
            base_price: rt.base_price,
            capacity_adult: rt.capacity_adult ?? 2,
            capacity_child: rt.capacity_child ?? 0,
            description: rt.description ?? "",
            amenity_ids: rt.room_type_amenities.map((a: any) => a.amenity_id),
            gallery: rt.gallery.sort((a: any, b: any) => a.display_order - b.display_order),
          }))
      );
      setLoading(false);
    }
    load();
  }, [id, isCreate]);

  // ─ Slug validation (debounced) ─
  useEffect(() => {
    if (!villa.slug || villa.slug.length < 3) { setSlugStatus("idle"); return; }

    setSlugStatus("checking");
    const timer = setTimeout(async () => {
      const res = await checkSlugAvailability(villa.slug, villa.id);
      setSlugStatus(res.available ? "ok" : "taken");
    }, 600);
    return () => clearTimeout(timer);
  }, [villa.slug, villa.id]);

  // ─ Handlers ─
  const setVillaField = <K extends keyof VillaForm>(key: K, value: VillaForm[K]) => {
    setVilla(prev => ({ ...prev, [key]: value }));
  };

  const handleNameChange = (name: string) => {
    setVilla(prev => ({
      ...prev,
      name,
      slug: isCreate ? generateSlug(name) : prev.slug,
    }));
  };

  const addRoom = () => {
    setRooms(prev => [{ ...DEFAULT_ROOM, id: crypto.randomUUID() }, ...prev]);
  };

  const removeRoom = (idx: number) => {
    setRooms(prev => prev.filter((_, i) => i !== idx));
  };

  const setRoomField = <K extends keyof RoomTypeForm>(idx: number, key: K, value: RoomTypeForm[K]) => {
    setRooms(prev => prev.map((r, i) => i === idx ? { ...r, [key]: value } : r));
  };

  const handleSave = () => {
    if (slugStatus === "taken") { toast.error("Slug sudah dipakai. Ganti sebelum menyimpan."); return; }
    if (rooms.length === 0) { toast.error("Minimal 1 tipe kamar diperlukan"); return; }

    startTransition(async () => {
      const payload = {
        villa,
        amenity_ids: amenityIds,
        gallery,
        room_types: rooms,
      };

      const res = await saveFullVillaData(payload);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(isCreate ? "Properti berhasil dibuat!" : "Perubahan berhasil disimpan!");
        if (isCreate && res.villa_id) {
          router.push(`/admin/villas/${res.villa_id}/edit`);
        }
      }
    });
  };

  const handleArchive = () => {
    startTransition(async () => {
      const res = await archiveVilla(id);
      if (res.error) toast.error(res.error);
      else { toast.success("Properti diarsipkan"); router.push("/admin/villas"); }
    });
  };

  // ─ Loading ─
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F6F2]">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#3A4A1F] mx-auto" />
          <p className="text-sm text-slate-500">Memuat data properti...</p>
        </div>
      </div>
    );
  }

  return (
    <Container className="py-8 pb-32 bg-[#F7F6F2] min-h-screen">
      {/* ─── Sticky Header ─── */}
      <div className="sticky top-0 z-50 bg-[#F7F6F2]/90 backdrop-blur-md pb-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/admin/villas">
              <Button variant="outline" size="icon" className="rounded-full bg-white shadow-sm w-9 h-9">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900">
                  {isCreate ? "Tambah Properti Baru" : villa.name || "Edit Properti"}
                </h1>
                {!isCreate && <StatusBadge status={villa.status} variant="villa" />}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">/{villa.slug || "—"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isCreate && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="h-10 text-xs font-bold text-red-600 border-red-200 hover:bg-red-50" disabled={isPending}>
                    <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Arsipkan
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Arsipkan Properti?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Properti akan dinonaktifkan dan tidak muncul di publik. Data riwayat reservasi tetap aman. Tindakan ini dapat diurungkan kapan saja.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleArchive} className="bg-red-600 hover:bg-red-700">Arsipkan</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button onClick={handleSave} disabled={isPending || slugStatus === "taken"} className="bg-[#3A4A1F] hover:bg-[#2A3A1F] text-white rounded-xl h-10 px-6 font-bold shadow-lg shadow-[#3A4A1F]/20">
              {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Simpan Semua
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* ─── LEFT: Main form ─── */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* ── SECTION 1: Info Properti ── */}
          <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-100">
              <MapPin className="w-4 h-4 text-[#3A4A1F]" />
              <h2 className="font-bold text-slate-800">Informasi Properti</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Nama Properti *</label>
                  <Input value={villa.name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. Villa Bougainvillea" className="h-11 bg-slate-50 border-slate-200 font-semibold" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                    URL Slug *
                    {slugStatus === "checking" && <Loader2 className="w-3 h-3 animate-spin text-slate-400" />}
                    {slugStatus === "ok" && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                    {slugStatus === "taken" && <span className="text-[10px] text-red-500 font-bold">— Sudah terpakai!</span>}
                  </label>
                  <Input
                    value={villa.slug}
                    onChange={e => setVillaField("slug", e.target.value.toLowerCase())}
                    className={`h-11 bg-slate-50 font-mono text-sm border-slate-200 ${slugStatus === "taken" ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Phone className="w-3 h-3" /> Nomor WhatsApp *</label>
                  <Input value={villa.whatsapp_number} onChange={e => setVillaField("whatsapp_number", e.target.value)} placeholder="628123456789" className="h-11 bg-slate-50 border-slate-200" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Settings2 className="w-3 h-3" /> Status</label>
                  <Select value={villa.status} onValueChange={(v: any) => setVillaField("status", v)}>
                    <SelectTrigger className="h-11 bg-slate-50 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">✅ Aktif / Dipublikasikan</SelectItem>
                      <SelectItem value="coming_soon">🔜 Coming Soon</SelectItem>
                      <SelectItem value="inactive">🔴 Nonaktif / Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Deskripsi Umum</label>
                <textarea
                  value={villa.description}
                  onChange={e => setVillaField("description", e.target.value)}
                  rows={4}
                  placeholder="Ceritakan keunikan dan keindahan properti ini..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Alamat Lengkap *</label>
                <textarea
                  value={villa.address}
                  onChange={e => setVillaField("address", e.target.value)}
                  rows={2}
                  placeholder="Jl. Raya Ubud No. 1, Gianyar, Bali..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Globe className="w-3 h-3" /> URL Google Maps</label>
                  <Input value={villa.gmaps_url} onChange={e => setVillaField("gmaps_url", e.target.value)} placeholder="https://maps.google.com/..." className="h-11 bg-slate-50 border-slate-200 text-xs" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><MessageCircle className="w-3 h-3" /> Pesan WA Default</label>
                  <Input value={villa.default_whatsapp_message} onChange={e => setVillaField("default_whatsapp_message", e.target.value)} placeholder="Halo, saya ingin booking Villa..." className="h-11 bg-slate-50 border-slate-200 text-xs" />
                </div>
              </div>
            </div>
          </section>

          {/* ── SECTION 2: Room Types ── */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BedDouble className="w-4 h-4 text-[#3A4A1F]" />
                <h2 className="font-bold text-slate-800">Tipe Kamar <span className="text-slate-400 font-normal text-sm">({rooms.length})</span></h2>
              </div>
              <Button type="button" onClick={addRoom} className="h-9 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl">
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Tambah Kamar
              </Button>
            </div>

            <div className="space-y-4">
              {rooms.map((room, idx) => (
                <div key={room.id ?? idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="border-b border-slate-100 p-4 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-[#3A4A1F]/10 flex items-center justify-center text-[11px] font-black text-[#3A4A1F]">
                        {idx + 1}
                      </span>
                      <Input
                        value={room.name}
                        onChange={e => setRoomField(idx, "name", e.target.value)}
                        placeholder="Nama tipe kamar (e.g. King Suite)"
                        className="h-9 bg-white border-slate-200 font-bold text-slate-800 max-w-[280px]"
                      />
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button type="button" className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Tipe Kamar?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Kamar "{room.name || "ini"}" akan dihapus dari form. Jika sudah tersimpan, kamar akan diarsipkan untuk menjaga riwayat reservasi.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => removeRoom(idx)} className="bg-red-600 hover:bg-red-700">Hapus</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: fields */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Harga Dasar</label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">Rp</span>
                            <Input type="number" value={room.base_price} onChange={e => setRoomField(idx, "base_price", Number(e.target.value))} className="pl-8 h-10 font-mono font-bold text-sm" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Dewasa</label>
                          <Input type="number" min={1} value={room.capacity_adult} onChange={e => setRoomField(idx, "capacity_adult", Number(e.target.value))} className="h-10 text-center" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Anak</label>
                          <Input type="number" min={0} value={room.capacity_child} onChange={e => setRoomField(idx, "capacity_child", Number(e.target.value))} className="h-10 text-center" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Deskripsi Kamar</label>
                        <textarea rows={3} value={room.description} onChange={e => setRoomField(idx, "description", e.target.value)} placeholder="Deskripsikan fasilitas unik kamar ini..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>

                      <AmenitiesSelect selectedIds={room.amenity_ids} onChange={ids => setRoomField(idx, "amenity_ids", ids)} label="Fasilitas Kamar" />

                      {/* Pricing Calendar — only visible for existing rooms */}
                      {room.id && !isCreate && (
                        <div className="mt-2">
                          <PricingCalendar roomTypeId={room.id} basePrice={room.base_price} />
                        </div>
                      )}
                      {isCreate && (
                        <p className="text-[10px] text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                          💡 Simpan properti terlebih dahulu untuk mengakses pengaturan harga dinamis.
                        </p>
                      )}
                    </div>

                    {/* Right: gallery */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Foto Kamar</label>
                      <GalleryUploader
                        villaId={villa.id!}
                        roomTypeId={room.id}
                        items={room.gallery}
                        onChange={items => setRoomField(idx, "gallery", items)}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {rooms.length === 0 && (
                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
                  <BedDouble className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="font-bold text-slate-600">Belum ada tipe kamar</p>
                  <p className="text-sm text-slate-400 mt-1">Tambahkan minimal 1 tipe kamar untuk dapat menyimpan properti.</p>
                  <Button type="button" onClick={addRoom} className="mt-4 bg-[#3A4A1F] text-white rounded-xl font-bold text-sm">
                    <Plus className="w-4 h-4 mr-2" /> Tambah Tipe Kamar
                  </Button>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ─── RIGHT: Sidebar ─── */}
        <div className="xl:col-span-4 space-y-5">
          {/* Gallery */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <ImageIcon className="w-4 h-4 text-[#3A4A1F]" />
              <h3 className="font-bold text-slate-800 text-sm">Foto Properti Umum</h3>
            </div>
            <p className="text-xs text-slate-400 mb-3">Foto lobby, eksterior, kolam renang, dsb.</p>
            <GalleryUploader villaId={villa.id!} items={gallery} onChange={setGallery} />
          </div>

          {/* Villa Amenities */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <Settings2 className="w-4 h-4 text-[#3A4A1F]" />
              <h3 className="font-bold text-slate-800 text-sm">Fasilitas Villa Umum</h3>
            </div>
            <p className="text-xs text-slate-400 mb-3">Fasilitas yang diakses semua tamu (kolam, parkir, dll).</p>
            <AmenitiesSelect selectedIds={amenityIds} onChange={setAmenityIds} />
          </div>
        </div>
      </div>
    </Container>
  );
}