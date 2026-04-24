"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Info, Image as ImageIcon, BedDouble, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface VillaTabsProps {
  villaId: string;
}

export function VillaTabs({ villaId }: VillaTabsProps) {
  const pathname = usePathname();
  
  const tabs = [
    {
      name: "Details",
      href: `/admin/villas/${villaId}/details`,
      icon: Info,
    },
    {
      name: "Amenities",
      href: `/admin/villas/${villaId}/amenities`,
      icon: Star,
    },
    {
      name: "Media",
      href: `/admin/villas/${villaId}/media`,
      icon: ImageIcon,
    },
    {
      name: "Rooms",
      href: `/admin/villas/${villaId}/rooms`,
      icon: BedDouble,
    },
  ];

  return (
    <div className="mt-8 border-b border-slate-200">
      <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "group inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-semibold transition-colors",
                isActive
                  ? "border-[#3A4A1F] text-[#3A4A1F]"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={cn(
                  "h-4 w-4",
                  isActive ? "text-[#3A4A1F]" : "text-slate-400 group-hover:text-slate-500"
                )}
                aria-hidden="true"
              />
              {tab.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
