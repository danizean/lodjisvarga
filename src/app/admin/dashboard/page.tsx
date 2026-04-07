import { getDashboardStats, getAdminVillasWithRooms, getAdminPromos } from "@/lib/queries/villas";
import { Building2, Users, Tag, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardOverviewPage() {
  const [stats, villas, promos] = await Promise.all([
    getDashboardStats(),
    getAdminVillasWithRooms(),
    getAdminPromos(),
  ]);

  const recentVillas = villas.slice(0, 4);
  const activePromos = promos.filter((p: any) => p.is_active);

  const statCards = [
    {
      label: "Villa Aktif",
      value: stats.activeVillas,
      icon: Building2,
      color: "emerald",
      href: "/admin/villas",
    },
    {
      label: "Leads Pending",
      value: stats.pendingLeads,
      icon: Users,
      color: "blue",
      href: "/admin/bookings",
    },
    {
      label: "Promo Aktif",
      value: stats.activePromos,
      icon: Tag,
      color: "amber",
      href: "/admin/promos",
    },
    {
      label: "Total Properti",
      value: villas.length,
      icon: TrendingUp,
      color: "purple",
      href: "/admin/villas",
    },
  ];

  const colorMap: Record<string, string> = {
    emerald: "from-emerald-500 to-emerald-600",
    blue: "from-blue-500 to-blue-600",
    amber: "from-amber-500 to-amber-600",
    purple: "from-purple-500 to-purple-600",
  };

  return (
    <div className="p-8 space-y-8 bg-[#F7F6F2] min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-[#1A1A1A] tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1 text-sm">Selamat datang di panel admin Lodjisvarga.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <Link href={card.href} key={card.label}>
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group cursor-pointer">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[card.color]} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-3xl font-black text-slate-900">{card.value}</p>
                <p className="text-xs font-medium text-slate-500 mt-1">{card.label}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Villas */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="font-bold text-slate-800">Properti Terbaru</h2>
            <Link href="/admin/villas" className="text-xs text-[#3A4A1F] font-bold flex items-center gap-1 hover:underline">
              Lihat Semua <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentVillas.map((villa: any) => (
              <div key={villa.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="font-semibold text-sm text-slate-900">{villa.name}</p>
                  <p className="text-xs text-slate-400">{villa.room_types?.length ?? 0} tipe kamar</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${
                  villa.status === "active" || villa.status === "Published"
                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                    : villa.status === "coming_soon"
                    ? "bg-amber-100 text-amber-700 border-amber-200"
                    : "bg-slate-100 text-slate-500 border-slate-200"
                }`}>
                  {villa.status === "coming_soon" ? "Coming Soon" : villa.status ?? "inactive"}
                </span>
              </div>
            ))}
            {recentVillas.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-slate-400">Belum ada properti. <Link href="/admin/villas/new" className="text-[#3A4A1F] font-bold hover:underline">Tambah sekarang →</Link></p>
            )}
          </div>
        </div>

        {/* Active Promos */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="font-bold text-slate-800">Promo Aktif</h2>
            <Link href="/admin/promos" className="text-xs text-[#3A4A1F] font-bold flex items-center gap-1 hover:underline">
              Kelola Promo <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {activePromos.slice(0, 4).map((promo: any) => (
              <div key={promo.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="font-semibold text-sm text-slate-900">{promo.title}</p>
                  <p className="text-xs text-slate-400 font-mono">{promo.discount_code} — {promo.discount_value}% off</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
                  Aktif
                </span>
              </div>
            ))}
            {activePromos.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-slate-400">Tidak ada promo aktif. <Link href="/admin/promos" className="text-[#3A4A1F] font-bold hover:underline">Buat promo →</Link></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
