"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions/auth";
import { LayoutDashboard, Home, Calendar, Users, LogOut, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide sidebar on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const sidebarLinks = [
    { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Manage Villas", href: "/admin/villas", icon: Home },
    { name: "Promo", href: "/admin/promos", icon: Tag },
    { name: "Bookings", href: "/admin/bookings", icon: Users },
    { name: "Calendar", href: "/admin/calendar", icon: Calendar },
  ];

  return (
    <div className="flex min-h-screen bg-[#F7F6F2]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 z-10">
        <div className="p-6 border-b border-gray-100 flex-shrink-0">
          <Link href="/admin/dashboard" className="block text-2xl font-bold text-[#3A4A1F] tracking-tight hover:opacity-80 transition-opacity">
            Lodjisvarga
          </Link>
          <p className="text-sm text-gray-500 font-light mt-1">Admin Portal</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                  isActive 
                    ? "bg-[#3A4A1F] text-white shadow-md shadow-[#3A4A1F]/20" 
                    : "text-gray-600 hover:bg-[#A8BFA3]/20 hover:text-[#3A4A1F]"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-[#A8BFA3]" : ""}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={async () => { await logout(); }}
            className="w-full flex items-center justify-start gap-3 px-4 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 font-medium"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content (Offset by sidebar width) */}
      <main className="flex-1 ml-64 overflow-x-hidden min-h-screen">
        {children}
      </main>
    </div>
  );
}
