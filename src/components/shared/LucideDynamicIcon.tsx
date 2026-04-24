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
  Shirt
} from "lucide-react";

/**
 * STRICT ALLOW-LIST FOR ICONS
 * 
 * To prevent bundle bloat (loading all 1000+ lucide icons) and to ensure
 * runtime safety, any icon name from the database must be manually registered
 * here. If an amenity uses an icon_name not in this list, it will safely
 * fall back to the Sparkles icon.
 */
const ICON_MAP: Record<string, React.ElementType> = {
  waves: Waves, // For Private Pool
  wifi: Wifi,
  car: CarFront,
  coffee: Coffee,
  tv: Tv,
  wind: Wind, // For AC
  utensils: Utensils,
  bath: Bath,
  refrigerator: Refrigerator,
  flame: Flame, // For BBQ / Firepit
  dumbbell: Dumbbell,
  sparkles: Sparkles,
  "monitor-play": MonitorPlay,
  sofa: Sofa,
  "utensils-crossed": UtensilsCrossed,
  shirt: Shirt // For Laundry/Ironing
};

interface LucideDynamicIconProps {
  iconName?: string | null;
  className?: string;
}

export function LucideDynamicIcon({ iconName, className = "" }: LucideDynamicIconProps) {
  // Normalize the iconName
  const normalizedKey = iconName?.trim().toLowerCase();
  
  // Resolve the icon from the map, fallback to Sparkles
  const IconComponent = normalizedKey && ICON_MAP[normalizedKey] 
    ? ICON_MAP[normalizedKey] 
    : Sparkles;

  return <IconComponent className={className} />;
}
