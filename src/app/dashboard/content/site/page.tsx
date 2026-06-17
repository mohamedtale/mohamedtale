"use client";
import { useState, useEffect } from "react";
import { Save, RefreshCw, CheckCircle } from "lucide-react";

const inp = "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 transition-colors bg-white";
const ta = inp + " resize-none";

const TABS = [
  { key: "hero",     label: "قسم Hero" },
  { key: "about",    label: "عن الجهاز" },
  { key: "services", label: "الخدمات" },
  { key: "contact",  label: "التواصل" },
  { key: "footer",   label: "التذييل" },
];

const DEFAULTS: Record<string, string> = {
  hero_title: "نحفر المستقبل",
  hero_subtitle: "لنوصل الماء لكل بيت",
  hero_desc: "الجهاز التنفيذي لحفر وصيانة آبار المياه — نضمن وصول المياه النقية لكل مناطق ليبيا بأعلى معايير الجودة والاحترافية",
  hero_btn1: "خريطة الآبار التفاعلية",
  hero_btn2: "استعرض مشاريعنا",
  hero_badge: "الجهاز التنفيذي الوطني — ليبيا",
  about_title: "رائدون في مجال إدارة موارد المياه",
  about_subtitle: "من نحن",
  about_p1: "الجهاز التنفيذي لحفر وصيانة آبار المياه مؤسسة حكومية ليبية متخصصة، تأسست لضمان توفير المياه النقية لجميع المناطق الليبية من خلال منظومة متكاملة من خدمات الحفر والصيانة والتحليل.",
  about_p2: "نعمل بمنهجية علمية واحترافية عالية، ونوظف أحدث التقنيات والمعدات لضمان جودة المياه واستدامتها لخدمة المواطن الليبي في كل أرجاء البلاد.",
  about_check1: "معدات حفر حديثة بمواصفات دولية عالية الجودة",
  about_check2: "كوادر فنية مؤهلة وذات خبرة ميدانية واسعة",
  about_check3: "تغطية جغرافية شاملة لكافة مناطق ليبيا",
  about_check4: "معايير سلامة صارمة في جميع العمليات",
  about_years: "+١٥ عام",
  about_years_label: "من الخبرة والتميز",
  services_title: "منظومة خدمات متكاملة",
  services_desc: "نقدم حلولاً شاملة لإدارة آبار المياه في ليبيا من الحفر حتى الصيانة والتحليل",
  service1_title: "حفر الآبار",
  service1_desc: "حفر آبار المياه الجوفية بأحدث المعدات الثقيلة وأعلى معايير الدقة والجودة",
  service2_title: "الصيانة الدورية",
  service2_desc: "برامج صيانة شاملة تضمن استمرارية تشغيل الآبار وتمديد عمرها الافتراضي",
  service3_title: "التحاليل المخبرية",
  service3_desc: "تحليل دقيق لجودة المياه وفق أحدث المعايير الدولية لضمان سلامتها",
  service4_title: "الاستشارات الفنية",
  service4_desc: "فريق من الخبراء المتخصصين يقدم حلولاً مبتكرة لكل تحديات إدارة المياه",
  service5_title: "تركيب المضخات",
  service5_desc: "تركيب وصيانة منظومات الضخ المتكاملة بكافة الأنواع والأحجام",
  service6_title: "المسح الجيولوجي",
  service6_desc: "دراسات جيولوجية متعمقة لتحديد أفضل المواقع وضمان نجاح الحفر",
  service7_title: "التدريب والتأهيل",
  service7_desc: "برامج تدريب متخصصة لرفع كفاءة الكوادر الفنية في قطاع المياه",
  service8_title: "ضمان الجودة",
  service8_desc: "التزام راسخ بمعايير ISO الدولية في كل مرحلة من مراحل العمل",
  contact_address: "طرابلس، ليبيا — شارع عمر المختار",
  contact_phone: "+218 21 333 0000",
  contact_email: "info@wellsagency.ly",
  contact_hours: "الأحد – الخميس: ٨:٠٠ – ١٥:٠٠",
  footer_desc: "مؤسسة حكومية ليبية متخصصة في توفير المياه النقية لجميع مناطق ليبيا بأعلى معايير الجودة والاحترافية.",
  footer_copyright: "© 2024 الجهاز التنفيذي لحفر وصيانة آبار المياه — جميع الحقوق محفوظة",
};

