import type {
  ActivePromoData,
  AmenityData,
  PublicRoomTypeData,
  PublicVillaData,
  RoomTypeCardData,
  RoomTypeGalleryImage,
  VillaGalleryItem,
} from "@/types/public-villas";

type FlattenOptions = {
  includeComingSoonPlaceholder?: boolean;
  highlightLimit?: number;
  fallbackToFirstAmenities?: boolean;
};

type RoomPricingInput = Pick<
  RoomTypeCardData,
  "base_price" | "effective_price" | "price_source" | "activePromo"
>;

export type ResolvedRoomPricing = {
  displayPrice: number;
  priceSource: "base" | "override";
  discountPercentage: number;
  hasPromo: boolean;
  hasManagedPrice: boolean;
  finalPrice: number;
};

export function resolveRoomDisplayPricing(input: RoomPricingInput): ResolvedRoomPricing {
  const overridePrice = input.effective_price ?? 0;
  const basePrice = input.base_price ?? 0;
  const displayPrice = overridePrice > 0 ? overridePrice : basePrice;
  const priceSource: "base" | "override" =
    overridePrice > 0 ? input.price_source ?? "override" : "base";
  const discountPercentage = input.activePromo?.discount_value ?? 0;
  const hasManagedPrice = displayPrice > 0;
  const hasPromo = hasManagedPrice && discountPercentage > 0;
  const finalPrice = hasPromo
    ? Math.max(0, Math.round(displayPrice * (1 - discountPercentage / 100)))
    : displayPrice;

  return {
    displayPrice,
    priceSource,
    discountPercentage,
    hasPromo,
    hasManagedPrice,
    finalPrice,
  };
}

export function normalizeRoomGallery(room: Pick<PublicRoomTypeData, "gallery" | "room_gallery">): RoomTypeGalleryImage[] {
  const source = room.gallery ?? room.room_gallery ?? [];
  return [...source]
    .filter((image) => Boolean(image?.image_url))
    .sort((left, right) => {
      if (left.is_primary && !right.is_primary) return -1;
      if (!left.is_primary && right.is_primary) return 1;
      return (left.display_order ?? 0) - (right.display_order ?? 0);
    })
    .map((image) => ({
      image_url: image.image_url,
      is_primary: image.is_primary ?? false,
      display_order: image.display_order ?? 0,
    }));
}

export function extractRoomAmenities(room: Pick<PublicRoomTypeData, "room_type_amenities">): AmenityData[] {
  return (room.room_type_amenities ?? [])
    .flatMap((link) => (link.amenities ? [link.amenities] : []))
    .filter((amenity): amenity is AmenityData => Boolean(amenity?.id && amenity?.name));
}

export function resolveHighlightAmenities(params: {
  amenities: AmenityData[];
  highlightIds?: string[] | null;
  limit?: number;
  fallbackToFirstAmenities?: boolean;
}) {
  const { amenities, highlightIds, limit = 4, fallbackToFirstAmenities = true } = params;
  const selected = (highlightIds ?? [])
    .map((id) => amenities.find((amenity) => amenity.id === id))
    .filter((amenity): amenity is AmenityData => Boolean(amenity));

  if (selected.length > 0) {
    return selected.slice(0, limit);
  }

  return fallbackToFirstAmenities ? amenities.slice(0, limit) : [];
}

