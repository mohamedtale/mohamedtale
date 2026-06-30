"use client";
import { useState, useEffect } from "react";
import { Plus, X, Save, Wrench, Clock, CheckCircle, AlertTriangle, RefreshCw, Calendar, DollarSign, User } from "lucide-react";

const COLS = [
  { key: "قيد التنفيذ", label: "قيد التنفيذ", color: "#2563eb", bg: "#dbeafe", icon: Clock },
  { key: "منتهية",      label: "منتهية",      color: "#16a34a", bg: "#dcfce7", icon: CheckCircle },
  { key: "معلقة",      label: "معلقة",       color: "#d97706", bg: "#fef3c7", icon: AlertTriangle },
  { key: "متأخرة",     label: "متأخرة",      color: "#dc2626", bg: "#fee2e2", icon: AlertTriangle },
];

const PRIORITY_COLOR: Record<string, { bg: string; color: string }> = {
  "عالية":    { bg: "#fee2e2", color: "#dc2626" },
  "متوسطة":   { bg: "#fef3c7", color: "#d97706" },
  "منخفضة":  { bg: "#dcfce7", color: "#16a34a" },
};

const EMPTY = { wellId: "", type: "صيانة دورية", status: "قيد التنفيذ", description: "", technician: "", cost: "", priority: "متوسطة", scheduledAt: "" };
const inp = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all bg-white";

