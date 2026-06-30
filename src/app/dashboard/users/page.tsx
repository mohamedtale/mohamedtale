"use client";
import { useState, useEffect } from "react";
import { Plus, X, Save, Pencil, Trash2, Users, Shield, Search, Mail, Phone, Building2 } from "lucide-react";

const ROLES = ["مدير النظام","مهندس","فني","موظف","ضيف"];
const DEPTS = ["الإدارة العامة","الهندسة","الصيانة","المالية","الموارد البشرية","تقنية المعلومات"];
const EMPTY = { name: "", employeeId: "", email: "", phone: "", department: "", role: "موظف", status: "نشط", password: "" };

const ROLE_CONFIG: Record<string, { bg: string; color: string }> = {
  "مدير النظام": { bg: "#fce7f3", color: "#be185d" },
  "مهندس":       { bg: "#dbeafe", color: "#1d4ed8" },
  "فني":         { bg: "#fef3c7", color: "#d97706" },
  "موظف":        { bg: "#f3f4f6", color: "#4b5563" },
  "ضيف":         { bg: "#f0fdf4", color: "#16a34a" },
};

const AVATAR_COLORS = ["#1d4ed8","#7c3aed","#be185d","#d97706","#0891b2","#16a34a"];

const inp = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all bg-white";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/users").then(r => r.json()).then(d => setUsers(Array.isArray(d) ? d : [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const set = (k: string, v: string) => setEditing((p: any) => ({ ...p, [k]: v }));

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const save = async () => {
    setSaving(true);
    try {
      const method = editing.id ? "PUT" : "POST";
      const url = editing.id ? `/api/users/${editing.id}` : "/api/users";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
      if (!res.ok) throw new Error();
      showToast("تم الحفظ بنجاح ✓");
      setEditing(null);
      load();
    } catch { showToast("خطأ في الحفظ"); }
    finally { setSaving(false); }
  };

  const del = async (id: string) => {
    if (!confirm("حذف المستخدم؟")) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    load();
  };

  const filtered = users.filter(u => {
    const matchSearch = !search || u.name?.includes(search) || u.employeeId?.includes(search) || u.email?.includes(search);
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const stats = [
    { label: "إجمالي المستخدمين", value: users.length, color: "#3b82f6", bg: "#dbeafe" },
    { label: "نشط", value: users.filter(u => u.status === "نشط").length, color: "#16a34a", bg: "#dcfce7" },
    { label: "مدير النظام", value: users.filter(u => u.role === "مدير النظام").length, color: "#be185d", bg: "#fce7f3" },
    { label: "مهندس", value: users.filter(u => u.role === "مهندس").length, color: "#1d4ed8", bg: "#dbeafe" },
  ];

  return (
    <div className="p-5 lg:p-7 space-y-5" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-800">إدارة المستخدمين</h1>
          <p className="text-gray-400 text-sm mt-0.5">إدارة الموظفين وصلاحيات الوصول</p>
        </div>
        <button onClick={() => setEditing({ ...EMPTY })}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg shadow-blue-900/20"
          style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}>
          <Plus className="w-4 h-4" /> مستخدم جديد
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: s.bg }}>
              {i === 2 ? <Shield className="w-4 h-4" style={{ color: s.color }} /> : <Users className="w-4 h-4" style={{ color: s.color }} />}
            </div>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
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
                <h2 className="font-black text-gray-800">{editing.id ? "تعديل المستخدم" : "مستخدم جديد"}</h2>
                <p className="text-xs text-gray-400 mt-0.5">أدخل بيانات الموظف</p>
              </div>
              <button onClick={() => setEditing(null)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">الاسم الكامل *</label>
                <input className={inp} value={editing.name} onChange={e => set("name", e.target.value)} placeholder="محمد أحمد" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">الرقم الوظيفي *</label>
                <input className={inp} value={editing.employeeId} onChange={e => set("employeeId", e.target.value)} placeholder="EMP-001" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">البريد الإلكتروني *</label>
                <input type="email" className={inp} value={editing.email} onChange={e => set("email", e.target.value)} placeholder="user@example.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">رقم الهاتف</label>
                <input className={inp} value={editing.phone || ""} onChange={e => set("phone", e.target.value)} placeholder="0912345678" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">القسم</label>
                <select className={inp} value={editing.department || ""} onChange={e => set("department", e.target.value)}>
                  <option value="">اختر القسم</option>
                  {DEPTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">الدور</label>
                <select className={inp} value={editing.role} onChange={e => set("role", e.target.value)}>
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">الحالة</label>
                <select className={inp} value={editing.status} onChange={e => set("status", e.target.value)}>
                  {["نشط","غير نشط","موقوف"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              {!editing.id && (
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">كلمة المرور *</label>
                  <input type="password" className={inp} value={editing.password} onChange={e => set("password", e.target.value)} placeholder="••••••••" />
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={save} disabled={saving || !editing.name || !editing.employeeId || !editing.email}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm flex-1 justify-center disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}>
                <Save className="w-4 h-4" /> {saving ? "جاري الحفظ..." : "حفظ"}
              </button>
              <button onClick={() => setEditing(null)} className="px-4 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-100 border border-gray-200">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-gray-200 flex-1 min-w-48">
          <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم، الرقم الوظيفي، البريد..." className="text-xs outline-none flex-1 text-right bg-transparent placeholder:text-gray-400" />
        </div>
        {["", ...ROLES].map(r => (
          <button key={r}
            onClick={() => setRoleFilter(r)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${roleFilter === r ? "text-white shadow" : "bg-white text-gray-600 border border-gray-200"}`}
            style={roleFilter === r ? { background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" } : {}}>
            {r || "الكل"}
          </button>
        ))}
      </div>

      {/* Users table */}
      {loading ? (
        <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-16" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-14 text-center border border-gray-100 shadow-sm">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Users className="w-7 h-7 text-gray-300" />
          </div>
          <p className="text-gray-400 font-medium">لا يوجد مستخدمون</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/70 text-right">
                {["المستخدم","الرقم الوظيفي","القسم","الدور","الحالة","الإجراءات"].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-bold text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u: any, idx: number) => {
                const rc = ROLE_CONFIG[u.role] || ROLE_CONFIG["موظف"];
                const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                return (
                  <tr key={u.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                          style={{ background: `linear-gradient(135deg,${avatarColor}cc,${avatarColor})` }}>
                          {u.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{u.name}</p>
                          <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5">
                            <Mail className="w-2.5 h-2.5" />
                            <span>{u.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-lg">{u.employeeId}</span>
                    </td>
                    <td className="px-4 py-3">
                      {u.department ? (
                        <div className="flex items-center gap-1 text-gray-600">
                          <Building2 className="w-3 h-3 text-gray-300" />
                          <span className="text-xs">{u.department}</span>
                        </div>
                      ) : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={rc}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold"
                        style={{
                          backgroundColor: u.status === "نشط" ? "#dcfce7" : u.status === "موقوف" ? "#fee2e2" : "#f3f4f6",
                          color: u.status === "نشط" ? "#16a34a" : u.status === "موقوف" ? "#dc2626" : "#6b7280"
                        }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: u.status === "نشط" ? "#22c55e" : u.status === "موقوف" ? "#ef4444" : "#9ca3af" }} />
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setEditing(u)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors" title="تعديل">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => del(u.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors" title="حذف">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-gray-50">
            <p className="text-xs text-gray-400">
              عرض <span className="font-semibold text-gray-600">{filtered.length}</span> من <span className="font-semibold text-gray-600">{users.length}</span> مستخدم
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
