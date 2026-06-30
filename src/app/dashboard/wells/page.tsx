"use client";
import { useEffect, useState } from "react";
import { Search, Plus, Eye, Edit, Trash2, RefreshCw, Droplets, MapPin, TrendingUp, AlertTriangle, CheckCircle, Download, Filter, ChevronUp, ChevronDown } from "lucide-react";

interface Well {
  id: string; wellId: string; name: string; region: string;
  depth: number | null; type: string; status: string; createdAt: string; cost?: number | null;
}

const STATUS_CONFIG: Record<string, { bg: string; color: string; dot: string }> = {
  "فعال":        { bg: "#dcfce7", color: "#16a34a", dot: "#22c55e" },
  "صيانة":       { bg: "#fef3c7", color: "#d97706", dot: "#f59e0b" },
  "متعطل":       { bg: "#fee2e2", color: "#dc2626", dot: "#ef4444" },
  "قيد الإنشاء": { bg: "#ede9fe", color: "#7c3aed", dot: "#8b5cf6" },
};

type SortKey = "wellId" | "name" | "region" | "depth" | "status" | "createdAt";

export default function WellsPage() {
  const [wells, setWells] = useState<Well[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const fetchWells = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/wells?${params.toString()}`);
      const data = await res.json();
      setWells(Array.isArray(data) ? data : []);
    } catch { setWells([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchWells(); }, [statusFilter]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const sorted = [...wells].sort((a, b) => {
    let av: any = a[sortKey], bv: any = b[sortKey];
    if (sortKey === "depth") { av = av ?? -1; bv = bv ?? -1; }
    if (typeof av === "string") av = av.toLowerCase();
    if (typeof bv === "string") bv = bv.toLowerCase();
    return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
  });

  const deleteWell = async (id: string, name: string) => {
    if (!confirm(`هل تريد حذف البئر "${name}"؟`)) return;
    await fetch(`/api/wells/${id}`, { method: "DELETE" });
    setWells(prev => prev.filter(w => w.id !== id));
  };

  const toggleSelect = (id: string) => setSelected(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const toggleAll = () => setSelected(selected.size === sorted.length ? new Set() : new Set(sorted.map(w => w.id)));

  const exportCSV = () => {
    const rows = [["رقم البئر","الاسم","المنطقة","العمق","النوع","الحالة","التاريخ"]];
    wells.forEach(w => rows.push([w.wellId, w.name, w.region, String(w.depth ?? ""), w.type, w.status, new Date(w.createdAt).toLocaleDateString("ar-LY")]));
    const csv = rows.map(r => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = "wells.csv";
    a.click();
  };

  const SortIcon = ({ k }: { k: SortKey }) => sortKey === k
    ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />)
    : <ChevronDown className="w-3 h-3 inline opacity-20" />;

  const stats = [
    { label: "إجمالي الآبار", value: wells.length, icon: Droplets, color: "#3b82f6", bg: "#dbeafe" },
    { label: "فعال", value: wells.filter(w => w.status === "فعال").length, icon: CheckCircle, color: "#16a34a", bg: "#dcfce7" },
    { label: "تحت الصيانة", value: wells.filter(w => w.status === "صيانة").length, icon: RefreshCw, color: "#d97706", bg: "#fef3c7" },
    { label: "متعطل", value: wells.filter(w => w.status === "متعطل").length, icon: AlertTriangle, color: "#dc2626", bg: "#fee2e2" },
  ];

  return (
    <div className="p-5 lg:p-7 space-y-5" dir="rtl">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} onClick={() => setStatusFilter(s.label === "إجمالي الآبار" ? "" : s.label)}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <TrendingUp className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400 transition-colors" />
            </div>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-48 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && fetchWells()}
              placeholder="البحث بالاسم، المنطقة، رقم البئر..."
              className="bg-transparent text-sm outline-none flex-1 text-right placeholder:text-gray-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 outline-none focus:border-blue-500 bg-white"
          >
            <option value="">جميع الحالات</option>
            {Object.keys(STATUS_CONFIG).map(s => <option key={s}>{s}</option>)}
          </select>
          <button onClick={fetchWells} className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
            <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
            <Download className="w-3.5 h-3.5" /> تصدير CSV
          </button>
          {selected.size > 0 && (
            <button className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> حذف ({selected.size})
            </button>
          )}
          <a href="/dashboard/wells/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-bold text-sm"
            style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}>
            <Plus className="w-4 h-4" />
            <span>إضافة بئر</span>
          </a>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-400" />
            <p className="text-sm text-gray-400">جاري التحميل...</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="p-14 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Droplets className="w-8 h-8 text-blue-300" />
            </div>
            <p className="text-gray-500 font-semibold">لا توجد آبار مسجلة</p>
            <p className="text-gray-300 text-sm mt-1">ابدأ بإضافة أول بئر في النظام</p>
            <a href="/dashboard/wells/new"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl text-white font-bold text-sm"
              style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}>
              <Plus className="w-4 h-4" /> إضافة بئر جديد
            </a>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/70 text-right">
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox" checked={selected.size === sorted.length && sorted.length > 0} onChange={toggleAll}
                      className="rounded border-gray-300" />
                  </th>
                  {[
                    { label: "رقم البئر", key: "wellId" as SortKey },
                    { label: "اسم البئر", key: "name" as SortKey },
                    { label: "المنطقة", key: "region" as SortKey },
                    { label: "العمق (م)", key: "depth" as SortKey },
                    { label: "الحالة", key: "status" as SortKey },
                    { label: "تاريخ الإضافة", key: "createdAt" as SortKey },
                  ].map(col => (
                    <th key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="px-4 py-3 text-xs font-bold text-gray-500 cursor-pointer hover:text-gray-700 select-none whitespace-nowrap">
                      {col.label} <SortIcon k={col.key} />
                    </th>
                  ))}
                  <th className="px-4 py-3 text-xs font-bold text-gray-500">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((well, idx) => {
                  const cfg = STATUS_CONFIG[well.status] || { bg: "#f3f4f6", color: "#6b7280", dot: "#9ca3af" };
                  const isSelected = selected.has(well.id);
                  return (
                    <tr key={well.id}
                      className={`border-t border-gray-50 transition-colors ${isSelected ? "bg-blue-50/40" : "hover:bg-gray-50/50"}`}>
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(well.id)} className="rounded border-gray-300" />
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-blue-600 font-semibold text-xs bg-blue-50 px-2 py-0.5 rounded-lg">{well.wellId}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800 text-sm">{well.name}</p>
                        <p className="text-xs text-gray-400">{well.type}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-gray-600">
                          <MapPin className="w-3 h-3 text-gray-300" />
                          <span className="text-xs">{well.region}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-gray-700">{well.depth ?? "—"}</span>
                        {well.depth && <span className="text-xs text-gray-400 mr-1">م</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
                          {well.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {new Date(well.createdAt).toLocaleDateString("ar-LY")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <a href={`/dashboard/wells/${well.id}`}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors inline-flex" title="عرض">
                            <Eye className="w-3.5 h-3.5" />
                          </a>
                          <a href={`/dashboard/wells/${well.id}/edit`}
                            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors inline-flex" title="تعديل">
                            <Edit className="w-3.5 h-3.5" />
                          </a>
                          <button onClick={() => deleteWell(well.id, well.name)}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors" title="حذف">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-gray-50 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                عرض <span className="font-semibold text-gray-600">{sorted.length}</span> من إجمالي <span className="font-semibold text-gray-600">{wells.length}</span> بئر
                {selected.size > 0 && <span className="text-blue-600"> • {selected.size} محدد</span>}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
