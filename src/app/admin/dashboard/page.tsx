import { getDashboardStats, getAdminVillasWithRooms, getAdminPromos } from "@/lib/queries/villas";
import { Building2, Users, Tag, TrendingUp, ArrowUpRight, Plus } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function DashboardOverviewPage() {
  const [stats, villas, promos] = await Promise.all([
    getDashboardStats(),
    getAdminVillasWithRooms(),
    getAdminPromos(),
  ]);

  const recentVillas = villas.slice(0, 5);
  const activePromos = promos.filter((p: any) => p.is_active);

  const statCards = [
    {
      label: "Villa Aktif",
      value: stats.activeVillas,
      icon: Building2,
      href: "/admin/villas",
      accent: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Leads Pending",
      value: stats.pendingLeads,
      icon: Users,
      href: "/admin/bookings",
      accent: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Promo Aktif",
      value: stats.activePromos,
      icon: Tag,
      href: "/admin/promos",
      accent: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Total Properti",
      value: villas.length,
      icon: TrendingUp,
      href: "/admin/villas",
      accent: "text-violet-600",
      bg: "bg-violet-50",
    },
  ] as const;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Ringkasan aktivitas properti Lodjisvarga.</p>
        </div>
        <Link href="/admin/blog/new">
          <Button size="sm" className="bg-[#3A4A1F] hover:bg-[#2A3A10] text-white gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Tulis Artikel
          </Button>
        </Link>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link href={card.href} key={card.label} className="group">
              <Card size="sm" className="hover:ring-gray-200 transition-all duration-200 cursor-pointer ring-gray-100">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-4 h-4 ${card.accent}`} />
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 tabular-nums">{card.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* ── Content tables ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Recent villas */}
        <Card size="sm" className="ring-gray-100">
          <CardHeader className="border-b border-gray-100">
            <CardTitle>Properti Terbaru</CardTitle>
            <div data-slot="card-action">
              <Link href="/admin/villas" className="text-xs text-[#3A4A1F] font-medium hover:underline flex items-center gap-0.5">
                Lihat semua <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-50">
              {recentVillas.length === 0 && (
                <p className="px-4 py-10 text-center text-sm text-gray-400">
                  Belum ada properti.{" "}
                  <Link href="/admin/villas/new" className="text-[#3A4A1F] font-medium hover:underline">
                    Tambah →
                  </Link>
                </p>
              )}
              {recentVillas.map((villa: any) => (
                <div key={villa.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{villa.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{villa.room_types?.length ?? 0} tipe kamar</p>
                  </div>
                  <VillaStatusBadge status={villa.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active promos */}
        <Card size="sm" className="ring-gray-100">
          <CardHeader className="border-b border-gray-100">
            <CardTitle>Promo Aktif</CardTitle>
            <div data-slot="card-action">
              <Link href="/admin/promos" className="text-xs text-[#3A4A1F] font-medium hover:underline flex items-center gap-0.5">
                Kelola <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-50">
              {activePromos.length === 0 && (
                <p className="px-4 py-10 text-center text-sm text-gray-400">
                  Tidak ada promo aktif.{" "}
                  <Link href="/admin/promos" className="text-[#3A4A1F] font-medium hover:underline">
                    Buat promo →
                  </Link>
                </p>
              )}
              {activePromos.slice(0, 5).map((promo: any) => (
                <div key={promo.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{promo.title}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">
                      {promo.discount_code} · {promo.discount_value}% off
                    </p>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 flex-shrink-0 gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Aktif
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

// ─── Status Badge ──────────────────────────────────────────────────────────────

function VillaStatusBadge({ status }: { status: string | null }) {
  const s = status?.toLowerCase();

  if (s === "active" || s === "published") {
    return (
      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 flex-shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Aktif
      </Badge>
    );
  }
  if (s === "coming_soon") {
    return (
      <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50 flex-shrink-0">
        Coming Soon
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-gray-500 flex-shrink-0">
      {status ?? "Inactive"}
    </Badge>
  );
}
