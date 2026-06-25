"use client";
import { useState, useRef } from "react";
import { Printer, RefreshCw } from "lucide-react";

const EMPTY = {
  name: "",
  employeeId: "",
  email: "",
  phone: "",
  whatsapp: "",
  department: "",
  role: "",
  status: "نشط",
  joinDate: "",
  summary: "",
  skills: "",
  responsibilities: "",
};

const inp =
  "w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500 transition-colors bg-white";

const DEPTS = [
  "الإدارة العامة",
  "الهندسة",
  "الصيانة",
  "المالية",
  "الموارد البشرية",
  "تقنية المعلومات",
];
const ROLES = ["مدير النظام", "مهندس", "فني", "موظف", "ضيف"];

export default function CVPage() {
  const [form, setForm] = useState({ ...EMPTY });
  const [preview, setPreview] = useState(false);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const skills = form.skills
    ? form.skills.split("\n").filter(Boolean)
    : ["إدارة المشاريع", "التقارير الفنية", "العمل الميداني", "التنسيق الإداري"];

  const responsibilities = form.responsibilities
    ? form.responsibilities.split("\n").filter(Boolean)
    : [
        "المشاركة في تنفيذ مشاريع الشركة وفق المعايير المعتمدة",
        "إعداد التقارير الدورية ومتابعة سير العمل",
        "التنسيق مع الأقسام الأخرى لإنجاز المهام",
        "المحافظة على جودة الأداء والالتزام بالمواعيد",
      ];

  const today = new Date().toLocaleDateString("ar-LY", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div dir="rtl">
      {/* Toolbar */}
      <div className="no-print p-6 lg:p-8 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-800">نموذج السيرة الذاتية</h1>
            <p className="text-gray-500 text-sm mt-1">عبّئ البيانات يدوياً ثم اطبع</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setForm({ ...EMPTY })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> مسح
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm"
              style={{ background: "linear-gradient(135deg,#1565C0,#2196F3)" }}
            >
              <Printer className="w-4 h-4" /> طباعة
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-bold text-gray-700 mb-4 text-sm">بيانات الموظف</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">الاسم الكامل</label>
              <input className={inp} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="محمد أحمد علي" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">الرقم الوظيفي</label>
              <input className={inp} value={form.employeeId} onChange={(e) => set("employeeId", e.target.value)} placeholder="EMP-001" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">البريد الإلكتروني</label>
              <input className={inp} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="user@company.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">رقم الهاتف</label>
              <input className={inp} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+218 91 000 0000" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">واتساب</label>
              <input className={inp} value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="+218 91 000 0000" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">تاريخ الالتحاق</label>
              <input className={inp} type="date" value={form.joinDate} onChange={(e) => set("joinDate", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">القسم</label>
              <select className={inp} value={form.department} onChange={(e) => set("department", e.target.value)}>
                <option value="">اختر القسم</option>
                {DEPTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">المسمى الوظيفي</label>
              <select className={inp} value={form.role} onChange={(e) => set("role", e.target.value)}>
                <option value="">اختر المسمى</option>
                {ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">الحالة</label>
              <select className={inp} value={form.status} onChange={(e) => set("status", e.target.value)}>
                {["نشط", "غير نشط", "موقوف"].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">نبذة مهنية</label>
              <textarea
                className={inp + " resize-none"}
                rows={3}
                value={form.summary}
                onChange={(e) => set("summary", e.target.value)}
                placeholder="اكتب نبذة مختصرة عن الموظف..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">المهارات (سطر لكل مهارة)</label>
              <textarea
                className={inp + " resize-none"}
                rows={3}
                value={form.skills}
                onChange={(e) => set("skills", e.target.value)}
                placeholder={"إدارة المشاريع\nالتقارير الفنية\nالعمل الميداني"}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">المهام والمسؤوليات (سطر لكل مهمة)</label>
              <textarea
                className={inp + " resize-none"}
                rows={3}
                value={form.responsibilities}
                onChange={(e) => set("responsibilities", e.target.value)}
                placeholder={"تنفيذ المشاريع\nإعداد التقارير\n..."}
              />
            </div>
          </div>
        </div>
      </div>

      {/* CV Preview - printed */}
      <div className="cv-paper bg-white max-w-4xl mx-auto rounded-3xl shadow-xl border border-gray-100 overflow-hidden px-6 pb-6 print:shadow-none print:rounded-none print:border-none print:max-w-full">
        {/* Header */}
        <div
          className="px-10 py-8 text-white -mx-6 mb-8"
          style={{ background: "linear-gradient(135deg,#0d47a1,#1565C0,#1976D2)" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div
                className="w-24 h-24 rounded-full border-4 border-white/30 flex items-center justify-center text-4xl font-black shadow-lg"
                style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
              >
                {form.name?.charAt(0) || "م"}
              </div>
              <div>
                <h2 className="text-3xl font-black mb-1">{form.name || "اسم الموظف"}</h2>
                <p className="text-blue-200 text-lg font-semibold">{form.role || "المسمى الوظيفي"}</p>
                <p className="text-blue-300 text-sm mt-1">{form.department || "القسم"}</p>
              </div>
            </div>
            <div className="text-left text-blue-200 text-sm space-y-1">
              <p className="text-white font-bold text-base">شركة محمد تيل</p>
              <p>للخدمات الهندسية</p>
              <div
                className="mt-2 px-3 py-1 rounded-full text-xs font-bold text-center text-white"
                style={{ backgroundColor: form.status === "نشط" ? "#4caf50" : "#f44336" }}
              >
                {form.status}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-3 gap-8">
          {/* Left */}
          <div className="col-span-1 space-y-6">
            <section>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">
                بيانات الاتصال
              </h3>
              <div className="space-y-3">
                <InfoRow label="الهاتف" value={form.phone || "—"} />
                <InfoRow label="البريد" value={form.email || "—"} small />
                <InfoRow label="الواتساب" value={form.whatsapp || form.phone || "—"} />
              </div>
            </section>

            <section>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">
                الهوية الوظيفية
              </h3>
              <div className="space-y-3">
                <InfoRow label="الرقم الوظيفي" value={form.employeeId || "—"} />
                <InfoRow
                  label="تاريخ الالتحاق"
                  value={
                    form.joinDate
                      ? new Date(form.joinDate).toLocaleDateString("ar-LY", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "—"
                  }
                />
              </div>
            </section>

            <section>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">
                المهارات
              </h3>
              <div className="space-y-2">
                {skills.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: "#1565C0" }} />
                    <span className="text-xs text-gray-600">{s}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right */}
          <div className="col-span-2 space-y-6">
            <section>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">
                نبذة مهنية
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {form.summary ||
                  `موظف كفء في شركة محمد تيل للخدمات الهندسية، يشغل منصب ${form.role || "—"} ضمن قسم ${form.department || "—"}. يتمتع بخبرة في المجال الهندسي والتقني ويحرص على تقديم أعلى مستويات الجودة في العمل.`}
              </p>
            </section>

            <section>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">
                المسيرة المهنية
              </h3>
              <div className="flex gap-3">
                <div className="mt-1 w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: "#1565C0", marginTop: 6 }} />
                <div>
                  <p className="font-bold text-gray-800 text-sm">{form.role || "المسمى الوظيفي"}</p>
                  <p className="text-blue-600 text-xs font-medium">شركة محمد تيل للخدمات الهندسية</p>
                  {form.department && <p className="text-gray-500 text-xs">{form.department}</p>}
                  <p className="text-gray-400 text-xs mt-1">
                    {form.joinDate
                      ? new Date(form.joinDate).toLocaleDateString("ar-LY", { year: "numeric", month: "long" })
                      : "—"}{" "}
                    — حتى الآن
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">
                المهام والمسؤوليات
              </h3>
              <ul className="space-y-2">
                {responsibilities.map((r, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-600">
                    <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#1565C0" }} />
                    {r}
                  </li>
                ))}
              </ul>
            </section>

            {/* Signatures */}
            <div className="pt-6 flex justify-between items-end">
              <div className="text-center">
                <div className="border-t border-gray-300 w-36 mb-2" />
                <p className="text-xs text-gray-500">توقيع الموظف</p>
              </div>
              <div className="text-center">
                <div className="border-t border-gray-300 w-36 mb-2" />
                <p className="text-xs text-gray-500">توقيع المدير المباشر</p>
              </div>
              <div className="text-xs text-gray-400 text-left">
                <p>تاريخ الإصدار:</p>
                <p className="font-semibold text-gray-600">{today}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 text-center text-xs text-gray-400 border-t border-gray-100">
          شركة محمد تيل للخدمات الهندسية — وثيقة رسمية — جميع الحقوق محفوظة
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0 !important; }
        }
      `}</style>
    </div>
  );
}

function InfoRow({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className={`font-semibold text-gray-700 ${small ? "text-xs break-all" : "text-sm"}`}>{value}</p>
    </div>
  );
}
