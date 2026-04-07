import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

// We use the public supabase client for uploads over RLS since images should go to public bucket
// Note: Bypassing RLS requires proper policies in Supabase Storage or an anon service key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFiles = async (files: File[], villaId: string, roomTypeId?: string) => {
    setIsUploading(true);
    const uploadedUrls: { file: File, publicUrl: string }[] = [];

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        
        const path = roomTypeId 
          ? `villas/${villaId}/rooms/${roomTypeId}/${fileName}`
          : `villas/${villaId}/${fileName}`;

        const { error } = await supabase.storage
          .from("villa-media")
          .upload(path, file, { upsert: true });

        if (error) {
          console.error("Upload error:", error);
          throw error;
        }

        const { data } = supabase.storage.from("villa-media").getPublicUrl(path);

        uploadedUrls.push({
          file,
          publicUrl: data.publicUrl
        });
      }

      return uploadedUrls;
    } catch (e) {
      throw e;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFiles, isUploading };
}
