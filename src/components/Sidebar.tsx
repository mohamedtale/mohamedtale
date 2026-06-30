"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, PlusCircle, Map, Database, FileText, CheckSquare,
  Wrench, DollarSign, Users, LogOut, ChevronDown, Droplets,
  BarChart2, Settings, Bell, Home, Shield,
} from "lucide-react";

const MENU = [
  { label: "الرئيسية", icon: Home, href: "/" },
  { label: "لوحة التحكم", icon: LayoutDashboard, href: "/dashboard", exact: true },
  {
    label: "إدارة البيانات", icon: Database, section: true,
    children: [
      { label: "قاعدة البيانات", icon: Database, href: "/dashboard/wells" },
      { label: "تحليل البيانات", icon: BarChart2, href: "/dashboard/wells/design" },
    ],
  },
  {
    label: "إدارة الآبار", icon: Droplets, section: true,
    children: [
      { label: "قائمة الآبار", icon: Database, href: "/dashboard/wells" },
      { label: "إضافة بئر جديد", icon: PlusCircle, href: "/dashboard/wells/new" },
      { label: "خريطة الآبار", icon: Map, href: "/dashboard/wells/map" },
      { label: "تصميم البئر", icon: Settings, href: "/dashboard/wells/design" },
    ],
  },
  {
    label: "التقارير", icon: FileText, section: true,
    children: [
      { label: "التقارير العامة", icon: FileText, href: "/dashboard/reports" },
      { label: "التقارير المخصصة", icon: CheckSquare, href: "/dashboard/reports/approval" },
    ],
  },
  { label: "الصيانة", icon: Wrench, href: "/dashboard/maintenance" },
  { label: "جودة المياه", icon: Droplets, href: "/dashboard/maps" },
  {
    label: "الإعدادات", icon: Settings, section: true,
    children: [
      { label: "إعدادات النظام", icon: Settings, href: "/dashboard/content/site" },
      { label: "إدارة المستخدمين", icon: Users, href: "/dashboard/users" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState<Record<string, boolean>>({ "إدارة الآبار": true });

  const isActive = (href: string, exact?: boolean) => {
    if (exact || href === "/") return pathname === href;
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="w-60 min-h-screen flex flex-col shrink-0" style={{ background: "linear-gradient(180deg,#0f172a 0%,#1e293b 100%)" }}>
      {/* Logo */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}>
            <Droplets className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white text-xs font-bold leading-tight">الجهاز التنفيذي</p>
            <p className="text-blue-400 text-[10px]">لحفر وصيانة آبار المياه</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto space-y-0.5 scrollbar-none">
        {MENU.map((item, idx) => {
          if (item.section) {
            const expanded = open[item.label] !== false;
            return (
              <div key={idx} className="mb-1">
                <button
                  onClick={() => setOpen(p => ({ ...p, [item.label]: !expanded }))}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-white/50 hover:text-white/70 transition-colors text-xs font-semibold uppercase tracking-wider"
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? "rotate-0" : "-rotate-90"}`} />
                </button>
                {expanded && (
                  <div className="mr-2 border-r border-white/10 pr-1 mt-0.5 space-y-0.5">
                    {item.children?.map((child: any) => {
                      const active = isActive(child.href);
                      return (
                        <Link key={child.href} href={child.href}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                            active
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                              : "text-white/60 hover:text-white hover:bg-white/8"
                          }`}>
                          <child.icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const active = isActive(item.href, item.exact);
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all mb-0.5 ${
                active
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                  : "text-white/60 hover:text-white hover:bg-white/8"
              }`}>
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center text-white text-xs font-bold shrink-0">م</div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">مدير النظام</p>
            <p className="text-white/40 text-[10px]">admin@water.gov.ly</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/50 hover:text-red-400 hover:bg-red-500/10 text-xs transition-all">
          <LogOut className="w-3.5 h-3.5" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
}
