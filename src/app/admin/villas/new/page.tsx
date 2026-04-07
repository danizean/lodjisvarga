"use client";

import { useState, useTransition, useMemo, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { saveFullVillaData } from "@/lib/actions/villas";
import { useUpload } from "@/hooks/use-upload";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { slugify } from "@/lib/utils/slug";
import { 
  ArrowLeft, Save, Loader2, ImagePlus, Plus, 
  Trash2, BedDouble, MapPin, Phone, Check, Info, Layout,
  Globe, AlertCircle, X
} from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/shared/Container";

// --- Types Sesuai Skema Database ---
interface RoomType {
  id: string;
  name: string;
  base_price: number;
  capacity_adult: number;
  capacity_child: number;
  description: string;
  amenity_ids: string[]; // Untuk junction table room_type_amenities
  files_to_upload: File[];
}

interface VillaData {
  name: string;
  description: string;
  address: string;
  gmaps_url: string;
  whatsapp_number: string;
  status: "active" | "coming_soon" | "inactive";
}

// Data Amenitas (Idealnya di-fetch dari table public.amenities)
const MOCK_AMENITIES = [
  { id: "1000-01", name: "Private Pool" },
  { id: "1000-02", name: "High-speed WiFi" },
  { id: "1000-03", name: "Kitchen" },
  { id: "1000-04", name: "Parking Area" },
];

export default function MasterVillaForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { uploadFiles, isUploading } = useUpload();
  const [activeTab, setActiveTab] = useState("info");

  // ID Villa tetap (Deterministic UUID)
  const [villaId] = useState(() => crypto.randomUUID());

  // --- State Utama ---
  const [formData, setFormData] = useState<VillaData>({
    name: "",
    description: "",
    address: "",
    gmaps_url: "",
    whatsapp_number: "",
    status: "active", 
  });

  const [villaAmenities, setVillaAmenities] = useState<string[]>([]);
  const [villaFiles, setVillaFiles] = useState<File[]>([]);
  
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([
    {
      id: crypto.randomUUID(),
      name: "Deluxe Suite",
      base_price: 1500000,
      capacity_adult: 2,
      capacity_child: 0,
      description: "",
      amenity_ids: [],
      files_to_upload: []
    }
  ]);

  const computedSlug = useMemo(() => slugify(formData.name), [formData.name]);

  // --- Handlers ---
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleAmenity = (id: string, target: 'villa' | string) => {
    if (target === 'villa') {
      setVillaAmenities(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
    } else {
      setRoomTypes(prev => prev.map(rt => 
        rt.id === target 
          ? { ...rt, amenity_ids: rt.amenity_ids.includes(id) ? rt.amenity_ids.filter(a => a !== id) : [...rt.amenity_ids, id] }
          : rt
      ));
    }
  };

  // --- Flow Eksekusi ---
  const handlePublish = async () => {
    // 1. Validasi Field Wajib (villas table NOT NULL constraints)
    if (!formData.name.trim() || !formData.address.trim()) {
      setActiveTab("info");
      return toast.error("Validation Error", { description: "Name and Address are required." });
    }

    startTransition(async () => {
      const toastId = toast.loading("Deploying Property to Platform...");
      try {
        // STEP 1: Upload Gallery Villa (public.gallery)
        let villaGallery = [];
        if (villaFiles.length > 0) {
          const uploaded = await uploadFiles(villaFiles, `villas/${villaId}`);
          villaGallery = uploaded.map((file, i) => ({
            villa_id: villaId,
            image_url: file.publicUrl,
            is_primary: i === 0,
            display_order: i
          }));
        }

        // STEP 2: Upload Gallery Room & Process Room Data (public.room_types)
        const processedRooms = await Promise.all(roomTypes.map(async (room) => {
          let roomGallery = [];
          if (room.files_to_upload.length > 0) {
            const uploaded = await uploadFiles(room.files_to_upload, `rooms/${room.id}`);
            roomGallery = uploaded.map((file, i) => ({
              room_type_id: room.id,
              image_url: file.publicUrl,
              is_primary: i === 0,
              display_order: i
            }));
          }
          return {
            ...room,
            gallery: roomGallery
          };
        }));

        // STEP 3: Payload Construction Sesuai Skema
        const finalPayload = {
          villa: {
            id: villaId,
            ...formData,
            slug: computedSlug,
          },
          villa_amenities: villaAmenities, // Untuk tabel villa_amenities
          room_types: processedRooms,     // Untuk tabel room_types & room_type_amenities
          gallery: villaGallery,          // Untuk tabel gallery
        };

        const result = await saveFullVillaData(finalPayload as any);
        if (result?.error) throw new Error(result.error);

        toast.success("Success!", { id: toastId, description: "Villa architecture synchronized." });
        router.push("/admin/villas");
        router.refresh();

      } catch (error: any) {
        toast.error("Deployment Failed", { id: toastId, description: error.message });
      }
    });
  };

  return (
    <Container className="py-10 space-y-8 bg-[#F8FAFC] min-h-screen pb-44">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin/villas">
            <Button variant="outline" size="icon" className="rounded-2xl bg-white border-slate-200 shadow-sm">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Setup New Property</h1>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mt-1">
              <Globe className="w-3 h-3" /> /{computedSlug || "villa-slug"}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <div className="col-span-12 lg:col-span-3 space-y-3">
          {[
            { id: "info", label: "General Info", icon: Info },
            { id: "amenities", label: "Facilities", icon: Check },
            { id: "rooms", label: "Inventory", icon: Layout },
            { id: "gallery", label: "Gallery", icon: ImagePlus },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all border ${
                activeTab === tab.id 
                ? "bg-slate-900 text-white border-slate-900 shadow-xl" 
                : "bg-white text-slate-500 border-slate-100 shadow-sm"
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="col-span-12 lg:col-span-9 bg-white rounded-[32px] border border-slate-200/60 shadow-sm p-10">
          
          {/* TAB: INFO */}
          {activeTab === "info" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest px-1">Villa Name *</label>
                  <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="Lodjisvarga Uluwatu" className="h-14 rounded-xl bg-slate-50/50 border-slate-200 font-medium text-lg" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest px-1">WA Integration</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input name="whatsapp_number" value={formData.whatsapp_number} onChange={handleInputChange} placeholder="62812..." className="h-14 pl-12 rounded-xl bg-slate-50/50" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 tracking-widest px-1">Main Address *</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                  <textarea name="address" value={formData.address} onChange={handleInputChange} className="w-full min-h-[120px] pl-12 p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all" placeholder="Jalan Raya Uluwatu No. 88..." />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest px-1">Property Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="w-full h-14 px-4 rounded-xl border border-slate-200 bg-white text-sm font-bold cursor-pointer">
                    <option value="active">🟢 Active & Published</option>
                    <option value="coming_soon">🟡 Coming Soon</option>
                    <option value="inactive">🔴 Inactive / Draft</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest px-1">G-Maps URL</label>
                  <Input name="gmaps_url" value={formData.gmaps_url} onChange={handleInputChange} placeholder="https://maps.google.com/..." className="h-14 rounded-xl" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 tracking-widest px-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full min-h-[150px] p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm" placeholder="Write property story..." />
              </div>
            </div>
          )}

          {/* TAB: AMENITIES */}
          {activeTab === "amenities" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="font-bold text-slate-900 px-1">Villa Facilities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {MOCK_AMENITIES.map(am => (
                  <div key={am.id} onClick={() => toggleAmenity(am.id, 'villa')}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      villaAmenities.includes(am.id) ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm" : "border-slate-100 text-slate-400"
                    }`}>
                    <span className="text-sm font-bold">{am.name}</span>
                    {villaAmenities.includes(am.id) && <Check className="w-4 h-4" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: ROOMS */}
          {activeTab === "rooms" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {roomTypes.map((room, idx) => (
                <div key={room.id} className="p-8 rounded-[32px] border border-slate-100 bg-slate-50/30 space-y-6 relative group transition-all hover:bg-white hover:shadow-2xl hover:shadow-slate-100/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 border border-slate-100 shadow-sm">
                        <BedDouble className="w-6 h-6" />
                      </div>
                      <h4 className="font-black text-slate-800">Unit Type #{idx + 1}</h4>
                    </div>
                    {idx > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => setRoomTypes(prev => prev.filter(r => r.id !== room.id))} className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete Unit
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Room Name</label>
                      <Input value={room.name} onChange={e => setRoomTypes(prev => prev.map(r => r.id === room.id ? {...r, name: e.target.value} : r))} className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Base Price / Night</label>
                      <Input type="number" value={room.base_price} onChange={e => setRoomTypes(prev => prev.map(r => r.id === room.id ? {...r, base_price: Number(e.target.value)} : r))} className="h-12 rounded-xl font-mono" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Capacity (Adult/Child)</label>
                      <div className="flex gap-2">
                        <Input type="number" value={room.capacity_adult} onChange={e => setRoomTypes(prev => prev.map(r => r.id === room.id ? {...r, capacity_adult: Number(e.target.value)} : r))} placeholder="Adults" className="rounded-xl" />
                        <Input type="number" value={room.capacity_child} onChange={e => setRoomTypes(prev => prev.map(r => r.id === room.id ? {...r, capacity_child: Number(e.target.value)} : r))} placeholder="Children" className="rounded-xl" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Room Gallery</label>
                      <label className="flex items-center justify-center h-12 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer bg-white hover:border-slate-900 transition-all text-[11px] font-bold text-slate-500">
                        <ImagePlus className="w-4 h-4 mr-2" /> {room.files_to_upload.length} Files Queued
                        <input type="file" multiple className="hidden" accept="image/*" onChange={e => e.target.files && setRoomTypes(prev => prev.map(r => r.id === room.id ? {...r, files_to_upload: [...r.files_to_upload, ...Array.from(e.target.files!)]} : r))} />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Room Facilities</label>
                    <div className="flex flex-wrap gap-2">
                      {MOCK_AMENITIES.map(am => (
                        <button key={am.id} onClick={() => toggleAmenity(am.id, room.id)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                            room.amenity_ids.includes(am.id) ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white text-slate-400 border-slate-100"
                          }`}>{am.name}</button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full py-10 border-dashed border-2 rounded-[32px] text-slate-400 hover:text-slate-900 transition-all" 
                onClick={() => setRoomTypes([...roomTypes, { id: crypto.randomUUID(), name: "", base_price: 0, capacity_adult: 2, capacity_child: 0, description: "", amenity_ids: [], files_to_upload: [] }])}>
                <Plus className="w-5 h-5 mr-2" /> Add Room Category
              </Button>
            </div>
          )}

          {/* TAB: GALLERY */}
          {activeTab === "gallery" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="relative border-4 border-dashed border-slate-50 rounded-[40px] p-20 flex flex-col items-center justify-center bg-slate-50/50 group hover:bg-slate-50 transition-all">
                <input type="file" multiple accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={e => e.target.files && setVillaFiles(prev => [...prev, ...Array.from(e.target.files!)])} />
                <div className="p-6 bg-white rounded-3xl shadow-sm mb-4 group-hover:scale-110 transition-transform">
                  <ImagePlus className="w-12 h-12 text-slate-900" />
                </div>
                <h4 className="text-xl font-black text-slate-700">Master Villa Media</h4>
                <p className="text-sm text-slate-400 mt-1 italic font-medium tracking-tight text-center">Recommended: 1920x1080px (Max 5MB each)</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {villaFiles.map((file, i) => (
                  <div key={i} className="aspect-square bg-slate-100 rounded-3xl relative overflow-hidden group border border-slate-100">
                    <div className="absolute inset-0 flex items-center justify-center p-4 text-[10px] text-slate-300 text-center italic break-all font-medium">{file.name}</div>
                    {i === 0 && <div className="absolute top-3 left-3 bg-slate-900 text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-lg z-20">COVER</div>}
                    <button onClick={() => setVillaFiles(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-3 right-3 p-2 bg-white text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-md">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-10 left-0 right-0 z-50 flex justify-center px-6">
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-5 rounded-[32px] shadow-2xl flex items-center justify-between w-full max-w-6xl">
          <div className="hidden sm:flex items-center gap-6 px-4">
            <div className="flex flex-col">
              <h4 className="text-white font-bold text-sm">Deployment Mode</h4>
              <p className="text-slate-400 text-[10px] font-medium tracking-widest uppercase italic">platform-v3.0</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex gap-5">
              <div className="text-center">
                <p className="text-white font-black text-xs">{roomTypes.length}</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase">Units</p>
              </div>
              <div className="text-center">
                <p className="text-white font-black text-xs">{villaFiles.length}</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase">Media</p>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handlePublish} 
            disabled={isPending || isUploading} 
            className="h-14 px-12 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 transition-all min-w-[220px]"
          >
            {isPending || isUploading ? (
              <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Synchronizing...</>
            ) : (
              <><Save className="w-5 h-5 mr-3" /> Publish to OTA</>
            )}
          </Button>
        </div>
      </div>
    </Container>
  );
}