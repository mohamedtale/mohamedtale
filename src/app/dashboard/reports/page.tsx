"use client";
import { useState, useEffect } from "react";
import { Plus, X, Save, FileText, Trash2, CheckCircle, Clock, AlertCircle, FileCheck, Search } from "lucide-react";

const TYPES = ["جيولوجي","صيانة","حفر","جودة مياه","مالي","تفتيش"];
const STATUSES = ["مسودة","قيد المراجعة","معتمد","مرفوض"];

const STATUS_CONFIG: Record<string, { bg: string; color: string; icon: any }> = {
  "مسودة":        { bg: "#f3f4f6", color: "#6b7280", icon: FileText },
  "قيد المراجعة": { bg: "#fef3c7", color: "#d97706", icon: Clock },
  "معتمد":        { bg: "#dcfce7", color: "#16a34a", icon: CheckCircle },
  "مرفوض":       { bg: "#fee2e2", color: "#dc2626", icon: AlertCircle },
};

const TYPE_COLOR: Record<string, string> = {
  "جيولوجي":   "#8b5cf6",
  "صيانة":     "#f59e0b",
  "حفر":       "#3b82f6",
  "جودة مياه": "#06b6d4",
  "مالي":      "#10b981",
  "تفتيش":     "#ef4444",
};

const EMPTY = { title: "", type: "جيولوجي", status: "مسودة", author: "", reviewer: "", wellId: "", content: "" };
const inp = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all bg-white";

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [wells, setWells] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const load = (status = filter) => {
    setLoading(true);
    Promise.all([
      fetch(`/api/reports${status ? `?status=${status}` : ""}`).then(r => r.json()),
      fetch("/api/wells").then(r => r.json()),
    ]).then(([r, w]) => {
      setReports(Array.isArray(r) ? r : []);
      setWells(Array.isArray(w) ? w : []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, wellId: form.wellId || null }),
      });
      if (!res.ok) throw new Error();
      showToast("تم إضافة التقرير بنجاح ✓");
      setShowForm(false);
      setForm({ ...EMPTY });
      load();
    } catch { showToast("خطأ في الحفظ"); }
    finally { setSaving(false); }
  };

  const del = async (id: string) => {
    if (!confirm("حذف التقرير؟")) return;
    await fetch(`/api/reports/${id}`, { method: "DELETE" });
    load();
  };

  const displayed = reports.filter(r => !search || r.title?.includes(search) || r.author?.includes(search));

  const statCounts = STATUSES.map(s => ({ label: s, count: reports.filter(r => r.status === s).length, cfg: STATUS_CONFIG[s] }));

  return (
    <div className="p-5 lg:p-7 space-y-5" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-800">التقارير الفنية</h1>
          <p className="text-gray-400 text-sm mt-0.5">إدارة ومتابعة التقارير الفنية والحقلية</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg shadow-blue-900/20"
          style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}>
          <Plus className="w-4 h-4" /> تقرير جديد
        </button>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCounts.map(({ label, count, cfg }) => {
          const Icon = cfg.icon;
          return (
            <div key={label} onClick={() => { setFilter(filter === label ? "" : label); load(filter === label ? "" : label); }}
              className={`bg-white rounded-2xl p-4 border shadow-sm cursor-pointer transition-all hover:shadow-md ${filter === label ? "border-blue-400 ring-2 ring-blue-100" : "border-gray-100"}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: cfg.bg }}>
                  <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                </div>
              </div>
              <p className="text-xl font-black" style={{ color: cfg.color }}>{count}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          );
        })}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium">
          {toast}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-black text-gray-800">إضافة تقرير جديد</h2>
                <p className="text-xs text-gray-400 mt-0.5">أدخل بيانات التقرير الفني</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-600 mb-1.5">عنوان التقرير *</label>
                <input required className={inp} value={form.title} onChange={e => set("title", e.target.value)} placeholder="تقرير فحص بئر..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">النوع</label>
                <select className={inp} value={form.type} onChange={e => set("type", e.target.value)}>
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">الحالة</label>
                <select className={inp} value={form.status} onChange={e => set("status", e.target.value)}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">الكاتب *</label>
                <input className={inp} value={form.author} onChange={e => set("author", e.target.value)} placeholder="اسم الكاتب" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">المراجع</label>
                <input className={inp} value={form.reviewer} onChange={e => set("reviewer", e.target.value)} placeholder="اسم المراجع" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-600 mb-1.5">البئر المرتبط</label>
                <select className={inp} value={form.wellId} onChange={e => set("wellId", e.target.value)}>
                  <option value="">— غير مرتبط —</option>
                  {wells.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-600 mb-1.5">محتوى التقرير</label>
                <textarea rows={4} className={inp} style={{ resize: "none" }} value={form.content} onChange={e => set("content", e.target.value)} placeholder="اكتب محتوى التقرير هنا..." />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={save} disabled={saving || !form.title || !form.author}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm flex-1 justify-center disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}>
                <Save className="w-4 h-4" /> {saving ? "جاري الحفظ..." : "حفظ التقرير"}
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-100 border border-gray-200">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Filters + search */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-gray-200 flex-1 min-w-48">
          <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث في التقارير..." className="text-xs outline-none flex-1 text-right bg-transparent placeholder:text-gray-400" />
        </div>
        {["", ...STATUSES].map(s => (
          <button key={s}
            onClick={() => { setFilter(s); load(s); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${filter === s ? "text-white shadow" : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"}`}
            style={filter === s ? { background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" } : {}}>
            {s || "الكل"} {!s && `(${reports.length})`}
          </button>
        ))}
      </div>

      {/* Reports list */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-20" />)}</div>
      ) : displayed.length === 0 ? (
        <div className="bg-white rounded-2xl p-14 text-center border border-gray-100 shadow-sm">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <FileText className="w-7 h-7 text-gray-300" />
          </div>
          <p className="text-gray-400 font-medium">لا توجد تقارير</p>
          <p className="text-gray-300 text-sm mt-1">ابدأ بإضافة أول تقرير فني</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {displayed.map((r: any) => {
            const sc = STATUS_CONFIG[r.status] || STATUS_CONFIG["مسودة"];
            const StatusIcon = sc.icon;
            const typeColor = TYPE_COLOR[r.type] || "#6b7280";
            return (
              <div key={r.id} className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: typeColor + "18" }}>
                  <FileCheck className="w-5 h-5" style={{ color: typeColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-800 text-sm">{r.title}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ backgroundColor: typeColor + "18", color: typeColor }}>
                      {r.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    بقلم: {r.author}
                    {r.reviewer && ` • مراجع: ${r.reviewer}`}
                    {" • "}{new Date(r.createdAt).toLocaleDateString("ar-LY")}
                    {r.well && ` • ${r.well.name}`}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0"
                  style={{ backgroundColor: sc.bg, color: sc.color }}>
                  <StatusIcon className="w-3 h-3" />
                  {r.status}
                </div>
                <button onClick={() => del(r.id)} className="p-2 rounded-xl hover:bg-red-50 text-gray-300 hover:text-red-500 flex-shrink-0 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
