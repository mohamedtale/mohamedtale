"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutDashboard,
  PlusCircle,
  Map,
  Database,
  Calculator,
  FileText,
  CheckSquare,
  Wrench,
  DollarSign,
  Users,
  User,
} from "lucide-react";

const menuItems: any[] = [
  { label: "الرئيسية", icon: Home, href: "/" },
  { label: "لوحة التحكم", icon: LayoutDashboard, href: "/dashboard" },
  {
    label: "إدارة الآبار",
    isSection: true,
    children: [
      { label: "إدخال بيانات بئر", icon: PlusCircle, href: "/dashboard/wells/new" },
      { label: "خريطة الآبار", icon: Map, href: "/dashboard/wells/map" },
      { label: "قاعدة البيانات", icon: Database, href: "/dashboard/wells" },
      { label: "تصميم البئر والميزانية", icon: Calculator, href: "/dashboard/wells/design" },
    ],
  },
  { label: "الخرائط", icon: Map, href: "/dashboard/maps" },
  { label: "التقارير الفنية", icon: FileText, href: "/dashboard/reports" },
  { label: "اعتماد التقارير", icon: CheckSquare, href: "/dashboard/reports/approval" },
  {
    label: "المتابعة والصيانة",
    isSection: true,
    children: [
      { label: "سجل الصيانة", icon: Wrench, href: "/dashboard/maintenance" },
    ],
  },
  { label: "العقود والأسعار", icon: DollarSign, href: "/dashboard/contracts" },
  { label: "إدارة المستخدمين", icon: Users, href: "/dashboard/users" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <div className="w-64 min-h-screen flex flex-col" style={{ backgroundColor: "#1e2d4e" }}>
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#3b82f6" }}>
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white text-xs font-semibold leading-tight">الجهاز التنفيذي</p>
            <p className="text-white/60 text-xs">حفر وصيانة آبار المياه</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto">
        {menuItems.map((item: any, idx: number) => {
          if (item.isSection) {
            return (
              <div key={idx} className="mb-2">
                <p className="text-white/40 text-xs px-3 py-2 uppercase tracking-wider">{item.label}</p>
                {item.children?.map((child: any) => {
                  const Icon = child.icon;
                  const active = isActive(child.href);
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 text-sm transition-colors ${
                        active ? "text-white" : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                      style={active ? { backgroundColor: "#3b82f6" } : {}}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{child.label}</span>
                    </Link>
                  );
                })}
              </div>
            );
          }

          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 text-sm transition-colors ${
                active ? "text-white" : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
              style={active ? { backgroundColor: "#3b82f6" } : {}}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white/20">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-medium">أحمد محمد</p>
            <p className="text-white/50 text-xs">مدير النظام</p>
          </div>
        </div>
      </div>
    </div>
  );
}
