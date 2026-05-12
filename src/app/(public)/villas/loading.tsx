import { Loader2 } from "lucide-react";

export default function VillasLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-[#FAF8F4]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#3A4A1F]" />
        <p className="text-sm font-medium tracking-wide text-[#3A4A1F]/70">
          Memuat detail properti...
        </p>
      </div>
    </div>
  );
}
