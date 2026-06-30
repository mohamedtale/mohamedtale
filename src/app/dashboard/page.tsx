"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Droplets, Wrench, AlertTriangle, CheckCircle, TrendingUp, TrendingDown,
  PlusCircle, FileText, MapPin, Activity, BarChart2, Eye
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadialBarChart, RadialBar
} from "recharts";

const MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو"];
const REGIONS = ["طرابلس", "مصراتة", "بنغازي", "الزاوية", "سرت", "ترهونة", "البيضاء", "درنة", "سبها", "غدامس"];

const waterLevelData = MONTHS.map((m, i) => ({
  name: m,
  value: [38, 42, 35, 45, 40, 43][i],
}));

const regionData = REGIONS.map((r, i) => ({
  name: r,
  value: [210, 185, 165, 142, 130, 98, 76, 62, 52, 28][i],
}));

const qualityData = [
  { name: "ممتازة", value: 32, color: "#22c55e" },
  { name: "جيدة", value: 41, color: "#3b82f6" },
  { name: "متوسطة", value: 17, color: "#f59e0b" },
  { name: "ضعيفة", value: 10, color: "#ef4444" },
];

const STATUS_MAP: Record<string, { bg: string; color: string }> = {
  "فعال": { bg: "#dcfce7", color: "#16a34a" },
  "صيانة": { bg: "#fef3c7", color: "#d97706" },
  "متعطل": { bg: "#fee2e2", color: "#dc2626" },
  "قيد الإنشاء": { bg: "#ede9fe", color: "#7c3aed" },
};

