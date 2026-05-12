import { Loader2 } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F6F2]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#3A4A1F]" />
        <p className="text-sm font-medium tracking-wide text-[#3A4A1F]/70">
          Memuat halaman...
        </p>
      </div>
    </div>
  );
}
