"use client";

import { LucideDynamicIcon } from "@/components/shared/LucideDynamicIcon";
import { cn } from "@/lib/utils";

export type AmenityChipItem = {
  id?: string;
  name: string;
  icon_name?: string | null;
};

interface AmenityChipGroupProps {
  amenities: AmenityChipItem[];
  maxVisible?: number;
  containerClassName?: string;
  chipClassName?: string;
  iconClassName?: string;
  overflowClassName?: string;
  showOverflow?: boolean;
  legacyPoolBadge?: boolean;
  legacyPoolBadgeClassName?: string;
}

export function AmenityChipGroup({
  amenities,
  maxVisible = 4,
  containerClassName,
  chipClassName,
  iconClassName,
  overflowClassName,
  showOverflow = true,
  legacyPoolBadge = false,
  legacyPoolBadgeClassName,
}: AmenityChipGroupProps) {
  const visibleChips = amenities.slice(0, maxVisible);
  const overflowCount = Math.max(0, amenities.length - maxVisible);

  if (visibleChips.length === 0 && !legacyPoolBadge) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap gap-1.5", containerClassName)}>
      {visibleChips.map((amenity, index) => (
        <span
          key={amenity.id ?? `${amenity.name}-${index}`}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600",
            chipClassName
          )}
        >
          <LucideDynamicIcon
            iconName={amenity.icon_name ?? null}
            amenityName={amenity.name}
            className={cn("h-3 w-3 flex-shrink-0 text-[#3A4A1F]", iconClassName)}
          />
          {amenity.name}
        </span>
      ))}

      {showOverflow && overflowCount > 0 && (
        <span
          className={cn(
            "inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-400",
            overflowClassName
          )}
        >
          +{overflowCount} lainnya
        </span>
      )}

      {legacyPoolBadge && (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-900",
            legacyPoolBadgeClassName
          )}
        >
          <LucideDynamicIcon iconName="waves" className="h-3 w-3" />
          Private Pool
        </span>
      )}
    </div>
  );
}

