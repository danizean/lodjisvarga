import { redirect } from "next/navigation";

export default async function EditPageRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/villas/${id}/details`);
}
