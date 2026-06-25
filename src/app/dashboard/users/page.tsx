"use client";
import { useState, useEffect } from "react";
import { Plus, X, Save, Pencil, Trash2, Users, FileText } from "lucide-react";
import Link from "next/link";

const ROLES = ["مدير النظام","مهندس","فني","موظف","ضيف"];
const DEPTS = ["الإدارة العامة","الهندسة","الصيانة","المالية","الموارد البشرية","تقنية المعلومات"];
const EMPTY = { name: "", employeeId: "", email: "", phone: "", department: "", role: "موظف", status: "نشط", password: "" };
const inp = "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 transition-colors";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/users").then(r => r.json()).then(d => setUsers(Array.isArray(d) ? d : [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const set = (k: string, v: string) => setEditing((p: any) => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const method = editing.id ? "PUT" : "POST";
      const url = editing.id ? `/api/users/${editing.id}` : "/api/users";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
      if (!res.ok) throw new Error("فشل الحفظ");
      setMsg("تم الحفظ ✓");
      setEditing(null);
      load();
    } catch { setMsg("خطأ في الحفظ"); }
    finally { setSaving(false); setTimeout(() => setMsg(""), 3000); }
  };

  const del = async (id: string) => {
    if (!confirm("حذف المستخدم؟")) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    load();
  };

  const filtered = users.filter(u => !search || u.name?.includes(search) || u.employeeId?.includes(search) || u.email?.includes(search));
  const roleColor = (r: string) => r === "مدير النظام" ? { bg: "#fce7f3", color: "#be185d" } : r === "مهندس" ? { bg: "#dbeafe", color: "#1565C0" } : r === "فني" ? { bg: "#fef3c7", color: "#d97706" } : { bg: "#f3f4f6", color: "#6b7280" };

  return (
    <div className="p-6 lg:p-8" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800">إدارة المستخدمين</h1>
          <p className="text-gray-500 text-sm mt-1">الموظفون وصلاحيات الوصول</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/users/cv"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors">
            <FileText className="w-4 h-4" /> نموذج CV
          </Link>
          <button onClick={() => setEditing({ ...EMPTY })}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm"
            style={{ background: "linear-gradient(135deg,#1565C0,#2196F3)" }}>
            <Plus className="w-4 h-4" /> مستخدم جديد
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "إجمالي المستخدمين", value: users.length },
          { label: "نشط", value: users.filter(u => u.status === "نشط").length },
          { label: "مدير النظام", value: users.filter(u => u.role === "مدير النظام").length },
          { label: "مهندس", value: users.filter(u => u.role === "مهندس").length },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-2xl font-black text-gray-800">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <input className={inp} value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم أو الرقم الوظيفي..." />
      </div>

      {msg && <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 text-green-700 text-sm border border-green-200">{msg}</div>}

      {editing && (
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-lg border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">{editing.id ? "تعديل المستخدم" : "مستخدم جديد"}</h2>
            <button onClick={() => setEditing(null)} className="p-2 rounded-xl hover:bg-gray-100"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">الاسم الكامل</label><input className={inp} value={editing.name} onChange={e => set("name", e.target.value)} placeholder="محمد أحمد" /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">الرقم الوظيفي</label><input className={inp} value={editing.employeeId} onChange={e => set("employeeId", e.target.value)} placeholder="EMP-001" /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">البريد الإلكتروني</label><input type="email" className={inp} value={editing.email} onChange={e => set("email", e.target.value)} placeholder="user@example.com" /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">رقم الهاتف</label><input className={inp} value={editing.phone || ""} onChange={e => set("phone", e.target.value)} placeholder="+218 91 000 0000" /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">القسم</label><select className={inp} value={editing.department || ""} onChange={e => set("department", e.target.value)}><option value="">اختر القسم</option>{DEPTS.map(d => <option key={d}>{d}</option>)}</select></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">الدور</label><select className={inp} value={editing.role} onChange={e => set("role", e.target.value)}>{ROLES.map(r => <option key={r}>{r}</option>)}</select></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">الحالة</label><select className={inp} value={editing.status} onChange={e => set("status", e.target.value)}>{["نشط","غير نشط","موقوف"].map(s => <option key={s}>{s}</option>)}</select></div>
            {!editing.id && <div><label className="block text-xs font-semibold text-gray-600 mb-1">كلمة المرور</label><input type="password" className={inp} value={editing.password} onChange={e => set("password", e.target.value)} placeholder="••••••••" /></div>}
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={save} disabled={saving || !editing.name || !editing.employeeId || !editing.email}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#1565C0,#2196F3)" }}>
              <Save className="w-4 h-4" /> {saving ? "جاري الحفظ..." : "حفظ"}
            </button>
            <button onClick={() => setEditing(null)} className="px-4 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-100">إلغاء</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-16" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
          <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">لا يوجد مستخدمون</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: "#f8faff" }}>
              <tr>
                {["الاسم","الرقم الوظيفي","القسم","الدور","الحالة","الإجراءات"].map(h => (
                  <th key={h} className="px-4 py-3 text-right text-xs font-bold text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u: any) => {
                const rc = roleColor(u.role);
                return (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: "#1565C0" }}>
                          {u.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-xs">{u.name}</p>
                          <p className="text-gray-400 text-xs">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{u.employeeId}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{u.department || "—"}</td>
                    <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-full font-medium" style={rc}>{u.role}</span></td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: u.status === "نشط" ? "#dcfce7" : "#fee2e2", color: u.status === "نشط" ? "#16a34a" : "#dc2626" }}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setEditing(u)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => del(u.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
