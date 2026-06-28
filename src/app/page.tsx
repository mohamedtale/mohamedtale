"use client";

import Link from "next/link";
import {
  Droplets, MapPin, Activity, Drill, Wrench, FlaskConical,
  Settings, Globe, Truck, FileSearch, Phone, Mail,
  Building2, CheckCircle2, ArrowLeft, Users,
} from "lucide-react";

const services = [
  { icon: Drill, title: "حفر الآبار", desc: "حفر آبار المياه الإنتاجية والاستكشافية والاختبارية وآبار المراقبة" },
  { icon: Wrench, title: "صيانة الآبار", desc: "صيانة وقتل وتصوير الآبار الارتوازية بمختلف أنحاء ليبيا" },
  { icon: Truck, title: "الآليات والمعدات", desc: "توفير وتوريد وتأجير الآليات والمعدات الخاصة بحفر الآبار" },
  { icon: Globe, title: "الدراسات الجيولوجية", desc: "إعداد الدراسات الجيولوجية ذات العلاقة بالمياه مع الهيئة العامة للموارد المائية" },
  { icon: FlaskConical, title: "التحاليل المخبرية", desc: "تحليل جودة المياه وإصدار التقارير الفنية المتخصصة" },
  { icon: FileSearch, title: "الاستكشاف المائي", desc: "دراسة وتحديد مواقع حفر الآبار الجديدة في مختلف مناطق ليبيا" },
  { icon: Settings, title: "تركيب المضخات", desc: "تركيب وصيانة مضخات المياه وتوفير مستلزماتها" },
  { icon: Building2, title: "إدارة المشاريع", desc: "تنفيذ مشاريع الحفر والصيانة وفق أعلى معايير الجودة" },
];

const projects = [
  {
    title: "عقد حفر 60,000 متر طولي",
    partner: "الهيئة العامة للمياه",
    desc: "حفر 60 ألف متر طولي في مختلف أنحاء ليبيا ضمن عقد شامل مع الهيئة العامة للمياه",
    region: "ليبيا",
    icon: Drill,
  },
  {
    title: "مشروع قرارة القطف - بني وليد",
    partner: "جهاز استثمار مياه النهر",
    desc: "حفر 14 بئراً بعمق 1200 متر للبئر الواحد بمشروع جبل الحساونة جفارة",
    region: "بني وليد",
    icon: Activity,
  },
  {
    title: "صيانة 88 بئراً ارتوازياً",
    partner: "الهيئة العامة للمياه",
    desc: "صيانة وقتل وتصوير 88 بئراً ارتوازياً بالمنطقة الوسطى",
    region: "المنطقة الوسطى",
    icon: Wrench,
  },
  {
    title: "حفر آبار طرابلس والجبل الغربي",
    partner: "تكليفات حكومية",
    desc: "تنفيذ تكليفات حفر عدة آبار في طرابلس وباطن الجبل الغربي",
    region: "طرابلس",
    icon: MapPin,
  },
];

const branches = [
  { name: "المقر الرئيسي", city: "طرابلس", desc: "الإدارة العامة والمقر الرئيسي للجهاز" },
  { name: "المنطقة الشرقية", city: "بنغازي", desc: "فرع المنطقة الشرقية - يغطي شرق ليبيا" },
  { name: "المنطقة الجنوبية", city: "الكفرة", desc: "فرع المنطقة الجنوبية - يغطي جنوب ليبيا" },
];

