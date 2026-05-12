# Analisis Arsitektur: `villas/[slug]/page.tsx`

## Ringkasan

Villa Detail Page adalah **Server Component** murni (Next.js App Router) yang mengorkestrasi seluruh halaman detail villa — dari data fetching, pricing snapshot, hingga rendering section-section konten. Halaman ini merangkai **8 komponen UI** dari dua direktori berbeda.

---

## Peta Komponen (Dependency Tree)

```
VillaDetailPage (RSC — page.tsx)
│
├── [Data Layer]
│   ├── createStaticClient()              ← Supabase static client
│   ├── getCachedVillaDetail(slug)        ← unstable_cache + full villa query
│   ├── getPublicPricingSnapshot()        ← Parallel: room_prices + promos
│   └── attachPublicPricing()            ← Merge priceMap → room types
│
├── [Mapper Layer]
│   ├── buildDetailGalleryItems()         ← Villa + room photos → flat list
│   ├── mapRoomTypesToUnitCards()         ← Room types → RoomTypeCardData[]
│   └── resolveRoomDisplayPricing()       ← Base/override/promo → final price
│
└── [UI Layer]
    │
    ├── VillaDetailHero                   ← Hero section (Server)
    ├── [Breadcrumb nav]                  ← Inline JSX (absolute overlay)
    ├── [Sticky mobile nav]               ← Inline JSX (scroll tabs)
    │
    ├── VillaUnitCard[]                   ← Per-room card (Client)
    │   ├── PriceBlock                    ← Render-prop pricing resolver
    │   ├── RoomImageCarousel             ← Embla carousel (Client)
    │   ├── AmenityChipGroup              ← Highlight amenity chips (Client)
    │   ├── RoomDetailModal               ← Base UI dialog (Client)
    │   │   ├── ModalGallery              ← Local image slider
    │   │   ├── AmenityChip[]             ← Full amenity grid
    │   │   └── WhatsAppMessageForm       ← WA form in modal footer
    │   └── InquiryCTA → WhatsAppMessageForm
    │
    ├── VillaKeyInfoGrid                  ← Info grid: check-in, wifi, dll (Server)
    ├── VillaGallery                      ← Filterable gallery + lightbox (Client)
    ├── VillaDescriptionBlock             ← Description + ReadMore (Server)
    ├── VillaFacilitiesGrid               ← Amenity chips + expand (Client)
    ├── VillaSupportingAccordion          ← FAQ / Rules / Nearby (Server*)
    └── VillaFloatingCTA                  ← Sticky WA button mobile (Client)
```

> *VillaSupportingAccordion menggunakan shadcn Accordion (no `"use client"` — kompatibel RSC jika tidak ada state interaktif)

---

## Detail Setiap Layer

### 1. Data Layer

#### `getCachedVillaDetail(slug)` — `page.tsx` L147
```ts
unstable_cache(async () => { ... }, ["villa-detail", slug], { tags: ["villas"], revalidate: 86400 })
```
| Aspek | Detail |
|---|---|
| **Cache** | ISR 24 jam + tag `"villas"` untuk on-demand revalidation |
| **Query** | Single Supabase query dengan nested join: `gallery`, `room_types`, `room_type_amenities`, `villa_amenities` |
| **Status filter** | `.in("status", ["active", "coming_soon"])` — "inactive" tidak direturn |
| **Return** | `PublicVillaData \| null` |

> ⚠️ `generateMetadata` **tidak menggunakan cache yang sama** — ia membuat query terpisah dengan `createStaticClient()`. Duplikasi query bisa dioptimalkan.

#### `getPublicPricingSnapshot()` — `lib/queries/public-pricing.ts`
```ts
await Promise.all([room_prices query, promos query])
```
| Aspek | Detail |
|---|---|
| **room_prices** | Filter: `in(room_type_ids)`, `eq("date", today)` dalam timezone Jakarta |
| **promos** | Filter: `status=published`, date range `start_date ≤ today ≤ expired_at`, order by `discount_value DESC`, limit 1 |
| **Return** | `{ priceMap: Map<string, number>, activePromo, prices, pricesError, promosError }` |

> `getJakartaDateKey()` → `Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" })` menghasilkan format `YYYY-MM-DD`.

#### `attachPublicPricing()` — `lib/queries/public-pricing.ts` L59
```ts
rooms.map(room => ({
  ...room,
  effective_price: priceMap.get(room.id) ?? Number(room.base_price),
  price_source: priceMap.has(room.id) ? "override" : "base",
}))
```
Room dengan `room_prices` override hari ini → `price_source: "override"`. Sisanya → `"base"`.

---

### 2. Mapper Layer (`lib/mappers/public-villas.ts`)

#### `buildDetailGalleryItems()`
Memisahkan foto properti (filter `!room_type_id`) dan foto per room type, lalu menggabungkannya:
```
villaPhotos (sorted by is_primary, display_order) → category: "villa"
roomPhotos (per roomType, sorted) → category: "unit"
```
Output: `VillaGalleryItem[]` = `{ url, label, category }[]`

