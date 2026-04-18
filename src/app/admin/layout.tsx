"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions/auth";
import {
  LayoutDashboard, Home, Calendar, Users, LogOut, Tag, BookOpen,
  ChevronRight, PanelLeft, Bell, Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// ─── Nav structure ─────────────────────────────────────────────────────────────

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Content",
    items: [
      { name: "Blog", href: "/admin/blog", icon: BookOpen },
      { name: "Promo", href: "/admin/promos", icon: Tag },
    ],
  },
  {
    label: "Property",
    items: [
      { name: "Villas", href: "/admin/villas", icon: Home },
      { name: "Bookings", href: "/admin/bookings", icon: Users },
      { name: "Calendar", href: "/admin/calendar", icon: Calendar },
    ],
  },
];

// ─── Page title map ────────────────────────────────────────────────────────────

function usePageTitle(pathname: string) {
  if (pathname.startsWith("/admin/blog/new")) return { title: "Artikel Baru", crumbs: ["Blog", "Baru"] };
  if (pathname.match(/\/admin\/blog\/.+\/edit/)) return { title: "Edit Artikel", crumbs: ["Blog", "Edit"] };
  if (pathname.startsWith("/admin/blog")) return { title: "Blog CMS", crumbs: ["Blog"] };
  if (pathname.startsWith("/admin/villas")) return { title: "Kelola Villa", crumbs: ["Villa"] };
  if (pathname.startsWith("/admin/promos")) return { title: "Promo & Diskon", crumbs: ["Promo"] };
  if (pathname.startsWith("/admin/bookings")) return { title: "Bookings", crumbs: ["Bookings"] };
  if (pathname.startsWith("/admin/calendar")) return { title: "Kalender", crumbs: ["Kalender"] };
  if (pathname.startsWith("/admin/dashboard")) return { title: "Dashboard", crumbs: [] };
  return { title: "Admin", crumbs: [] };
}

// ─── Layout ────────────────────────────────────────────────────────────────────

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  if (pathname === "/admin/login") return <>{children}</>;

  const { title, crumbs } = usePageTitle(pathname);

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-gray-200
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-[72px]" : "w-60"}
        `}
      >
        {/* Brand */}
        <div className={`flex items-center border-b border-gray-100 h-14 flex-shrink-0 ${collapsed ? "px-4 justify-center" : "px-5 gap-3"}`}>
          <div className="w-7 h-7 rounded-lg bg-[#3A4A1F] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-black">L</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate leading-tight">Lodjisvarga</p>
              <p className="text-[10px] text-gray-400 font-medium">Admin Portal</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((link) => {
                  const isActive = pathname.startsWith(link.href);
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      title={collapsed ? link.name : undefined}
                      className={`
                        relative flex items-center gap-3 rounded-lg text-sm font-medium
                        transition-all duration-150 group
                        ${collapsed ? "px-0 py-2.5 justify-center" : "px-3 py-2"}
                        ${isActive
                          ? "bg-[#3A4A1F]/8 text-[#3A4A1F]"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }
                      `}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#3A4A1F] rounded-r-full" />
                      )}
                      <Icon className={`flex-shrink-0 w-4 h-4 ${isActive ? "text-[#3A4A1F]" : "text-gray-400 group-hover:text-gray-600"}`} />
                      {!collapsed && <span>{link.name}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-gray-100 flex-shrink-0 space-y-0.5">
          {/* Collapse toggle */}
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`w-full justify-start gap-3 text-gray-400 hover:text-gray-600 ${collapsed ? "justify-center px-0" : ""}`}
          >
            <PanelLeft className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span className="text-xs font-medium">Collapse</span>}
          </Button>

          {/* Sign out */}
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={async () => { await logout(); }}
            title="Sign out"
            className={`w-full justify-start gap-3 text-red-500 hover:bg-red-50 hover:text-red-600 ${collapsed ? "justify-center px-0" : ""}`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span className="text-xs">Sign Out</span>}
          </Button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${collapsed ? "ml-[72px]" : "ml-60"}`}>

        {/* Top Header */}
        <header className="sticky top-0 z-30 h-14 bg-white border-b border-gray-200 flex items-center px-6 gap-4">
          {/* Breadcrumb / title */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Link href="/admin/dashboard" className="text-gray-400 hover:text-gray-600 text-xs font-medium transition-colors flex-shrink-0">
              Admin
            </Link>
            {crumbs.map((crumb) => (
              <span key={crumb} className="flex items-center gap-2 text-gray-400 flex-shrink-0">
                <ChevronRight className="w-3 h-3" />
                <span className="text-xs font-medium">{crumb}</span>
              </span>
            ))}
            <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
            <h1 className="text-sm font-semibold text-gray-900 truncate">{title}</h1>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon-sm"
              type="button"
              title="Notifikasi"
              className="text-gray-400 hover:text-gray-600"
            >
              <Bell className="w-4 h-4" />
            </Button>
            <Link
              href="/admin/dashboard"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              title="Pengaturan"
            >
              <Settings className="w-4 h-4" />
            </Link>
            {/* Avatar */}
            <div className="w-7 h-7 rounded-full bg-[#3A4A1F] flex items-center justify-center ml-1 flex-shrink-0">
              <span className="text-white text-xs font-bold">A</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
