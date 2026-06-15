"use client";
import { Droplets, CheckCircle, Settings, AlertTriangle, Plus, Map, Wrench, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const barData = [
  { name: "يناير", حفر: 12, صيانة: 8 },
  { name: "فبراير", حفر: 19, صيانة: 11 },
  { name: "مارس", حفر: 15, صيانة: 14 },
  { name: "أبريل", حفر: 22, صيانة: 9 },
  { name: "مايو", حفر: 18, صيانة: 16 },
  { name: "يونيو", حفر: 25, صيانة: 12 },
];

const pieData = [
  { name: "طرابلس", value: 85 },
  { name: "بنغازي", value: 62 },
  { name: "مصراتة", value: 48 },
  { name: "أخرى", value: 105 },
];

const PIE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#94a3b8"];

const wells = [
  { name: "بئر الزاوية الشمالي", location: "طرابلس", status: "فعال" },
  { name: "بئر مصراتة المركزي", location: "مصراتة", status: "فعال" },
  { name: "بئر الزيان الزراعي", location: "بنغازي", status: "صيانة" },
  { name: "بئر سبها الغربي", location: "سبها", status: "فعال" },
];

const activities = [
  { text: "تم إضافة بئر جديد في طرابلس", time: "منذ 10 دقائق", color: "#3b82f6" },
  { text: "اكتمال صيانة بئر مصراتة", time: "منذ ساعة", color: "#22c55e" },
  { text: "تقرير جيولوجي جديد معتمد", time: "منذ 3 ساعات", color: "#f59e0b" },
  { text: "تحديث بيانات بئر بنغازي", time: "أمس", color: "#3b82f6" },
  { text: "طلب صيانة جديد لبئر سبها", time: "أمس", color: "#ef4444" },
];

export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#1e2d4e] mb-6">لوحة التحكم</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "إجمالي الآبار", value: 300, icon: Droplets, color: "#3b82f6", bg: "#eff6ff" },
          { label: "الآبار النشطة", value: 247, icon: CheckCircle, color: "#22c55e", bg: "#f0fdf4" },
          { label: "حالات الصيانة", value: 38, icon: Settings, color: "#f97316", bg: "#fff7ed" },
          { label: "الآبار المتعطلة", value: 15, icon: AlertTriangle, color: "#ef4444", bg: "#fef2f2" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-sm">{stat.label}</span>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: stat.bg }}>
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
              </div>
              <div className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-[#1e2d4e] mb-4">النشاط الشهري</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="حفر" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="صيانة" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-[#1e2d4e] mb-4">التوزيع الجغرافي</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-[#1e2d4e] mb-4">أبرز الآبار</h2>
          <div className="space-y-3">
            {wells.map((well, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <div className="text-sm font-medium text-gray-800">{well.name}</div>
                  <div className="text-xs text-gray-400">{well.location}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${well.status === 'فعال' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  {well.status}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-[#1e2d4e] mb-4">آخر النشاطات</h2>
          <div className="space-y-3">
            {activities.map((activity, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: activity.color }} />
                <div>
                  <div className="text-sm text-gray-700">{activity.text}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-[#1e2d4e] mb-4">الإجراءات السريعة</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "إضافة بئر جديد", icon: Plus, color: "#3b82f6", href: "/dashboard/wells/new" },
              { label: "فتح الخريطة", icon: Map, color: "#22c55e", href: "/dashboard/maps" },
              { label: "جدولة صيانة", icon: Wrench, color: "#f97316", href: "/dashboard/maintenance" },
              { label: "تقرير جديد", icon: FileText, color: "#8b5cf6", href: "/dashboard/reports" },
            ].map((action, i) => {
              const Icon = action.icon;
              return (
                <a key={i} href={action.href} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:shadow-sm transition-all text-center" style={{ backgroundColor: `${action.color}10` }}>
                  <Icon size={24} style={{ color: action.color }} />
                  <span className="text-xs font-medium text-gray-700">{action.label}</span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