#### `mapRoomTypesToUnitCards()`
Wrapper dari `mapRoomTypeToCard()` yang:
1. Extract `roomAmenities` dari `room_type_amenities`
2. Extract `villaAmenities` dari `villa.villa_amenities`
3. **Merge unik** kedua set (villa amenities ditampilkan duluan)
4. Resolve `highlight_amenities` dari `highlight_amenity_ids` atau fallback ke 4 pertama
5. Resolve pricing via `resolveRoomDisplayPricing()`

#### `resolveRoomDisplayPricing()`
```
displayPrice = effective_price > 0 ? effective_price : base_price
hasPromo = displayPrice > 0 && discountPercentage > 0
finalPrice = hasPromo ? round(displayPrice * (1 - discount/100)) : displayPrice
```
Return: `{ displayPrice, priceSource, discountPercentage, hasPromo, hasManagedPrice, finalPrice }`

---

### 3. UI Components

#### `VillaDetailHero` — `components/villa/VillaDetailHero.tsx`
| | |
|---|---|
| **Type** | Server Component |
| **Role** | Hero section fullscreen: foto background, nama villa, address, summary, stats pills, CTA row |
| **Props** | `name, address, summary, heroPhoto, galleryPreview, isComingSoon, startingPriceText, guestSummary, totalPhotos, whatsappNumber` |
| **Catatan** | `galleryPreview` prop diterima tapi **tidak digunakan** di dalam komponen — hanya sebagai signature sisa dari redesign sebelumnya |

**CTA hierarchy:**
1. `Lihat Unit & Harga` → `#units` anchor (primary, white solid)
2. `Tanya via WhatsApp` → wa.me link (secondary, shown if `!isComingSoon`)
3. `Galeri` → `#gallery` anchor (tertiary, ghost)

---

#### `VillaUnitCard` — `components/villa/VillaUnitCard.tsx`
| | |
|---|---|
| **Type** | Client Component (`"use client"`) |
| **Role** | Card per room type: foto carousel, info, harga, CTA booking |
| **Layout** | `flex-col` mobile → `flex-row` lg (horizontal split 3 panel) |

**3 Panel:**
| Panel | Isi |
|---|---|
| **Image** | `RoomImageCarousel` (Embla) + promo badge (`-X%`) |
| **Info** | Nama, bed type, highlight amenities (`AmenityChipGroup`), `RoomDetailModal` trigger |
| **Price/CTA** | Coming soon state / managed price display + `InquiryCTA` → WA |

---

#### `RoomDetailModal` — `components/villa/RoomDetailModal.tsx`
| | |
|---|---|
| **Type** | Client Component |
| **Library** | `@base-ui/react/dialog` (bukan shadcn Dialog) |
| **Behavior** | Mobile: bottom sheet (`rounded-t-[28px]`, `inset-x-0 bottom-0`). Desktop: centered modal |

**Konten:**
- `ModalGallery` — local slider (useState, bukan Embla)
- Key specs grid: bed type + harga
- Full description
- Full amenity grid (`AmenityChip[]`)
- Sticky footer: harga summary + `WhatsAppMessageForm`

---

#### `VillaGallery` — `components/features/villas/VillaGallery.tsx`
| | |
|---|---|
| **Type** | Client Component |
| **Role** | Filterable photo grid + lightbox |
| **Filter tabs** | Semua / Foto Villa / Foto Unit |
| **Grid** | 5 preview foto (1 utama `col-span-7 row-span-2` + 4 secondary `col-span-5`) |
| **Lightbox** | shadcn `Dialog` — full image viewer + thumbnail strip + swipe touch |

---

#### `VillaFacilitiesGrid` — `components/villa/VillaFacilitiesGrid.tsx`
| | |
|---|---|
| **Type** | Client Component (useState untuk expand) |
| **Role** | Grid amenity properti, awalnya 9, expand jika lebih |
| **Backward compat** | Mendukung `amenities: AmenityItem[]` (rich, dari DB) **atau** `facilities: string[]` (legacy string array) |
| **Icon** | `LucideDynamicIcon` untuk DB data; keyword-based fallback untuk legacy |

---

#### `VillaKeyInfoGrid` — `components/villa/VillaKeyInfoGrid.tsx`
| | |
|---|---|
| **Type** | Server Component |
| **Role** | Grid 2-kolom (4 kolom xl) untuk info singkat: Check-in, WiFi, Parkir, Jumlah Kamar |
| **Data** | Hardcoded di `page.tsx` — bukan dari DB |

---

#### `VillaDescriptionBlock` — `components/villa/VillaDescriptionBlock.tsx`
| | |
|---|---|
| **Type** | Server Component |
| **Role** | Render description villa sebagai paragraf terformat |
| **Logic** | `splitIntoParagraphs()`: split pada `\n\n`, fallback ke split per 2 kalimat |
| **ReadMore** | Shared component `ReadMore` — preview 1 paragraf |