export default function MaintenancePage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [wells, setWells] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

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

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          cost: form.cost ? parseFloat(form.cost) : null,
          scheduledAt: form.scheduledAt ? new Date(form.scheduledAt) : null,
        }),
      });
      showToast("تم حفظ طلب الصيانة بنجاح ✓");
      setShowForm(false);
      setForm({ ...EMPTY });
      load();
    } catch { showToast("خطأ في الحفظ"); }
    finally { setSaving(false); }
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

  const totalCost = logs.reduce((s, l) => s + (l.cost || 0), 0);

  return (
    <div className="p-5 lg:p-7 space-y-5" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-800">سجل الصيانة</h1>
          <p className="text-gray-400 text-sm mt-0.5">إدارة ومتابعة أعمال الصيانة الميدانية</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg shadow-blue-900/20"
          style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}>
          <Plus className="w-4 h-4" /> طلب صيانة جديد
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {COLS.map(col => {
          const items = logs.filter(l => l.status === col.key);
          return (
            <div key={col.key} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: col.bg }}>
                  <col.icon className="w-4 h-4" style={{ color: col.color }} />
                </div>
                <span className="text-xs font-semibold text-gray-500">{col.label}</span>
              </div>
              <p className="text-2xl font-black" style={{ color: col.color }}>{items.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {items.reduce((s, l) => s + (l.cost || 0), 0).toLocaleString("ar-LY")} د.ل
              </p>
            </div>
          );
        })}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium animate-fade-in">
          {toast}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 w-full max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-black text-gray-800">طلب صيانة جديد</h2>
                <p className="text-xs text-gray-400 mt-0.5">أدخل تفاصيل العمل المطلوب</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-600 mb-1.5">البئر</label>
                <select className={inp} value={form.wellId} onChange={e => set("wellId", e.target.value)}>
                  <option value="">اختر البئر...</option>
                  {wells.map((w: any) => <option key={w.id} value={w.id}>{w.name} ({w.wellId})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">نوع الصيانة</label>
                <select className={inp} value={form.type} onChange={e => set("type", e.target.value)}>
                  {["صيانة دورية","إصلاح طارئ","تغيير قطع","فحص دوري","تنظيف"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">الحالة</label>
                <select className={inp} value={form.status} onChange={e => set("status", e.target.value)}>
                  {["قيد التنفيذ","منتهية","معلقة","متأخرة"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">الفني المسؤول</label>
                <input className={inp} value={form.technician} onChange={e => set("technician", e.target.value)} placeholder="اسم الفني" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">الأولوية</label>
                <select className={inp} value={form.priority} onChange={e => set("priority", e.target.value)}>
                  {["عالية","متوسطة","منخفضة"].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">التكلفة التقديرية (د.ل)</label>
                <input type="number" className={inp} value={form.cost} onChange={e => set("cost", e.target.value)} placeholder="0" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">تاريخ الجدولة</label>
                <input type="date" className={inp} value={form.scheduledAt} onChange={e => set("scheduledAt", e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-600 mb-1.5">وصف العمل</label>
                <textarea rows={3} className={inp} style={{ resize: "none" }} value={form.description} onChange={e => set("description", e.target.value)} placeholder="وصف المشكلة أو العمل المطلوب..." />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={save} disabled={saving || !form.wellId || !form.technician}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm flex-1 justify-center disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}>
                <Save className="w-4 h-4" /> {saving ? "جاري الحفظ..." : "حفظ الطلب"}
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Kanban board */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="animate-pulse bg-gray-200 rounded-3xl h-64" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLS.map(col => {
            const items = logs.filter(l => l.status === col.key);
            return (
              <div key={col.key} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Column header */}
                <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: col.bg + "80" }}>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                    <span className="font-bold text-sm" style={{ color: col.color }}>{col.label}</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: col.bg, color: col.color }}>
                    {items.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="p-3 space-y-2.5 min-h-32">
                  {items.length === 0 ? (
                    <div className="text-center py-8">
                      <Wrench className="w-6 h-6 text-gray-200 mx-auto mb-2" />
                      <p className="text-xs text-gray-300">لا يوجد</p>
                    </div>
                  ) : items.map((log: any) => {
                    const pc = PRIORITY_COLOR[log.priority] || PRIORITY_COLOR["متوسطة"];
                    return (
                      <div key={log.id} className="rounded-xl p-3 border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all">
                        <div className="flex items-start justify-between gap-1 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-800 text-xs leading-tight">{log.type}</p>
                            {log.well && <p className="text-xs text-gray-400 mt-0.5 truncate">{log.well.name}</p>}
                          </div>
                          <button onClick={() => del(log.id)} className="text-gray-300 hover:text-red-400 shrink-0 transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="space-y-1 mb-2.5">
                          {log.technician && (
                            <div className="flex items-center gap-1 text-gray-500">
                              <User className="w-2.5 h-2.5" />
                              <span className="text-[10px]">{log.technician}</span>
                            </div>
                          )}
                          {log.cost && (
                            <div className="flex items-center gap-1 text-gray-500">
                              <DollarSign className="w-2.5 h-2.5" />
                              <span className="text-[10px]">{Number(log.cost).toLocaleString("ar-LY")} د.ل</span>
                            </div>
                          )}
                          {log.scheduledAt && (
                            <div className="flex items-center gap-1 text-gray-500">
                              <Calendar className="w-2.5 h-2.5" />
                              <span className="text-[10px]">{new Date(log.scheduledAt).toLocaleDateString("ar-LY")}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={pc}>
                            {log.priority}
                          </span>
                          <div className="flex gap-1">
                            {COLS.filter(c => c.key !== col.key).slice(0, 2).map(c => (
                              <button key={c.key} onClick={() => updateStatus(log.id, c.key)}
                                className="text-[9px] px-1.5 py-0.5 rounded-full border transition-colors hover:opacity-80"
                                style={{ borderColor: c.color + "50", color: c.color }}>
                                {c.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cost summary */}
      {logs.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">إجمالي تكلفة الصيانة المسجلة</p>
            <p className="text-lg font-black text-gray-800">{totalCost.toLocaleString("ar-LY")} <span className="text-sm font-medium text-gray-500">د.ل</span></p>
          </div>
          <div className="mr-auto text-xs text-gray-400">{logs.length} سجل صيانة</div>
        </div>
      )}
    </div>
  );
}
