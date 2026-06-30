"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save, X, FileText, Droplets, Settings, DollarSign, CheckCircle, MapPin } from "lucide-react";
import Link from "next/link";

const TABS = [
  { id: 1, label: "المعلومات الأساسية", icon: FileText },
  { id: 2, label: "المواصفات الفنية", icon: Settings },
  { id: 3, label: "مواصفات المياه", icon: Droplets },
  { id: 4, label: "خصائص الخزان المائي", icon: MapPin },
  { id: 5, label: "المعلومات المالية", icon: DollarSign },
  { id: 6, label: "المراجعة والاعتماد", icon: CheckCircle },
];

const REGIONS = ["طرابلس", "مصراتة", "بنغازي", "الزاوية", "سرت", "ترهونة", "البيضاء", "درنة", "سبها", "غدامس", "الكفرة", "مورزق"];
const MUNICIPALITIES = ["طرابلس المركز", "سوق الجمعة", "تاجوراء", "عين زارة", "مصراتة المركز", "أخرى"];
const DRILL_METHODS = ["حفر دوراني", "حفر بالضربة", "حفر هوائي", "حفر بالماء"];
const PUMP_TYPES = ["غاطسة كهربائية", "سطحية", "يدوية", "شمسية"];
const WATER_TYPES = ["جوفي عميق", "جوفي ضحل", "ارتوازي", "شبه ارتوازي"];

