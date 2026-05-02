# Admin Villas — Full Architectural Audit
> Scope: `src/app/admin/villas/**` + all directly referenced components
> Status: **READ-ONLY — no code modified**

---

## 1. Render Tree Map

### Route inventory (all routes that exist in the filesystem)

```
/admin/villas                               → app/admin/villas/page.tsx         [SERVER]
/admin/villas/create                        → app/admin/villas/create/page.tsx  [CLIENT] ⚠️ STUB
/admin/villas/new                           → app/admin/villas/new/page.tsx     [SERVER] redirect → /admin/villas/new/details
/admin/villas/new/details                   → [id]/layout.tsx + [id]/details/page.tsx
/admin/villas/[id]                          → ⛔ NO page.tsx — 404 or falls to layout only
/admin/villas/[id]/edit                     → [id]/layout.tsx + [id]/edit/page.tsx  redirect → /admin/villas/[id]/details
/admin/villas/[id]/details                  → [id]/layout.tsx + [id]/details/page.tsx     [CLIENT] NEW FLOW ✅
/admin/villas/[id]/amenities                → [id]/layout.tsx + [id]/amenities/page.tsx   [CLIENT] LEGACY FLOW ⚠️
/admin/villas/[id]/media                    → [id]/layout.tsx + [id]/media/page.tsx        [CLIENT] NEW FLOW ✅
/admin/villas/[id]/rooms                    → [id]/layout.tsx + [id]/rooms/page.tsx        [CLIENT] NEW FLOW ✅
/admin/villas/[id]/rooms/[roomId]           → [id]/rooms/[roomId]/page.tsx                 [CLIENT] LEGACY ROOM EDITOR ⚠️
```

### Component render chains per route

#### `/admin/villas` (list page)
```
page.tsx (SERVER)
  → AdminPageShell
  → AdminSection
  → VillaStatusToggle   ← NEW ✅ (just added this session)
  → AdminLinkButton     → /admin/villas/[id]/edit → redirect → /admin/villas/[id]/details
```

#### `/admin/villas/new` → redirect → `/admin/villas/new/details`
```
new/page.tsx  (instant redirect, no render)
  ↓
[id]/layout.tsx (id = "new", isCreate = true, no VillaTabs rendered)
  → [id]/details/page.tsx  (CLIENT, react-hook-form + saveVillaDetails action)
    - No room editor here
    - No amenity manager here
    - Creates villa, then router.push to /admin/villas/[villaId]/details
```

#### `/admin/villas/[id]/edit` → redirect → `/admin/villas/[id]/details`
```
[id]/edit/page.tsx  (instant redirect, no render)
  ↓
[id]/layout.tsx
  → [id]/details/page.tsx
```
> **Note**: The list page still links to `/admin/villas/${villa.id}/edit`, which works because of this redirect.

#### `/admin/villas/[id]/details`
```
[id]/layout.tsx
  → VillaTabs  (Details | Amenities | Media | Rooms)
  → [id]/details/page.tsx  (CLIENT)
      react-hook-form (villaDetailsSchema from villa-tabs.ts)
      saveVillaDetails()   ← lib/actions/villas.ts
      checkSlugAvailability()
      Autosave on field change (1.5s debounce)
      No room management here. No amenity manager here.
```

#### `/admin/villas/[id]/amenities`  ⚠️ LEGACY / DISCONNECTED
```
[id]/layout.tsx
  → VillaTabs
  → [id]/amenities/page.tsx  (CLIENT, "use client" at top)
      AmenitiesSelect  ← src/components/admin/AmenitiesSelect.tsx
        - Old flat chip list (no icons, no highlights, no FIFO)
        - Fetches all amenities from supabase client directly
        - saveVillaAmenities()  ← correct server action
      NO AmenityHighlightManager mounted here
      NO highlight_amenity_ids managed here
```

#### `/admin/villas/[id]/media`
```
[id]/layout.tsx
  → VillaTabs
  → [id]/media/page.tsx  (CLIENT)
      GalleryUploader   ← src/components/admin/GalleryUploader.tsx
      saveVillaGallery()  ← correct server action
      Auto-save on every change
```

#### `/admin/villas/[id]/rooms`
```
[id]/layout.tsx
  → VillaTabs
  → [id]/rooms/page.tsx  (CLIENT)
      addRoomTypeToVilla()  → creates room, push to /rooms/[roomId]
      deleteRoomType()
      Grid of room cards (no highlight info shown)
```

