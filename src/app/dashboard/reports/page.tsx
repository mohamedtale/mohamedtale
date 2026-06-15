"use client";
import { Search, Upload, Eye, Download, FileText } from "lucide-react";
import { useState } from "react";

const reports = [
  { title: "تقرير الحفر الجيولوجي - بئر طرابلس", author: "أحمد محمد", reviewer: "م. خالد علي", date: "2024-06-10", status: "معتمد", tags: ["جيولوجيا", "حفر"], size: "2.3 MB" },
  { title: "تقرير صيانة بئر مصراتة المركزي", author: "فاطمة علي", reviewer: "م. سامي حسن", date: "2024-06-08", status: "قيد المراجعة", tags: ["صيانة"], size: "1.8 MB" },
  { title: "تحليل جودة المياه - بنغازي", author: "محمد خالد", reviewer: "د. نور الدين", date: "2024-06-05", status: "معتمد", tags: ["جودة المياه"], size: "3.1 MB" },
  { title: "تقرير الميزانية الفصلي Q2", author: "سامي حسن", reviewer: "أحمد محمد", date: "2024-06-01", status: "مسودة", tags: ["مالي"], size: "0.9 MB" },
  { title: "تقرير حفر بئر سبها الغربي", author: "نور الدين", reviewer: "م. خالد علي", date: "2024-05-28", status: "قيد المراجعة", tags: ["حفر"], size: "4.2 MB" },
  { title: "تقرير المسح الجيولوجي الشامل", author: "أحمد محمد", reviewer: "د. محمد", date: "2024-05-20", status: "معتمد", tags: ["جيولوجيا"], size: "5.6 MB" },
];

const statusColors: Record<string, string> = {
  "معتمد": "bg-green-100 text-green-700",
  "قيد المراجعة": "bg-yellow-100 text-yellow-700",
  "مسودة": "bg-gray-100 text-gray-700",
};

const filters = ["الكل", "جيولوجيا", "صيانة", "حفر", "جودة المياه", "مالي"];

export default function ReportsPage() {
  const [activeFilter, setActiveFilter] = useState("الكل");
  const [statusFilter, setStatusFilter] = useState("الكل");

  const filtered = reports.filter(r => {
    const tagMatch = activeFilter === "الكل" || r.tags.includes(activeFilter);
    const statusMatch = statusFilter === "الكل" || r.status === statusFilter;
    return tagMatch && statusMatch;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1e2d4e]">التقارير الفنية</h1>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Upload size={16} />
          رفع تقرير فني جديد
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "مسودات", value: 1, color: "text-gray-600", bg: "bg-gray-100" },
          { label: "قيد المراجعة", value: 2, color: "text-yellow-700", bg: "bg-yellow-100" },
          { label: "معتمد", value: 3, color: "text-green-700", bg: "bg-green-100" },
          { label: "إجمالي التقارير", value: 6, color: "text-blue-700", bg: "bg-blue-100" },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-2xl p-4`}>
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className={`text-sm ${s.color} mt-1`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search + Tags */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
        <div className="flex gap-3 mb-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="البحث في التقارير..." className="w-full border border-gray-200 rounded-lg px-4 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${activeFilter === f ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        {["الكل", "مسودة", "قيد المراجعة", "معتمد"].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s === "قيد المراجعة" ? "قيد المراجعة" : s)}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${statusFilter === s || (s === "قيد المراجعة" && statusFilter === "قيد المراجعة") ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {s}{s === "قيد المراجعة" && <span className="mr-1 text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">2</span>}
          </button>
        ))}
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((report, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[report.status]}`}>
                {report.status}
              </span>
              <span className="text-xs text-gray-400">{report.size}</span>
            </div>
            <div className="flex items-start gap-3 mb-3">
              <FileText size={20} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <h3 className="font-medium text-gray-800 text-sm leading-relaxed">{report.title}</h3>
            </div>
            <div className="text-xs text-gray-500 space-y-1 mb-3">
              <div>الكاتب: <span className="text-gray-700">{report.author}</span></div>
              <div>المراجع: <span className="text-gray-700">{report.reviewer}</span></div>
              <div>التاريخ: <span className="text-gray-700">{report.date}</span></div>
            </div>
            <div className="flex flex-wrap gap-1 mb-4">
              {report.tags.map(tag => (
                <span key={tag} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-1 border border-gray-200 rounded-lg py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors">
                <Eye size={12} /> عرض
              </button>
              <button className="flex-1 flex items-center justify-center gap-1 bg-blue-50 text-blue-600 rounded-lg py-1.5 text-xs hover:bg-blue-100 transition-colors">
                <Download size={12} /> تحميل
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
