"use client";
import { useEffect, useState } from "react";
import { Search, Filter, Plus, Eye, Edit, Trash2, RefreshCw, Droplets } from "lucide-react";

interface Well {
  id: string; wellId: string; name: string; region: string;
  depth: number | null; type: string; status: string; createdAt: string;
}

export default function WellsPage() {
  const [wells, setWells] = useState<Well[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchWells = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/wells?${params.toString()}`);
      const data = await res.json();
      setWells(Array.isArray(data) ? data : []);
    } catch {
      setWells([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWells(); }, []);

  const handleSearch = () => fetchWells();

  const deleteWell = async (id: string, name: string) => {
    if (!confirm(`هل تريد حذف البئر "${name}"؟`)) return;
    try {
      await fetch(`/api/wells/${id}`, { method: "DELETE" });
      setWells(prev => prev.filter(w => w.id !== id));
    } catch {
      alert("فشل حذف البئر");
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; color: string }> = {
      "فعال": { bg: "#dcfce7", color: "#16a34a" },
      "صيانة": { bg: "#fef3c7", color: "#d97706" },
      "متعطل": { bg: "#fee2e2", color: "#dc2626" },
      "قيد الإنشاء": { bg: "#ede9fe", color: "#7c3aed" },
    };
    return map[status] || { bg: "#f3f4f6", color: "#6b7280" };
  };

  return (
    <div className="p-6 lg:p-8" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800">قاعدة بيانات الآبار</h1>
          <p className="text-gray-500 text-sm mt-1">إجمالي الآبار: {wells.length}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchWells} className="flex items-center gap-2 border border-gray-200 bg-white px-3 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <a href="/dashboard/wells/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm"
            style={{ background: "linear-gradient(135deg,#1565C0,#2196F3)" }}>
            <Plus size={16} />
            <span>إضافة بئر</span>
          </a>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex gap-3 flex-wrap">
          <div className="flex-1 min-w-48 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
            <Search size={16} className="text-gray-400 flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="البحث بالاسم أو المنطقة أو الرقم..."
              className="bg-transparent text-sm outline-none flex-1 text-right"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); }}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 outline-none focus:border-blue-500 bg-white"
          >
            <option value="">جميع الحالات</option>
            <option value="فعال">فعال</option>
            <option value="صيانة">صيانة</option>
            <option value="متعطل">متعطل</option>
            <option value="قيد الإنشاء">قيد الإنشاء</option>
          </select>
          <button onClick={handleSearch} className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <Filter size={16} />
            <span>بحث</span>
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <RefreshCw size={32} className="animate-spin mx-auto mb-3 text-blue-500" />
            <p>جاري التحميل...</p>
          </div>
        ) : wells.length === 0 ? (
          <div className="p-12 text-center">
            <Droplets className="w-14 h-14 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">لا توجد آبار مسجلة</p>
            <p className="text-gray-300 text-sm mt-1">ابدأ بإضافة أول بئر في النظام</p>
            <a href="/dashboard/wells/new"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl text-white font-bold text-sm"
              style={{ background: "linear-gradient(135deg,#1565C0,#2196F3)" }}>
              <Plus size={16} /> إضافة بئر جديد
            </a>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "#f8faff" }} className="text-gray-600 text-right">
                  {["رقم البئر","اسم البئر","المنطقة","العمق (م)","النوع","الحالة","تاريخ الإضافة","الإجراءات"].map(h => (
                    <th key={h} className="px-4 py-3 font-bold text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {wells.map(well => {
                  const badge = statusBadge(well.status);
                  return (
                    <tr key={well.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-blue-600 font-semibold text-xs">{well.wellId}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{well.name}</td>
                      <td className="px-4 py-3 text-gray-600">{well.region}</td>
                      <td className="px-4 py-3 text-gray-600">{well.depth ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{well.type}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={badge}>
                          {well.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{new Date(well.createdAt).toLocaleDateString("ar-LY")}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <a href={`/dashboard/wells/${well.id}`} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors inline-flex"><Eye size={14} /></a>
                          <a href={`/dashboard/wells/${well.id}/edit`} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors inline-flex"><Edit size={14} /></a>
                          <button onClick={() => deleteWell(well.id, well.name)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
