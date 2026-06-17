"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Droplets, Wrench, AlertTriangle, CheckCircle, PlusCircle, Map, FileText, Settings, TrendingUp, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const MONTHS = ["يناير","فبراير","مارس","أبريل","مايو","يونيو"];
const PIE_COLORS = ["#1565C0","#2196F3","#f97316","#22c55e"];

export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, active: 0, maintenance: 0, broken: 0, reports: 0, contracts: 0 });
  const [wells, setWells] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/stats").then(r => r.json()),
      fetch("/api/wells").then(r => r.json()),
      fetch("/api/maintenance").then(r => r.json()),
    ]).then(([s, w, m]) => {
      setStats(s);
      setWells(Array.isArray(w) ? w.slice(0, 5) : []);
      setMaintenance(Array.isArray(m) ? m.slice(0, 5) : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: "إجمالي الآبار", value: stats.total, icon: Droplets, color: "#1565C0", bg: "#dbeafe" },
    { label: "الآبار الفعالة", value: stats.active, icon: CheckCircle, color: "#16a34a", bg: "#dcfce7" },
    { label: "تحت الصيانة", value: stats.maintenance, icon: Wrench, color: "#d97706", bg: "#fef3c7" },
    { label: "الآبار المتعطلة", value: stats.broken, icon: AlertTriangle, color: "#dc2626", bg: "#fee2e2" },
  ];

  const pieData = [
    { name: "فعال", value: stats.active || 1 },
    { name: "صيانة", value: stats.maintenance || 0 },
    { name: "متعطل", value: stats.broken || 0 },
  ];

  const skel = "animate-pulse bg-gray-200 rounded-xl";

  return (
    <div className="p-6 lg:p-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-800">لوحة التحكم</h1>
        <p className="text-gray-500 text-sm mt-1">مرحباً — إليك نظرة عامة على النظام</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((c, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            {loading ? (
              <div className={`${skel} h-16 w-full`} />
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: c.bg }}>
                    <c.icon className="w-5 h-5" style={{ color: c.color }} />
                  </div>
                  <TrendingUp className="w-4 h-4 text-gray-300" />
                </div>
                <p className="text-3xl font-black text-gray-800">{c.value}</p>
                <p className="text-gray-500 text-xs mt-1">{c.label}</p>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Bar chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-4 text-sm">النشاط الشهري</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MONTHS.map((m, i) => ({ name: m, حفر: Math.floor(Math.random() * 20) + 5, صيانة: Math.floor(Math.random() * 15) + 3 }))}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="حفر" fill="#1565C0" radius={[4, 4, 0, 0]} />
              <Bar dataKey="صيانة" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-4 text-sm">حالة الآبار</h2>
          {loading ? <div className={`${skel} h-40 w-full`} /> : (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={["#22c55e","#f97316","#ef4444"][i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="space-y-2 mt-2">
            {[{ l: "فعال", c: "#22c55e" }, { l: "صيانة", c: "#f97316" }, { l: "متعطل", c: "#ef4444" }].map(x => (
              <div key={x.l} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: x.c }} />
                <span className="text-gray-600">{x.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent wells */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 text-sm">أحدث الآبار</h2>
            <Link href="/dashboard/wells" className="text-xs text-blue-600 font-medium hover:underline">عرض الكل</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className={`${skel} h-12 w-full`} />)}</div>
          ) : wells.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">لا توجد آبار مسجلة بعد</p>
          ) : (
            <div className="space-y-2">
              {wells.map((w: any) => (
                <div key={w.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#dbeafe" }}>
                    <Droplets className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{w.name}</p>
                    <p className="text-xs text-gray-400">{w.region} • {w.wellId}</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0"
                    style={{
                      backgroundColor: w.status === "فعال" ? "#dcfce7" : w.status === "صيانة" ? "#fef3c7" : "#fee2e2",
                      color: w.status === "فعال" ? "#16a34a" : w.status === "صيانة" ? "#d97706" : "#dc2626",
                    }}>
                    {w.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-4 text-sm">إجراءات سريعة</h2>
          <div className="space-y-2">
            {[
              { href: "/dashboard/wells/new", icon: PlusCircle, label: "إضافة بئر جديد", color: "#1565C0" },
              { href: "/dashboard/maintenance", icon: Wrench, label: "سجل الصيانة", color: "#d97706" },
              { href: "/dashboard/reports", icon: FileText, label: "التقارير الفنية", color: "#16a34a" },
              { href: "/dashboard/contracts", icon: Settings, label: "العقود", color: "#7c3aed" },
              { href: "/dashboard/maps", icon: Map, label: "خريطة الآبار", color: "#0891b2" },
            ].map((a, i) => (
              <Link key={i} href={a.href}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: a.color + "15" }}>
                  <a.icon className="w-4 h-4" style={{ color: a.color }} />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
