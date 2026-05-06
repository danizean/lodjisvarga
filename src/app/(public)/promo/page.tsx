import type { Metadata } from "next";
import { getPublicPromos } from "@/lib/queries/promos";
import { Container } from "@/components/shared/Container";
import { Tag } from "lucide-react";
import Link from "next/link";
import { PromoCard } from "./PromoCard";

export const metadata: Metadata = {
  title: "Promo & Penawaran Eksklusif | Lodjisvarga",
  description:
    "Temukan promo, diskon, dan penawaran eksklusif terbaru untuk menginap di Lodjisvarga Yogyakarta.",
};

export const dynamic = "force-dynamic";

export default async function PromoPage() {
  const promos = await getPublicPromos();

  return (
    <main className="bg-[#F7F6F2] min-h-screen pt-28 pb-28">
      <Container className="max-w-6xl px-6">

        {/* ── Section Header ─────────────────────────────────────────────── */}
        <div className="max-w-2xl mx-auto text-center mb-14 md:mb-20 space-y-5">
          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-8 md:w-12 bg-[#D4AF37]/50" />
            <span className="text-[#D4AF37] font-bold tracking-[0.4em] uppercase text-[10px] md:text-xs">
              Penawaran Spesial
            </span>
            <div className="h-px w-8 md:w-12 bg-[#D4AF37]/50" />
          </div>

          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#3A4A1F] leading-tight tracking-tight">
            Penawaran{" "}
            <span className="italic text-[#D4AF37]">Eksklusif</span>
          </h1>

          <p className="text-gray-500 font-light leading-relaxed text-sm md:text-base max-w-lg mx-auto">
            Sempurnakan pengalaman menginap Anda di Lodjisvarga dengan penawaran istimewa yang kami rancang khusus untuk Anda.
          </p>
        </div>

        {/* ── Content ────────────────────────────────────────────────────── */}
        {promos.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {promos.map((promo, index) => (
              <PromoCard key={promo.id} promo={promo} index={index} />
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}

// ── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-8 text-center bg-white rounded-[3rem] border border-dashed border-[#3A4A1F]/10 max-w-xl mx-auto shadow-sm">
      <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/8 border border-[#D4AF37]/15 flex items-center justify-center mb-6 rotate-3">
        <Tag className="w-7 h-7 text-[#D4AF37]/50" aria-hidden="true" />
      </div>
      <h2 className="font-serif text-2xl text-[#3A4A1F] mb-3">
        Belum Ada Promo Saat Ini
      </h2>
      <p className="text-gray-500 font-light text-sm max-w-xs leading-relaxed mb-8">
        Kami sedang menyiapkan penawaran menarik lainnya. Silakan cek kembali nanti atau hubungi kami untuk informasi penawaran khusus.
      </p>
      <Link
        href="/villas"
        className="rounded-full bg-[#3A4A1F] px-8 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-[#2A3A0F] hover:shadow-lg hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3A4A1F]/50 focus-visible:ring-offset-2"
      >
        Lihat Semua Villa
      </Link>
    </div>
  );
}
