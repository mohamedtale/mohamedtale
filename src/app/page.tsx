"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { useCountUp } from "@/hooks/useCountUp";
import {
  Menu, X, ChevronLeft, Phone, Mail, MapPin, Clock,
  Droplets, Wrench, FlaskConical, Headphones, Zap,
  Map, GraduationCap, ShieldCheck, Star, ArrowLeft,
  CheckCircle, Globe
} from "lucide-react";

// --- Navbar ---
function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const links = [
    { label: "الرئيسية", href: "#" },
    { label: "عن الجهاز", href: "#about" },
    { label: "خدماتنا", href: "#services" },
    { label: "مشاريعنا", href: "#projects" },
    { label: "الخريطة", href: "#map" },
    { label: "اتصل بنا", href: "#contact" },
  ];

  return (
    <nav
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo + Name */}
          <div className="flex items-center gap-3">
            <Logo size={44} />
            <div className="hidden sm:block">
              <p className={`text-xs font-bold leading-tight ${scrolled ? "text-blue-900" : "text-white"}`}>
                الجهاز التنفيذي
              </p>
              <p className={`text-xs leading-tight ${scrolled ? "text-blue-700" : "text-blue-200"}`}>
                لحفر وصيانة آبار المياه
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className={`text-sm font-medium transition-colors hover:text-blue-400 ${
                  scrolled ? "text-gray-700" : "text-white"
                }`}
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              بوابة الموظفين
            </Link>
            <button
              className={`text-sm border rounded-lg px-3 py-1.5 transition-colors ${
                scrolled
                  ? "border-blue-600 text-blue-600 hover:bg-blue-50"
                  : "border-white/50 text-white hover:bg-white/10"
              }`}
            >
              EN
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className={`lg:hidden p-2 ${scrolled ? "text-gray-700" : "text-white"}`}
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden bg-white/95 backdrop-blur-md rounded-2xl mb-2 p-4 shadow-xl">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="block py-2 px-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/login"
              className="block mt-2 bg-blue-600 text-white text-center py-2 rounded-lg"
              onClick={() => setOpen(false)}
            >
              بوابة الموظفين
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