#### `/admin/villas/[id]/rooms/[roomId]`  ⚠️ LEGACY ROOM EDITOR
```
[id]/rooms/[roomId]/page.tsx  (CLIENT)  — NO [id]/layout.tsx applied here!
    react-hook-form (roomTypeSchema from villa-tabs.ts)
    updateRoomType()     ← lib/actions/rooms.ts
    saveRoomAmenities()  ← lib/actions/rooms.ts
    saveRoomGallery()    ← lib/actions/rooms.ts

    AmenitiesSelect      ← OLD flat chip component — NO highlight support
    GalleryUploader      ← correct
    
    ❌ NO AmenityHighlightManager mounted
    ❌ NO highlight_amenity_ids field in roomTypeSchema
    ❌ NO highlight_amenity_ids saved to DB from this route
```

#### `VillaManagementEditor` (the UNIFIED editor — **NEVER MOUNTED**)
```
src/components/admin/VillaManagementEditor.tsx  (CLIENT, default export)
  → RoomEditorPanel (per room)
    → AmenityHighlightManager  ← THE REFACTORED COMPONENT ✅
      → LucideDynamicIcon
      → Framer Motion
      → FIFO logic
      → Live preview
  → GalleryUploader
  → AmenitiesSelect (villa-level)

NOT rendered by ANY page.tsx in src/app/admin/villas/**
NOT imported in any page route file.
```

---

## 2. Root Cause Findings

### CRITICAL — C1: `VillaManagementEditor` is a ghost component
**File:** `src/components/admin/VillaManagementEditor.tsx`

- This 761-line unified editor contains the full new architecture:  
  `RoomEditorPanel → AmenityHighlightManager → LucideDynamicIcon + Framer Motion`
- It is **imported and used by exactly zero route pages**.
- `grep` for any page that imports it: **0 results**.
- All traffic from `/admin/villas/[id]/edit` now redirects to the tabbed architecture
  (`details / amenities / media / rooms`) which is a **completely separate, parallel codebase**.
- The entire `VillaManagementEditor` + `RoomEditorPanel` + `AmenityHighlightManager` chain  
  is unreachable from any active browser URL.

### CRITICAL — C2: `AmenityHighlightManager` is unreachable from the active UI
**File:** `src/components/admin/villas/AmenityHighlightManager.tsx`

- Only imported in `RoomEditorPanel.tsx` (line 29).
- `RoomEditorPanel` is only used in `VillaManagementEditor.tsx` (line 642).
- `VillaManagementEditor` is not mounted by any route.
- **Result:** `AmenityHighlightManager` (including the refactor just completed)  
  is **100% dead code** in the current routing architecture.

### CRITICAL — C3: The active room editor (`/rooms/[roomId]`) uses legacy `AmenitiesSelect`
**File:** `src/app/admin/villas/[id]/rooms/[roomId]/page.tsx`

- Line 17: `import { AmenitiesSelect } from "@/components/admin/AmenitiesSelect";`
- Line 285–293: Renders flat chip selector, no highlight concept.
- `roomTypeSchema` (villa-tabs.ts line 34-44) has **no `highlight_amenity_ids` field**.
- `updateRoomType()` server action has **no `highlight_amenity_ids` parameter**.
- Highlights set through the DB via `saveFullVillaData` (old unified flow) are  
  **never editable, displayable, or saveable** through the active room editor.

### CRITICAL — C4: The active amenities tab manages VILLA amenities only, not room highlights
**File:** `src/app/admin/villas/[id]/amenities/page.tsx`

- Renders `AmenitiesSelect` for villa-level amenities (`villa_amenities` table).
- No connection to room highlights (`highlight_amenity_ids` column on `room_types`).
- The tab label says "Amenities" which suggests it's the right place,  
  but it manages a completely different data concern than room highlights.

### HIGH — H1: `addRoomTypeToVilla` has schema mismatch
**File:** `src/lib/actions/rooms.ts` line 15-22
```ts
data: {
  villa_id: string;
  name: string;
  base_price: number;
  capacity_adult: number;  // ← required
  capacity_child: number;  // ← required
  description?: string;
}
```
**File:** `src/app/admin/villas/[id]/rooms/page.tsx` line 84-88
```ts
await addRoomTypeToVilla({
  villa_id: id,
  name: "New Room Type",
  base_price: 0,
  // capacity_adult MISSING → TypeScript error if strict
  // capacity_child MISSING → TypeScript error if strict
});
```
This call is missing `capacity_adult` and `capacity_child`. In the DB payload on line 27-30, these fields are spread in directly — passing `undefined` to non-nullable DB columns will cause a Supabase runtime error.

