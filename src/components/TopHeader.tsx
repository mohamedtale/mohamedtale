"use client";
import { useState } from "react";
import { Search, Bell, Settings, ChevronDown, Droplets } from "lucide-react";
import { usePathname } from "next/navigation";

const BREADCRUMBS: Record<string, string[]> = {
  "/dashboard": ["الرئيسية", "لوحة التحكم"],
  "/dashboard/wells": ["الرئيسية", "إدارة الآبار", "قائمة الآبار"],
  "/dashboard/wells/new": ["الرئيسية", "إدارة الآبار", "إضافة بئر جديد"],
  "/dashboard/wells/map": ["الرئيسية", "إدارة الآبار", "خريطة الآبار"],
  "/dashboard/wells/design": ["الرئيسية", "إدارة الآبار", "تصميم البئر"],
  "/dashboard/maintenance": ["الرئيسية", "الصيانة"],
  "/dashboard/reports": ["الرئيسية", "التقارير"],
  "/dashboard/users": ["الرئيسية", "الإعدادات", "المستخدمون"],
  "/dashboard/maps": ["الرئيسية", "جودة المياه"],
  "/dashboard/contracts": ["الرئيسية", "العقود"],
};

export default function TopHeader() {
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);

  const crumbs = BREADCRUMBS[pathname] || ["الرئيسية"];

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center px-5 gap-4 shrink-0 z-10">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 flex-1 min-w-0">
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-gray-200">/</span>}
            <span className={i === crumbs.length - 1 ? "text-gray-700 font-semibold" : ""}>{c}</span>
          </span>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 w-56 border border-gray-100">
        <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="بحث سريع..."
          className="bg-transparent text-xs outline-none flex-1 text-right placeholder:text-gray-400"
        />
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setNotifOpen(p => !p)}
          className="relative w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors border border-gray-100"
        >
          <Bell className="w-3.5 h-3.5 text-gray-500" />
          <span className="absolute -top-0.5 -left-0.5 w-3.5 h-3.5 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center font-bold">3</span>
        </button>
        {notifOpen && (
          <div className="absolute left-0 top-10 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden" dir="rtl">
            <div className="p-3 border-b border-gray-50">
              <p className="text-xs font-bold text-gray-700">الإشعارات</p>
            </div>
            {[
              { icon: "🔧", text: "بئر مصراتة المركزي يحتاج صيانة دورية", time: "منذ 10 دقائق" },
              { icon: "📋", text: "تقرير جديد بانتظار المراجعة", time: "منذ ساعة" },
              { icon: "⚠️", text: "بئر الكفرة متعطل — مطلوب تدخل عاجل", time: "منذ 3 ساعات" },
            ].map((n, i) => (
              <div key={i} className="flex items-start gap-2.5 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                <span className="text-base shrink-0">{n.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 leading-snug">{n.text}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User */}
      <div className="flex items-center gap-2 pl-2 border-r border-gray-100 pr-4">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center text-white text-xs font-bold">م</div>
        <div className="hidden sm:block">
          <p className="text-xs font-semibold text-gray-700 leading-none">مدير النظام</p>
          <p className="text-[10px] text-gray-400 mt-0.5">admin</p>
        </div>
        <ChevronDown className="w-3 h-3 text-gray-400" />
      </div>
    </header>
  );
}
