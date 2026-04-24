import { redirect } from "next/navigation";

// /admin/villas/new redirects to /admin/villas/new/edit pattern
// We use [id]/edit page to handle "new" as a special case
export default function NewVillaRedirectPage() {
  redirect("/admin/villas/new/details");
}