"use client";

import { use, useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  updateRoomType, 
  addRoomTypeToVilla, 
  deleteRoomType 
} from "@/lib/actions/villas";
import { createClient } from "@/lib/supabase/client"; // Pastikan path ini benar
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, Save, Loader2, Plus, Trash2, 
  BedDouble, Users, Info 
} from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/shared/Container";

export default function OTAVillaRoomEditor({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const villaId = resolvedParams.id;
  const router = useRouter();
  
  const [villaData, setVillaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Fetch Data Villa & Room Types
  const fetchVilla = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("villas")
        .select("*, room_types(*)")
        .eq("id", villaId)
        .single();

      if (error) throw error;
      setVillaData(data);
    } catch (error: any) {
      toast.error("Failed to load villa data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVilla();
  }, [villaId]);

  // Handler: Tambah Kamar Baru
  const handleAddRoom = () => {
    startTransition(async () => {
      const newRoomData = {
        villa_id: villaId,
        name: "New Room Type",
        base_price: 1500000,
        capacity_adult: 2,
        capacity_child: 0,
        description: "New room description...",
      };

      const result = await addRoomTypeToVilla(newRoomData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("New room type created!");
        fetchVilla(); // Refresh data tanpa reload halaman
        router.refresh();
      }
    });
  };

  // Handler: Update Kamar
  const handleUpdateRoom = (rtId: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const payload = {
        name: formData.get("name") as string,
        base_price: Number(formData.get("base_price")),
        capacity_adult: Number(formData.get("capacity_adult")),
        capacity_child: Number(formData.get("capacity_child")),
        description: formData.get("description") as string,
      };
      
      const result = await updateRoomType(rtId, payload);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Room inventory updated");
        router.refresh();
      }
    });
  };

  // Handler: Hapus Kamar
  const handleDeleteRoom = (rtId: string) => {
    if (!confirm("Are you sure? This will remove this room from inventory.")) return;
    
    startTransition(async () => {
      const result = await deleteRoomType(rtId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Room type removed");
        setVillaData((prev: any) => ({
          ...prev,
          room_types: prev.room_types.filter((r: any) => r.id !== rtId)
        }));
        router.refresh();
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F6F2]">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#3A4A1F] mx-auto" />
          <p className="text-sm font-medium text-gray-500">Loading inventory system...</p>
        </div>
      </div>
    );
  }

  return (
    <Container className="py-10 space-y-8 bg-[#F7F6F2] min-h-screen pb-32">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/villas">
            <Button variant="outline" size="icon" className="rounded-full bg-white shadow-sm hover:bg-gray-50">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {villaData?.name}
            </h1>
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-2 mt-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Inventory & Pricing Manager
            </p>
          </div>
        </div>
        <Button 
          onClick={handleAddRoom} 
          disabled={isPending} 
          className="bg-[#3A4A1F] hover:bg-[#2A3A1F] text-white rounded-2xl h-12 px-6 shadow-lg shadow-[#3A4A1F]/20 transition-all active:scale-95"
        >
          {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-5 h-5 mr-2" />}
          Add New Unit Type
        </Button>
      </div>

      {/* Room List Grid */}
      <div className="grid gap-8">
        {villaData?.room_types?.map((rt: any, index: number) => (
          <form 
            key={rt.id} 
            onSubmit={(e) => handleUpdateRoom(rt.id, e)} 
            className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden group hover:border-emerald-200 transition-all"
          >
            <div className="flex flex-col lg:flex-row">
              {/* Sidebar Info */}
              <div className="bg-slate-50 p-8 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-200 min-w-[200px]">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BedDouble className="w-8 h-8 text-[#3A4A1F]" />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Unit Category</span>
                <p className="text-xl font-black text-slate-900 mt-1">#{index + 1}</p>
              </div>

              {/* Input Fields */}
              <div className="p-8 flex-1 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Info className="w-3 h-3" /> Room Name
                    </label>
                    <Input name="name" defaultValue={rt.name} required className="h-12 bg-slate-50 border-slate-200 rounded-xl focus:ring-emerald-500" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      IDR / Night
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                      <Input name="base_price" type="number" defaultValue={rt.base_price} required className="h-12 pl-10 bg-slate-50 border-slate-200 rounded-xl font-mono font-bold" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Users className="w-3 h-3" /> Max Capacity
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input name="capacity_adult" type="number" defaultValue={rt.capacity_adult} placeholder="Adult" className="h-12 bg-slate-50 border-slate-200 rounded-xl" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">Adult</span>
                      </div>
                      <div className="relative flex-1">
                        <Input name="capacity_child" type="number" defaultValue={rt.capacity_child} placeholder="Child" className="h-12 bg-slate-50 border-slate-200 rounded-xl" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">Child</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Inventory Description</label>
                  <textarea 
                    name="description" 
                    defaultValue={rt.description}
                    placeholder="Describe the unique features of this unit..."
                    className="w-full min-h-[100px] p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
                  />
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <Button 
                    type="button" 
                    onClick={() => handleDeleteRoom(rt.id)} 
                    disabled={isPending} 
                    variant="ghost" 
                    className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl px-4 h-10 font-bold text-xs"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> 
                    Delete Room Type
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isPending} 
                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-10 px-8 font-bold text-xs shadow-lg shadow-slate-200 transition-all active:scale-95"
                  >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Architecture
                  </Button>
                </div>
              </div>
            </div>
          </form>
        ))}

        {/* Empty State */}
        {villaData?.room_types?.length === 0 && (
          <div className="bg-white rounded-[40px] border-2 border-dashed border-slate-200 p-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <BedDouble className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-900">No Inventory Found</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto text-sm">
              Start by creating your first room category (e.g., Luxury King Room) to begin accepting bookings.
            </p>
            <Button 
              onClick={handleAddRoom} 
              disabled={isPending} 
              className="mt-8 bg-[#3A4A1F] hover:bg-[#2A3A1F] text-white rounded-2xl h-12 px-8"
            >
              <Plus className="w-5 h-5 mr-2" /> Create First Room Type
            </Button>
          </div>
        )}
      </div>
    </Container>
  );
}