"use client";
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";

interface Project {
  id?: string;
  title: string;
  description: string;
  date: string;
  region: string;
  count: string;
  imageUrl: string;
  order: number;
  visible: boolean;
}

const EMPTY: Project = { title: "", description: "", date: "", region: "", count: "", imageUrl: "", order: 0, visible: true };

export default function ContentProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/content/projects");
      const data = await r.json();
      setProjects(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      if (editing?.id) {
        await fetch(`/api/content/projects/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
      } else {
        await fetch("/api/content/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
      }
      setMsg("تم الحفظ بنجاح ✓");
      setEditing(null);
      load();
    } catch {
      setMsg("حدث خطأ");
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const del = async (id: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    await fetch(`/api/content/projects/${id}`, { method: "DELETE" });
    load();
  };

  const inp = "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 transition-colors";

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-800">إدارة المشاريع</h1>
          <p className="text-gray-500 text-sm mt-1">المشاريع المعروضة على الصفحة الرئيسية</p>
        </div>
        <button onClick={() => setEditing({ ...EMPTY })}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm"
          style={{ background: "linear-gradient(135deg,#1565C0,#2196F3)" }}>
          <Plus className="w-4 h-4" /> مشروع جديد
        </button>
      </div>

      {msg && <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 text-green-700 text-sm font-medium border border-green-200">{msg}</div>}

      {editing && (
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-lg border border-blue-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-black text-gray-800">{editing.id ? "تعديل المشروع" : "إضافة مشروع جديد"}</h2>
            <button onClick={() => setEditing(null)} className="p-2 rounded-xl hover:bg-gray-100"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">عنوان المشروع</label>
              <input className={inp} value={editing.title} onChange={e => setEditing(p => p && ({ ...p, title: e.target.value }))} placeholder="عنوان المشروع..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">التاريخ</label>
              <input className={inp} value={editing.date} onChange={e => setEditing(p => p && ({ ...p, date: e.target.value }))} placeholder="مارس 2024" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">المنطقة</label>
              <input className={inp} value={editing.region} onChange={e => setEditing(p => p && ({ ...p, region: e.target.value }))} placeholder="طرابلس" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">العدد / الحجم</label>
              <input className={inp} value={editing.count} onChange={e => setEditing(p => p && ({ ...p, count: e.target.value }))} placeholder="45 بئر" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">الترتيب</label>
              <input type="number" className={inp} value={editing.order} onChange={e => setEditing(p => p && ({ ...p, order: parseInt(e.target.value) || 0 }))} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">رابط الصورة</label>
              <input className={inp} value={editing.imageUrl} onChange={e => setEditing(p => p && ({ ...p, imageUrl: e.target.value }))} placeholder="https://images.unsplash.com/..." />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">الوصف</label>
              <textarea rows={3} className={inp} style={{ resize: "none" }} value={editing.description}
                onChange={e => setEditing(p => p && ({ ...p, description: e.target.value }))} placeholder="وصف المشروع..." />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-5">
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-sm"
              style={{ background: "linear-gradient(135deg,#1565C0,#2196F3)", opacity: saving ? 0.7 : 1 }}>
              <Save className="w-4 h-4" /> {saving ? "جاري الحفظ..." : "حفظ المشروع"}
            </button>
            <button onClick={() => setEditing(null)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100">إلغاء</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center text-gray-400">جاري التحميل...</div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center">
          <p className="text-gray-400 mb-4">لا توجد مشاريع بعد</p>
          <button onClick={() => setEditing({ ...EMPTY })} className="text-blue-600 font-bold text-sm">أضف أول مشروع</button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl p-5 flex items-center gap-4 border border-gray-100 shadow-sm">
              {p.imageUrl && <img src={p.imageUrl} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-sm truncate">{p.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{p.region} — {p.date} — {p.count}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${p.visible ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {p.visible ? "مرئي" : "مخفي"}
                </span>
                <button onClick={() => setEditing(p)} className="p-2 rounded-xl hover:bg-blue-50 text-blue-600"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => del(p.id!)} className="p-2 rounded-xl hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
