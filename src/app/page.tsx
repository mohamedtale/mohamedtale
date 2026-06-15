import Link from "next/link";
import {
  Droplets,
  MapPin,
  Activity,
  CheckCircle,
  Drill,
  Wrench,
  FlaskConical,
  MessageSquare,
  Settings,
  Globe,
  GraduationCap,
  Shield,
} from "lucide-react";

const services = [
  { icon: Drill, title: "حفر الآبار", desc: "حفر آبار المياه بأحدث التقنيات" },
  { icon: Wrench, title: "الصيانة الدورية", desc: "صيانة شاملة ودورية للآبار" },
  { icon: FlaskConical, title: "التحاليل المخبرية", desc: "تحليل جودة المياه في المختبر" },
  { icon: MessageSquare, title: "الاستشارات الفنية", desc: "خبراء متخصصون في مجال المياه" },
  { icon: Settings, title: "تركيب المضخات", desc: "تركيب وصيانة مضخات المياه" },
  { icon: Globe, title: "المسح الجيولوجي", desc: "دراسة جيولوجية شاملة للمنطقة" },
  { icon: GraduationCap, title: "التدريب والتأهيل", desc: "تدريب الكوادر الفنية المتخصصة" },
  { icon: Shield, title: "ضمان الجودة", desc: "معايير جودة عالمية معتمدة" },
];

const projects = [
  {
    title: "مشروع آبار طرابلس الكبرى",
    date: "مارس 2024",
    desc: "حفر وتجهيز 45 بئراً في محيط طرابلس الكبرى لتأمين المياه للمناطق النائية",
    region: "طرابلس",
  },
  {
    title: "مشروع صيانة آبار بنغازي",
    date: "يناير 2024",
    desc: "صيانة شاملة لـ 62 بئراً في منطقة بنغازي وتحديث منظومة الضخ",
    region: "بنغازي",
  },
  {
    title: "مشروع مسح جيولوجي سبها",
    date: "نوفمبر 2023",
    desc: "إجراء مسح جيولوجي شامل لمنطقة سبها وتحديد مواقع حفر الآبار الجديدة",
    region: "سبها",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#1e2d4e" }}>
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: "#1e2d4e" }}>الجهاز التنفيذي</p>
              <p className="text-xs text-gray-500">حفر وصيانة آبار المياه</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-blue-600 transition-colors">الرئيسية</a>
            <a href="#" className="hover:text-blue-600 transition-colors">عن الجهاز</a>
            <a href="#" className="hover:text-blue-600 transition-colors">خريطة الآبار</a>
            <a href="#" className="hover:text-blue-600 transition-colors">خدماتنا</a>
            <a href="#" className="hover:text-blue-600 transition-colors">المشاريع</a>
            <a href="#" className="hover:text-blue-600 transition-colors">اتصل بنا</a>
          </div>
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: "#1e2d4e" }}
          >
            بوابة الموظفين
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section
        className="pt-20 min-h-screen flex flex-col justify-center relative"
        style={{ background: "linear-gradient(135deg, #0f1c36 0%, #1e2d4e 40%, #0a0f1a 100%)" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs mb-8"
            style={{ backgroundColor: "rgba(59,130,246,0.2)", color: "#93c5fd" }}
          >
            <Activity className="w-3 h-3" />
            <span>ليبيا - الجهاز التنفيذي الوطني</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            الجهاز التنفيذي لحفر
            <br />
            <span style={{ color: "#3b82f6" }}>وصيانة آبار المياه</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
            نعمل على توفير المياه النقية لجميع مناطق ليبيا من خلال حفر وصيانة آبار المياه
            باستخدام أحدث التقنيات والمعدات المتطورة
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-16">
            <Link
              href="/dashboard/wells/map"
              className="px-6 py-3 rounded-xl text-white font-medium transition-all hover:opacity-90"
              style={{ backgroundColor: "#3b82f6" }}
            >
              <MapPin className="w-4 h-4 inline ml-2" />
              استعرض خريطة الآبار
            </Link>
            <a
              href="#about"
              className="px-6 py-3 rounded-xl font-medium transition-all border border-white/20 text-white hover:bg-white/10"
            >
              اعرف علينا أكثر
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "+1,500", label: "تقرير فني", icon: CheckCircle },
              { value: "24", label: "منطقة جغرافية", icon: MapPin },
              { value: "247", label: "بئر فعال", icon: Droplets },
              { value: "+300", label: "بئر منجز في ليبيا", icon: Activity },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl p-6 text-center" style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <s.icon className="w-6 h-6 mx-auto mb-2" style={{ color: "#3b82f6" }} />
                <p className="text-3xl font-bold text-white mb-1">{s.value}</p>
                <p className="text-gray-400 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3" style={{ color: "#1e2d4e" }}>ما نقدمه من خدمات</h2>
            <p className="text-gray-500">خدمات متكاملة لإدارة وصيانة آبار المياه في ليبيا</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {services.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-center">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: "rgba(59,130,246,0.1)" }}
                >
                  <s.icon className="w-6 h-6" style={{ color: "#3b82f6" }} />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3" style={{ color: "#1e2d4e" }}>أحدث المشاريع</h2>
            <p className="text-gray-500">أبرز المشاريع المنجزة في مختلف مناطق ليبيا</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {projects.map((p, i) => (
              <div key={i} className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div
                  className="h-40 flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, #1e2d4e, #3b82f6)` }}
                >
                  <Droplets className="w-12 h-12 text-white/50" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>{p.region}</span>
                    <span className="text-xs text-gray-400">{p.date}</span>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">{p.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-gray-400 text-sm" style={{ backgroundColor: "#1e2d4e" }}>
        <p className="text-white/80">الجهاز التنفيذي لحفر وصيانة آبار المياه - ليبيا</p>
        <p className="mt-1 text-white/40">جميع الحقوق محفوظة © 2024</p>
      </footer>
    </div>
  );
}