export default function NewWellPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    // Step 1 - Basic
    wellId: "", contractNumber: "", contractName: "", implementingEntity: "",
    location: "", region: "", municipality: "", coordinates: "", drillingDate: "",
    // Step 2 - Technical
    drillMethod: "", totalDepth: "", casingDiameter: "", protectionDiameter: "",
    filterSize: "", pumpType: "", pumpDepth: "", boreDiameter: "",
    // Step 3 - Water
    tds: "", hardness: "", ph: "", ec: "", salinity: "", waterType: "", waterQuality: "",
    // Step 4 - Aquifer
    staticLevel: "", dynamicLevel: "", flowRate: "", aquiferType: "", aquiferDepth: "",
    // Step 5 - Financial
    cost: "", contractValue: "", notes: "",
    // Step 6
    status: "فعال",
  });

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const Input = ({ label, field, placeholder, required, type = "text" }: any) => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label}{required && <span className="text-red-500 mr-1">*</span>}
      </label>
      <input
        type={type}
        value={(form as any)[field]}
        onChange={e => set(field, e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white transition-all"
      />
    </div>
  );

  const Select = ({ label, field, options, required }: any) => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label}{required && <span className="text-red-500 mr-1">*</span>}
      </label>
      <select
        value={(form as any)[field]}
        onChange={e => set(field, e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white transition-all text-gray-700"
      >
        <option value="">اختر...</option>
        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const handleSubmit = async () => {
    setSaving(true);
    setError("");
    try {
      const [lat, lng] = form.coordinates.split(",").map(s => parseFloat(s.trim()));
      const res = await fetch("/api/wells", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wellId: form.wellId,
          name: form.contractName || form.wellId,
          region: form.region,
          location: form.location,
          latitude: lat || null,
          longitude: lng || null,
          depth: form.totalDepth ? parseInt(form.totalDepth) : null,
          type: form.waterType || "مياه جوفية",
          status: form.status,
          casingType: form.casingDiameter || null,
          pumpType: form.pumpType || null,
          waterQuality: form.waterQuality || null,
          cost: form.cost ? parseFloat(form.cost) : null,
          notes: form.notes || null,
          drillingDate: form.drillingDate || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "حدث خطأ"); setSaving(false); return; }
      router.push("/dashboard/wells");
    } catch {
      setError("حدث خطأ في الاتصال");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/wells" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-500 rotate-180" />
          </Link>
          <div>
            <p className="text-xs text-gray-400">الرئيسية / إدارة الآبار / <span className="text-blue-500">إضافة بئر جديد</span></p>
            <h1 className="text-lg font-bold text-gray-800">إضافة بئر جديد</h1>
            <p className="text-xs text-gray-400">تسجيل بيانات بئر مياه جديد داخل المنظومة</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/wells" className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
            <X size={14} /> إلغاء
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 px-6">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => step > t.id ? setStep(t.id) : undefined}
              className={`flex items-center gap-2 px-4 py-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                step === t.id
                  ? "border-blue-500 text-blue-600 bg-blue-50/50"
                  : step > t.id
                  ? "border-transparent text-green-600 cursor-pointer hover:bg-gray-50"
                  : "border-transparent text-gray-400 cursor-default"
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                step > t.id ? "bg-green-100 text-green-600" :
                step === t.id ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-400"
              }`}>
                {step > t.id ? "✓" : t.id}
              </span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center"><FileText size={16} className="text-blue-600" /></div>
                <h2 className="font-bold text-gray-800">المعلومات الأساسية <span className="text-blue-500">ⓘ</span></h2>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <Input label="رقم العقد" field="contractNumber" placeholder="أدخل رقم العقد" required />
                <Input label="اسم العقد" field="contractName" placeholder="أدخل اسم العقد" required />
                <Select label="الجهة المنفذة" field="implementingEntity" options={["شركة المياه الوطنية", "مؤسسة الحفر الليبية", "شركة خاصة", "أخرى"]} required />
                <Input label="الموقع" field="location" placeholder="أدخل الموقع" required />
                <Input label="رقم البئر" field="wellId" placeholder="أدخل رقم البئر" required />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <Select label="البادية" field="municipality" options={MUNICIPALITIES} />
                <Select label="المنطقة" field="region" options={REGIONS} required />
                <Input label="الإحداثيات" field="coordinates" placeholder="خط الطول ، خط العرض" />
                <Input label="تاريخ التنفيذ (اختياري)" field="drillingDate" type="date" />
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center"><Settings size={16} className="text-orange-600" /></div>
                <h2 className="font-bold text-gray-800">المواصفات الفنية <span className="text-orange-500">⚙</span></h2>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <Select label="طريقة الحفر" field="drillMethod" options={DRILL_METHODS} required />
                <Input label="العمق الكلي" field="totalDepth" placeholder="أدخل العمق (متر)" type="number" required />
                <Input label="أنبوب الوقاية" field="protectionDiameter" placeholder="أدخل مقاس أنبوب الوقاية" required />
                <Input label="أنبوب الغلاف" field="casingDiameter" placeholder="أدخل مقاس أنبوب الغلاف" required />
                <Input label="المصافي" field="filterSize" placeholder="أدخل مقاس المصافي" required />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <Input label="قطر الحفر (بوصة) (اختياري)" field="boreDiameter" placeholder="أدخل القطر (بوصة)" />
                <Select label="نوع المضخة (اختياري)" field="pumpType" options={PUMP_TYPES} />
                <Input label="عمق المضخة (اختياري)" field="pumpDepth" placeholder="أدخل العمق (متر)" type="number" />
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center"><Droplets size={16} className="text-blue-600" /></div>
                <h2 className="font-bold text-gray-800">مواصفات المياه 💧</h2>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <Input label="مجموع الأملاح المذابة (TDS)" field="tds" placeholder="أدخل القيمة (mg/L)" type="number" />
                <Input label="العسر الكلي" field="hardness" placeholder="أدخل القيمة (mg/L)" type="number" />
                <Select label="نوع الماء" field="waterType" options={WATER_TYPES} />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <Input label="PH (اختياري)" field="ph" placeholder="PH القيمة" type="number" />
                <Input label="EC (اختياري)" field="ec" placeholder="أدخل القيمة (μS/cm)" type="number" />
                <Input label="الملوحة (اختياري)" field="salinity" placeholder="أدخل القيمة (ppt)" type="number" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Select label="جودة المياه" field="waterQuality" options={["ممتازة", "جيدة", "متوسطة", "ضعيفة"]} />
              </div>
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center"><MapPin size={16} className="text-green-600" /></div>
                <h2 className="font-bold text-gray-800">خصائص الخزان المائي</h2>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <Input label="المنسوب الساكن (م)" field="staticLevel" placeholder="أدخل العمق (متر)" type="number" />
                <Input label="المنسوب الديناميكي (م)" field="dynamicLevel" placeholder="أدخل العمق (متر)" type="number" />
                <Input label="معدل التدفق (م³/ساعة)" field="flowRate" placeholder="أدخل المعدل" type="number" />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
                <Select label="نوع الخزان" field="aquiferType" options={["محصور", "غير محصور", "ارتوازي", "شبه ارتوازي"]} />
                <Input label="عمق الخزان (م)" field="aquiferDepth" placeholder="أدخل العمق" type="number" />
              </div>
            </div>
          )}

          {/* Step 5 */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center"><DollarSign size={16} className="text-purple-600" /></div>
                <h2 className="font-bold text-gray-800">المعلومات المالية</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="تكلفة الحفر (د.ل)" field="cost" placeholder="أدخل التكلفة" type="number" />
                <Input label="قيمة العقد (د.ل)" field="contractValue" placeholder="أدخل قيمة العقد" type="number" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">ملاحظات</label>
                <textarea
                  value={form.notes}
                  onChange={e => set("notes", e.target.value)}
                  rows={4}
                  placeholder="أدخل أي ملاحظات إضافية..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 6 */}
          {step === 6 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center"><CheckCircle size={16} className="text-green-600" /></div>
                <h2 className="font-bold text-gray-800">المراجعة والاعتماد</h2>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
              )}

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  ["رقم البئر", form.wellId],
                  ["اسم العقد", form.contractName],
                  ["المنطقة", form.region],
                  ["الموقع", form.location],
                  ["العمق الكلي", form.totalDepth ? `${form.totalDepth} م` : "—"],
                  ["نوع المضخة", form.pumpType || "—"],
                  ["جودة المياه", form.waterQuality || "—"],
                  ["تكلفة الحفر", form.cost ? `${parseFloat(form.cost).toLocaleString()} د.ل` : "—"],
                  ["الإحداثيات", form.coordinates || "—"],
                ].map(([k, v]) => (
                  <div key={k} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">{k}</p>
                    <p className="text-sm font-semibold text-gray-800">{v || "—"}</p>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">حالة البئر</label>
                <div className="flex gap-3 flex-wrap">
                  {["فعال", "قيد الإنشاء", "صيانة", "متعطل"].map(s => (
                    <button key={s} onClick={() => set("status", s)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                        form.status === s ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={16} className="rotate-180" /> السابق
          </button>

          <div className="flex items-center gap-1">
            {TABS.map(t => (
              <div key={t.id} className={`w-2 h-2 rounded-full transition-all ${step === t.id ? "w-6 bg-blue-500" : step > t.id ? "bg-green-400" : "bg-gray-200"}`} />
            ))}
          </div>

          {step < 6 ? (
            <button
              onClick={() => setStep(s => Math.min(6, s + 1))}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
              style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}
            >
              التالي <ChevronLeft size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving || !form.wellId || !form.region}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#15803d,#22c55e)" }}
            >
              <Save size={14} />
              {saving ? "جاري الحفظ..." : "حفظ البئر"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
