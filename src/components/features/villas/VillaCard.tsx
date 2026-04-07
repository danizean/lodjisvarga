"use client";

import Image from "next/image";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Star, MapPin, Users, Check, Tag, BedDouble, SquareFoot } from "lucide-react";
import type { VillaData } from "@/components/sections/FeaturedVillasClient";

interface VillaCardProps {
  villa: VillaData;
}

export function VillaCard({ villa }: VillaCardProps) {
  // 1. Data Logic: Gallery & Primary Image
  const primaryImage = villa.gallery?.find(g => g.is_primary)?.image_url 
    || villa.gallery?.[0]?.image_url 
    || "/assets/placeholder-villa.webp";

  // 2. Data Logic: Room Type & Pricing
  // Kita ambil room_type pertama sebagai representasi di card
  const room = villa.room_types?.[0];
  const basePrice = room?.base_price || 0;
  const breakfastPrice = basePrice + 250000; // Contoh logic penambahan harga breakfast

  // 3. Formatting Currency
  const formatIDR = (price: number) => 
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  // 4. Amenities Logic (villas_amenities join)
  const topAmenities = villa.villa_amenities?.slice(0, 4).map(va => va.amenities);

  // 5. WhatsApp Link Logic
  const waMessage = encodeURIComponent(`Halo Lodjisvarga, saya tertarik untuk booking villa: ${villa.name}`);
  const waLink = `https://wa.me/${villa.whatsapp_number?.replace(/\D/g, "")}?text=${waMessage}`;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col transform hover:-translate-y-2 group">
      
      {/* Image Container with Hover Effect */}
      <div className="relative h-64 overflow-hidden">
        <Image
          src={primaryImage}
          alt={villa.name}
          fill
          className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        
        {/* Rating Badge */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-gray-900 flex items-center gap-1 z-10 pointer-events-none">
          <Star className="w-3.5 h-3.5 fill-[#3A4A1F] text-[#3A4A1F]" />
          4.9
        </div>

        {/* Status Overlay (Optional) */}
        {villa.status === 'coming_soon' && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
             <span className="text-white font-bold tracking-widest uppercase text-xs border border-white px-4 py-2">Coming Soon</span>
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col">
        {/* Title & Short Info */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-serif text-xl font-bold text-gray-900 line-clamp-1">
            {villa.name}
          </h3>
        </div>
        <p className="text-sm text-gray-500 mb-6 line-clamp-2 leading-relaxed">
          {villa.description || `Luxury villa experience at ${villa.address}. Perfect for romantic getaways.`}
        </p>

        {/* Dynamic Features Grid (Based on DB Room Data) */}
        <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-6 text-xs text-gray-600 border-b border-gray-200 pb-6">
          <div className="flex items-center gap-2">
            <BedDouble className="w-3.5 h-3.5 text-[#3A4A1F]" />
            {room?.name || "Standard Bed"}
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-[#3A4A1F]" />
            Up to {room?.capacity_adult || 2} Guests
          </div>
          {topAmenities?.map((am, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#3A4A1F]" />
              {am?.name}
            </div>
          ))}
        </div>

        {/* Pricing Section (Dynamic & Modern) */}
        <div className="mt-auto">
          <div className="flex flex-col mb-4 space-y-2">
            <div className="flex justify-between items-center mb-1 border-b border-gray-100 pb-2">
              <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Publish Rate
              </span>
              <span className="text-xs text-gray-500 font-medium tracking-wide">Start from</span>
            </div>

            {/* Room Only Option */}
            <div className="flex justify-between items-center bg-gray-50/50 p-2 rounded-lg border border-gray-100 transition-colors hover:bg-gray-50">
              <span className="text-sm text-gray-600 font-medium">Room Only</span>
              <div className="font-bold text-sm text-gray-700 text-right flex items-baseline gap-1">
                {formatIDR(basePrice)}
                <span className="text-[10px] text-gray-500 font-normal">/night</span>
              </div>
            </div>

            {/* Incl Breakfast Option */}
            <div className="flex justify-between items-center bg-[#3A4A1F]/5 p-2.5 rounded-lg border border-[#3A4A1F]/20 transition-colors hover:bg-[#3A4A1F]/10 shadow-sm">
              <span className="text-sm text-[#3A4A1F] font-bold">Incl. Breakfast</span>
              <div className="font-bold text-lg text-[#3A4A1F] text-right flex items-baseline gap-1">
                {formatIDR(breakfastPrice)}
                <span className="text-xs text-[#3A4A1F]/80 font-normal">/night</span>
              </div>
            </div>
          </div>

          <p className="text-xs font-bold text-gray-900 mb-3 text-center uppercase tracking-wider">
            Booking Options
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Link 
              href={waLink} 
              target="_blank"
              className="col-span-2 flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[#25D366] text-white hover:bg-[#128C7E] transition-all shadow-md group"
            >
              <span className="font-bold text-sm">WhatsApp</span>
            </Link>
            
            <Link 
              href={`/villas/${villa.slug}`}
              className="col-span-2 flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[#3A4A1F] text-white hover:bg-[#2A3A1F] transition-all shadow-md group"
            >
              <Tag className="w-4 h-4" />
              <span className="font-bold text-sm">Website</span>
            </Link>

            {/* Social/OTA Badges */}
            <div className="flex items-center justify-center py-2.5 px-3 rounded-lg border border-gray-200 bg-white hover:border-blue-400 transition-all opacity-70 hover:opacity-100 cursor-pointer">
              <span className="font-bold text-xs text-[#1BA0E2]">Traveloka</span>
            </div>
            <div className="flex items-center justify-center py-2.5 px-3 rounded-lg border border-gray-200 bg-white hover:border-red-400 transition-all opacity-70 hover:opacity-100 cursor-pointer">
              <span className="font-bold text-xs text-[#FF5A5F]">Airbnb</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}