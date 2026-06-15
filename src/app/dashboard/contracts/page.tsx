"use client";
import { Plus, Search, Filter, Eye, Edit, FileText } from "lucide-react";

const contracts = [
  { id: "CNT-001", title: "عقد حفر آبار منطقة طرابلس", vendor: "شركة المياه الوطنية", value: 450000, wells: 15, start: "2024-01-01", end: "2024-12-31", status: "نشط" },
  { id: "CNT-002", title: "عقد صيانة آبار بنغازي", vendor: "مؤسسة الحفر الليبية", value: 180000, wells: 8, start: "2024-03-01", end: "2024-09-30", status: "نشط" },
  { id: "CNT-003", title: "عقد تركيب مضخات مصراتة", vendor: "شركة المضخات العربية", value: 95000, wells: 5, start: "2024-02-15", end: "2024-06-15", status: "مكتمل" },
  { id: "CNT-004", title: "عقد مسح جيولوجي الجنوب", vendor: "مختبرات الجيولوجيا", value: 75000, wells: 0, start: "2024-05-01", end: "2024-08-31", status: "نشط" },
];

export default function ContractsPage() {
  const totalValue = contracts.reduce((s, c) => s + c.value, 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">العقود والأسعار</h1>
          <p className="text-gray-500 text-sm mt-1">إدارة العقود والتعاقدات المالية</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus size={16} />
          <span>إضافة عقد جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "إجمالي العقود", value: contracts.length, color: "bg-blue-500" },
          { label: "العقود النشطة", value: contracts.filter(c => c.status === "نشط").length, color: "bg-green-500" },
          { label: "إجمالي الآبار", value: contracts.reduce((s, c) => s + c.wells, 0), color: "bg-orange-500" },
          { label: "إجمالي القيمة (د.ل)", value: totalValue.toLocaleString("ar-LY"), color: "bg-purple-500" },
        ].map((s, i) => (
          <div key={i} className={`${s.color} text-white rounded-2xl p-5`}>
            <div className="text-3xl font-black">{s.value}</div>
            <div className="text-sm mt-1 opacity-90">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <Search size={16} className="text-gray-400" />
            <input placeholder="البحث في العقود..." className="bg-transparent text-sm outline-none flex-1 text-right" />
          </div>
          <button className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
            <Filter size={16} />
            <span>تصفية</span>
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {contracts.map(c => (
            <div key={c.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <FileText size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 text-sm">{c.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{c.vendor} • {c.start} إلى {c.end}</div>
                    {c.wells > 0 && <div className="text-xs text-blue-600 mt-0.5">{c.wells} بئر مشمول بالعقد</div>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold text-slate-800">{c.value.toLocaleString("ar-LY")} د.ل</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      c.status === "نشط" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}>{c.status}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"><Eye size={14} /></button>
                    <button className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100"><Edit size={14} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
