// lib/queries/villas.ts
export async function getVillaDetail(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("villas")
    .select(
      `
      *,
      gallery (*),
      villa_amenities (
        amenities (*)
      ),
      room_types (
        *,
        room_type_amenities (
          amenities (*)
        )
      )
    `,
    )
    .eq("slug", slug)
    .eq("status", "Published")
    .single();

  if (error || !data) return null;
  return data;
}
