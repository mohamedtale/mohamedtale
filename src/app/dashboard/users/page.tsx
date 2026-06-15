"use client";
import { Plus, Search, Filter, Eye, Edit, Trash2, Shield, User, Clock } from "lucide-react";

const users = [
  { id: "EMP-2024-001", name: "أحمد محمد الصغير", email: "ahmed@water.gov.ly", phone: "0912345678", dept: "الرياضة الدائمة", role: "مدير النظام", status: "نشط", date: "2024-01-15" },
  { id: "EMP-2024-002", name: "فاطمة علي الفيتوري", email: "fatima@water.gov.ly", phone: "0913456789", dept: "التقنية الفنية", role: "موظف", status: "نشط", date: "2024-02-10" },
  { id: "EMP-2024-003", name: "محمد خالد المبروك", email: "mohammed@water.gov.ly", phone: "0914567890", dept: "الصيانة", role: "موظف", status: "نشط", date: "2024-03-05" },
  { id: "EMP-2024-004", name: "سامي حسن الزنتاني", email: "sami@water.gov.ly", phone: "0915678901", dept: "المالية", role: "زائر", status: "نشط", date: "2024-04-20" },
  { id: "EMP-2024-005", name: "نور الدين عبدالله", email: "nour@water.gov.ly", phone: "0916789012", dept: "المخابرات", role: "موظف", status: "قيد المراجعة", date: "2024-06-01" },
];

const roleColors: Record<string, string> = {
  "مدير النظام": "bg-purple-100 text-purple-700",
  "موظف": "bg-blue-100 text-blue-700",
  "زائر": "bg-gray-100 text-gray-600",
};

export default function UsersPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">إدارة المستخدمين</h1>
          <p className="text-gray-500 text-sm mt-1">التحكم في حسابات المستخدمين وصلاحياتهم</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus size={16} />
          <span>إضافة مستخدم جديد</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "إجمالي المستخدمين", value: 5, color: "bg-blue-500", Icon: User },
          { label: "المديرون", value: 1, color: "bg-purple-500", Icon: Shield },
          { label: "قيد المراجعة", value: 1, color: "bg-orange-500", Icon: Clock },
          { label: "المستخدمون النشطون", value: 4, color: "bg-green-500", Icon: User },
        ].map((s, i) => {
          const Icon = s.Icon;
          return (
            <div key={i} className={`${s.color} text-white rounded-2xl p-5`}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-4xl font-black">{s.value}</div>
                <Icon size={28} className="opacity-60" />
              </div>
              <div className="text-sm opacity-90">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Role Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { role: "مدير النظام", count: 1, perms: "كل الصلاحيات", Icon: Shield, color: "bg-purple-50 border-purple-200" },
          { role: "موظف", count: 3, perms: "إضافة / عرض / تعديل", Icon: User, color: "bg-blue-50 border-blue-200" },
          { role: "زائر", count: 1, perms: "عرض فقط", Icon: Eye, color: "bg-gray-50 border-gray-200" },
        ].map((r, i) => {
          const Icon = r.Icon;
          return (
            <div key={i} className={`${r.color} border rounded-xl p-4 flex items-center gap-4`}>
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                <Icon size={20} className="text-slate-600" />
              </div>
              <div>
                <div className="font-bold text-slate-800 text-sm">{r.role}</div>
                <div className="text-xs text-gray-500">{r.count} مستخدم</div>
                <div className="text-xs text-gray-400 mt-0.5">الصلاحيات: {r.perms}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <Search size={16} className="text-gray-400" />
            <input placeholder="البحث عن مستخدم..." className="bg-transparent text-sm outline-none flex-1 text-right" />
          </div>
          <button className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
            <Filter size={16} />
            <span>تصفية</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-right">
                {["المستخدم", "الرقم الوظيفي", "القسم", "الدور", "الحالة", "تاريخ الانضمام", "الإجراءات"].map(h => (
                  <th key={h} className="px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-slate-800">{u.name}</div>
                      <div className="text-xs text-gray-400">{u.email}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-blue-600">{u.id}</td>
                  <td className="px-4 py-3 text-gray-600">{u.dept}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[u.role] || "bg-gray-100 text-gray-600"}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      u.status === "نشط" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                    }`}>{u.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{u.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"><Eye size={14} /></button>
                      <button className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100"><Edit size={14} /></button>
                      <button className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
