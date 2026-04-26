import {
  Sparkles,
  Waves,
  Wifi,
  CarFront,
  Coffee,
  Tv,
  Wind,
  Utensils,
  Bath,
  Refrigerator,
  Flame,
  Dumbbell,
  MonitorPlay,
  Sofa,
  UtensilsCrossed,
  Shirt,
  ShowerHead,
  Lock,
  Droplets,
  Thermometer,
} from "lucide-react";

/**
 * STRICT ALLOW-LIST FOR ICONS
 *
 * Icons are resolved in order:
 *   1. Exact match on icon_name from DB (e.g. "wind", "wifi")
 *   2. Keyword match on amenity name (for null icon_name fallback)
 *   3. Default: Sparkles
 */
const ICON_MAP: Record<string, React.ElementType> = {
  waves: Waves,
  wifi: Wifi,
  car: CarFront,
  "car-front": CarFront,
  coffee: Coffee,
  tv: Tv,
  wind: Wind,
  utensils: Utensils,
  bath: Bath,
  "shower-head": ShowerHead,
  refrigerator: Refrigerator,
  flame: Flame,
  dumbbell: Dumbbell,
  sparkles: Sparkles,
  "monitor-play": MonitorPlay,
  sofa: Sofa,
  "utensils-crossed": UtensilsCrossed,
  shirt: Shirt,
  lock: Lock,
  droplets: Droplets,
  thermometer: Thermometer,
};

/** Keyword → icon fallback when icon_name is null */
const KEYWORD_MAP: { keywords: string[]; icon: React.ElementType }[] = [
  { keywords: ["pool", "kolam", "renang", "swim"], icon: Waves },
  { keywords: ["wifi", "internet", "wi-fi"], icon: Wifi },
  { keywords: ["parkir", "parking", "garasi", "mobil"], icon: CarFront },
  { keywords: ["ac", "pendingin", "air cond", "aircond"], icon: Wind },
  { keywords: ["tv", "televisi", "netflix", "youtube", "streaming"], icon: Tv },
  { keywords: ["google tv"], icon: MonitorPlay },
  { keywords: ["kulkas", "fridge", "refrigerator"], icon: Refrigerator },
  { keywords: ["water heater", "pemanas", "hot water"], icon: ShowerHead },
  { keywords: ["sarapan", "breakfast", "coffee", "kopi"], icon: Coffee },
  { keywords: ["dapur", "kitchen", "masak", "utensil", "cooking"], icon: Utensils },
  { keywords: ["kamar mandi", "bathroom", "shower", "bath", "wc"], icon: Bath },
  { keywords: ["gym", "fitness", "olahraga", "dumbbell"], icon: Dumbbell },
  { keywords: ["sofa", "ruang tamu", "living"], icon: Sofa },
  { keywords: ["laundry", "cuci", "setrika", "ironing"], icon: Shirt },
  { keywords: ["bbq", "bakar", "grill", "fire"], icon: Flame },
  { keywords: ["safe", "kunci", "brankas", "locker"], icon: Lock },
];

function getIconByKeyword(name: string): React.ElementType {
  const lower = name.toLowerCase();
  const match = KEYWORD_MAP.find((entry) =>
    entry.keywords.some((kw) => lower.includes(kw))
  );
  return match?.icon ?? Sparkles;
}

interface LucideDynamicIconProps {
  iconName?: string | null;
  /** Amenity name — used as fallback when iconName is null */
  amenityName?: string;
  className?: string;
}

export function LucideDynamicIcon({
  iconName,
  amenityName,
  className = "",
}: LucideDynamicIconProps) {
  // 1. Exact match on iconName from DB
  const normalizedKey = iconName?.trim().toLowerCase();
  if (normalizedKey && ICON_MAP[normalizedKey]) {
    const IconComponent = ICON_MAP[normalizedKey];
    return <IconComponent className={className} />;
  }

  // 2. Keyword match on amenity name
  if (amenityName) {
    const IconComponent = getIconByKeyword(amenityName);
    return <IconComponent className={className} />;
  }

  // 3. Default fallback
  return <Sparkles className={className} />;
}
