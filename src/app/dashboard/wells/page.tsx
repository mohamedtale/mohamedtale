"use client";
import { Search, Filter, MoreVertical, Edit, Trash2 } from "lucide-react";

const wells = [
  { name: "أحمد محمد الصغير", id: "W-001", phone: "0912345678", whatsapp: "0912345678", role: "مدير", dept: "الإدارة", status: "فعال", date: "2024-01-15", location: "طرابلس" },
  { name: "فاطمة علي الفيتوري", id: "W-003", phone: "0923456789", whatsapp: "0923456789", role: "موظف", dept: "التقنية", status: "فعال", date: "2024-02-20", location: "مصراتة" },
  { name: "محمد خالد المبروك", id: "W-008", phone: "0934567890", whatsapp: "0934567890", role: "موظف", dept: "الصيانة", status: "صيانة", date: "2024-03-10", location: "بنغازي" },
  { name: "سامي حسن الزنتاني", id: "W-004", phone: "0945678901", whatsapp: "0945678901", role: "زائر", dept: "المالية", status: "فعال", date: "2024-04-05", location: "سبها" },
  { name: "نور الدين عبدالله", id: "W-012", phone: "0956789012", whatsapp: "0956789012", role: "موظف", dept: "الجيولوجيا", status: "فعال", date: "2024-05-12", location: "الزاوية" },
];

export default function WellsPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1e2d4e]">قاعدة البيانات</h1>
        <a href="/dashboard/wells/new" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
          <span>+ إضافة بئر</span>
        </a>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="البحث عن بئر..."
              className="w-full border border-gray-200 rounded-lg px-4 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 flex items-center gap-2 hover:bg-gray-50">
            <Filter size={16} />
            <span>تصفية</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["المستخدم", "الرقم الوظيفي", "الهاتف", "الواتساب", "الدور", "القسم", "الحالة", "تاريخ الانضمام", "الإجراءات"].map(h => (
                  <th key={h} className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {wells.map((well, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{well.name}</div>
                    <div className="text-xs text-gray-400">{well.location}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono">{well.id}</td>
                  <td className="px-4 py-3 text-gray-600">{well.phone}</td>
                  <td className="px-4 py-3 text-gray-600">{well.whatsapp}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${well.role === 'مدير' ? 'bg-purple-100 text-purple-700' : well.role === 'زائر' ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'}`}>
                      {well.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{well.dept}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${well.status === 'فعال' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {well.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{well.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="text-blue-500 hover:text-blue-700"><Edit size={14} /></button>
                      <button className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                      <button className="text-gray-400 hover:text-gray-600"><MoreVertical size={14} /></button>
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
