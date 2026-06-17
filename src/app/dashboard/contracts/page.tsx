"use client";
import { useState, useEffect } from "react";
import { Plus, X, Save, Pencil, Trash2, DollarSign, RefreshCw } from "lucide-react";

const STATUSES = ["نشط", "منتهي", "معلق", "ملغى"];
const inp = "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 transition-colors bg-white";
const EMPTY = { title: "", vendor: "", value: "", wells: "", startDate: "", endDate: "", status: "نشط", notes: "" };

const statusStyle = (s: string) =>
  s === "نشط" ? { backgroundColor: "#dcfce7", color: "#16a34a" } :
  s === "منتهي" ? { backgroundColor: "#f3f4f6", color: "#6b7280" } :
  s === "معلق" ? { backgroundColor: "#fef3c7", color: "#d97706" } :
  { backgroundColor: "#fee2e2", color: "#dc2626" };

export default function ContractsPage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/contracts").then(r => r.json()).then(d => setContracts(Array.isArray(d) ? d : [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const set = (k: string, v: string) => setEditing((p: any) => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const isNew = !editing.id;
      const url = isNew ? "/api/contracts" : `/api/contracts/${editing.id}`;
      const method = isNew ? "POST" : "PUT";
      const payload = {
        ...editing,
        value: parseFloat(editing.value) || 0,
        wells: parseInt(editing.wells) || 0,
        startDate: editing.startDate ? new Date(editing.startDate).toISOString() : undefined,
        endDate: editing.endDate ? new Date(editing.endDate).toISOString() : undefined,
      };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error();
      setMsg("تم الحفظ ✓");
      setEditing(null);
      load();
    } catch { setMsg("خطأ في الحفظ"); }
    finally { setSaving(false); setTimeout(() => setMsg(""), 3000); }
  };

  const del = async (id: string) => {
    if (!confirm("حذف العقد؟")) return;
    await fetch(`/api/contracts/${id}`, { method: "DELETE" });
    load();
  };

  const totalValue = contracts.filter(c => c.status === "نشط").reduce((s, c) => s + (c.value || 0), 0);

  return (
    <div className="p-6 lg:p-8" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800">العقود والأسعار</h1>
          <p className="text-gray-500 text-sm mt-1">إدارة العقود مع الموردين والمقاولين</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50">
            <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => setEditing({ ...EMPTY })}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm"
            style={{ background: "linear-gradient(135deg,#1565C0,#2196F3)" }}>
            <Plus className="w-4 h-4" /> عقد جديد
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-black text-gray-800">{contracts.length}</p>
          <p className="text-xs text-gray-500 mt-1">إجمالي العقود</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-black text-green-600">{contracts.filter(c => c.status === "نشط").length}</p>
          <p className="text-xs text-gray-500 mt-1">عقود نشطة</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-2xl font-black text-blue-600">{totalValue.toLocaleString("ar-LY")}</p>
          <p className="text-xs text-gray-500 mt-1">القيمة الإجمالية النشطة (د.ل)</p>
        </div>
      </div>

      {msg && <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 text-green-700 text-sm border border-green-200">{msg}</div>}

      {/* Form */}
      {editing && (
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-lg border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">{editing.id ? "تعديل العقد" : "عقد جديد"}</h2>
            <button onClick={() => setEditing(null)} className="p-2 rounded-xl hover:bg-gray-100"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">عنوان العقد <span className="text-red-500">*</span></label>
              <input className={inp} value={editing.title} onChange={e => set("title", e.target.value)} placeholder="عقد حفر آبار منطقة..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">المورد/المقاول <span className="text-red-500">*</span></label>
              <input className={inp} value={editing.vendor} onChange={e => set("vendor", e.target.value)} placeholder="اسم الشركة أو المقاول" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">القيمة الإجمالية (د.ل)</label>
              <input type="number" className={inp} value={editing.value} onChange={e => set("value", e.target.value)} placeholder="500000" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">عدد الآبار</label>
              <input type="number" className={inp} value={editing.wells} onChange={e => set("wells", e.target.value)} placeholder="10" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">الحالة</label>
              <select className={inp} value={editing.status} onChange={e => set("status", e.target.value)}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">تاريخ البداية</label>
              <input type="date" className={inp} value={editing.startDate ? editing.startDate.split("T")[0] : ""} onChange={e => set("startDate", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">تاريخ الانتهاء</label>
              <input type="date" className={inp} value={editing.endDate ? editing.endDate.split("T")[0] : ""} onChange={e => set("endDate", e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">ملاحظات</label>
              <textarea rows={2} className={inp} style={{ resize: "none" }} value={editing.notes || ""} onChange={e => set("notes", e.target.value)} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={save} disabled={saving || !editing.title || !editing.vendor}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#1565C0,#2196F3)" }}>
              <Save className="w-4 h-4" /> {saving ? "جاري الحفظ..." : "حفظ"}
            </button>
            <button onClick={() => setEditing(null)} className="px-4 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-100">إلغاء</button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-20" />)}</div>
      ) : contracts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
          <DollarSign className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">لا توجد عقود مسجلة</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contracts.map((c: any) => (
            <div key={c.id} className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#d1fae5" }}>
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-sm truncate">{c.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{c.vendor} • {c.wells} بئر • {(c.value || 0).toLocaleString("ar-LY")} د.ل</p>
                {c.startDate && <p className="text-xs text-gray-300 mt-0.5">{new Date(c.startDate).toLocaleDateString("ar-LY")} — {c.endDate ? new Date(c.endDate).toLocaleDateString("ar-LY") : "—"}</p>}
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0" style={statusStyle(c.status)}>{c.status}</span>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => setEditing(c)} className="p-2 rounded-xl hover:bg-blue-50 text-blue-600"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => del(c.id)} className="p-2 rounded-xl hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
