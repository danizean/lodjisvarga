import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  CalendarDays,
  Tag,
  TrendingUp,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AdminEmptyState,
  AdminPageShell,
  AdminSection,
} from "@/components/admin/ui/AdminPageShell";
import { AdminKpiCard } from "@/components/admin/ui/AdminKpiCard";
import { AdminLinkButton } from "@/components/admin/ui/AdminLinkButton";
import { getAdminDashboardOverview } from "@/features/admin/dashboard/queries";

export const dynamic = "force-dynamic";

function VillaStatusBadge({ status }: { status: string | null }) {
  const value = status?.toLowerCase();

  if (value === "active" || value === "published") {
    return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Aktif</Badge>;
  }

  if (value === "maintenance") {
    return <Badge className="bg-amber-50 text-amber-700 border-amber-200">Maintenance</Badge>;
  }

  return <Badge variant="outline">{status ?? "Inactive"}</Badge>;
}

export default async function DashboardOverviewPage() {
  const { stats, recentVillas, activePromos } = await getAdminDashboardOverview();

  const alerts = [] as string[];
  if (stats.pendingLeads > 0) {
    alerts.push(`${stats.pendingLeads} lead belum ditindaklanjuti.`);
  }
  if (recentVillas.length === 0) {
    alerts.push("Belum ada properti aktif untuk dijual.");
  }

  return (
    <AdminPageShell
      title="Dashboard"
      description="Ringkasan operasional harian untuk tim reservasi dan pricing."
      actions={
        <>
          <AdminLinkButton href="/admin/calendar" variant="outline" size="sm">
            <CalendarDays className="h-4 w-4" />
            Calendar & Pricing
          </AdminLinkButton>
          <AdminLinkButton href="/admin/villas/new" variant="default" size="sm">
            Tambah Properti
          </AdminLinkButton>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminKpiCard
          label="Villa Aktif"
          value={stats.activeVillas}
          icon={Building2}
          href="/admin/villas"
          tone="success"
        />
        <AdminKpiCard
          label="Leads Pending"
          value={stats.pendingLeads}
          icon={Users}
          href="/admin/bookings"
          tone="warning"
        />
        <AdminKpiCard
          label="Promo Aktif"
          value={stats.activePromos}
          icon={Tag}
          href="/admin/promos"
          tone="info"
        />
        <AdminKpiCard
          label="Total Properti"
          value={stats.totalVillas}
          icon={TrendingUp}
          href="/admin/villas"
          tone="primary"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <AdminSection
          title="Alert Operasional"
          description="Prioritas yang perlu ditindaklanjuti hari ini"
          action={
            <AdminLinkButton href="/admin/bookings" variant="ghost" size="sm">
              Lihat Bookings
            </AdminLinkButton>
          }
        >
          <div className="space-y-2 px-5 py-4">
            {alerts.length === 0 ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                Semua indikator utama aman. Tidak ada alert kritikal.
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert}
                  className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{alert}</span>
                </div>
              ))
            )}
          </div>
        </AdminSection>

        <AdminSection
          title="Quick Insight"
          description="Akses cepat ke area yang sering dibuka"
        >
          <div className="grid gap-2 px-5 py-4">
            <Link href="/admin/calendar" className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm hover:bg-slate-50">
              <span className="font-medium text-slate-700">Update harga akhir pekan</span>
              <ArrowUpRight className="h-4 w-4 text-slate-400" />
            </Link>
            <Link href="/admin/bookings" className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm hover:bg-slate-50">
              <span className="font-medium text-slate-700">Follow up lead baru</span>
              <ArrowUpRight className="h-4 w-4 text-slate-400" />
            </Link>
            <Link href="/admin/villas" className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm hover:bg-slate-50">
              <span className="font-medium text-slate-700">Review status properti</span>
              <ArrowUpRight className="h-4 w-4 text-slate-400" />
            </Link>
          </div>
        </AdminSection>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <AdminSection
          title="Properti Terbaru"
          description="5 properti terbaru yang masuk sistem"
          action={
            <AdminLinkButton href="/admin/villas" variant="ghost" size="sm">
              Lihat semua
            </AdminLinkButton>
          }
        >
          {recentVillas.length === 0 ? (
            <div className="px-5 py-4">
              <AdminEmptyState
                title="Belum ada properti"
                description="Tambahkan properti baru agar bisa dijual di website."
                action={
                  <AdminLinkButton href="/admin/villas/new" variant="default" size="sm">
                    Tambah Properti
                  </AdminLinkButton>
                }
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentVillas.map((villa) => (
                <div key={villa.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0 space-y-0.5">
                    <p className="truncate text-sm font-medium text-slate-900">{villa.name}</p>
                    <p className="text-xs text-slate-500">{villa.room_types?.length ?? 0} tipe kamar</p>
                  </div>
                  <VillaStatusBadge status={villa.status} />
                </div>
              ))}
            </div>
          )}
        </AdminSection>

        <AdminSection
          title="Promo Aktif"
          description="Promo yang sedang berjalan saat ini"
          action={
            <AdminLinkButton href="/admin/promos" variant="ghost" size="sm">
              Kelola promo
            </AdminLinkButton>
          }
        >
          {activePromos.length === 0 ? (
            <div className="px-5 py-4">
              <AdminEmptyState
                title="Tidak ada promo aktif"
                description="Buat promo baru untuk mendorong konversi booking."
                action={
                  <AdminLinkButton href="/admin/promos" variant="default" size="sm">
                    Buat Promo
                  </AdminLinkButton>
                }
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {activePromos.map((promo) => (
                <div key={promo.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0 space-y-0.5">
                    <p className="truncate text-sm font-medium text-slate-900">{promo.title}</p>
                    <p className="text-xs text-slate-500">
                      {promo.discount_code} - {promo.discount_value}%
                    </p>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Aktif</Badge>
                </div>
              ))}
            </div>
          )}
        </AdminSection>
      </div>
    </AdminPageShell>
  );
}
