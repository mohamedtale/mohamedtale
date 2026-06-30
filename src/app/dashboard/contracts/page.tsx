"use client";
import { useState, useEffect } from "react";
import { Plus, X, Save, Pencil, Trash2, DollarSign, FileSignature, TrendingUp, Building2, Droplets, Calendar } from "lucide-react";

const EMPTY = { title: "", vendor: "", value: "", wells: "", startDate: "", endDate: "", status: "نشط", notes: "" };

const STATUS_CONFIG: Record<string, { bg: string; color: string }> = {
  "نشط":   { bg: "#dcfce7", color: "#16a34a" },
  "منتهي": { bg: "#f3f4f6", color: "#6b7280" },
  "معلق":  { bg: "#fef3c7", color: "#d97706" },
  "ملغي":  { bg: "#fee2e2", color: "#dc2626" },
};

const inp = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all bg-white";

function progressPercent(start: string, end: string): number {
  const s = new Date(start).getTime(), e = new Date(end).getTime(), n = Date.now();
  if (n >= e) return 100;
  if (n <= s) return 0;
  return Math.round(((n - s) / (e - s)) * 100);
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/contracts").then(r => r.json()).then(d => setContracts(Array.isArray(d) ? d : [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const set = (k: string, v: string) => setEditing((p: any) => ({ ...p, [k]: v }));

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const save = async () => {
    setSaving(true);
    try {
      const method = editing.id ? "PUT" : "POST";
      const url = editing.id ? `/api/contracts/${editing.id}` : "/api/contracts";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
      if (!res.ok) throw new Error();
      showToast("تم الحفظ بنجاح ✓");
      setEditing(null);
      load();
    } catch { showToast("خطأ في الحفظ"); }
    finally { setSaving(false); }
  };

  const del = async (id: string) => {
    if (!confirm("حذف العقد؟")) return;
    await fetch(`/api/contracts/${id}`, { method: "DELETE" });
    load();
  };

  const totalValue = contracts.reduce((s, c) => s + (c.value || 0), 0);
  const totalWells = contracts.reduce((s, c) => s + (c.wells || 0), 0);

  return (
    <div className="p-5 lg:p-7 space-y-5" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-800">العقود والأسعار</h1>
          <p className="text-gray-400 text-sm mt-0.5">إدارة عقود الحفر والصيانة والتوريد</p>
        </div>
        <button onClick={() => setEditing({ ...EMPTY })}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg shadow-blue-900/20"
          style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}>
          <Plus className="w-4 h-4" /> عقد جديد
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "إجمالي العقود", value: contracts.length, icon: FileSignature, color: "#3b82f6", bg: "#dbeafe" },
          { label: "العقود النشطة", value: contracts.filter(c => c.status === "نشط").length, icon: TrendingUp, color: "#16a34a", bg: "#dcfce7" },
          { label: "إجمالي الآبار المشمولة", value: totalWells, icon: Droplets, color: "#8b5cf6", bg: "#ede9fe" },
          { label: "إجمالي القيمة", value: totalValue.toLocaleString("ar-LY") + " د.ل", icon: DollarSign, color: "#d97706", bg: "#fef3c7" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: s.bg }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium">
          {toast}
        </div>
      )}

      {/* Form modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-black text-gray-800">{editing.id ? "تعديل العقد" : "عقد جديد"}</h2>
                <p className="text-xs text-gray-400 mt-0.5">أدخل تفاصيل العقد</p>
              </div>
              <button onClick={() => setEditing(null)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-600 mb-1.5">عنوان العقد *</label>
                <input className={inp} value={editing.title} onChange={e => set("title", e.target.value)} placeholder="عقد حفر آبار منطقة طرابلس" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">الجهة المتعاقدة *</label>
                <input className={inp} value={editing.vendor} onChange={e => set("vendor", e.target.value)} placeholder="شركة المياه الوطنية" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">القيمة الإجمالية (د.ل)</label>
                <input type="number" className={inp} value={editing.value} onChange={e => set("value", e.target.value)} placeholder="500000" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">عدد الآبار</label>
                <input type="number" className={inp} value={editing.wells} onChange={e => set("wells", e.target.value)} placeholder="10" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">الحالة</label>
                <select className={inp} value={editing.status} onChange={e => set("status", e.target.value)}>
                  {Object.keys(STATUS_CONFIG).map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">تاريخ البداية</label>
                <input type="date" className={inp} value={editing.startDate ? editing.startDate.split("T")[0] : ""} onChange={e => set("startDate", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">تاريخ الانتهاء</label>
                <input type="date" className={inp} value={editing.endDate ? editing.endDate.split("T")[0] : ""} onChange={e => set("endDate", e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-600 mb-1.5">ملاحظات</label>
                <textarea rows={2} className={inp} style={{ resize: "none" }} value={editing.notes || ""} onChange={e => set("notes", e.target.value)} placeholder="ملاحظات إضافية..." />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={save} disabled={saving || !editing.title || !editing.vendor}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm flex-1 justify-center disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}>
                <Save className="w-4 h-4" /> {saving ? "جاري الحفظ..." : "حفظ العقد"}
              </button>
              <button onClick={() => setEditing(null)} className="px-4 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-100 border border-gray-200">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Contracts list */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-28" />)}</div>
      ) : contracts.length === 0 ? (
        <div className="bg-white rounded-2xl p-14 text-center border border-gray-100 shadow-sm">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <FileSignature className="w-7 h-7 text-gray-300" />
          </div>
          <p className="text-gray-400 font-medium">لا توجد عقود مسجلة</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contracts.map((c: any) => {
            const sc = STATUS_CONFIG[c.status] || STATUS_CONFIG["نشط"];
            const prog = c.startDate && c.endDate ? progressPercent(c.startDate, c.endDate) : null;
            return (
              <div key={c.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}>
                    <FileSignature className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-gray-800">{c.title}</p>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <div className="flex items-center gap-1 text-gray-500 text-xs">
                            <Building2 className="w-3 h-3" />
                            <span>{c.vendor}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500 text-xs">
                            <Droplets className="w-3 h-3" />
                            <span>{c.wells} بئر</span>
                          </div>
                          {c.startDate && (
                            <div className="flex items-center gap-1 text-gray-500 text-xs">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(c.startDate).toLocaleDateString("ar-LY")} — {new Date(c.endDate).toLocaleDateString("ar-LY")}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={sc}>{c.status}</span>
                        <span className="font-black text-gray-800 text-sm">{(c.value || 0).toLocaleString("ar-LY")} <span className="font-normal text-gray-500 text-xs">د.ل</span></span>
                      </div>
                    </div>

                    {prog !== null && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                          <span>نسبة التقدم</span>
                          <span className="font-semibold">{prog}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all"
                            style={{
                              width: `${prog}%`,
                              background: prog >= 90 ? "#ef4444" : prog >= 70 ? "#f59e0b" : "linear-gradient(90deg,#1d4ed8,#3b82f6)"
                            }} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => setEditing(c)} className="p-2 rounded-xl hover:bg-blue-50 text-blue-500 transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => del(c.id)} className="p-2 rounded-xl hover:bg-red-50 text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {c.notes && <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-50">{c.notes}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
