import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface UploadResult {
  file: File;
  publicUrl: string;
}

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFiles = async (
    files: File[],
    villaId: string,
    roomTypeId?: string
  ): Promise<UploadResult[]> => {
    setIsUploading(true);
    setUploadProgress(0);
    const supabase = createClient();
    const results: UploadResult[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
        const path = roomTypeId
          ? `villas/rooms/${villaId}/${roomTypeId}/${uniqueName}`
          : `villas/villas/${villaId}/${uniqueName}`;

        const { error } = await supabase.storage
          .from("villa-media")
          .upload(path, file, { upsert: false, cacheControl: "3600" });

        if (error) throw new Error(`Upload gagal untuk ${file.name}: ${error.message}`);

        const { data } = supabase.storage.from("villa-media").getPublicUrl(path);
        results.push({ file, publicUrl: data.publicUrl });

        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }
      return results;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteFiles = async (urls: string[]) => {
    const supabase = createClient();
    const paths = urls.map((url) => {
      const parts = url.split("/villa-media/");
      return parts.length > 1 ? parts[1] : url;
    });
    if (paths.length > 0) {
      await supabase.storage.from("villa-media").remove(paths);
    }
  };

  return { uploadFiles, deleteFiles, isUploading, uploadProgress };
}
