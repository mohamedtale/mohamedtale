"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, ChevronRight, ChevronLeft, Save } from "lucide-react";

const STEPS = ["المعلومات الأساسية", "الموقع الجغرافي", "المواصفات الفنية", "المعدات", "نتائج الحفر", "المراجعة والحفظ"];
const REGIONS = ["طرابلس","بنغازي","مصراتة","الزاوية","سبها","الكفرة","غريان","الزنتان","زليتن","الخمس","ترهونة","الجفرة","مرزق","غدامس","درنة","البيضاء","الجبل الأخضر","أوباري"];
const inp = "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white";
const sel = inp + " appearance-none";
const label = (t: string) => <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t}</label>;

export default function NewWellPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", wellId: "", type: "مياه جوفية", status: "فعال", drillingDate: "",
    region: "", location: "", latitude: "", longitude: "",
    depth: "", casingType: "", waterQuality: "", notes: "",
    pumpType: "", cost: "",
  });

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const steps = [
    <div key={0} className="grid grid-cols-2 gap-4">
      <div className="col-span-2">{label("اسم البئر *")}<input className={inp} required value={form.name} onChange={e => set("name", e.target.value)} placeholder="بئر الزاوية الشمالي" /></div>
      <div>{label("رقم البئر *")}<input className={inp} required value={form.wellId} onChange={e => set("wellId", e.target.value)} placeholder="WL-2024-001" /></div>
      <div>{label("تاريخ الحفر")}<input type="date" className={inp} value={form.drillingDate} onChange={e => set("drillingDate", e.target.value)} /></div>
      <div>{label("نوع البئر")}<select className={sel} value={form.type} onChange={e => set("type", e.target.value)}><option>مياه جوفية</option><option>ارتوازي</option><option>سطحي</option><option>تجميع مطر</option></select></div>
      <div>{label("الحالة")}<select className={sel} value={form.status} onChange={e => set("status", e.target.value)}><option>فعال</option><option>صيانة</option><option>متعطل</option><option>قيد الإنشاء</option></select></div>
    </div>,

    <div key={1} className="grid grid-cols-2 gap-4">
      <div>{label("المنطقة *")}<select className={sel} value={form.region} onChange={e => set("region", e.target.value)}><option value="">اختر المنطقة</option>{REGIONS.map(r => <option key={r}>{r}</option>)}</select></div>
      <div className="col-span-2">{label("العنوان التفصيلي")}<input className={inp} value={form.location} onChange={e => set("location", e.target.value)} placeholder="حي الأندلس، بالقرب من المدرسة..." /></div>
      <div>{label("خط العرض (Latitude)")}<input type="number" step="0.0001" className={inp} value={form.latitude} onChange={e => set("latitude", e.target.value)} placeholder="32.8872" /></div>
      <div>{label("خط الطول (Longitude)")}<input type="number" step="0.0001" className={inp} value={form.longitude} onChange={e => set("longitude", e.target.value)} placeholder="13.1913" /></div>
    </div>,

    <div key={2} className="grid grid-cols-2 gap-4">
      <div>{label("العمق (متر)")}<input type="number" className={inp} value={form.depth} onChange={e => set("depth", e.target.value)} placeholder="200" /></div>
      <div>{label("نوع الغلاف (Casing)")}<select className={sel} value={form.casingType} onChange={e => set("casingType", e.target.value)}><option value="">اختر النوع</option><option>PVC</option><option>HDPE</option><option>فولاذي</option><option>خرساني</option></select></div>
      <div>{label("جودة المياه")}<select className={sel} value={form.waterQuality} onChange={e => set("waterQuality", e.target.value)}><option value="">اختر الجودة</option><option>ممتازة</option><option>جيدة</option><option>متوسطة</option><option>تحتاج معالجة</option></select></div>
      <div className="col-span-2">{label("ملاحظات فنية")}<textarea rows={3} className={inp} style={{ resize: "none" }} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="أي ملاحظات فنية إضافية..." /></div>
    </div>,

    <div key={3} className="grid grid-cols-2 gap-4">
      <div>{label("نوع المضخة")}<select className={sel} value={form.pumpType} onChange={e => set("pumpType", e.target.value)}><option value="">اختر نوع المضخة</option><option>كهربائية غاطسة</option><option>ديزل</option><option>شمسية</option><option>يدوية</option></select></div>
      <div>{label("التكلفة الإجمالية (دينار)")}<input type="number" className={inp} value={form.cost} onChange={e => set("cost", e.target.value)} placeholder="50000" /></div>
    </div>,

    <div key={4} className="space-y-3">
      <p className="text-sm text-gray-600 bg-blue-50 p-4 rounded-xl border border-blue-100">
        يمكنك إضافة تقارير الحفر التفصيلية من صفحة التقارير الفنية بعد حفظ البئر.
      </p>
      <div>{label("ملاحظات نتائج الحفر")}<textarea rows={4} className={inp} style={{ resize: "none" }} onChange={e => set("notes", form.notes + "\n" + e.target.value)} placeholder="منسوب المياه، معدل الضخ، الطبقات الجيولوجية..." /></div>
    </div>,

    <div key={5} className="space-y-3">
      <h3 className="font-bold text-gray-800 mb-4">مراجعة البيانات قبل الحفظ</h3>
      {[
        ["اسم البئر", form.name], ["رقم البئر", form.wellId], ["النوع", form.type],
        ["الحالة", form.status], ["المنطقة", form.region], ["العمق", form.depth ? form.depth + " م" : "-"],
        ["نوع الغلاف", form.casingType], ["نوع المضخة", form.pumpType], ["جودة المياه", form.waterQuality],
        ["التكلفة", form.cost ? form.cost + " د.ل" : "-"],
      ].map(([k, v]) => (
        <div key={k} className="flex items-center gap-3 py-2.5 px-4 rounded-xl" style={{ background: "#f8faff", border: "1px solid #e8f0fe" }}>
          <span className="text-xs text-gray-500 w-32 flex-shrink-0">{k}</span>
          <span className="text-sm font-semibold text-gray-800">{v || "—"}</span>
        </div>
      ))}
    </div>,
  ];

  const canNext = () => {
    if (step === 0) return form.name.trim() && form.wellId.trim();
    if (step === 1) return form.region.trim();
    return true;
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const payload: any = {
        name: form.name,
        wellId: form.wellId,
        type: form.type,
        status: form.status,
        region: form.region,
        location: form.location || null,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        depth: form.depth ? parseInt(form.depth) : null,
        casingType: form.casingType || null,
        pumpType: form.pumpType || null,
        waterQuality: form.waterQuality || null,
        cost: form.cost ? parseFloat(form.cost) : null,
        notes: form.notes || null,
        drillingDate: form.drillingDate ? new Date(form.drillingDate) : null,
      };
      const res = await fetch("/api/wells", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الحفظ");
      router.push("/dashboard/wells");
    } catch (e: any) {
      setError(e.message);
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto" dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-800">إضافة بئر جديد</h1>
        <p className="text-gray-500 text-sm mt-1">أدخل بيانات البئر خطوة بخطوة</p>
      </div>

      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-1 flex-shrink-0">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${i === step ? "text-white" : i < step ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}
              style={i === step ? { background: "linear-gradient(135deg,#1565C0,#2196F3)" } : {}}>
              {i < step ? <CheckCircle className="w-3 h-3" /> : <span>{i + 1}</span>}
              <span className="hidden md:inline">{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`w-4 h-0.5 ${i < step ? "bg-green-400" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
        <h2 className="font-bold text-gray-800 mb-5">{STEPS[step]}</h2>
        {steps[step]}
      </div>

      {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-200">{error}</div>}

      <div className="flex items-center justify-between">
        <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-colors">
          <ChevronRight className="w-4 h-4" /> السابق
        </button>
        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-sm disabled:opacity-40 transition-all"
            style={{ background: "linear-gradient(135deg,#1565C0,#2196F3)" }}>
            التالي <ChevronLeft className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-sm disabled:opacity-70 transition-all"
            style={{ background: "linear-gradient(135deg,#16a34a,#22c55e)" }}>
            <Save className="w-4 h-4" /> {saving ? "جاري الحفظ..." : "حفظ البئر"}
          </button>
        )}
      </div>
    </div>
  );
}
