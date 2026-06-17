"use client";
import { useState, useEffect } from "react";
import { Plus, X, Save, Pencil, Trash2, DollarSign } from "lucide-react";

const EMPTY = { title: "", vendor: "", value: "", wells: "", startDate: "", endDate: "", status: "نشط", notes: "" };
const inp = "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 transition-colors";

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
      const method = editing.id ? "PUT" : "POST";
      const url = editing.id ? `/api/contracts/${editing.id}` : "/api/contracts";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
      if (!res.ok) throw new Error("فشل الحفظ");
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

  const statusColor = (s: string) => s === "نشط" ? { bg: "#dcfce7", color: "#16a34a" } : s === "منتهي" ? { bg: "#f3f4f6", color: "#6b7280" } : { bg: "#fef3c7", color: "#d97706" };
  const totalValue = contracts.reduce((s, c) => s + (c.value || 0), 0);

  return (
    <div className="p-6 lg:p-8" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800">العقود والأسعار</h1>
          <p className="text-gray-500 text-sm mt-1">إدارة عقود الحفر والصيانة</p>
        </div>
        <button onClick={() => setEditing({ ...EMPTY })}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm"
          style={{ background: "linear-gradient(135deg,#1565C0,#2196F3)" }}>
          <Plus className="w-4 h-4" /> عقد جديد
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "إجمالي العقود", value: contracts.length, icon: DollarSign, color: "#1565C0", bg: "#dbeafe" },
          { label: "العقود النشطة", value: contracts.filter(c => c.status === "نشط").length, icon: DollarSign, color: "#16a34a", bg: "#dcfce7" },
          { label: "إجمالي القيمة", value: totalValue.toLocaleString("ar-LY") + " د.ل", icon: DollarSign, color: "#7c3aed", bg: "#ede9fe" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: s.bg }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <p className="text-2xl font-black text-gray-800">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {msg && <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 text-green-700 text-sm border border-green-200">{msg}</div>}

      {editing && (
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-lg border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">{editing.id ? "تعديل العقد" : "عقد جديد"}</h2>
            <button onClick={() => setEditing(null)} className="p-2 rounded-xl hover:bg-gray-100"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">عنوان العقد</label><input className={inp} value={editing.title} onChange={e => set("title", e.target.value)} placeholder="عقد حفر آبار منطقة طرابلس" /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">الجهة المتعاقدة</label><input className={inp} value={editing.vendor} onChange={e => set("vendor", e.target.value)} placeholder="شركة..." /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">القيمة (د.ل)</label><input type="number" className={inp} value={editing.value} onChange={e => set("value", e.target.value)} placeholder="500000" /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">عدد الآبار</label><input type="number" className={inp} value={editing.wells} onChange={e => set("wells", e.target.value)} placeholder="10" /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">الحالة</label><select className={inp} value={editing.status} onChange={e => set("status", e.target.value)}>{["نشط","منتهي","معلق","ملغي"].map(s => <option key={s}>{s}</option>)}</select></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">تاريخ البداية</label><input type="date" className={inp} value={editing.startDate ? editing.startDate.split("T")[0] : ""} onChange={e => set("startDate", e.target.value)} /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">تاريخ الانتهاء</label><input type="date" className={inp} value={editing.endDate ? editing.endDate.split("T")[0] : ""} onChange={e => set("endDate", e.target.value)} /></div>
            <div className="col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">ملاحظات</label><textarea rows={2} className={inp} style={{ resize: "none" }} value={editing.notes || ""} onChange={e => set("notes", e.target.value)} /></div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#1565C0,#2196F3)" }}>
              <Save className="w-4 h-4" /> {saving ? "جاري الحفظ..." : "حفظ"}
            </button>
            <button onClick={() => setEditing(null)} className="px-4 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-100">إلغاء</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-20" />)}</div>
      ) : contracts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
          <DollarSign className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">لا توجد عقود مسجلة</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contracts.map((c: any) => {
            const sc = statusColor(c.status);
            return (
              <div key={c.id} className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#dbeafe" }}>
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm truncate">{c.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{c.vendor} • {c.wells} بئر • {(c.value || 0).toLocaleString("ar-LY")} د.ل</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0" style={sc}>{c.status}</span>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => setEditing(c)} className="p-2 rounded-xl hover:bg-blue-50 text-blue-600"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => del(c.id)} className="p-2 rounded-xl hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