### HIGH — H2: `/admin/villas/create` is a dead stub
**File:** `src/app/admin/villas/create/page.tsx`

- Renders an `<h1>` and a `TODO` comment. Nothing else.
- No user flow navigates here (the "Tambah Properti" button goes to `/admin/villas/new`).
- Completely orphaned.

### HIGH — H3: `/admin/villas/[id]` has no `page.tsx`
No file exists at `src/app/admin/villas/[id]/page.tsx`.

- A user visiting `/admin/villas/[id]` (e.g., from a bookmark or external link) will get a 404 or Next.js "not found" because the layout exists but no page handles the root `[id]` segment.
- The `VillaTabs` component is never shown for this URL.

### MEDIUM — M1: `VillaManagementEditor` has a stale redirect after save
**File:** `src/components/admin/VillaManagementEditor.tsx` line 318
```ts
router.push(`/admin/villas/${res.villa_id}/edit`);
```
This pushes to `/edit` after creating a villa. Since the tabbed refactor was built,
`/edit` now redirects to `/details`. This means create flow does a double redirect.
Harmless but indicates the file is from a pre-refactor era and was never updated.

### MEDIUM — M2: `rooms/[roomId]/page.tsx` is not wrapped in `[id]/layout.tsx`
The `[id]/layout.tsx` applies to all children **of** `[id]`, including `rooms/[roomId]`.
However, the room editor at `/rooms/[roomId]` has its **own full-page layout** embedded inline
(its own header with `ArrowLeft`, its own title, etc.) which duplicates the layout chrome
already provided by `[id]/layout.tsx`.

This means the room editor page renders both:
- The VillaTabs header from `[id]/layout.tsx`  
- Its own internal `ArrowLeft` + room name header

Visual duplication of navigation.

### MEDIUM — M3: Two parallel `saveVillaDetails` vs `saveFullVillaData` flows
- New tabbed flow: `saveVillaDetails()` (standalone, in `villas.ts` line 265–313)
- Old unified flow: `saveFullVillaData()` (complete, in `villas.ts` line 24–214)

`saveVillaDetails` does NOT save:
- `amenity_ids` (saved separately via `saveVillaAmenities`)
- `gallery` (saved separately via `saveVillaGallery`)
- `room_types` (saved separately via `updateRoomType`, `saveRoomAmenities`, etc.)
- `highlight_amenity_ids` — **never saved from any active UI tab**

`saveFullVillaData` saves everything atomically but is only called from `VillaManagementEditor` which is unmounted.

### LOW — L1: `VillaTabs` includes "Amenities" tab that may mislead
The tab "Amenities" at `/admin/villas/[id]/amenities` manages villa-level amenities,
not room highlights. A user looking to set room highlights would click this tab and find
no relevant controls, with no indication that room highlights are managed per-room.

---

## 3. Refactor Gaps — What was implemented but not wired

| Component Refactored | Where It Lives | Currently Reachable? | Reason Not Reachable |
|---|---|---|---|
| `AmenityHighlightManager` (icon grid, FIFO, live preview) | `src/components/admin/villas/AmenityHighlightManager.tsx` | ❌ NO | Only mounted inside `RoomEditorPanel` which is only mounted inside `VillaManagementEditor`, which no route page imports |
| `RoomEditorPanel` (tabbed room editor with amenity highlights) | `src/components/admin/villas/RoomEditorPanel.tsx` | ❌ NO | Only mounted inside `VillaManagementEditor` |
| `VillaManagementEditor` (unified command center) | `src/components/admin/VillaManagementEditor.tsx` | ❌ NO | Zero route pages import or render it |
| `VillaStatusToggle` (inline toggle on list page) | `src/components/admin/villas/VillaStatusToggle.tsx` | ✅ YES | Correctly imported and rendered in `app/admin/villas/page.tsx` |

**The root cause in one sentence:**

> The tabbed routing refactor (`details/amenities/media/rooms`) replaced the unified editor as the active UI, but the components implementing the new UX (`RoomEditorPanel`, `AmenityHighlightManager`) were only wired into the old unified editor, which no longer has an active route.

---

## 4. Recommended Fix Plan (ordered)

### Step 1 — Wire `AmenityHighlightManager` into the active room editor
**File to modify:** `src/app/admin/villas/[id]/rooms/[roomId]/page.tsx`

Replace `AmenitiesSelect` in the amenities section with `AmenityHighlightManager`.