// --- Particles ---
function Particles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 2,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 8,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            top: `${p.top}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

// --- Stat Card ---
function StatCard({ target, suffix, label, prefix }: { target: number; suffix?: string; label: string; prefix?: string }) {
  const { displayValue, elementRef } = useCountUp({ target, duration: 2000, prefix, suffix });
  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20"
    >
      <div className="text-4xl font-bold text-white mb-2">{displayValue}</div>
      <div className="text-blue-200 text-sm">{label}</div>
    </div>
  );
}

// --- Hero ---
function Hero() {
  return (
    <section
      className="relative min-h-screen flex flex-col justify-center items-center text-center px-4 pt-20"
      style={{
        background: "linear-gradient(135deg, #0a1628 0%, #1e3a5f 50%, #0d2137 100%)",
      }}
    >
      <Particles />
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="flex justify-center mb-6">
          <Logo size={80} />
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
          الجهاز التنفيذي
          <span className="block text-blue-400">لحفر وصيانة آبار المياه</span>
        </h1>
        <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
          نعمل من أجل توفير المياه النظيفة لكل مواطن ليبي — بكفاءة، احترافية، واستدامة
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#map"
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-8 py-4 rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/30 flex items-center gap-2 justify-center"
          >
            <Map size={18} />
            استعرض خريطة الآبار
          </a>
          <a
            href="#about"
            className="border border-white/30 hover:bg-white/10 text-white font-medium px-8 py-4 rounded-xl transition-all flex items-center gap-2 justify-center"
          >
            تعرف علينا
            <ChevronLeft size={18} />
          </a>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
          <StatCard target={1500} prefix="+" label="تقرير فني" />
          <StatCard target={24} label="منطقة جغرافية" />
          <StatCard target={247} prefix="+" label="بئر فعال" />
          <StatCard target={300} prefix="+" label="مشروع منجز" />
        </div>
      </div>
    </section>
  );
}

// --- About ---
function About() {
  const cards = [
    { title: "التأسيس", icon: <Star size={24} />, desc: "تأسس الجهاز لتلبية الاحتياجات المائية الوطنية وضمان استدامة الموارد المائية في ليبيا." },
    { title: "الانتشار الجغرافي", icon: <Globe size={24} />, desc: "يغطي الجهاز 24 منطقة جغرافية على امتداد الأراضي الليبية من الشرق إلى الغرب." },
    { title: "معايير الجودة", icon: <ShieldCheck size={24} />, desc: "نطبق أعلى معايير الجودة الدولية في جميع مراحل الحفر والصيانة والتحليل المخبري." },
  ];

  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div>
            <span className="text-blue-600 text-sm font-semibold uppercase tracking-widest">عن الجهاز</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-6 leading-tight">
              نحو مستقبل مائي مستدام لليبيا
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              الجهاز التنفيذي لحفر وصيانة آبار المياه هو مؤسسة حكومية ليبية متخصصة في إدارة الموارد المائية الجوفية،
              تأسس بهدف تحقيق الأمن المائي وضمان وصول المياه النظيفة لجميع مناطق ليبيا.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              يضم الجهاز كوادر هندسية وفنية مؤهلة، ويعتمد أحدث التقنيات في مجال حفر الآبار والمسح الجيولوجي
              وتحليل جودة المياه، مع التزام تام بالمعايير البيئية الدولية.
            </p>
            <div className="flex flex-wrap gap-3">
              {["الأمن المائي", "التنمية المستدامة", "الكفاءة التقنية"].map((tag) => (
                <span
                  key={tag}
                  className="bg-blue-50 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full border border-blue-100"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Cards */}
          <div className="space-y-4">
            {cards.map((card) => (
              <div
                key={card.title}
                className="flex gap-4 p-5 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all bg-white"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                  {card.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{card.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Stats Section ---
function StatsSection() {
  const stats = [
    { target: 1500, suffix: "+", label: "تقرير فني مُعتمد" },
    { target: 300, suffix: "+", label: "مشروع منجز" },
    { target: 24, suffix: "", label: "منطقة جغرافية" },
    { target: 15, suffix: "+", label: "سنة خبرة" },
  ];

  return (
    <section
      className="py-24"
      style={{ background: "linear-gradient(135deg, #0a1628 0%, #1e3a5f 100%)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white">إنجازاتنا بالأرقام</h2>
          <p className="text-blue-300 mt-2">سنوات من العطاء والخدمة لوطننا الحبيب</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s) => (
            <StatCard key={s.label} target={s.target} suffix={s.suffix} label={s.label} />
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Services ---
function Services() {
  const services = [
    { icon: <Droplets size={28} />, title: "حفر الآبار", desc: "حفر الآبار الجوفية بأحدث المعدات والتقنيات المتطورة" },
    { icon: <Wrench size={28} />, title: "الصيانة الدورية", desc: "برامج صيانة منتظمة لضمان كفاءة الآبار واستمرارية التشغيل" },
    { icon: <FlaskConical size={28} />, title: "التحاليل المخبرية", desc: "فحص وتحليل جودة المياه وفق أعلى المعايير الدولية" },
    { icon: <Headphones size={28} />, title: "الاستشارات الفنية", desc: "خدمات استشارية متخصصة في مجال الموارد المائية الجوفية" },
    { icon: <Zap size={28} />, title: "تركيب المضخات", desc: "تركيب وصيانة أنظمة ضخ المياه بكفاءة عالية" },
    { icon: <Map size={28} />, title: "المسح الجيولوجي", desc: "دراسات جيولوجية وهيدرولوجية شاملة لتحديد مواقع الآبار" },
    { icon: <GraduationCap size={28} />, title: "التدريب والتأهيل", desc: "برامج تدريبية متخصصة للكوادر الفنية والهندسية" },
    { icon: <ShieldCheck size={28} />, title: "ضمان الجودة", desc: "تطبيق أنظمة متكاملة لضمان الجودة في جميع العمليات" },
  ];

  return (
    <section id="services" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-blue-600 text-sm font-semibold uppercase tracking-widest">خدماتنا</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">ماذا نقدم؟</h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            نقدم طيفاً واسعاً من الخدمات المتكاملة في مجال حفر وصيانة آبار المياه
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {services.map((s) => (
            <div
              key={s.title}
              className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-blue-50 group-hover:bg-blue-600 rounded-xl flex items-center justify-center text-blue-600 group-hover:text-white transition-colors mb-4">
                {s.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Map Section ---
const wellsData = [
  { name: "طرابلس", x: 22, y: 18, status: "فعال", count: 89 },
  { name: "مصراتة", x: 38, y: 22, status: "فعال", count: 45 },
  { name: "بنغازي", x: 72, y: 28, status: "فعال", count: 67 },
  { name: "سبها", x: 48, y: 62, status: "صيانة", count: 34 },
  { name: "الزاوية", x: 18, y: 22, status: "فعال", count: 28 },
  { name: "الكفرة", x: 78, y: 68, status: "فعال", count: 21 },
];

function MapSection() {
  const [hovered, setHovered] = useState<null | typeof wellsData[0]>(null);

  const statusColor: Record<string, string> = {
    "فعال": "#22c55e",
    "صيانة": "#f97316",
    "متعطل": "#ef4444",
  };

  return (
    <section id="map" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-blue-600 text-sm font-semibold uppercase tracking-widest">الخريطة</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">خريطة انتشار الآبار</h2>
          <p className="text-gray-500 mt-3">توزيع الآبار عبر المناطق الليبية</p>
        </div>

        <div className="relative rounded-3xl overflow-hidden border border-gray-200 shadow-xl bg-gray-50">
          <div className="relative w-full" style={{ paddingBottom: "55%" }}>
            <svg
              viewBox="0 0 800 440"
              className="absolute inset-0 w-full h-full"
              style={{ background: "linear-gradient(180deg, #dbeafe 0%, #eff6ff 100%)" }}
            >
              {/* Simplified Libya outline */}
              <path
                d="M 60 80 L 100 60 L 200 50 L 280 55 L 340 50 L 400 48 L 460 52 L 520 55 L 580 60 L 620 70 L 660 80 L 700 100 L 720 140 L 730 180 L 720 220 L 700 260 L 680 300 L 660 340 L 620 370 L 560 390 L 480 400 L 400 405 L 320 400 L 240 390 L 160 370 L 100 340 L 70 300 L 55 260 L 50 220 L 52 180 L 55 140 Z"
                fill="#bfdbfe"
                stroke="#3b82f6"
                strokeWidth="2"
              />
              {/* Interior terrain lines */}
              <path d="M 100 200 Q 300 180 500 200 Q 650 215 720 200" stroke="#93c5fd" strokeWidth="1" fill="none" />
              <path d="M 80 280 Q 250 260 450 275 Q 620 290 700 280" stroke="#93c5fd" strokeWidth="1" fill="none" />

              {/* Well dots */}
              {wellsData.map((well) => {
                const cx = (well.x / 100) * 800;
                const cy = (well.y / 100) * 440;
                const color = statusColor[well.status] || "#22c55e";
                return (
                  <g
                    key={well.name}
                    className="cursor-pointer"
                    onMouseEnter={() => setHovered(well)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <circle cx={cx} cy={cy} r="18" fill={color} opacity="0.15" />
                    <circle cx={cx} cy={cy} r="10" fill={color} opacity="0.3" />
                    <circle cx={cx} cy={cy} r="6" fill={color} />
                    <text
                      x={cx}
                      y={cy + 22}
                      textAnchor="middle"
                      fontSize="11"
                      fill="#1e3a5f"
                      fontWeight="bold"
                    >
                      {well.name}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Tooltip */}
            {hovered && (
              <div
                className="absolute bg-white rounded-xl shadow-xl border border-gray-100 p-4 pointer-events-none z-10 min-w-40"
                style={{
                  left: `${hovered.x}%`,
                  top: `${hovered.y}%`,
                  transform: "translate(-50%, -130%)",
                }}
              >
                <div className="font-bold text-gray-900 mb-1">{hovered.name}</div>
                <div className="text-sm text-gray-500">عدد الآبار: <span className="text-blue-600 font-semibold">{hovered.count}</span></div>
                <div className="text-sm mt-1">
                  الحالة:{" "}
                  <span
                    className="font-medium"
                    style={{ color: statusColor[hovered.status] }}
                  >
                    {hovered.status}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 py-4 border-t border-gray-100 bg-white">
            {Object.entries(statusColor).map(([label, color]) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                <span className="text-sm text-gray-600">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Projects ---
function Projects() {
  const projects = [
    {
      title: "مشروع آبار طرابلس الكبرى",
      region: "طرابلس",
      date: "مارس 2024",
      desc: "حفر وتجهيز 45 بئراً جوفياً لتأمين مياه الشرب لمناطق طرابلس الكبرى وضواحيها.",
      count: 45,
      gradient: "from-blue-900 to-blue-600",
    },
    {
      title: "مشروع صيانة آبار بنغازي",
      region: "بنغازي",
      date: "يناير 2024",
      desc: "أعمال صيانة شاملة لـ 62 بئراً في منطقة بنغازي مع تحديث منظومة الضخ.",
      count: 62,
      gradient: "from-indigo-900 to-blue-700",
    },
    {
      title: "مشروع مسح جيولوجي سبها",
      region: "سبها",
      date: "نوفمبر 2023",
      desc: "مسح جيولوجي وهيدرولوجي شامل لمنطقة سبها لتحديد المواقع المثلى لحفر الآبار.",
      count: 34,
      gradient: "from-blue-900 to-indigo-800",
    },
  ];

  return (
    <section id="projects" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-blue-600 text-sm font-semibold uppercase tracking-widest">مشاريعنا</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">أحدث المشاريع</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {projects.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Image placeholder */}
              <div className={`h-48 bg-gradient-to-br ${p.gradient} relative flex items-center justify-center`}>
                <Droplets size={48} className="text-white/30" />
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full">
                  {p.region}
                </div>
                <div className="absolute bottom-4 left-4 text-white/70 text-xs">{p.date}</div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-gray-900 text-lg mb-2">{p.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{p.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 text-sm font-medium">{p.count} بئر</span>
                  <button className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:gap-2 transition-all">
                    عرض التفاصيل
                    <ArrowLeft size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Contact ---
function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSuccess(true);
  };

  const info = [
    { icon: <MapPin size={20} />, label: "العنوان", value: "طريق المطار، طرابلس، ليبيا" },
    { icon: <Phone size={20} />, label: "الهاتف", value: "+218 21 123 4567" },
    { icon: <Mail size={20} />, label: "البريد الإلكتروني", value: "info@wwda.ly" },
    { icon: <Clock size={20} />, label: "ساعات العمل", value: "الأحد – الخميس: 8:00 – 15:00" },
  ];

  return (
    <section id="contact" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-blue-600 text-sm font-semibold uppercase tracking-widest">اتصل بنا</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">نحن هنا لمساعدتك</h2>
        </div>
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 order-1 lg:order-2">
            {success ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <CheckCircle size={64} className="text-green-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">تم إرسال رسالتك بنجاح!</h3>
                <p className="text-gray-500">سيتواصل معك فريقنا قريباً</p>
                <button
                  onClick={() => { setSuccess(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                  className="mt-6 text-blue-600 text-sm font-medium"
                >
                  إرسال رسالة أخرى
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="أدخل اسمك الكامل"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="example@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+218 ..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">موضوع الرسالة</label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="موضوع رسالتك"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الرسالة</label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="اكتب رسالتك هنا..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      جارٍ الإرسال...
                    </>
                  ) : "إرسال الرسالة"}
                </button>
              </form>
            )}
          </div>

          {/* Info */}
          <div className="order-2 lg:order-1 space-y-6">
            <p className="text-gray-600 leading-relaxed">
              يسعدنا التواصل معكم للرد على استفساراتكم وتقديم المساعدة اللازمة. فريقنا متاح خلال ساعات الدوام الرسمي.
            </p>
            {info.map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{item.label}</div>
                  <div className="text-gray-500 text-sm mt-0.5">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Footer ---
function Footer() {
  return (
    <footer style={{ background: "#0f1c36" }} className="text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-10 pb-10 border-b border-white/10">
          {/* Logo col */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Logo size={40} />
              <div>
                <div className="font-bold text-sm">الجهاز التنفيذي</div>
                <div className="text-blue-300 text-xs">لحفر وصيانة آبار المياه</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              نعمل على توفير المياه النظيفة لكل مواطن ليبي من خلال إدارة فعالة وتقنيات حديثة.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-bold mb-4 text-sm">روابط سريعة</h4>
            <ul className="space-y-2">
              {["الرئيسية", "عن الجهاز", "خدماتنا", "مشاريعنا", "اتصل بنا"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4 text-sm">تواصل معنا</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-center gap-2"><MapPin size={14} />طريق المطار، طرابلس، ليبيا</li>
              <li className="flex items-center gap-2"><Phone size={14} />+218 21 123 4567</li>
              <li className="flex items-center gap-2"><Mail size={14} />info@wwda.ly</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 text-center text-gray-500 text-sm">
          © 2024 الجهاز التنفيذي لحفر وصيانة آبار المياه — جميع الحقوق محفوظة
        </div>
      </div>
    </footer>
  );
}

// --- Main Page ---
export default function HomePage() {
  return (
    <main dir="rtl" className="font-sans">
      <Navbar />
      <Hero />
      <About />
      <StatsSection />
      <Services />
      <MapSection />
      <Projects />
      <Contact />
      <Footer />
    </main>
  );
}
