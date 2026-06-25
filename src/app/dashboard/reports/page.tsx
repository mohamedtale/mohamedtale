"use client";
import { useState, useEffect } from "react";
import { Plus, X, Save, FileText, Trash2 } from "lucide-react";

const TYPES = ["جيولوجي","صيانة","حفر","جودة مياه","مالي","تفتيش"];
const STATUSES = ["مسودة","قيد المراجعة","معتمد","مرفوض"];
const inp = "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 transition-colors";
const EMPTY = { title: "", type: "جيولوجي", status: "مسودة", author: "", reviewer: "", wellId: "", content: "" };

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [wells, setWells] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

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

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form, wellId: form.wellId || null };
      const res = await fetch("/api/reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("فشل الحفظ");
      setMsg("تم إضافة التقرير ✓");
      setShowForm(false);
      setForm({ ...EMPTY });
      load();
    } catch { setMsg("خطأ في الحفظ"); }
    finally { setSaving(false); setTimeout(() => setMsg(""), 3000); }
  };

  const del = async (id: string) => {
    if (!confirm("حذف التقرير؟")) return;
    await fetch(`/api/reports/${id}`, { method: "DELETE" });
    load();
  };

  const statusColor = (s: string) => ({
    "مسودة": { bg: "#f3f4f6", color: "#6b7280" },
    "قيد المراجعة": { bg: "#fef3c7", color: "#d97706" },
    "معتمد": { bg: "#dcfce7", color: "#16a34a" },
    "مرفوض": { bg: "#fee2e2", color: "#dc2626" },
  }[s] || { bg: "#f3f4f6", color: "#6b7280" });

  return (
    <div className="p-6 lg:p-8" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800">التقارير الفنية</h1>
          <p className="text-gray-500 text-sm mt-1">إدارة التقارير الفنية والحقلية</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm"
          style={{ background: "linear-gradient(135deg,#1565C0,#2196F3)" }}>
          <Plus className="w-4 h-4" /> تقرير جديد
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {["", ...STATUSES].map(s => (
          <button key={s} onClick={() => { setFilter(s); load(s); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex-shrink-0 transition-all ${filter === s ? "text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"}`}
            style={filter === s ? { background: "linear-gradient(135deg,#1565C0,#2196F3)" } : {}}>
            {s || "الكل"} {!s && `(${reports.length})`}
          </button>
        ))}
      </div>

      {msg && <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 text-green-700 text-sm border border-green-200">{msg}</div>}

      {showForm && (
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-lg border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">إضافة تقرير جديد</h2>
            <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-gray-100"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">عنوان التقرير</label><input required className={inp} value={form.title} onChange={e => set("title", e.target.value)} placeholder="تقرير فحص بئر..." /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">النوع</label><select className={inp} value={form.type} onChange={e => set("type", e.target.value)}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">الحالة</label><select className={inp} value={form.status} onChange={e => set("status", e.target.value)}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">الكاتب</label><input className={inp} value={form.author} onChange={e => set("author", e.target.value)} placeholder="اسم الكاتب" /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">المراجع</label><input className={inp} value={form.reviewer} onChange={e => set("reviewer", e.target.value)} placeholder="اسم المراجع" /></div>
            <div className="col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">البئر المرتبط</label><select className={inp} value={form.wellId} onChange={e => set("wellId", e.target.value)}><option value="">— غير مرتبط —</option>{wells.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}</select></div>
            <div className="col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">محتوى التقرير</label><textarea rows={4} className={inp} style={{ resize: "none" }} value={form.content} onChange={e => set("content", e.target.value)} placeholder="اكتب محتوى التقرير هنا..." /></div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={save} disabled={saving || !form.title}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#1565C0,#2196F3)" }}>
              <Save className="w-4 h-4" /> {saving ? "جاري الحفظ..." : "حفظ التقرير"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-100">إلغاء</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-20" />)}</div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
          <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">لا توجد تقارير</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r: any) => {
            const sc = statusColor(r.status);
            return (
              <div key={r.id} className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#dbeafe" }}>
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm truncate">{r.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.type} • {r.author} • {new Date(r.createdAt).toLocaleDateString("ar-LY")}</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0" style={sc}>{r.status}</span>
                <button onClick={() => del(r.id)} className="p-2 rounded-xl hover:bg-red-50 text-gray-300 hover:text-red-500 flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
