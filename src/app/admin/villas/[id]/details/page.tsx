"use client";

import { use, useEffect, useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Save, Loader2, Globe, Phone, CheckCircle2, AlertTriangle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { saveVillaDetails, checkSlugAvailability } from "@/lib/actions/villas";
import { villaDetailsSchema, type VillaDetailsFormData } from "@/lib/validations/villa-tabs";

export default function VillaDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isCreate = id === "new";
  const router = useRouter();

  const [loading, setLoading] = useState(!isCreate);
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "ok" | "taken">("idle");
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const form = useForm<VillaDetailsFormData>({
    resolver: zodResolver(villaDetailsSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      address: "",
      gmaps_url: "",
      whatsapp_number: "",
      default_whatsapp_message: "",
      status: "coming_soon",
    },
  });

  // Generate slug automatically only when creating
  const nameValue = form.watch("name");
  useEffect(() => {
    if (isCreate && nameValue && !form.formState.dirtyFields.slug) {
      const generated = nameValue
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
        .replace(/^-|-$/g, "");
      
      form.setValue("slug", generated, { shouldValidate: true });
    }
  }, [nameValue, isCreate, form]);

  // Check slug availability
  const slugValue = form.watch("slug");
  useEffect(() => {
    if (!slugValue || slugValue.length < 3) {
      setSlugStatus("idle");
      return;
    }
    
    let cancelled = false;
    const timer = setTimeout(async () => {
      if (cancelled) return;
      setSlugStatus("checking");
      const res = await checkSlugAvailability(slugValue, isCreate ? undefined : id);
      if (cancelled) return;
      setSlugStatus(res.available ? "ok" : "taken");
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [slugValue, id, isCreate]);

  // Initial Data Fetching
  useEffect(() => {
    if (isCreate) return;

    async function load() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("villas")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        toast.error("Properti tidak ditemukan");
        setLoading(false);
        return;
      }

      form.reset({
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description ?? "",
        address: data.address ?? "",
        gmaps_url: data.gmaps_url ?? "",
        whatsapp_number: data.whatsapp_number ?? "",
        default_whatsapp_message: data.default_whatsapp_message ?? "",
        status: (data.status as "active" | "coming_soon" | "inactive") ?? "coming_soon",
      });
      setLoading(false);
    }
    load();
  }, [id, isCreate, form]);

  // Hybrid Autosave Logic
  useEffect(() => {
    // Only subscribe to changes if not creating. For creation, force manual save.
    if (isCreate) return;
    
    const subscription = form.watch((value, { type }) => {
      // type is the input name or undefined if manual setValue
      if (!type) return;

      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }

      setSaveStatus("idle");
      
      autosaveTimerRef.current = setTimeout(async () => {
        // Validate before autosaving
        const isValid = await form.trigger();
        if (isValid && slugStatus !== "taken") {
          performSave(form.getValues(), true);
        }
      }, 1500); // 1.5s debounce
    });

    return () => subscription.unsubscribe();
  }, [form, isCreate, slugStatus]);

  const performSave = async (data: VillaDetailsFormData, isAutosave = false) => {
    setSaveStatus("saving");
    
    // Explicit transition only for manual saves so we don't block UI on autosave
    const action = async () => {
      const res = await saveVillaDetails(data);
      if (res.error) {
        setSaveStatus("error");
        if (!isAutosave) toast.error(res.error);
        return;
      }

      setSaveStatus("saved");
      if (!isAutosave) {
        toast.success(isCreate ? "Properti berhasil dibuat" : "Perubahan disimpan");
      }
      
      // Clear saved status after a few seconds
      setTimeout(() => {
        setSaveStatus((current) => current === "saved" ? "idle" : current);
      }, 3000);

      if (isCreate && res.villa_id) {
        router.push(`/admin/villas/${res.villa_id}/details`);
      }
    };

    if (isAutosave) {
      action();
    } else {
      startTransition(action);
    }
  };

  const onSubmit = (data: VillaDetailsFormData) => {
    if (slugStatus === "taken") {
      toast.error("Slug sudah dipakai. Ganti sebelum menyimpan.");
      return;
    }
    
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
    performSave(data, false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#3A4A1F]" />
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Indicator Section */}
      <div className="flex items-center justify-end h-8">
        {saveStatus === "saving" && (
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Saving...</span>
          </div>
        )}
        {saveStatus === "saved" && (
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>Saved to draft</span>
          </div>
        )}
        {saveStatus === "error" && (
          <div className="flex items-center gap-2 text-sm font-medium text-red-500">
            <AlertTriangle className="h-4 w-4" />
            <span>Autosave failed</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-5">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Property Name</label>
                <Input 
                  {...form.register("name")} 
                  placeholder="e.g. Lodji Svarga Ubud" 
                  className="h-11 rounded-xl bg-slate-50 border-slate-200"
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  URL Slug
                  {slugStatus === "checking" && <Loader2 className="h-3 w-3 animate-spin text-slate-400" />}
                  {slugStatus === "ok" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                  {slugStatus === "taken" && <span className="text-[10px] text-red-500 lowercase">Taken</span>}
                </label>
                <Input 
                  {...form.register("slug")} 
                  className={`h-11 rounded-xl bg-slate-50 border-slate-200 font-mono text-sm ${
                    slugStatus === "taken" ? "border-red-300 focus-visible:ring-red-300" : ""
                  }`}
                />
                {form.formState.errors.slug && (
                  <p className="text-xs text-red-500">{form.formState.errors.slug.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Description</label>
              <Textarea 
                {...form.register("description")} 
                rows={5} 
                placeholder="Describe the positioning, atmosphere, and key features."
                className="resize-none rounded-xl bg-slate-50 border-slate-200"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-5">Location</h2>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Full Address</label>
                <Textarea 
                  {...form.register("address")} 
                  rows={3} 
                  placeholder="Street, area, city, province..."
                  className="resize-none rounded-xl bg-slate-50 border-slate-200"
                />
                {form.formState.errors.address && (
                  <p className="text-xs text-red-500">{form.formState.errors.address.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <Globe className="h-3.5 w-3.5" />
                  Google Maps URL
                </label>
                <Input 
                  {...form.register("gmaps_url")} 
                  placeholder="https://maps.google.com/..." 
                  className="h-11 rounded-xl bg-slate-50 border-slate-200"
                />
                {form.formState.errors.gmaps_url && (
                  <p className="text-xs text-red-500">{form.formState.errors.gmaps_url.message}</p>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Context */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-5">Communication</h2>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <Phone className="h-3.5 w-3.5" />
                  WhatsApp Number
                </label>
                <Input 
                  {...form.register("whatsapp_number")} 
                  placeholder="628123456789" 
                  className="h-11 rounded-xl bg-slate-50 border-slate-200 font-mono text-sm"
                />
                {form.formState.errors.whatsapp_number && (
                  <p className="text-xs text-red-500">{form.formState.errors.whatsapp_number.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Default Message</label>
                <Textarea 
                  {...form.register("default_whatsapp_message")} 
                  rows={4} 
                  placeholder="Hi, I would like to know more..."
                  className="resize-none rounded-xl bg-slate-50 border-slate-200"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-5">Visibility</h2>
            
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Status</label>
              <Select 
                value={form.watch("status")} 
                onValueChange={(val) => form.setValue("status", val as any, { shouldValidate: true, shouldDirty: true })}
              >
                <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active / Published</SelectItem>
                  <SelectItem value="coming_soon">Coming Soon</SelectItem>
                  <SelectItem value="inactive">Inactive / Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </section>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          type="submit" 
          disabled={isPending || !form.formState.isValid || slugStatus === "taken"} 
          className="h-12 px-8 rounded-xl bg-[#3A4A1F] text-white hover:bg-[#2E3C18] font-bold shadow-lg shadow-[#3A4A1F]/20"
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {isCreate ? "Create Property" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