const stats = [
  { value: "+150", label: "موظف متخصص", icon: Users },
  { value: "1971", label: "سنة التأسيس", icon: Building2 },
  { value: "3", label: "فروع في ليبيا", icon: MapPin },
  { value: "+88", label: "بئر صيانة منجز", icon: CheckCircle2 },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#0ea5e9" }}>
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">الجهاز التنفيذي</p>
              <p className="text-xs text-slate-500">حفر وصيانة آبار المياه</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <a href="#about" className="hover:text-sky-600 transition-colors">عن الجهاز</a>
            <a href="#services" className="hover:text-sky-600 transition-colors">خدماتنا</a>
            <a href="#projects" className="hover:text-sky-600 transition-colors">المشاريع</a>
            <a href="#branches" className="hover:text-sky-600 transition-colors">الفروع</a>
            <a href="#contact" className="hover:text-sky-600 transition-colors">اتصل بنا</a>
          </div>
          <Link href="/dashboard" className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90" style={{ backgroundColor: "#0ea5e9" }}>
            بوابة الموظفين
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 min-h-screen flex flex-col justify-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0c4a6e 0%, #0369a1 40%, #0ea5e9 100%)" }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 rounded-full border-2 border-white"></div>
          <div className="absolute top-40 right-40 w-32 h-32 rounded-full border border-white"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full border border-white"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-20 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs mb-8 bg-white/20 text-white border border-white/30">
            <Activity className="w-3 h-3" />
            <span>منذ عام 1971م · ليبيا</span>
          </div>
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 bg-white/20 backdrop-blur-sm border border-white/30">
            <Droplets className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            الجهاز التنفيذي لحفر
            <br />
            <span className="text-sky-200">وصيانة آبار المياه</span>
          </h1>
          <p className="text-sky-100 text-lg md:text-xl max-w-3xl mx-auto mb-4 leading-relaxed">
            من أكبر الجهات العاملة في مجال حفر وصيانة آبار المياه داخل ليبيا
          </p>
          <p className="text-sky-200 text-base max-w-2xl mx-auto mb-10 leading-relaxed">
            نعمل على توفير المياه لجميع مناطق ليبيا من خلال حفر وصيانة الآبار الإنتاجية
            والاستكشافية والاختبارية وآبار المراقبة باستخدام أحدث التقنيات والمعدات
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-16">
            <a href="#projects" className="px-6 py-3 rounded-xl text-white font-medium flex items-center gap-2" style={{ backgroundColor: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.4)" }}>
              <ArrowLeft className="w-4 h-4" />
              استعرض المشاريع
            </a>
            <Link href="/dashboard" className="px-6 py-3 rounded-xl font-medium bg-white flex items-center gap-2" style={{ color: "#0369a1" }}>
              بوابة الموظفين
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <div key={i} className="rounded-2xl p-6 text-center backdrop-blur-sm" style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
                <s.icon className="w-6 h-6 mx-auto mb-2 text-sky-200" />
                <p className="text-3xl font-bold text-white mb-1">{s.value}</p>
                <p className="text-sky-200 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-4 font-medium" style={{ backgroundColor: "#e0f2fe", color: "#0369a1" }}>
                <Building2 className="w-3 h-3" />
                تأسس عام 1971م
              </div>
              <h2 className="text-3xl font-bold mb-4 text-slate-800">عن الجهاز التنفيذي</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                يُعدّ الجهاز التنفيذي لحفر وصيانة آبار المياه من أكبر الجهات العاملة في مجال حفر وصيانة
                آبار المياه داخل ليبيا، تأسس عام 1971م ويضم أكثر من 150 موظفاً متخصصاً في المجالين الفني والإداري.
              </p>
              <p className="text-slate-600 leading-relaxed mb-6">
                يمتلك الجهاز فروعاً في المنطقة الشرقية ببنغازي والمنطقة الجنوبية بالكفرة، ويعمل على
                تنفيذ مشاريع الحفر والصيانة في مختلف أنحاء ليبيا بالتنسيق مع الهيئة العامة للموارد المائية.
              </p>
              <div className="grid grid-cols-1 gap-3">
                {[
                  "حفر الآبار الإنتاجية والاستكشافية والاختبارية وآبار المراقبة",
                  "صيانة وقتل وتصوير الآبار الارتوازية",
                  "توفير وتوريد وتأجير الآليات والمعدات الخاصة",
                  "إعداد الدراسات الجيولوجية مع الهيئة العامة للموارد المائية",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#0ea5e9" }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "موظف متخصص", value: "+150", color: "#0ea5e9" },
                { label: "سنة خبرة", value: "+50", color: "#0284c7" },
                { label: "فروع تشغيلية", value: "3", color: "#0369a1" },
                { label: "مشروع منجز", value: "+200", color: "#075985" },
              ].map((s, i) => (
                <div key={i} className="rounded-2xl p-6 text-center text-white" style={{ backgroundColor: s.color }}>
                  <p className="text-4xl font-bold mb-1">{s.value}</p>
                  <p className="text-sm opacity-90">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-4 font-medium" style={{ backgroundColor: "#e0f2fe", color: "#0369a1" }}>خدماتنا</div>
            <h2 className="text-3xl font-bold mb-3 text-slate-800">ما نقدمه من خدمات</h2>
            <p className="text-slate-500">خدمات متكاملة لحفر وصيانة آبار المياه في ليبيا</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {services.map((s, i) => (
              <div key={i} className="rounded-2xl p-6 shadow-sm hover:shadow-md transition-all text-center border border-slate-100 hover:border-sky-200">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#e0f2fe" }}>
                  <s.icon className="w-6 h-6" style={{ color: "#0ea5e9" }} />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{s.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="py-20" style={{ backgroundColor: "#f0f9ff" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-4 font-medium" style={{ backgroundColor: "#e0f2fe", color: "#0369a1" }}>المشاريع الحالية</div>
            <h2 className="text-3xl font-bold mb-3 text-slate-800">أبرز المشاريع والعقود</h2>
            <p className="text-slate-500">مشاريع حفر وصيانة آبار المياه في مختلف مناطق ليبيا</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((p, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-sky-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#e0f2fe" }}>
                    <p.icon className="w-6 h-6" style={{ color: "#0ea5e9" }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: "#e0f2fe", color: "#0369a1" }}>{p.region}</span>
                      <span className="text-xs text-slate-400">{p.partner}</span>
                    </div>
                    <h3 className="font-bold text-slate-800 mb-2">{p.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Branches */}
      <section id="branches" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-4 font-medium" style={{ backgroundColor: "#e0f2fe", color: "#0369a1" }}>الفروع</div>
            <h2 className="text-3xl font-bold mb-3 text-slate-800">فروع الجهاز</h2>
            <p className="text-slate-500">نغطي مختلف مناطق ليبيا من خلال فروعنا</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {branches.map((b, i) => (
              <div key={i} className="rounded-2xl p-8 text-center border-2 hover:border-sky-400 transition-colors" style={{ borderColor: "#bae6fd" }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#e0f2fe" }}>
                  <MapPin className="w-7 h-7" style={{ color: "#0ea5e9" }} />
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-1">{b.name}</h3>
                <p className="font-medium mb-2" style={{ color: "#0ea5e9" }}>{b.city}</p>
                <p className="text-slate-500 text-sm">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20" style={{ background: "linear-gradient(135deg, #0c4a6e, #0369a1)" }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">تواصل معنا</h2>
          <p className="text-sky-200 mb-10">للاستفسار عن خدماتنا أو المشاريع تواصل مع الجهاز التنفيذي</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Phone, label: "الهاتف", value: "اتصل بنا" },
              { icon: Mail, label: "البريد الإلكتروني", value: "راسلنا" },
              { icon: MapPin, label: "العنوان", value: "طرابلس، ليبيا" },
            ].map((c, i) => (
              <div key={i} className="rounded-2xl p-6 text-center" style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
                <c.icon className="w-8 h-8 mx-auto mb-3 text-sky-200" />
                <p className="text-white font-medium mb-1">{c.label}</p>
                <p className="text-sky-200 text-sm">{c.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center" style={{ backgroundColor: "#0c4a6e" }}>
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#0ea5e9" }}>
            <Droplets className="w-4 h-4 text-white" />
          </div>
          <p className="text-white font-semibold">الجهاز التنفيذي لحفر وصيانة آبار المياه</p>
        </div>
        <p className="text-sky-300 text-sm">تأسس عام 1971م · ليبيا</p>
        <p className="text-sky-400 text-xs mt-2">جميع الحقوق محفوظة © 2024</p>
      </footer>
    </div>
  );
}
