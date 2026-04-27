"use client";

import { use, useCallback, useEffect, useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Save, Loader2, CheckCircle2, BedDouble, ImageIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { updateRoomType, saveRoomAmenities, saveRoomGallery } from "@/lib/actions/rooms";
import { roomTypeSchema, type RoomTypeFormData } from "@/lib/validations/villa-tabs";
import { AmenityHighlightManager } from "@/components/admin/villas/AmenityHighlightManager";
import { GalleryUploader, type GalleryItem } from "@/components/admin/GalleryUploader";

// ── Local types ────────────────────────────────────────────────────────────────

interface RoomTypeAmenityRecord {
  amenity_id: string;
}

interface RoomGalleryRecord {
  id: string;
  image_url: string;
  is_primary: boolean | null;
  display_order: number | null;
}

interface RoomEditorRecord {
  id: string;
  villa_id: string | null;
  name: string;
  bed_type: string | null;
  base_price: number | null;
  description: string | null;
  status: "active" | "inactive" | null;
  /** JSONB array column — may be null when the row was created before this field existed */
  highlight_amenity_ids: string[] | null;
  room_type_amenities: RoomTypeAmenityRecord[] | null;
  room_gallery: RoomGalleryRecord[] | null;
}

interface Amenity {
  id: string;
  name: string;
  icon_name?: string | null;
}

// ── Page component ─────────────────────────────────────────────────────────────

export default function RoomEditorPage({
  params,
}: {
  params: Promise<{ id: string; roomId: string }>;
}) {
  const { id: villaId, roomId } = use(params);
  const router = useRouter();

  // ── Loading / save state ──────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Amenity state (selection + highlights) ────────────────────────────────
  const [allAmenities, setAllAmenities] = useState<Amenity[]>([]);
  const [amenityIds, setAmenityIds] = useState<string[]>([]);
  const [initialAmenityIds, setInitialAmenityIds] = useState<string[]>([]);
  const [highlightIds, setHighlightIds] = useState<string[]>([]);
  const [initialHighlightIds, setInitialHighlightIds] = useState<string[]>([]);

  // ── Gallery state ─────────────────────────────────────────────────────────
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // ── Form ──────────────────────────────────────────────────────────────────
  const form = useForm<RoomTypeFormData>({
    resolver: zodResolver(roomTypeSchema),
    mode: "onChange",
  });

  // ── Data loading ──────────────────────────────────────────────────────────

  /** Fetch the full amenity catalog once — needed by AmenityHighlightManager */
  useEffect(() => {
    async function loadAmenities() {
      const supabase = createClient();
      const { data } = await supabase
        .from("amenities")
        .select("id, name, icon_name")
        .order("name");
      setAllAmenities(
        (data ?? []).map((a) => ({ id: a.id, name: a.name, icon_name: a.icon_name ?? null }))
      );
    }
    loadAmenities();
  }, []);

  /** Fetch this room's data and seed all derived state */
  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("room_types")
        .select(
          `
          *,
          room_type_amenities(amenity_id),
          room_gallery:gallery!gallery_room_type_id_fkey(*)
        `
        )
        .eq("id", roomId)
        .single();

      if (error || !data) {
        toast.error("Kamar tidak ditemukan");
        router.push(`/admin/villas/${villaId}/rooms`);
        return;
      }

      const roomData = data as RoomEditorRecord;

      form.reset({
        id: roomData.id,
        villa_id: roomData.villa_id ?? undefined,
        name: roomData.name,
        bed_type: roomData.bed_type ?? "",
        base_price: roomData.base_price ?? 0,
        description: roomData.description ?? "",
        status: roomData.status ?? "active",
        highlight_amenity_ids: roomData.highlight_amenity_ids ?? [],
      });

      const aIds = (roomData.room_type_amenities ?? []).map((a) => a.amenity_id);
      setAmenityIds(aIds);
      setInitialAmenityIds(aIds);

      const hIds = roomData.highlight_amenity_ids ?? [];
      setHighlightIds(hIds);
      setInitialHighlightIds(hIds);

      const gItems: GalleryItem[] = (roomData.room_gallery ?? [])
        .sort((l, r) => (l.display_order ?? 0) - (r.display_order ?? 0))
        .map((img) => ({
          id: img.id,
          image_url: img.image_url,
          is_primary: img.is_primary ?? false,
          display_order: img.display_order ?? 0,
        }));
      setGallery(gItems);

      setLoading(false);
    }
    load();
  }, [roomId, villaId, form, router]);

  // ── Save logic ────────────────────────────────────────────────────────────

  const performSave = useCallback(
    async (data: RoomTypeFormData, isAutosave = false) => {
      setSaveStatus("saving");

      const action = async () => {
        // 1. Save room details + highlights atomically via updateRoomType
        const res = await updateRoomType(roomId, {
          name: data.name,
          base_price: data.base_price,
          bed_type: data.bed_type ?? undefined,
          description: data.description ?? undefined,
          highlight_amenity_ids: highlightIds,
        });

        if (res.error) {
          setSaveStatus("error");
          if (!isAutosave) toast.error(res.error);
          return;
        }

        // 2. Save amenity junction table only on explicit save (avoids excessive DB writes)
        const hasAmenitiesChanged =
          JSON.stringify([...amenityIds].sort()) !==
          JSON.stringify([...initialAmenityIds].sort());

        if (hasAmenitiesChanged && !isAutosave) {
          const amenityRes = await saveRoomAmenities(roomId, amenityIds);
          if (amenityRes.error) {
            setSaveStatus("error");
            toast.error(amenityRes.error);
            return;
          }
          setInitialAmenityIds([...amenityIds]);
        }

        // 3. Sync initialHighlightIds so the next autosave doesn't re-persist unnecessarily
        setInitialHighlightIds([...highlightIds]);

        setSaveStatus("saved");
        if (!isAutosave) {
          toast.success("Perubahan kamar berhasil disimpan");
        }

        setTimeout(() => {
          setSaveStatus((s) => (s === "saved" ? "idle" : s));
        }, 3000);
      };

      if (isAutosave) action();
      else startTransition(action);
    },
    // highlightIds is intentionally in deps so autosave captures the latest selection
    [amenityIds, highlightIds, initialAmenityIds, roomId, startTransition]
  );

  // Hybrid autosave — fires 1.5s after any form field change
  useEffect(() => {
    const subscription = form.watch((_, { type }) => {
      if (!type) return;

      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
      setSaveStatus("idle");

      autosaveTimerRef.current = setTimeout(async () => {
        const isValid = await form.trigger();
        if (isValid) performSave(form.getValues(), true);
      }, 1500);
    });

    return () => subscription.unsubscribe();
  }, [form, performSave]);

  const handleGalleryChange = (newItems: GalleryItem[]) => {
    setGallery(newItems);
    startTransition(async () => {
      const res = await saveRoomGallery(roomId, villaId, newItems);
      if (res.error) toast.error(res.error);
    });
  };

  const onSubmit = (data: RoomTypeFormData) => {
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    performSave(data, false);
  };

  // ── Amenity selection handlers ────────────────────────────────────────────

  /** When amenity selection changes, prune any highlights that were de-selected */
  const handleSelectedChange = (ids: string[]) => {
    setAmenityIds(ids);
    setHighlightIds((prev) => prev.filter((hid) => ids.includes(hid)));
    setSaveStatus("idle");
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#3A4A1F]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Page sub-title (layout chrome handled by [id]/layout.tsx + VillaTabs) ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {form.getValues("name") || "Room Editor"}
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Edit spesifikasi, fasilitas sorotan, dan galeri untuk tipe kamar ini.
          </p>
        </div>

        {/* Inline save status indicator */}
        <div className="flex h-6 items-center">
          {saveStatus === "saving" && (
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Menyimpan...</span>
            </div>
          )}
          {saveStatus === "saved" && (
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-600">
              <CheckCircle2 className="h-3 w-3" />
              <span>Tersimpan</span>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        {/* ── Section 1: Room specification ── */}
        <section className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-2">
            <div className="rounded-xl bg-[#3A4A1F]/10 p-2 text-[#3A4A1F]">
              <BedDouble className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Spesifikasi Unit</h3>
          </div>

          <div className="mb-5 space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Nama Kamar
            </label>
            <Input
              {...form.register("name")}
              placeholder="e.g. Deluxe Room"
              className="h-12 rounded-xl bg-slate-50 border-slate-200"
            />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Tipe Kasur
              </label>
              <Input
                {...form.register("bed_type")}
                placeholder="e.g. 1 King Bed"
                className="h-12 rounded-xl bg-slate-50 border-slate-200"
              />
              {form.formState.errors.bed_type && (
                <p className="text-xs text-red-500">{form.formState.errors.bed_type.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Harga Dasar
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                  Rp
                </span>
                <Input
                  type="number"
                  {...form.register("base_price")}
                  placeholder="0"
                  className="h-12 rounded-xl bg-slate-50 border-slate-200 pl-11"
                />
              </div>
              {form.formState.errors.base_price && (
                <p className="text-xs text-red-500">{form.formState.errors.base_price.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Deskripsi Kamar
            </label>
            <Textarea
              {...form.register("description")}
              rows={4}
              placeholder="Jelaskan spesifikasi, view, dan suasana kamar..."
              className="resize-none rounded-xl bg-slate-50 border-slate-200"
            />
          </div>
        </section>

        {/* ── Section 2: Amenity + Highlight Manager (the new component) ── */}
        <AmenityHighlightManager
          allAmenities={allAmenities}
          roomAmenities={allAmenities.filter((a) => amenityIds.includes(a.id))}
          selectedIds={amenityIds}
          onSelectedChange={handleSelectedChange}
          highlightIds={highlightIds}
          onHighlightChange={setHighlightIds}
          roomName={form.watch("name")}
        />

        {/* ── Section 3: Gallery ── */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-[#3A4A1F]/10 p-2 text-[#3A4A1F]">
                <ImageIcon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Room Gallery</h3>
            </div>
            {isPending && !isUploading && (
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <Loader2 className="h-3 w-3 animate-spin" />
                Menyimpan galeri...
              </div>
            )}
          </div>

          <GalleryUploader
            villaId={villaId}
            roomTypeId={roomId}
            items={gallery}
            onChange={handleGalleryChange}
            onUploadStatusChange={setIsUploading}
          />
        </section>

        {/* ── Save bar ── */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isPending || !form.formState.isValid}
            className="h-12 px-8 rounded-xl bg-[#3A4A1F] text-white hover:bg-[#2E3C18] font-bold shadow-lg shadow-[#3A4A1F]/20"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Room Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