export function mapRoomTypeToCard(params: {
  room: PublicRoomTypeData;
  villa: Pick<PublicVillaData, "name" | "slug" | "status" | "whatsapp_number">;
  activePromo: ActivePromoData;
  highlightLimit?: number;
  fallbackToFirstAmenities?: boolean;
}): RoomTypeCardData {
  const { room, villa, activePromo, highlightLimit = 3, fallbackToFirstAmenities = true } = params;
  const amenities = extractRoomAmenities(room);
  const highlightAmenities = resolveHighlightAmenities({
    amenities,
    highlightIds: room.highlight_amenity_ids,
    limit: highlightLimit,
    fallbackToFirstAmenities,
  });

  const resolvedPricing = resolveRoomDisplayPricing({
    base_price: room.base_price ?? 0,
    effective_price: room.effective_price ?? 0,
    price_source: room.price_source ?? "base",
    activePromo,
  });

  return {
    id: room.id,
    name: room.name,
    base_price: room.base_price ?? 0,
    effective_price: resolvedPricing.displayPrice,
    price_source: resolvedPricing.priceSource,
    activePromo,
    bed_type: room.bed_type ?? null,
    capacity_adult: room.capacity_adult ?? null,
    capacity_child: room.capacity_child ?? null,
    description: room.description ?? null,
    gallery: normalizeRoomGallery(room),
    amenities,
    highlight_amenities: highlightAmenities,
    villaName: villa.name,
    villaSlug: villa.slug,
    villaStatus: villa.status,
    villaWhatsapp: villa.whatsapp_number ?? null,
  };
}

export function flattenToRoomCards(
  villas: PublicVillaData[],
  activePromo: ActivePromoData,
  options: FlattenOptions = {}
): RoomTypeCardData[] {
  const {
    includeComingSoonPlaceholder = true,
    highlightLimit = 3,
    fallbackToFirstAmenities = true,
  } = options;
  const cards: RoomTypeCardData[] = [];

  for (const villa of villas) {
    if (villa.status === "inactive") continue;

    const roomTypes = (villa.room_types ?? []).filter((room) => room.status !== "inactive");

    if (roomTypes.length === 0 && includeComingSoonPlaceholder && villa.status === "coming_soon") {
      cards.push({
        id: `${villa.id}_placeholder`,
        name: "Segera Hadir",
        base_price: 0,
        effective_price: 0,
        price_source: "base",
        activePromo,
        bed_type: null,
        amenities: [],
        highlight_amenities: [],
        description: villa.description ?? null,
        gallery: [],
        villaName: villa.name,
        villaSlug: villa.slug,
        villaStatus: villa.status,
        villaWhatsapp: villa.whatsapp_number ?? null,
      });
      continue;
    }

    for (const room of roomTypes) {
      cards.push(
        mapRoomTypeToCard({
          room,
          villa,
          activePromo,
          highlightLimit,
          fallbackToFirstAmenities,
        })
      );
    }
  }

  return cards;
}

export function mapRoomTypesToUnitCards(params: {
  villa: Pick<PublicVillaData, "name" | "slug" | "status" | "whatsapp_number">;
  roomTypes: PublicRoomTypeData[];
  activePromo: ActivePromoData;
}) {
  const { villa, roomTypes, activePromo } = params;
  return roomTypes
    .filter((roomType) => roomType.status !== "inactive")
    .map((roomType) =>
      mapRoomTypeToCard({
        room: roomType,
        villa,
        activePromo,
        highlightLimit: 4,
        fallbackToFirstAmenities: true,
      })
    );
}

export function buildDetailGalleryItems(params: {
  villaName: string;
  villaGallery?: RoomTypeGalleryImage[] | null;
  roomTypes: PublicRoomTypeData[];
}) {
  const { villaName, villaGallery, roomTypes } = params;

  const villaPhotos: VillaGalleryItem[] = (villaGallery ?? [])
    .filter((photo) => !photo.room_type_id && Boolean(photo.image_url))
    .sort((left, right) => {
      if (left.is_primary && !right.is_primary) return -1;
      if (!left.is_primary && right.is_primary) return 1;
      return (left.display_order ?? 0) - (right.display_order ?? 0);
    })
    .map((photo) => ({
      url: photo.image_url,
      label: villaName,
      category: "villa",
    }));

  const roomPhotos: VillaGalleryItem[] = roomTypes.flatMap((roomType) =>
    normalizeRoomGallery(roomType).map((photo) => ({
      url: photo.image_url,
      label: roomType.name,
      category: "unit" as const,
    }))
  );

  return [...villaPhotos, ...roomPhotos];
}
