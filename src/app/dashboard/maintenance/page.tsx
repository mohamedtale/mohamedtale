"use client";
import { useState, useEffect } from "react";
import { Plus, X, Save, Wrench } from "lucide-react";

const COLS = [
  { key: "قيد التنفيذ", label: "قيد التنفيذ", color: "#2196F3", bg: "#dbeafe" },
  { key: "منتهية", label: "منتهية", color: "#16a34a", bg: "#dcfce7" },
  { key: "معلقة", label: "معلقة", color: "#d97706", bg: "#fef3c7" },
  { key: "متأخرة", label: "متأخرة", color: "#dc2626", bg: "#fee2e2" },
];

const EMPTY = { wellId: "", type: "صيانة دورية", status: "قيد التنفيذ", description: "", technician: "", cost: "", priority: "متوسطة", scheduledAt: "" };
const inp = "w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500 transition-colors";

export default function MaintenancePage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [wells, setWells] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/maintenance").then(r => r.json()),
      fetch("/api/wells").then(r => r.json()),
    ]).then(([m, w]) => {
      setLogs(Array.isArray(m) ? m : []);
      setWells(Array.isArray(w) ? w : []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, cost: form.cost ? parseFloat(form.cost) : null, scheduledAt: form.scheduledAt ? new Date(form.scheduledAt) : null }),
      });
      setMsg("تم الحفظ ✓");
      setShowForm(false);
      setForm({ ...EMPTY });
      load();
    } catch { setMsg("خطأ في الحفظ"); }
    finally { setSaving(false); setTimeout(() => setMsg(""), 3000); }
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/maintenance/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    load();
  };

  const del = async (id: string) => {
    if (!confirm("حذف هذا السجل؟")) return;
    await fetch(`/api/maintenance/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="p-6 lg:p-8" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800">سجل الصيانة</h1>
          <p className="text-gray-500 text-sm mt-1">إدارة ومتابعة أعمال الصيانة</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm"
          style={{ background: "linear-gradient(135deg,#1565C0,#2196F3)" }}>
          <Plus className="w-4 h-4" /> طلب صيانة جديد
        </button>
      </div>

      {msg && <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 text-green-700 text-sm border border-green-200">{msg}</div>}

      {showForm && (
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-lg border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">طلب صيانة جديد</h2>
            <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-gray-100"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">البئر</label>
              <select className={inp} value={form.wellId} onChange={e => set("wellId", e.target.value)}>
                <option value="">اختر البئر</option>
                {wells.map((w: any) => <option key={w.id} value={w.id}>{w.name} ({w.wellId})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">نوع الصيانة</label>
              <select className={inp} value={form.type} onChange={e => set("type", e.target.value)}>
                {["صيانة دورية","إصلاح طارئ","تغيير قطع","فحص دوري","تنظيف"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">الحالة</label>
              <select className={inp} value={form.status} onChange={e => set("status", e.target.value)}>
                {["قيد التنفيذ","منتهية","معلقة","متأخرة"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">الفني المسؤول</label>
              <input className={inp} value={form.technician} onChange={e => set("technician", e.target.value)} placeholder="اسم الفني" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">الأولوية</label>
              <select className={inp} value={form.priority} onChange={e => set("priority", e.target.value)}>
                {["عالية","متوسطة","منخفضة"].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">التكلفة (د.ل)</label>
              <input type="number" className={inp} value={form.cost} onChange={e => set("cost", e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">تاريخ الجدولة</label>
              <input type="date" className={inp} value={form.scheduledAt} onChange={e => set("scheduledAt", e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">الوصف</label>
              <textarea rows={2} className={inp} style={{ resize: "none" }} value={form.description} onChange={e => set("description", e.target.value)} placeholder="وصف المشكلة أو العمل المطلوب..." />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm"
              style={{ background: "linear-gradient(135deg,#1565C0,#2196F3)", opacity: saving ? 0.7 : 1 }}>
              <Save className="w-4 h-4" /> {saving ? "جاري الحفظ..." : "حفظ"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-100">إلغاء</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="animate-pulse bg-gray-200 rounded-3xl h-64" />)}</div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {COLS.map(col => {
            const items = logs.filter(l => l.status === col.key);
            return (
              <div key={col.key} className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: col.color }} />
                  <span className="font-bold text-gray-700 text-sm">{col.label}</span>
                  <span className="mr-auto text-xs px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: col.bg, color: col.color }}>{items.length}</span>
                </div>
                <div className="space-y-3">
                  {items.length === 0 ? (
                    <p className="text-center text-gray-300 text-xs py-6">لا يوجد</p>
                  ) : items.map((log: any) => (
                    <div key={log.id} className="rounded-2xl p-3 border" style={{ borderColor: col.color + "30", backgroundColor: col.bg + "40" }}>
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <p className="font-bold text-gray-800 text-xs leading-tight">{log.type}</p>
                        <button onClick={() => del(log.id)} className="text-gray-300 hover:text-red-400 flex-shrink-0"><X className="w-3 h-3" /></button>
                      </div>
                      {log.well && <p className="text-xs text-gray-500 mb-1">{log.well.name}</p>}
                      {log.technician && <p className="text-xs text-gray-400">الفني: {log.technician}</p>}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {COLS.filter(c => c.key !== col.key).map(c => (
                          <button key={c.key} onClick={() => updateStatus(log.id, c.key)}
                            className="text-xs px-2 py-0.5 rounded-full border transition-colors hover:opacity-80"
                            style={{ borderColor: c.color, color: c.color, fontSize: "10px" }}>
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
