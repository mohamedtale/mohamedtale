"use client";
import { useState, useEffect } from "react";
import { Save } from "lucide-react";

const STAT_FIELDS = [
  { key: "reports",  label: "عدد التقارير الفنية",       placeholder: "1500" },
  { key: "projects", label: "عدد المشاريع المنجزة",       placeholder: "300" },
  { key: "regions",  label: "عدد المناطق الجغرافية",      placeholder: "24" },
  { key: "years",    label: "سنوات الخبرة",               placeholder: "15" },
];

export default function ContentStatsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/content/stats").then(r => r.json()).then(data => {
      if (data && typeof data === "object") setValues(data);
    }).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/content/stats", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      setMsg("تم حفظ الإحصائيات بنجاح ✓");
    } catch {
      setMsg("حدث خطأ في الحفظ");
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const inp = "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 transition-colors text-center font-bold text-2xl";

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto" dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-800">إحصائيات الموقع</h1>
        <p className="text-gray-500 text-sm mt-1">تحديث الأرقام المعروضة في قسم "إنجازاتنا بالأرقام"</p>
      </div>

      {msg && <div className="mb-6 px-4 py-3 rounded-xl bg-green-50 text-green-700 text-sm font-medium border border-green-200">{msg}</div>}

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-2 gap-5">
          {STAT_FIELDS.map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-gray-600 mb-2">{f.label}</label>
              <input
                type="number"
                className={inp}
                value={values[f.key] ?? ""}
                placeholder={f.placeholder}
                onChange={e => setValues(prev => ({ ...prev, [f.key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <div className="mt-6 pt-5 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-4">سيتم عرض هذه الأرقام بشكل متحرك في الصفحة الرئيسية العامة.</p>
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm"
            style={{ background: "linear-gradient(135deg,#1565C0,#2196F3)", opacity: saving ? 0.7 : 1 }}>
            <Save className="w-4 h-4" /> {saving ? "جاري الحفظ..." : "حفظ الإحصائيات"}
          </button>
        </div>
      </div>
    </div>
  );
}
