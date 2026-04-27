import { redirect } from "next/navigation";

/**
 * Bare /admin/villas/[id] has no page — redirect to the first meaningful tab.
 * This prevents 404s from bookmarks, external links, or list-page "Edit" links
 * that land on the id segment without a sub-route.
 */
export default async function VillaIndexRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/villas/${id}/details`);
}