export default function SiteEditorPage() {
  const [tab, setTab] = useState("hero");
  const [config, setConfig] = useState<Record<string, string>>({ ...DEFAULTS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/content/stats").then(r => r.json()).then(d => {
      if (d && Object.keys(d).length > 0) {
        setConfig(prev => ({ ...prev, ...d }));
      }
    }).finally(() => setLoading(false));
  }, []);

  const set = (k: string, v: string) => setConfig(p => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/content/stats", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config) });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally { setSaving(false); }
  };

  const F = ({ label, k, rows }: { label: string; k: string; rows?: number }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      {rows ? (
        <textarea rows={rows} className={ta} value={config[k] ?? ""} onChange={e => set(k, e.target.value)} />
      ) : (
        <input className={inp} value={config[k] ?? ""} onChange={e => set(k, e.target.value)} />
      )}
    </div>
  );

  if (loading) return (
    <div className="p-8" dir="rtl">
      <div className="space-y-4">{Array(6).fill(0).map((_, i) => <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-10" />)}</div>
    </div>
  );

  return (
    <div className="p-6 lg:p-8" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800">تحرير محتوى الموقع</h1>
          <p className="text-gray-500 text-sm mt-1">تعديل جميع نصوص وبيانات الصفحة الرئيسية</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-green-600 text-sm font-semibold">
              <CheckCircle className="w-4 h-4" /> تم الحفظ
            </span>
          )}
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-sm disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#1565C0,#2196F3)" }}>
            <Save className="w-4 h-4" /> {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-2xl w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${tab === t.key ? "bg-white text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

        {/* ── Hero ── */}
        {tab === "hero" && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-700 text-sm mb-4 pb-3 border-b border-gray-100">قسم الصفحة الرئيسية (Hero)</h2>
            <F label="نص الشارة الصغيرة (Badge)" k="hero_badge" />
            <div className="grid grid-cols-2 gap-4">
              <F label="العنوان الرئيسي" k="hero_title" />
              <F label="العنوان الفرعي" k="hero_subtitle" />
            </div>
            <F label="الوصف تحت العنوان" k="hero_desc" rows={3} />
            <div className="grid grid-cols-2 gap-4">
              <F label="نص الزر الأول" k="hero_btn1" />
              <F label="نص الزر الثاني" k="hero_btn2" />
            </div>
            <div className="bg-blue-50 rounded-2xl p-4 text-xs text-blue-700 mt-2">
              الإحصائيات الصغيرة في Hero تُعدَّل من صفحة <strong>الإحصائيات</strong>
            </div>
          </div>
        )}

        {/* ── About ── */}
        {tab === "about" && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-700 text-sm mb-4 pb-3 border-b border-gray-100">قسم عن الجهاز</h2>
            <div className="grid grid-cols-2 gap-4">
              <F label="العنوان الصغير (تاج)" k="about_subtitle" />
              <F label="سنوات الخبرة (الشارة)" k="about_years" />
            </div>
            <F label="عنوان القسم الكبير" k="about_title" />
            <F label="الفقرة الأولى" k="about_p1" rows={3} />
            <F label="الفقرة الثانية" k="about_p2" rows={3} />
            <div className="pt-2">
              <p className="text-xs font-bold text-gray-500 mb-3">قائمة المميزات (✓)</p>
              <div className="grid grid-cols-2 gap-3">
                <F label="الميزة الأولى" k="about_check1" />
                <F label="الميزة الثانية" k="about_check2" />
                <F label="الميزة الثالثة" k="about_check3" />
                <F label="الميزة الرابعة" k="about_check4" />
              </div>
            </div>
          </div>
        )}

        {/* ── Services ── */}
        {tab === "services" && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-700 text-sm mb-4 pb-3 border-b border-gray-100">قسم الخدمات</h2>
            <div className="grid grid-cols-2 gap-4">
              <F label="عنوان القسم" k="services_title" />
              <F label="وصف القسم" k="services_desc" />
            </div>
            <div className="pt-2 space-y-4">
              {[1,2,3,4,5,6,7,8].map(n => (
                <div key={n} className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">الخدمة {n} — العنوان</label>
                    <input className={inp} value={config[`service${n}_title`] ?? ""} onChange={e => set(`service${n}_title`, e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">الوصف</label>
                    <input className={inp} value={config[`service${n}_desc`] ?? ""} onChange={e => set(`service${n}_desc`, e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Contact ── */}
        {tab === "contact" && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-700 text-sm mb-4 pb-3 border-b border-gray-100">معلومات التواصل</h2>
            <F label="العنوان (الموقع الجغرافي)" k="contact_address" />
            <div className="grid grid-cols-2 gap-4">
              <F label="رقم الهاتف" k="contact_phone" />
              <F label="البريد الإلكتروني" k="contact_email" />
            </div>
            <F label="ساعات العمل" k="contact_hours" />
          </div>
        )}

        {/* ── Footer ── */}
        {tab === "footer" && (
          <div className="space-y-4">
            <h2 className="font-bold text-gray-700 text-sm mb-4 pb-3 border-b border-gray-100">التذييل (Footer)</h2>
            <F label="وصف الجهاز في التذييل" k="footer_desc" rows={3} />
            <F label="نص حقوق الملكية" k="footer_copyright" />
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-sm disabled:opacity-60"
          style={{ background: "linear-gradient(135deg,#1565C0,#2196F3)" }}>
          <Save className="w-4 h-4" /> {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
        </button>
      </div>
    </div>
  );
}
