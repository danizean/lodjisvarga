"use client";

import { use, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  BedDouble,
  Building2,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Globe,
  Home,
  ImageIcon,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Save,
  Settings2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { saveFullVillaData, archiveVilla, checkSlugAvailability } from "@/lib/actions/villas";
import { createClient } from "@/lib/supabase/client";
import { AmenitiesSelect } from "@/components/admin/AmenitiesSelect";
import { GalleryUploader, type GalleryItem } from "@/components/admin/GalleryUploader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Container } from "@/components/shared/Container";
import { RoomEditorPanel, type RoomTypeForm } from "@/components/admin/villas/RoomEditorPanel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tables } from "@/types/database";

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

type VillaAmenityLink = { amenity_id: string };
type RoomAmenityLink = { amenity_id: string };
type GalleryRow = Tables<"gallery">;
type RoomTypeRow = Tables<"room_types">;
type VillaRow = Tables<"villas">;

interface RoomTypeWithRelations extends RoomTypeRow {
  room_type_amenities: RoomAmenityLink[];
  room_gallery: GalleryRow[];
}

interface VillaWithRelations extends VillaRow {
  villa_amenities: VillaAmenityLink[];
  villa_gallery: GalleryRow[];
  room_types: RoomTypeWithRelations[];
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .replace(/^-|-$/g, "");
}

const DEFAULT_ROOM: Omit<RoomTypeForm, "id"> = {
  name: "",
  base_price: 0,
  bed_type: "",
  description: "",
  amenity_ids: [],
  highlight_amenity_ids: [],
  gallery: [],
};

const DEFAULT_VILLA: VillaForm = {
  name: "",
  slug: "",
  description: "",
  address: "",
  gmaps_url: "",
  whatsapp_number: "",
  default_whatsapp_message: "",
  status: "active",
};

export default function VillaManagementEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isCreate = id === "new";
  const router = useRouter();

  const [villa, setVilla] = useState<VillaForm>({
    ...DEFAULT_VILLA,
    id: isCreate ? crypto.randomUUID() : id,
  });
  const [amenityIds, setAmenityIds] = useState<string[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [rooms, setRooms] = useState<RoomTypeForm[]>([]);
  const [loading, setLoading] = useState(!isCreate);
  const [isPending, startTransition] = useTransition();
  const [slugStatus, setSlugStatus] = useState<"idle" | "ok" | "taken">("idle");
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [uploadingScopes, setUploadingScopes] = useState<Record<string, boolean>>({});
  // Full amenities list — fetched once for the Fasilitas Sorotan selector.
  // The selector filters this down to only the IDs already picked per room.
  const [allAmenities, setAllAmenities] = useState<{ id: string; name: string; icon_name: string | null }[]>([]);

  useEffect(() => {
    async function loadAmenities() {
      const supabase = createClient();
      const { data } = await supabase.from("amenities").select("id, name, icon_name").order("name");
      setAllAmenities((data ?? []).map((a) => ({ id: a.id, name: a.name, icon_name: a.icon_name ?? null })));
    }
    loadAmenities();
  }, []);

  useEffect(() => {
    if (isCreate) return;

    async function load() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("villas")
        .select(`
          *,
          villa_amenities(amenity_id),
          villa_gallery:gallery!gallery_villa_id_fkey(*),
          room_types(*, room_type_amenities(amenity_id), room_gallery:gallery!gallery_room_type_id_fkey(*))
        `)
        .eq("id", id)
        .single();

      if (error || !data) {
        toast.error("Properti tidak ditemukan");
        setLoading(false);
        return;
      }

      const villaData = data as unknown as VillaWithRelations;

      setVilla({
        id: villaData.id,
        name: villaData.name,
        slug: villaData.slug,
        description: villaData.description ?? "",
        address: villaData.address ?? "",
        gmaps_url: villaData.gmaps_url ?? "",
        whatsapp_number: villaData.whatsapp_number ?? "",
        default_whatsapp_message: villaData.default_whatsapp_message ?? "",
        status: (villaData.status as VillaForm["status"]) ?? "active",
      });

      setAmenityIds((villaData.villa_amenities ?? []).map((amenity) => amenity.amenity_id));

      setGallery(
        (villaData.villa_gallery ?? [])
          .filter((image) => !image.room_type_id)
          .sort((left, right) => (left.display_order ?? 0) - (right.display_order ?? 0))
          .map((image) => ({
            id: image.id,
            image_url: image.image_url,
            is_primary: image.is_primary ?? false,
            display_order: image.display_order ?? 0,
          }))
      );

      setRooms(
        (villaData.room_types ?? [])
          .filter((roomType) => roomType.status !== "inactive")
          .map((roomType) => ({
            id: roomType.id,
            name: roomType.name,
            base_price: roomType.base_price ?? 0,
            bed_type: (roomType as unknown as { bed_type?: string | null }).bed_type ?? "",
            description: roomType.description ?? "",
            amenity_ids: (roomType.room_type_amenities ?? []).map((amenity) => amenity.amenity_id),
            highlight_amenity_ids:
              (roomType as unknown as { highlight_amenity_ids?: string[] }).highlight_amenity_ids ?? [],
            gallery: [...(roomType.room_gallery ?? [])]
              .sort((left, right) => (left.display_order ?? 0) - (right.display_order ?? 0))
              .map((img) => ({
                id: img.id,
                image_url: img.image_url,
                is_primary: img.is_primary ?? false,
                display_order: img.display_order ?? 0,
              })),
          }))
      );

      setLoading(false);
    }

    load();
  }, [id, isCreate]);

  useEffect(() => {
    if (!villa.slug || villa.slug.length < 3) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      if (cancelled) return;
      setIsCheckingSlug(true);
      const res = await checkSlugAvailability(villa.slug, villa.id);
      if (cancelled) return;
      setSlugStatus(res.available ? "ok" : "taken");
      setIsCheckingSlug(false);
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [villa.slug, villa.id]);

  const setVillaField = <K extends keyof VillaForm>(key: K, value: VillaForm[K]) => {
    setVilla((prev) => ({ ...prev, [key]: value }));
  };

  const handleNameChange = (name: string) => {
    setVilla((prev) => ({
      ...prev,
      name,
      slug: isCreate ? generateSlug(name) : prev.slug,
    }));
  };

  const addRoom = () => {
    setRooms((prev) => [{ ...DEFAULT_ROOM, id: crypto.randomUUID() }, ...prev]);
  };

  const removeRoom = (idx: number) => {
    setRooms((prev) => prev.filter((_, index) => index !== idx));
  };

  const setRoomField = <K extends keyof RoomTypeForm>(idx: number, key: K, value: RoomTypeForm[K]) => {
    setRooms((prev) => prev.map((room, index) => (index === idx ? { ...room, [key]: value } : room)));
  };

  const setUploadScope = (scope: string, uploading: boolean) => {
    setUploadingScopes((prev) => {
      if (uploading) {
        return { ...prev, [scope]: true };
      }

      const next = { ...prev };
      delete next[scope];
      return next;
    });
  };

  const handleSave = () => {
    if (effectiveSlugStatus === "taken") {
      toast.error("Slug sudah dipakai. Ganti sebelum menyimpan.");
      return;
    }

    if (rooms.length === 0) {
      toast.error("Minimal 1 tipe kamar diperlukan");
      return;
    }

    if (hasUploadingMedia) {
      toast.error("Tunggu sampai semua upload foto selesai sebelum menyimpan.");
      return;
    }

    startTransition(async () => {
      const payload = {
        villa,
        amenity_ids: amenityIds,
        gallery,
        room_types: rooms.map((room) => ({
          ...room,
          base_price: Number.isFinite(room.base_price) ? room.base_price : 0,
        })),
      };

      const res = await saveFullVillaData(payload);
      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success(isCreate ? "Properti berhasil dibuat" : "Perubahan berhasil disimpan");
      if (isCreate && res.villa_id) {
        router.push(`/admin/villas/${res.villa_id}/edit`);
      }
    });
  };

  const handleArchive = () => {
    startTransition(async () => {
      const res = await archiveVilla(id);
      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success("Properti diarsipkan");
      router.push("/admin/villas");
    });
  };

  const checklist = useMemo(
    () => [
      { label: "Nama dan slug siap tayang", done: villa.name.trim().length >= 3 && villa.slug.trim().length >= 3 },
      { label: "Kontak WhatsApp tersedia", done: villa.whatsapp_number.trim().length >= 9 },
      { label: "Alamat properti terisi", done: villa.address.trim().length >= 10 },
      { label: "Minimal 1 foto properti", done: gallery.length > 0 },
      { label: "Minimal 1 tipe kamar", done: rooms.length > 0 },
    ],
    [gallery.length, rooms.length, villa.address, villa.name, villa.slug, villa.whatsapp_number]
  );

  const completedChecklist = checklist.filter((item) => item.done).length;
  const totalRoomPhotos = rooms.reduce((total, room) => total + room.gallery.length, 0);
  const hasUploadingMedia = Object.keys(uploadingScopes).length > 0;
  const effectiveSlugStatus = !villa.slug || villa.slug.length < 3
    ? "idle"
    : isCheckingSlug
      ? "checking"
      : slugStatus;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#3A4A1F]" />
          <p className="text-sm text-slate-500">Memuat data properti...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Container className="max-w-[1500px] py-8 pb-28">
        <div className="sticky top-0 z-50 mb-6 rounded-3xl border border-white/70 bg-slate-50/90 px-2 py-3 backdrop-blur-md">
          <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm shadow-slate-200/60 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <Link href="/admin/villas">
                <Button variant="outline" size="icon" className="mt-1 size-10 rounded-full border-slate-200 bg-white">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#3A4A1F]/8 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#3A4A1F]">
                    <Building2 className="h-3.5 w-3.5" />
                    Property Management
                  </span>
                  {!isCreate && <StatusBadge status={villa.status} variant="villa" />}
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-950">
                    {isCreate ? "Buat Listing Villa Baru" : villa.name || "Edit Listing Villa"}
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Kelola informasi listing, media, dan inventori kamar dalam satu workspace yang lebih rapi.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="font-mono text-[11px]">/{villa.slug || "draft-listing"}</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Home className="h-3.5 w-3.5" />
                    {rooms.length} tipe kamar
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5" />
                    {gallery.length + totalRoomPhotos} foto
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {!isCreate && villa.slug && (
                <Link href={`/villas/${villa.slug}`} target="_blank" className="inline-flex">
                  <Button variant="outline" className="h-11 rounded-xl border-slate-200 px-4 text-xs font-bold text-slate-700">
                    <ExternalLink className="mr-1.5 h-4 w-4" />
                    Lihat Halaman Publik
                  </Button>
                </Link>
              )}
              {!isCreate && (
                <AlertDialog>
                  <AlertDialogTrigger className="inline-flex h-11 items-center justify-center rounded-xl border border-red-200 px-4 text-xs font-bold text-red-600 transition-colors hover:bg-red-50">
                    <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
                    Arsipkan
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Arsipkan properti ini?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Listing akan dinonaktifkan dari publik, tetapi histori data tetap aman dan masih bisa diaktifkan kembali nanti.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={handleArchive} className="bg-red-600 hover:bg-red-700">
                        Arsipkan
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button
                onClick={handleSave}
                disabled={isPending || effectiveSlugStatus === "taken" || hasUploadingMedia}
                className="h-11 rounded-xl bg-[#3A4A1F] px-6 text-sm font-bold text-white shadow-lg shadow-[#3A4A1F]/20 hover:bg-[#2E3C18]"
              >
                {isPending || hasUploadingMedia ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {hasUploadingMedia ? "Mengunggah Foto..." : "Simpan Listing"}
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Listing Readiness</p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-3xl font-black text-slate-950">{completedChecklist}</span>
              <span className="pb-1 text-sm font-medium text-slate-400">/ {checklist.length} lengkap</span>
            </div>
            <p className="mt-2 text-sm text-slate-500">Checklist ini membantu listing tampil lebih siap dan mudah dikelola.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Inventori Kamar</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-3">
                <BedDouble className="h-5 w-5 text-slate-700" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-950">{rooms.length}</p>
                <p className="text-sm text-slate-500">tipe kamar aktif</p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Media Properti</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-3">
                <ImageIcon className="h-5 w-5 text-slate-700" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-950">{gallery.length}</p>
                <p className="text-sm text-slate-500">foto properti utama</p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-[#3A4A1F]/15 bg-gradient-to-br from-[#F6F8F0] to-white p-5 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#3A4A1F]/70">Pricing Workspace</p>
            <p className="mt-3 text-base font-black text-slate-950">Harga dan availability dikelola terpisah</p>
            <p className="mt-2 text-sm text-slate-500">Form ini fokus pada data villa dan kamar. Rate harian dipindahkan ke calendar workspace.</p>
            <Link href="/admin/calendar" className="mt-4 inline-flex">
              <Button variant="outline" className="h-10 rounded-xl border-[#3A4A1F]/20 text-xs font-bold text-[#3A4A1F]">
                <CalendarDays className="mr-1.5 h-4 w-4" />
                Buka Calendar & Pricing
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="space-y-6 xl:col-span-8">
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-5">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#3A4A1F]" />
                  <h2 className="text-lg font-black text-slate-950">Informasi Listing</h2>
                </div>
                <p className="mt-1 text-sm text-slate-500">Susun headline, detail lokasi, dan channel komunikasi utama properti.</p>
              </div>
              <div className="space-y-5 p-6">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Nama Properti</label>
                    <Input
                      value={villa.name}
                      onChange={(event) => handleNameChange(event.target.value)}
                      placeholder="Contoh: Lodji Svarga Ubud"
                      className="h-12 rounded-2xl border-slate-200 bg-slate-50 font-semibold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      URL Slug
                      {effectiveSlugStatus === "checking" && <Loader2 className="h-3 w-3 animate-spin text-slate-400" />}
                      {effectiveSlugStatus === "ok" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                      {effectiveSlugStatus === "taken" && <span className="text-[10px] text-red-500">Sudah terpakai</span>}
                    </label>
                    <Input
                      value={villa.slug}
                      onChange={(event) => setVillaField("slug", event.target.value.toLowerCase())}
                      className={`h-12 rounded-2xl border-slate-200 bg-slate-50 font-mono text-sm ${
                        effectiveSlugStatus === "taken" ? "border-red-300 focus-visible:ring-red-300" : ""
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      <Phone className="h-3.5 w-3.5" />
                      Nomor WhatsApp
                    </label>
                    <Input
                      value={villa.whatsapp_number}
                      onChange={(event) => setVillaField("whatsapp_number", event.target.value)}
                      placeholder="628123456789"
                      className="h-12 rounded-2xl border-slate-200 bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      <Settings2 className="h-3.5 w-3.5" />
                      Status Listing
                    </label>
                    <Select value={villa.status} onValueChange={(value) => setVillaField("status", value as VillaForm["status"])}>
                      <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-slate-50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Aktif / Dipublikasikan</SelectItem>
                        <SelectItem value="coming_soon">Coming Soon</SelectItem>
                        <SelectItem value="inactive">Nonaktif / Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      <MessageCircle className="h-3.5 w-3.5" />
                      Template Pesan Awal
                    </label>
                    <Input
                      value={villa.default_whatsapp_message}
                      onChange={(event) => setVillaField("default_whatsapp_message", event.target.value)}
                      placeholder="Halo, saya ingin mengetahui informasi villa ini"
                      className="h-12 rounded-2xl border-slate-200 bg-slate-50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Deskripsi Properti</label>
                  <textarea
                    rows={5}
                    value={villa.description}
                    onChange={(event) => setVillaField("description", event.target.value)}
                    placeholder="Jelaskan positioning, suasana, dan keunggulan utama villa ini."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none ring-0 transition focus:border-[#3A4A1F]/30"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Alamat Lengkap</label>
                  <textarea
                    rows={3}
                    value={villa.address}
                    onChange={(event) => setVillaField("address", event.target.value)}
                    placeholder="Jalan, area, kota, provinsi, dan titik patokan terdekat."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none ring-0 transition focus:border-[#3A4A1F]/30"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      <Globe className="h-3.5 w-3.5" />
                      URL Google Maps
                    </label>
                    <Input
                      value={villa.gmaps_url}
                      onChange={(event) => setVillaField("gmaps_url", event.target.value)}
                      placeholder="https://maps.google.com/..."
                      className="h-12 rounded-2xl border-slate-200 bg-slate-50 text-sm"
                    />
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Tips Listing OTA</p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      <li>Gunakan nama properti yang konsisten dengan branding publik.</li>
                      <li>Tulis alamat yang jelas agar tim reservasi mudah membantu tamu.</li>
                      <li>Hindari slug yang terlalu umum supaya tidak bentrok dengan listing lain.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <BedDouble className="h-4 w-4 text-[#3A4A1F]" />
                    <h2 className="text-lg font-black text-slate-950">Inventori Kamar</h2>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">Kelola tipe kamar, kapasitas, fasilitas, dan galeri setiap unit.</p>
                </div>
                <Button type="button" onClick={addRoom} className="h-11 rounded-xl bg-slate-950 px-4 text-xs font-bold text-white hover:bg-slate-800">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Tambah Tipe Kamar
                </Button>
              </div>

              <div className="space-y-3">
                {rooms.map((room, idx) => (
                  <RoomEditorPanel
                    key={room.id ?? idx}
                    room={room}
                    idx={idx}
                    villaId={villa.id ?? ""}
                    isCreate={isCreate}
                    allAmenities={allAmenities}
                    onFieldChange={(key, value) => setRoomField(idx, key, value)}
                    onRemove={() => removeRoom(idx)}
                    onUploadStatusChange={(uploading) =>
                      setUploadScope(`room-${room.id ?? idx}`, uploading)
                    }
                  />
                ))}

                {rooms.length === 0 && (
                  <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                    <BedDouble className="mx-auto h-12 w-12 text-slate-200" />
                    <p className="mt-4 text-lg font-black text-slate-800">Belum ada tipe kamar</p>
                    <p className="mt-2 text-sm text-slate-500">
                      Tambahkan minimal satu kamar agar listing bisa disimpan dan dikelola.
                    </p>
                    <Button
                      type="button"
                      onClick={addRoom}
                      className="mt-5 h-11 rounded-xl bg-[#3A4A1F] px-5 text-sm font-bold text-white"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Tipe Kamar
                    </Button>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* ── Sidebar ── */}
          <aside className="space-y-5 xl:col-span-4">
            {/* Ringkasan Listing */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#3A4A1F]" />
                <h3 className="text-sm font-black text-slate-950">Ringkasan Listing</h3>
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span>Nama properti</span>
                  <span className="max-w-[180px] truncate font-semibold text-slate-900">{villa.name || "Draft"}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span>Status</span>
                  <StatusBadge status={villa.status} variant="villa" />
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span>Total tipe kamar</span>
                  <span className="font-semibold text-slate-900">{rooms.length}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <span>Foto kamar</span>
                  <span className="font-semibold text-slate-900">{totalRoomPhotos}</span>
                </div>
              </div>
            </div>

            {/* Checklist Kualitas */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#3A4A1F]" />
                <h3 className="text-sm font-black text-slate-950">Checklist Kualitas Listing</h3>
              </div>
              <div className="mt-4 space-y-3">
                {checklist.map((item) => (
                  <div key={item.label} className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                    <span className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full ${item.done ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.done ? "Sudah siap" : "Masih perlu dilengkapi"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Foto Properti */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-[#3A4A1F]" />
                  <h3 className="text-sm font-black text-slate-950">Foto Properti Umum</h3>
                </div>
                <p className="mt-1 text-xs text-slate-500">Tambahkan foto facade, area publik, kolam renang, atau ambience utama.</p>
              </div>
              <GalleryUploader
                villaId={villa.id ?? ""}
                items={gallery}
                onChange={setGallery}
                onUploadStatusChange={(uploading) => setUploadScope("villa-gallery", uploading)}
              />
            </div>

            {/* Fasilitas Villa */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-[#3A4A1F]" />
                  <h3 className="text-sm font-black text-slate-950">Fasilitas Villa Umum</h3>
                </div>
                <p className="mt-1 text-xs text-slate-500">Fasilitas yang bisa diakses tamu di area properti secara keseluruhan.</p>
              </div>
              <AmenitiesSelect selectedIds={amenityIds} onChange={setAmenityIds} />
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}