---

#### `VillaSupportingAccordion` — `components/villa/VillaSupportingAccordion.tsx`
| | |
|---|---|
| **Type** | Server Component (shadcn Accordion `type="multiple"`) |
| **Role** | 3 accordion items: Aturan Menginap, FAQ Tamu, Lokasi Sekitar |
| **Data** | Semua hardcoded di `page.tsx` (`STAY_RULES`, `TRAVELER_FAQS`, `NEARBY_SPOTS`) — tidak dari DB |

---

#### `VillaFloatingCTA` — `components/villa/VillaFloatingCTA.tsx`
| | |
|---|---|
| **Type** | Client Component |
| **Role** | Fixed WA button mobile, muncul setelah scroll 500px |
| **Behavior** | `window.scroll` listener (passive), hidden pada `lg:` breakpoint |
| **Guard** | Hanya render jika `isActive && whatsappNumber` — null return jika coming soon / tidak ada nomor |

---

### 4. Primitives (`components/features/villas/primitives/`)

| Komponen | Peran |
|---|---|
| `PriceBlock` | Render-prop wrapper — komputasi pricing lalu inject ke children |
| `RoomImageCarousel` | Embla carousel wrapper dengan dots, counter, nav buttons, semua styleable via className props |
| `AmenityChipGroup` | Flex wrap chip list dengan maxVisible, overflow count, optional legacy pool badge |
| `InquiryCTA` | Guard: jika `isBookable && whatsappNumber` → render `WhatsAppMessageForm`, else → `fallback` |

---

## Schema JSON-LD (SEO)

Page meng-inject 2 schema:

### `LodgingBusiness`
```json
{
  "@type": "LodgingBusiness",
  "name": "<villa.name>",
  "telephone": "<whatsapp_number>",
  "address": { "streetAddress": "...", "addressLocality": "Yogyakarta" },
  "image": ["<all gallery urls>"],
  "priceRange": "<startingPriceText>",
  "amenityFeature": [{ "@type": "LocationFeatureSpecification", "name": "..." }]
}
```

### `BreadcrumbList`
```
Beranda → Villas → <villa.name>
```

---

## Alur Data End-to-End

```
Supabase DB
    │
    ├── getCachedVillaDetail(slug)
    │       villas + gallery + room_types + amenities
    │
    ├── getPublicPricingSnapshot()
    │       room_prices (today) + promos (active)
    │
    ▼
attachPublicPricing(roomTypes, priceMap)
    → effective_price + price_source per room
    │
    ▼
buildDetailGalleryItems()        → allGalleryItems[]
mapRoomTypesToUnitCards()        → unitCards (RoomTypeCardData[])
resolveRoomDisplayPricing()      → lowestFinalPrice → startingPriceText
    │
    ▼
JSX Render
    VillaDetailHero     ← heroPhoto, startingPriceText, guestSummary
    VillaUnitCard[]     ← unitCards (dengan pricing + amenities embedded)
    VillaKeyInfoGrid    ← keyInfoItems (hardcoded)
    VillaGallery        ← allGalleryItems
    VillaDescriptionBlock ← overviewText
    VillaFacilitiesGrid ← propertyAmenities (villa-level only)
    VillaSupportingAccordion ← STAY_RULES, TRAVELER_FAQS, NEARBY_SPOTS
    VillaFloatingCTA    ← whatsappNumber, villaName
```

---

## Temuan & Area Refactor Potensial

| # | Temuan | Severity | Lokasi |
|---|---|---|---|
| 1 | `galleryPreview` prop di `VillaDetailHero` tidak digunakan di dalam komponen | Low | `VillaDetailHero.tsx` |
| 2 | `generateMetadata` membuat query Supabase terpisah — duplikasi dengan `getCachedVillaDetail` | Medium | `page.tsx` L185–194 |
| 3 | `STAY_RULES`, `TRAVELER_FAQS`, `NEARBY_SPOTS` hardcoded di page — tidak bisa dikustomisasi per villa | Medium | `page.tsx` L77–137 |
| 4 | `keyInfoItems` (Check-in, WiFi, dll) hardcoded — tidak dynamis dari DB | Low | `page.tsx` L330–335 |
| 5 | `WaIcon` SVG diduplikasi di 4 file berbeda (`VillaDetailHero`, `VillaUnitCard`, `RoomDetailModal`, `VillaFloatingCTA`) | Low | Multiple files |
| 6 | `ModalGallery` di `RoomDetailModal` menggunakan useState manual — tidak pakai Embla seperti `RoomImageCarousel` | Low | `RoomDetailModal.tsx` |
| 7 | Pricing tidak di-cache (ISR) — selalu fresh fetch saat request karena bergantung pada tanggal hari ini | Design | `page.tsx` L263–277 |
| 8 | Pricing snapshot dibuat dengan `createStaticClient()` tapi bersifat dynamic (date-dependent) — mismatch semantik | Medium | `page.tsx` L263 |
