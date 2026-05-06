"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Tag, Percent, ArrowRight } from "lucide-react";
import { format as formatDate } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import type { Database } from "@/types/database";

type PromoRow = Database["public"]["Tables"]["promos"]["Row"];
function formatDiscount(promo: PromoRow): string {
  if (promo.discount_type === "percentage" && promo.discount_value != null) {
    return `${promo.discount_value}% OFF`;
  }
  if (promo.discount_type === "fixed_amount" && promo.discount_value != null) {
    return `Hemat Rp ${promo.discount_value.toLocaleString("id-ID")}`;
  }
  return promo.discount_text ?? "";
}

function getDaysLeft(expiredAt: string): number | null {
  const now = new Date();
  const exp = new Date(expiredAt);
  const diff = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : null;
}

// ─── PromoCard ─────────────────────────────────────────────────────────────────
function PromoCard({ promo, index }: { promo: PromoRow; index: number }) {
  const imageUrl = promo.banner_image_url ?? promo.image_url;
  const daysLeft = promo.expired_at ? getDaysLeft(promo.expired_at) : null;
  const isUrgent = daysLeft !== null && daysLeft <= 3;
  const discountLabel = formatDiscount(promo);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.08, 0.24), ease: "easeOut" }}
      className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#3A4A1F]/8 transition-all duration-500 border border-[#3A4A1F]/5 hover:-translate-y-1"
    >
      {/* ── Image 1:1 ── */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100 flex-shrink-0">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={promo.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#3A4A1F]/5 to-[#D4AF37]/10">
            <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center">
              <Percent className="w-7 h-7 text-[#D4AF37]" aria-hidden="true" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#3A4A1F]/30">
              Promo Eksklusif
            </span>
          </div>
        )}

        {/* Bottom image overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Promo badge */}
        {promo.promo_badge && (
          <div className="absolute top-3 left-3 z-10 bg-[#D4AF37] text-white text-[9px] font-black uppercase tracking-[0.18em] px-3 py-1.5 rounded-full shadow-lg shadow-[#D4AF37]/30">
            {promo.promo_badge}
          </div>
        )}

        {/* Urgency pill */}
        {daysLeft !== null && (
          <div
            className={`absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wide shadow-md ${
              isUrgent
                ? "bg-rose-500 text-white shadow-rose-500/30"
                : "bg-white/90 backdrop-blur-md text-[#3A4A1F] border border-[#3A4A1F]/10"
            }`}
          >
            <Calendar className="w-2.5 h-2.5" aria-hidden="true" />
            {isUrgent ? `${daysLeft} hari lagi` : `${daysLeft}h tersisa`}
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="p-4 flex-1 flex flex-col gap-2">
        {/* Title + description */}
        <div className="space-y-1">
          <h2 className="font-serif text-base text-[#3A4A1F] leading-snug group-hover:text-[#2A3A0F] transition-colors duration-300">
            {promo.title}
          </h2>
          {promo.short_description && (
            <p className="text-[11px] text-gray-500 font-light leading-relaxed line-clamp-1">
              {promo.short_description}
            </p>
          )}
        </div>

        {/* Discount highlight */}
        {discountLabel && (
          <div className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-gradient-to-r from-[#3A4A1F]/5 to-[#D4AF37]/8 border border-[#D4AF37]/20 w-fit">
            <Tag className="w-3 h-3 text-[#D4AF37] flex-shrink-0" aria-hidden="true" />
            <span className="text-xs font-extrabold text-[#3A4A1F] tracking-tight">
              {discountLabel}
            </span>
          </div>
        )}

        {/* Promo code — display only */}
        <div className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-dashed border-[#3A4A1F]/15 bg-[#F7F6F2]">
          <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-gray-400">
            Kode
          </span>
          <span className="font-mono text-xs font-bold tracking-widest text-[#3A4A1F]">
            {promo.discount_code}
          </span>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-gray-100 space-y-2.5">
          {/* Expiry date */}
          {promo.expired_at && (
            <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
              <span>
                Berlaku hingga{" "}
                <span className={isUrgent ? "text-rose-500 font-bold" : "text-[#3A4A1F]/60 font-semibold"}>
                  {formatDate(new Date(promo.expired_at), "dd MMMM yyyy", { locale: idLocale })}
                </span>
              </span>
            </div>
          )}

          {/* CTA */}
          <Link
            href="/villas"
            className="flex items-center justify-center gap-2 w-full bg-[#3A4A1F] hover:bg-[#2A3A0F] text-white rounded-xl py-3.5 text-xs font-bold transition-colors duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3A4A1F]/50 group/link"
          >
            Lihat Unit
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

// ─── Exports ───────────────────────────────────────────────────────────────────
export { PromoCard };
export type { PromoRow };
