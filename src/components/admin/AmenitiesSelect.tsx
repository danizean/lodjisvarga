"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";

interface Amenity {
  id: string;
  name: string;
  icon_name?: string | null;
}

interface AmenitiesSelectProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  label?: string;
}

export function AmenitiesSelect({ selectedIds, onChange, label }: AmenitiesSelectProps) {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [isAdding, startAdd] = useTransition();

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from("amenities").select("*").order("name");
      setAmenities(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(x => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const handleAddNew = () => {
    const name = newName.trim();
    if (!name) return;

    startAdd(async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("amenities")
        .insert({ name })
        .select()
        .single();

      if (error || !data) {
        toast.error("Gagal menambah fasilitas baru");
        return;
      }
      setAmenities(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      onChange([...selectedIds, data.id]);
      setNewName("");
      toast.success(`Fasilitas "${name}" ditambahkan`);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-500 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" /> Memuat fasilitas...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {label && <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>}

      {/* Badges multi-select */}
      <div className="flex flex-wrap gap-2">
        {amenities.map(am => {
          const selected = selectedIds.includes(am.id);
          return (
            <button
              type="button"
              key={am.id}
              onClick={() => toggle(am.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                selected
                  ? "bg-[#3A4A1F] text-white border-[#3A4A1F] shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-[#3A4A1F]/30 hover:bg-slate-50"
              }`}
            >
              {selected && <Check className="w-3 h-3" />}
              {am.name}
            </button>
          );
        })}
      </div>

      {/* Add new amenity inline */}
      <div className="flex gap-2 items-center">
        <Input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddNew(); } }}
          placeholder="Tambah fasilitas baru..."
          className="h-9 text-sm bg-slate-50 border-slate-200 max-w-[240px]"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleAddNew}
          disabled={!newName.trim() || isAdding}
          className="h-9 text-xs"
        >
          {isAdding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3 mr-1" />}
          Tambah
        </Button>
      </div>
    </div>
  );
}
