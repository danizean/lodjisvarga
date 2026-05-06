export type VillaStatus = "active" | "coming_soon" | "inactive" | string;

export type ActivePromoData = {
  id: string;
  title: string;
  discount_code: string;
  discount_type: string | null;
  discount_value: number | null;
  discount_text: string | null;
  start_date?: string | null;
  expired_at: string | null;
  status: string | null;
} | null;

export type AmenityData = {
  id: string;
  name: string;
  icon_name: string | null;
};

export type RoomTypeGalleryImage = {
  image_url: string;
  is_primary: boolean | null;
  display_order: number | null;
  room_type_id?: string | null;
};

export type RoomTypeAmenityLink = {
  amenities: AmenityData | null;
};

export type PublicRoomTypeData = {
  id: string;
  name: string;
  status: string | null;
  base_price: number | null;
  effective_price?: number | null;
  price_source?: "base" | "override";
  highlight_amenity_ids?: string[] | null;
  bed_type?: string | null;
  capacity_adult?: number | null;
  capacity_child?: number | null;
  description: string | null;
  gallery?: RoomTypeGalleryImage[] | null;
  room_gallery?: RoomTypeGalleryImage[] | null;
  room_type_amenities?: RoomTypeAmenityLink[] | null;
};

export type PublicVillaData = {
  id: string;
  name: string;
  slug: string;
  status: VillaStatus;
  address: string | null;
  description: string | null;
  whatsapp_number: string | null;
  gmaps_url?: string | null;
  room_types: PublicRoomTypeData[];
  villa_gallery?: RoomTypeGalleryImage[] | null;
  villa_amenities?: { amenities: AmenityData | null }[] | null;
};

export type RoomTypeCardData = {
  id: string;
  name: string;
  base_price: number;
  effective_price?: number;
  price_source?: "base" | "override";
  activePromo?: ActivePromoData;
  bed_type?: string | null;
  amenities: { id: string; name: string; icon_name: string | null }[];
  highlight_amenities: { id: string; name: string; icon_name: string | null }[];
  capacity_adult?: number | null;
  capacity_child?: number | null;
  description: string | null;
  gallery: RoomTypeGalleryImage[];
  villaName: string;
  villaSlug: string;
  villaStatus: VillaStatus;
  villaWhatsapp: string | null;
};

export type VillaGalleryItem = {
  url: string;
  label: string;
  category: "villa" | "unit";
};
