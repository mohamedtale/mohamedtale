"use client";
import { useEffect, useState } from "react";
import { Search, Filter, Plus, Eye, Edit, Trash2, RefreshCw } from "lucide-react";

interface Well {
  id: string; wellId: string; name: string; region: string;
  depth: number | null; type: string; status: string; createdAt: string;
}

export default function WellsPage() {
  const [wells, setWells] = useState<Well[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchWells = async () => {
    setLoading(true);
    const res = await fetch("/api/wells");
    const data = await res.json();
    setWells(data);
    setLoading(false);
  };

  useEffect(() => { fetchWells(); }, []);

  const filtered = wells.filter(w =>
    w.name.includes(search) || w.region.includes(search) || w.wellId.includes(search)
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">قاعدة البيانات</h1>
          <p className="text-gray-500 text-sm mt-1">إجمالي الآبار: {wells.length}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchWells} className="flex items-center gap-2 border border-gray-200 bg-white px-3 py-2 rounded-lg text-sm hover:bg-gray-50">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <a href="/dashboard/wells/new" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus size={16} />
            <span>إضافة بئر</span>
          </a>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex gap-3">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <Search size={16} className="text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="البحث بالاسم أو المنطقة أو الرقم..." className="bg-transparent text-sm outline-none flex-1 text-right" />
          </div>
          <button className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
            <Filter size={16} />
            <span>تصفية</span>
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <RefreshCw size={32} className="animate-spin mx-auto mb-3" />
            <p>جاري التحميل...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">لا توجد نتائج</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-right">
                  {["رقم البئر","اسم البئر","المنطقة","العمق (م)","النوع","الحالة","تاريخ الإضافة","الإجراءات"].map(h => (
                    <th key={h} className="px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(well => (
                  <tr key={well.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-blue-600 font-medium">{well.wellId}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{well.name}</td>
                    <td className="px-4 py-3 text-gray-600">{well.region}</td>
                    <td className="px-4 py-3 text-gray-600">{well.depth ?? "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{well.type}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        well.status === "فعال" ? "bg-green-100 text-green-700" :
                        well.status === "صيانة" ? "bg-orange-100 text-orange-700" :
                        "bg-red-100 text-red-700"}`}>{well.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(well.createdAt).toLocaleDateString("ar-LY")}</td>
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
        )}
      </div>
    </div>
  );
}