- The page already has `amenityIds` and `setAmenityIds` state.
- Add a `highlightIds` / `setHighlightIds` state (load from `highlight_amenity_ids` DB column).
- Fetch `allAmenities` (same pattern as `VillaManagementEditor` — one Supabase call).
- Render `<AmenityHighlightManager>` instead of `<AmenitiesSelect>`.
- On explicit save, call:
  - `saveRoomAmenities(roomId, amenityIds)` — existing
  - A new `updateRoomHighlights(roomId, highlightIds)` call (or extend `updateRoomType` to accept `highlight_amenity_ids`)

### Step 2 — Extend `updateRoomType` to accept `highlight_amenity_ids`
**File to modify:** `src/lib/actions/rooms.ts`

Add `highlight_amenity_ids?: string[]` to the `updateRoomType` partial.
Persist this to the `room_types` table (already has the column).

### Step 3 — Extend `roomTypeSchema` to include `highlight_amenity_ids`
**File to modify:** `src/lib/validations/villa-tabs.ts`

```ts
highlight_amenity_ids: z.array(z.string().uuid()).max(4).default([]),
```

### Step 4 — Fix `addRoomTypeToVilla` call (missing capacity fields)
**File to modify:** `src/app/admin/villas/[id]/rooms/page.tsx` line 84-88

Either:
- Add `capacity_adult: 1, capacity_child: 0` to the call, or
- Remove `capacity_adult`/`capacity_child` from the server action signature (if no longer required by DB schema)

### Step 5 — Fix double-navigation chrome on `/rooms/[roomId]`
**File to modify:** `src/app/admin/villas/[id]/rooms/[roomId]/page.tsx`

Remove the inline `ArrowLeft` header at lines 195-205 since `[id]/layout.tsx` already provides full page chrome, `VillaTabs`, and back navigation.

### Step 6 — Add redirect for bare `/admin/villas/[id]`
**Create:** `src/app/admin/villas/[id]/page.tsx`
```ts
import { redirect } from "next/navigation";
export default async function VillaIndexRedirect({ params }) {
  const { id } = await params;
  redirect(`/admin/villas/${id}/details`);
}
```

### Step 7 — Rename or scope the "Amenities" tab
The current `/amenities` tab manages villa-level amenities, not room highlights.
Consider renaming the tab label to "Villa Facilities" to reduce confusion.

---

## 5. Optional Cleanup Plan

| Item | File(s) | Action | Risk |
|---|---|---|---|
| `/admin/villas/create` stub | `src/app/admin/villas/create/page.tsx` | Delete — nothing links to it | Zero |
| `VillaManagementEditor` | `src/components/admin/VillaManagementEditor.tsx` | **Do not delete yet** — contains business logic (save, archive, checklist) not fully replicated in the tabbed flow. Archive or refactor piece by piece. | Medium |
| `RoomEditorPanel` | `src/components/admin/villas/RoomEditorPanel.tsx` | Keep — it will be needed once Step 1 is done (or adapt its amenity tab directly) | — |
| Duplicate `generateSlug` function | `VillaManagementEditor.tsx` (line 86) vs `details/page.tsx` (inline useEffect) | Extract into `src/lib/utils/slug.ts` | Low |
| Duplicate `AmenitiesSelect` fetching | Used in 3 places each with its own Supabase fetch | Extract into a shared `useAmenities()` hook | Low |
| `saveFullVillaData` in `villas.ts` | `src/lib/actions/villas.ts` line 24 | Do not delete — keep as atomic fallback. Document it's no longer called from UI. | — |

---

## Summary Matrix

| Route | Active? | Uses New Components? | Saves Highlights? | Has Layout Chrome? |
|---|---|---|---|---|
| `/admin/villas` | ✅ | VillaStatusToggle ✅ | N/A | ✅ |
| `/admin/villas/new` | ✅ (redirect) | — | — | — |
| `/admin/villas/[id]/details` | ✅ | No | No | ✅ |
| `/admin/villas/[id]/amenities` | ✅ | **AmenitiesSelect (OLD)** | No | ✅ |
| `/admin/villas/[id]/media` | ✅ | GalleryUploader | No | ✅ |
| `/admin/villas/[id]/rooms` | ✅ | No | No | ✅ |
| `/admin/villas/[id]/rooms/[roomId]` | ✅ | **AmenitiesSelect (OLD)** | ❌ Never | ⚠️ Duplicated |
| `VillaManagementEditor` | ❌ GHOST | AmenityHighlightManager | Yes (via saveFullVillaData) | Self-contained |