export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, active: 0, maintenance: 0, broken: 0 });
  const [wells, setWells] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/stats").then(r => r.json()),
      fetch("/api/wells").then(r => r.json()),
    ]).then(([s, w]) => {
      setStats(s);
      setWells(Array.isArray(w) ? w : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Mini map
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || loading || wells.length === 0) return;
    const init = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
      const map = L.map(mapRef.current!, { center: [27, 17], zoom: 4, zoomControl: false, scrollWheelZoom: false });
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { attribution: "© Esri" }).addTo(map);
      mapInstanceRef.current = map;
      wells.filter(w => w.latitude && w.longitude).forEach(w => {
        const color = { "فعال": "#22c55e", "صيانة": "#f59e0b", "متعطل": "#ef4444" }[w.status as string] || "#8b5cf6";
        L.circleMarker([w.latitude, w.longitude], { radius: 5, fillColor: color, color: "white", weight: 1.5, fillOpacity: 1 })
          .bindPopup(`<div dir="rtl"><b>${w.name}</b><br/><small>${w.status}</small></div>`)
          .addTo(map);
      });
    };
    init();
  }, [wells, loading]);

  const suspended = stats.total - stats.active - stats.maintenance - (stats.broken || 0);
  const faultPct = stats.total ? ((stats.broken || 0) / stats.total * 100).toFixed(1) : "0";

  const statCards = [
    { label: "إجمالي الآبار", value: stats.total, icon: Droplets, color: "#3b82f6", bg: "#1e40af", trend: "+12", up: true },
    { label: "الآبار النشطة", value: stats.active, icon: CheckCircle, color: "#22c55e", bg: "#15803d", trend: "78.5%", up: true },
    { label: "تحت الصيانة", value: stats.maintenance, icon: Wrench, color: "#f59e0b", bg: "#b45309", trend: "11.5%", up: false },
    { label: "الآبار المتوقفة", value: stats.broken || 0, icon: AlertTriangle, color: "#ef4444", bg: "#b91c1c", trend: "10%", up: false },
    { label: "متوسط منسوب المياه", value: "42.7", unit: "متر", icon: Activity, color: "#8b5cf6", bg: "#6d28d9", trend: "-2.4%", up: false },
  ];

  const skel = "animate-pulse bg-white/10 rounded-xl";

  return (
    <div className="p-4 lg:p-6 space-y-5" dir="rtl">

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {statCards.map((c, i) => (
          <div key={i} className="rounded-2xl p-4 text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${c.bg}, ${c.color})` }}>
            <div className="absolute -left-3 -top-3 w-16 h-16 rounded-full opacity-10 bg-white" />
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
              <c.icon className="w-5 h-5 text-white" />
            </div>
            {loading ? <div className={`${skel} h-8 w-16 mb-1`} /> : (
              <p className="text-2xl font-black">{c.value}{c.unit ? <span className="text-sm font-normal mr-1">{c.unit}</span> : ""}</p>
            )}
            <p className="text-white/70 text-xs">{c.label}</p>
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${c.up ? "text-green-300" : "text-red-300"}`}>
              {c.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {c.trend} من الشهر الماضي
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Charts + Map */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* Water level area chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-800 text-sm">تطور منسوب المياه</h2>
              <p className="text-xs text-gray-400">آخر 6 أشهر</p>
            </div>
            <select className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-500 outline-none">
              <option>جميع المناطق</option>
              {REGIONS.slice(0, 4).map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={waterLevelData}>
              <defs>
                <linearGradient id="wl" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip formatter={(v) => [`${v} م`, "المنسوب"]} />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#wl)" dot={{ fill: "#3b82f6", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quality pie */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 text-sm mb-4">توزيع جودة المياه</h2>
          <div className="flex items-center gap-3">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={qualityData} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value" paddingAngle={2}>
                  {qualityData.map((q, i) => <Cell key={i} fill={q.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {qualityData.map(q => (
                <div key={q.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: q.color }} />
                    <span className="text-xs text-gray-600">{q.name}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-700">{q.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fault rate */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 text-sm mb-4">نسبة الأعطال</h2>
          <div className="flex items-center justify-center mb-3">
            <div className="relative">
              <ResponsiveContainer width={120} height={120}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%"
                  data={[{ value: parseFloat(faultPct), fill: "#ef4444" }]} startAngle={90} endAngle={-270}>
                  <RadialBar dataKey="value" background={{ fill: "#f1f5f9" }} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-black text-gray-800">{faultPct}%</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { label: "أعطال مفتوحة", value: stats.broken || 0, color: "#ef4444" },
              { label: "قيد المعالجة", value: stats.maintenance || 0, color: "#f59e0b" },
              { label: "مغلقة", value: stats.active || 0, color: "#22c55e" },
            ].map(x => (
              <div key={x.label} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: x.color }} />
                  <span className="text-gray-500">{x.label}</span>
                </div>
                <span className="font-bold" style={{ color: x.color }}>{x.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Bar chart + Map */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Region bar chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 text-sm">عدد الآبار حسب المنطقة</h2>
            <BarChart2 size={16} className="text-gray-300" />
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={regionData} layout="vertical" margin={{ right: 30 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#64748b" }} width={50} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => [`${v} بئر`, "العدد"]} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}
                fill="url(#bar-grad)"
              >
                <defs>
                  <linearGradient id="bar-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                </defs>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Map */}
        <div className="lg:col-span-3 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <div className="p-4 flex items-center justify-between border-b border-gray-100">
            <div>
              <h2 className="font-bold text-gray-800 text-sm">خريطة الآبار</h2>
              <p className="text-xs text-gray-400">توزيع جغرافي</p>
            </div>
            <Link href="/dashboard/wells/map" className="text-xs text-blue-500 font-medium hover:underline flex items-center gap-1">
              <MapPin size={12} /> عرض الكاملة
            </Link>
          </div>
          <div ref={mapRef} style={{ height: 220 }} />
        </div>
      </div>

      {/* Row 4: Wells table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b border-gray-100">
          <h2 className="font-bold text-gray-800 text-sm">أحدث الآبار</h2>
          <Link href="/dashboard/wells" className="text-xs text-blue-500 font-medium hover:underline flex items-center gap-1">
            <Eye size={12} /> عرض الكل
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" dir="rtl">
            <thead>
              <tr className="bg-slate-50 text-gray-500 text-xs">
                {["#", "رقم البئر", "اسم البئر", "المنطقة", "البلدية", "الإحداثيات", "العمق (م)", "الحالة", "آخر صيانة", "الإجراءات"].map(h => (
                  <th key={h} className="px-4 py-3 text-right font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="border-t border-gray-50">
                    {Array(10).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : wells.slice(0, 8).map((w, idx) => {
                const st = STATUS_MAP[w.status] || { bg: "#f3f4f6", color: "#6b7280" };
                return (
                  <tr key={w.id} className="border-t border-gray-50 hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                    <td className="px-4 py-3 font-mono text-blue-600 font-semibold text-xs">{w.wellId}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{w.name}</td>
                    <td className="px-4 py-3 text-gray-600">{w.region}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{w.location || "—"}</td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                      {w.latitude ? `${w.latitude.toFixed(4)}, ${w.longitude?.toFixed(4)}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{w.depth ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: st.bg, color: st.color }}>{w.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(w.createdAt).toLocaleDateString("ar-LY")}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/dashboard/wells/${w.id}`} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                          <Eye size={13} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Bottom toolbar */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/wells/new"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
              style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}>
              <PlusCircle size={14} /> إضافة بئر جديد
            </Link>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
              <FileText size={14} /> تصدير
            </button>
          </div>
          <p className="text-xs text-gray-400">إجمالي {wells.length} بئر</p>
        </div>
      </div>
    </div>
  );
}
