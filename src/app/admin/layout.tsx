"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  ChevronRight,
  Home,
  LogOut,
  PanelLeft,
  Plus,
  Tag,
  Users,
} from "lucide-react";
import { logout } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { AdminLinkButton } from "@/components/admin/ui/AdminLinkButton";

const NAV_GROUPS = [
  {
    label: "Core",
    items: [
      { name: "Dashboard", href: "/admin/dashboard", icon: Home },
      { name: "Villas", href: "/admin/villas", icon: Building2 },
      { name: "Calendar & Pricing", href: "/admin/calendar", icon: CalendarDays },
      { name: "Bookings", href: "/admin/bookings", icon: Users },
    ],
  },
  {
    label: "Marketing",
    items: [
      { name: "Promo", href: "/admin/promos", icon: Tag },
      { name: "Blog", href: "/admin/blog", icon: BookOpen },
    ],
  },
] as const;

function getPageMeta(pathname: string) {
  if (pathname.startsWith("/admin/blog/new")) {
    return { title: "Artikel Baru", description: "Tulis konten baru untuk publik website." };
  }
  if (pathname.match(/\/admin\/blog\/.+\/edit/)) {
    return { title: "Edit Artikel", description: "Perbarui konten dan metadata artikel." };
  }
  if (pathname.startsWith("/admin/blog")) {
    return { title: "Blog CMS", description: "Kelola artikel dan jadwal publikasi." };
  }
  if (pathname.startsWith("/admin/villas")) {
    return { title: "Villa Management", description: "Kelola properti, unit, dan status inventori." };
  }
  if (pathname.startsWith("/admin/promos")) {
    return { title: "Promo & Diskon", description: "Atur promo aktif dan masa berlaku." };
  }
  if (pathname.startsWith("/admin/bookings")) {
    return { title: "Bookings", description: "Pantau booking, lead, dan tindak lanjut tim ops." };
  }
  if (pathname.startsWith("/admin/calendar")) {
    return { title: "Calendar & Pricing", description: "Atur harga dan availability tanpa konflik." };
  }
  return { title: "Dashboard", description: "Ringkasan performa operasional hari ini." };
}

function getQuickAction(pathname: string) {
  if (pathname.startsWith("/admin/villas")) {
    return { href: "/admin/villas/new", label: "Tambah Properti" };
  }
  if (pathname.startsWith("/admin/blog")) {
    return { href: "/admin/blog/new", label: "Tulis Artikel" };
  }
  if (pathname.startsWith("/admin/bookings")) {
    return { href: "/admin/calendar", label: "Buka Kalender" };
  }
  if (pathname.startsWith("/admin/calendar")) {
    return { href: "/admin/villas", label: "Lihat Properti" };
  }
  return { href: "/admin/villas/new", label: "Tambah Properti" };
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const pageMeta = getPageMeta(pathname);
  const quickAction = getQuickAction(pathname);
  const leftInset = collapsed ? "ml-[92px]" : "ml-[272px]";

  const breadcrumbs = pathname.split("/").filter(Boolean).slice(1);
  if (breadcrumbs.length === 0) {
    breadcrumbs.push("dashboard");
  }

  return (
    <div className="min-h-screen bg-[var(--admin-bg)] text-slate-900">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white transition-[width] duration-200",
          collapsed ? "w-[92px]" : "w-[272px]"
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--admin-primary)] text-sm font-semibold text-white">
            LS
          </div>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">Lodjisvarga Admin</p>
              <p className="text-xs text-slate-500">Operations Console</p>
            </div>
          ) : null}
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="space-y-1.5">
              {!collapsed ? (
                <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                  {group.label}
                </p>
              ) : null}
              {group.items.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.name : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                      collapsed && "justify-center px-0",
                      isActive
                        ? "bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed ? <span className="truncate">{item.name}</span> : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="space-y-1 border-t border-slate-100 p-3">
          <AdminButton
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => setCollapsed((previous) => !previous)}
            className={cn("w-full justify-start", collapsed && "justify-center")}
          >
            <PanelLeft className="h-4 w-4" />
            {!collapsed ? <span>Collapse</span> : null}
          </AdminButton>
          <AdminButton
            variant="ghost"
            size="sm"
            type="button"
            onClick={async () => {
              await logout();
            }}
            className={cn("w-full justify-start text-[var(--admin-danger)] hover:bg-[var(--admin-danger-soft)]", collapsed && "justify-center")}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed ? <span>Sign Out</span> : null}
          </AdminButton>
        </div>
      </aside>

      <div className={cn("min-h-screen transition-[margin] duration-200", leftInset)}>
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex h-16 w-full max-w-[1240px] items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Link href="/admin/dashboard" className="hover:text-slate-600">
                  admin
                </Link>
                {breadcrumbs.map((crumb) => (
                  <span key={crumb} className="flex items-center gap-1">
                    <ChevronRight className="h-3 w-3" />
                    <span className="capitalize">{crumb.replaceAll("-", " ")}</span>
                  </span>
                ))}
              </div>
              <p className="truncate text-sm font-semibold text-slate-900">{pageMeta.title}</p>
            </div>

            <div className="flex items-center gap-2">
              <AdminLinkButton href={quickAction.href} variant="outline" size="sm">
                <Plus className="h-4 w-4" />
                {quickAction.label}
              </AdminLinkButton>
              <AdminButton variant="ghost" size="icon-sm" type="button" title="Notifications">
                <Bell className="h-4 w-4" />
              </AdminButton>
              <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 sm:flex">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--admin-primary)] text-[11px] font-semibold text-white">
                  OP
                </div>
                <span className="text-xs font-medium text-slate-600">Ops Team</span>
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  );
}
