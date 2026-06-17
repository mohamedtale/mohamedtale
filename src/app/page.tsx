"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { useCountUp } from "@/hooks/useCountUp";
import {
  Menu, X, MapPin, Phone, Mail, Clock, Droplets, Wrench,
  FlaskConical, MessageSquare, Settings, Globe, GraduationCap,
  Shield, ChevronDown, ArrowLeft, CheckCircle, Target, Award,
  Users, Drill, Play, Star,
} from "lucide-react";

const IMAGES = {
  heroBg:    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1920&q=85&fit=crop",
  aboutBg:   "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&q=80&fit=crop",
  workers:   "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=900&q=80&fit=crop",
  water:     "https://images.unsplash.com/photo-1559825481-12a05cc00344?w=900&q=80&fit=crop",
  drilling:  "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=900&q=80&fit=crop",
  proj1:     "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80&fit=crop&crop=center",
  proj2:     "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=800&q=80&fit=crop",
  proj3:     "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80&fit=crop",
  desert:    "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1600&q=80&fit=crop",
  waterDrop: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80&fit=crop",
};

const NAV = [
  { href: "#home",     label: "الرئيسية" },
  { href: "#about",    label: "عن الجهاز" },
  { href: "#services", label: "خدماتنا" },
  { href: "#map",      label: "الخريطة" },
  { href: "#projects", label: "مشاريعنا" },
  { href: "#contact",  label: "اتصل بنا" },
];

const SERVICE_ICONS = [Drill, Wrench, FlaskConical, MessageSquare, Settings, Globe, GraduationCap, Shield];

const DEFAULT_SERVICES = [
  { title: "حفر الآبار",        desc: "حفر آبار المياه الجوفية بأحدث المعدات الثقيلة وأعلى معايير الدقة والجودة" },
  { title: "الصيانة الدورية",    desc: "برامج صيانة شاملة تضمن استمرارية تشغيل الآبار وتمديد عمرها الافتراضي" },
  { title: "التحاليل المخبرية",  desc: "تحليل دقيق لجودة المياه وفق أحدث المعايير الدولية لضمان سلامتها" },
  { title: "الاستشارات الفنية",  desc: "فريق من الخبراء المتخصصين يقدم حلولاً مبتكرة لكل تحديات إدارة المياه" },
  { title: "تركيب المضخات",      desc: "تركيب وصيانة منظومات الضخ المتكاملة بكافة الأنواع والأحجام" },
  { title: "المسح الجيولوجي",    desc: "دراسات جيولوجية متعمقة لتحديد أفضل المواقع وضمان نجاح الحفر" },
  { title: "التدريب والتأهيل",   desc: "برامج تدريب متخصصة لرفع كفاءة الكوادر الفنية في قطاع المياه" },
  { title: "ضمان الجودة",        desc: "التزام راسخ بمعايير ISO الدولية في كل مرحلة من مراحل العمل" },
];

const WELLS = [
  { name: "طرابلس",  count: 89,  status: "فعال",  x: "22%", y: "17%", color: "#22c55e" },
  { name: "الزاوية", count: 28,  status: "فعال",  x: "16%", y: "22%", color: "#22c55e" },
  { name: "مصراتة",  count: 45,  status: "فعال",  x: "39%", y: "23%", color: "#22c55e" },
  { name: "بنغازي",  count: 67,  status: "فعال",  x: "72%", y: "27%", color: "#22c55e" },
  { name: "سبها",    count: 34,  status: "صيانة", x: "48%", y: "62%", color: "#f97316" },
  { name: "الكفرة",  count: 21,  status: "فعال",  x: "78%", y: "68%", color: "#22c55e" },
];

const PROJECTS = [
  { img: IMAGES.proj1, title: "مشروع آبار طرابلس الكبرى", date: "مارس 2024", region: "طرابلس", count: "45 بئر", desc: "حفر وتجهيز 45 بئراً في محيط طرابلس الكبرى لتأمين المياه للمناطق النائية." },
  { img: IMAGES.proj2, title: "مشروع صيانة آبار بنغازي", date: "يناير 2024", region: "بنغازي", count: "62 بئر", desc: "صيانة شاملة لـ 62 بئراً وتحديث كامل لمنظومة الضخ في منطقة بنغازي." },
  { img: IMAGES.proj3, title: "مشروع مسح جيولوجي سبها", date: "نوفمبر 2023", region: "سبها", count: "12 موقع", desc: "مسح جيولوجي شامل لمنطقة سبها وتحديد 12 موقعاً مثالياً للحفر." },
];

function Counter({ target, prefix = "", suffix = "", label }: { target: number; prefix?: string; suffix?: string; label: string }) {
  const { displayValue, elementRef } = useCountUp({ target, duration: 2500, prefix, suffix });
  return (
    <div ref={elementRef as React.RefObject<HTMLDivElement>} className="text-center">
      <div className="text-5xl lg:text-6xl font-black text-white mb-2 tabular-nums">{displayValue}</div>
      <div className="text-blue-300 text-sm font-medium tracking-wide uppercase">{label}</div>
    </div>
  );
}

function WellDot({ w }: { w: typeof WELLS[0] }) {
  const [show, setShow] = useState(false);
  return (
    <div className="absolute" style={{ left: w.x, top: w.y, transform: "translate(-50%,-50%)" }}>
      <button onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} className="relative group">
        <span className="absolute inset-0 rounded-full animate-ping opacity-40" style={{ backgroundColor: w.color }} />
        <span className="relative block w-5 h-5 rounded-full border-2 border-white shadow-lg transition-transform group-hover:scale-150" style={{ backgroundColor: w.color }} />
        {show && (
          <div className="absolute bottom-8 right-0 bg-white rounded-2xl shadow-2xl p-4 min-w-max z-20 text-right" style={{ border: "1px solid #e5e7eb" }}>
            <p className="font-bold text-gray-800 text-sm mb-1">{w.name}</p>
            <p className="text-blue-600 text-xs font-semibold">{w.count} بئر</p>
            <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: w.status === "فعال" ? "#dcfce7" : "#ffedd5", color: w.status === "فعال" ? "#16a34a" : "#ea580c" }}>
              {w.status}
            </span>
          </div>
        )}
      </button>
    </div>
  );
}

function ContactForm() {
  const [f, setF] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const submit = (e: React.FormEvent) => { e.preventDefault(); setLoading(true); setTimeout(() => { setLoading(false); setSent(true); }, 1600); };
  if (sent) return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}>
        <CheckCircle className="w-10 h-10 text-white" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">تم إرسال رسالتك بنجاح</h3>
      <p className="text-blue-200 mb-6">سنتواصل معك في أقرب وقت ممكن</p>
      <button onClick={() => { setSent(false); setF({ name: "", email: "", phone: "", subject: "", message: "" }); }}
        className="px-6 py-2.5 rounded-xl text-sm font-medium text-white border border-white/30 hover:bg-white/10 transition-colors">
        إرسال رسالة أخرى
      </button>
    </div>
  );
  const inputCls = "w-full px-4 py-3 rounded-xl text-sm outline-none transition-all bg-white/10 border border-white/20 text-white placeholder-blue-200/60 focus:bg-white/15 focus:border-blue-400";
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-blue-200 text-xs mb-1.5 font-medium">الاسم الكامل</label><input required className={inputCls} placeholder="محمد علي" value={f.name} onChange={e => setF(p => ({ ...p, name: e.target.value }))} /></div>
        <div><label className="block text-blue-200 text-xs mb-1.5 font-medium">رقم الهاتف</label><input className={inputCls} placeholder="+218 91 000 0000" value={f.phone} onChange={e => setF(p => ({ ...p, phone: e.target.value }))} /></div>
      </div>
      <div><label className="block text-blue-200 text-xs mb-1.5 font-medium">البريد الإلكتروني</label><input required type="email" className={inputCls} placeholder="example@email.com" value={f.email} onChange={e => setF(p => ({ ...p, email: e.target.value }))} /></div>
      <div><label className="block text-blue-200 text-xs mb-1.5 font-medium">موضوع الرسالة</label><input required className={inputCls} placeholder="استفسار عن خدمة..." value={f.subject} onChange={e => setF(p => ({ ...p, subject: e.target.value }))} /></div>
      <div><label className="block text-blue-200 text-xs mb-1.5 font-medium">الرسالة</label><textarea required rows={4} className={inputCls} style={{ resize: "none" }} placeholder="اكتب رسالتك هنا..." value={f.message} onChange={e => setF(p => ({ ...p, message: e.target.value }))} /></div>
      <button type="submit" disabled={loading}
        className="w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
        style={{ background: loading ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg,#2196F3,#1565C0)", color: "white" }}>
        {loading ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>جاري الإرسال...</> : <><ArrowLeft className="w-4 h-4" />إرسال الرسالة</>}
      </button>
    </form>
  );
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [dbProjects, setDbProjects] = useState<typeof PROJECTS | null>(null);
  const [cfg, setCfg] = useState<Record<string, string>>({});

  useEffect(() => {
    const fn = () => { setScrolled(window.scrollY > 50); setScrollY(window.scrollY); };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    fetch("/api/content/projects").then(r => r.json()).then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setDbProjects(data.map((p: any) => ({
          img: p.imageUrl || IMAGES.proj1, title: p.title, date: p.date,
          region: p.region, count: p.count, desc: p.description || "",
        })));
      }
    }).catch(() => {});
    fetch("/api/content/stats").then(r => r.json()).then(d => {
      if (d && Object.keys(d).length > 0) setCfg(d);
    }).catch(() => {});
  }, []);

  const c = (key: string, fallback: string) => cfg[key] || fallback;
  const n = (key: string, fallback: number) => cfg[key] ? parseInt(cfg[key]) : fallback;
  const displayProjects = dbProjects ?? PROJECTS;
  const services = DEFAULT_SERVICES.map((s, i) => ({
    title: c(`service${i+1}_title`, s.title),
    desc: c(`service${i+1}_desc`, s.desc),
    icon: SERVICE_ICONS[i],
  }));

  return (
    <div className="min-h-screen bg-white" dir="rtl">

      {/* ═══ NAVBAR ═══ */}
      <nav className="fixed top-0 inset-x-0 z-50 transition-all duration-500"
        style={{ background: scrolled ? "rgba(255,255,255,0.97)" : "transparent", backdropFilter: scrolled ? "blur(16px)" : "none", boxShadow: scrolled ? "0 1px 30px rgba(0,0,0,0.1)" : "none" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <Logo size={42} />
              <div>
                <p className="text-sm font-black leading-tight" style={{ color: scrolled ? "#0d2137" : "white" }}>الجهاز التنفيذي</p>
                <p className="text-xs leading-tight" style={{ color: scrolled ? "#6b7280" : "rgba(255,255,255,0.65)" }}>حفر وصيانة آبار المياه</p>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-8">
              {NAV.map(l => (
                <a key={l.href} href={l.href} className="text-sm font-medium transition-all hover:opacity-60"
                  style={{ color: scrolled ? "#374151" : "rgba(255,255,255,0.92)" }}>{l.label}</a>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login"
                className="hidden lg:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg,#1565C0,#2196F3)", boxShadow: "0 4px 15px rgba(33,150,243,0.35)" }}>
                بوابة الموظفين
              </Link>
              <button className="lg:hidden p-2 rounded-lg transition-colors" style={{ color: scrolled ? "#374151" : "white" }}
                onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
        {menuOpen && (
          <div className="lg:hidden mx-4 mb-3 rounded-2xl overflow-hidden shadow-2xl" style={{ background: "rgba(13,33,55,0.98)", backdropFilter: "blur(20px)" }}>
            <div className="p-5 space-y-1">
              {NAV.map(l => (
                <a key={l.href} href={l.href} className="block py-3 px-4 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all text-sm font-medium" onClick={() => setMenuOpen(false)}>{l.label}</a>
              ))}
              <Link href="/login" className="block mt-3 text-center py-3 rounded-xl text-white font-bold text-sm" style={{ background: "linear-gradient(135deg,#1565C0,#2196F3)" }} onClick={() => setMenuOpen(false)}>بوابة الموظفين</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ═══ HERO ═══ */}
      <section id="home" className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0" style={{ transform: `translateY(${scrollY * 0.35}px)`, willChange: "transform" }}>
          <img src={IMAGES.heroBg} alt="" className="w-full h-full object-cover scale-110" style={{ filter: "brightness(0.35) saturate(0.8)" }} />
        </div>
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(4,16,31,0.85) 0%, rgba(13,33,55,0.7) 50%, rgba(4,16,31,0.9) 100%)" }} />
        <div className="absolute bottom-0 inset-x-0 h-40" style={{ background: "linear-gradient(to top, #ffffff, transparent)" }} />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="particle" style={{ width: `${3+(i%4)*2}px`, height: `${3+(i%4)*2}px`, left: `${5+i*6.2}%`, top: `${10+(i*17)%75}%`, animationDuration: `${5+(i%6)*1.5}s`, animationDelay: `${i*0.3}s` }} />
          ))}
        </div>
        <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold mb-10 animate-fade-in-up"
            style={{ background: "rgba(33,150,243,0.15)", border: "1px solid rgba(33,150,243,0.4)", color: "#93c5fd" }}>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            {c("hero_badge", "الجهاز التنفيذي الوطني — ليبيا")}
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-none animate-fade-in-up" style={{ animationDelay: "0.1s", letterSpacing: "-0.02em" }}>
            {c("hero_title", "نحفر المستقبل")}
            <br />
            <span className="text-4xl md:text-5xl lg:text-6xl font-bold text-white/80">
              {c("hero_subtitle", "لنوصل الماء لكل بيت")}
            </span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            {c("hero_desc", "الجهاز التنفيذي لحفر وصيانة آبار المياه — نضمن وصول المياه النقية لكل مناطق ليبيا بأعلى معايير الجودة والاحترافية")}
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-20 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <a href="#map" className="px-8 py-4 rounded-2xl text-white font-bold text-sm flex items-center gap-2 transition-all hover:scale-105 hover:shadow-2xl"
              style={{ background: "linear-gradient(135deg,#1565C0,#2196F3)", boxShadow: "0 8px 30px rgba(33,150,243,0.5)" }}>
              <MapPin className="w-5 h-5" />{c("hero_btn1", "خريطة الآبار التفاعلية")}
            </a>
            <a href="#projects" className="px-8 py-4 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all hover:bg-white/15"
              style={{ border: "1px solid rgba(255,255,255,0.3)", color: "white" }}>
              <Play className="w-4 h-4" />{c("hero_btn2", "استعرض مشاريعنا")}
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            {[
              { v: "+١٬٥٠٠", l: "تقرير فني" },
              { v: "٢٤", l: "منطقة جغرافية" },
              { v: "+٢٤٧", l: "بئر فعال" },
              { v: "+٣٠٠", l: "مشروع مكتمل" },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl p-5 text-center"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)" }}>
                <p className="text-3xl font-black text-white mb-1">{s.v}</p>
                <p className="text-xs text-blue-300 font-medium">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40 animate-bounce">
          <span className="text-xs">اكتشف المزيد</span><ChevronDown className="w-4 h-4" />
        </div>
      </section>

      {/* ═══ ABOUT ═══ */}
      <section id="about" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative h-[500px]">
              <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl">
                <img src={IMAGES.workers} alt="موظفو الجهاز" className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(13,33,55,0.5),transparent)" }} />
              </div>
              <div className="absolute -bottom-6 -left-6 w-52 h-52 rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                <img src={IMAGES.waterDrop} alt="مياه" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -top-4 -right-4 w-40 h-40 rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                <img src={IMAGES.drilling} alt="حفر" className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-8 right-4 bg-white rounded-2xl px-5 py-4 shadow-xl" style={{ border: "1px solid #e8f0fe" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#1565C0,#2196F3)" }}>
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-black text-gray-800 text-lg">{c("about_years", "+١٥ عام")}</p>
                    <p className="text-xs text-gray-500">{c("about_years_label", "من الخبرة والتميز")}</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: "#dbeafe", color: "#1565C0" }}>
                {c("about_subtitle", "من نحن")}
              </span>
              <h2 className="text-4xl lg:text-5xl font-black mt-5 mb-6 leading-tight" style={{ color: "#0d2137" }}>
                {c("about_title", "رائدون في مجال إدارة موارد المياه")}
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-5">
                {c("about_p1", "الجهاز التنفيذي لحفر وصيانة آبار المياه مؤسسة حكومية ليبية متخصصة، تأسست لضمان توفير المياه النقية لجميع المناطق الليبية.")}
              </p>
              <p className="text-gray-500 leading-relaxed mb-8">
                {c("about_p2", "نعمل بمنهجية علمية واحترافية عالية، ونوظف أحدث التقنيات والمعدات لضمان جودة المياه واستدامتها.")}
              </p>
              <div className="space-y-3 mb-8">
                {[1,2,3,4].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#dbeafe,#bfdbfe)" }}>
                      <CheckCircle className="w-3 h-3 text-blue-600" />
                    </div>
                    <span className="text-gray-700 text-sm">{c(`about_check${i}`, ["معدات حفر حديثة","كوادر فنية مؤهلة","تغطية جغرافية شاملة","معايير سلامة صارمة"][i-1])}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Target, title: "رسالتنا", desc: "توفير المياه النقية لكل مواطن ليبي" },
                  { icon: Award,  title: "رؤيتنا",  desc: "الريادة في إدارة المياه الجوفية بإفريقيا" },
                  { icon: Users,  title: "فريقنا",  desc: "+٥٠٠ متخصص في الهندسة والجيولوجيا" },
                  { icon: Shield, title: "جودتنا",  desc: "التزام بمعايير ISO الدولية" },
                ].map((card, i) => (
                  <div key={i} className="rounded-2xl p-5" style={{ background: "#f8faff", border: "1px solid #e8f0fe" }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: "linear-gradient(135deg,#dbeafe,#bfdbfe)" }}>
                      <card.icon className="w-4 h-4 text-blue-700" />
                    </div>
                    <p className="font-bold text-gray-800 text-sm mb-1">{card.title}</p>
                    <p className="text-gray-500 text-xs leading-relaxed">{card.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS BAND ═══ */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img src={IMAGES.desert} alt="" className="w-full h-full object-cover" style={{ filter: "brightness(0.2) saturate(0.5)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,rgba(4,16,31,0.95),rgba(13,33,55,0.9))" }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-3">إنجازاتنا بالأرقام</h2>
            <p className="text-blue-300">مسيرة حافلة في خدمة المواطن الليبي</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <Counter target={n("reports", 1500)} prefix="+" label="تقرير فني" />
            <Counter target={n("projects", 300)} prefix="+" label="مشروع منجز" />
            <Counter target={n("regions", 24)} label="منطقة جغرافية" />
            <Counter target={n("years", 15)} prefix="+" suffix=" عام" label="سنوات الخبرة" />
          </div>
        </div>
      </section>

      {/* ═══ SERVICES ═══ */}
      <section id="services" className="py-32" style={{ backgroundColor: "#f8faff" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: "#dbeafe", color: "#1565C0" }}>خدماتنا</span>
            <h2 className="text-4xl font-black mt-5 mb-3" style={{ color: "#0d2137" }}>{c("services_title", "منظومة خدمات متكاملة")}</h2>
            <p className="text-gray-500 max-w-xl mx-auto">{c("services_desc", "نقدم حلولاً شاملة لإدارة آبار المياه في ليبيا من الحفر حتى الصيانة والتحليل")}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {services.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="bg-white rounded-3xl p-6 text-center cursor-default group transition-all duration-300"
                  style={{ border: "1px solid #e8f0fe", boxShadow: "0 2px 12px rgba(21,101,192,0.05)" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(21,101,192,0.18)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(21,101,192,0.05)"; }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110"
                    style={{ background: "linear-gradient(135deg,#1565C0,#2196F3)" }}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2 text-sm">{s.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ MAP ═══ */}
      <section id="map" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: "#dbeafe", color: "#1565C0" }}>التوزيع الجغرافي</span>
            <h2 className="text-4xl font-black mt-5 mb-3" style={{ color: "#0d2137" }}>خريطة انتشار الآبار</h2>
            <p className="text-gray-500">توزيع شبكة الآبار عبر مختلف مناطق ليبيا</p>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ border: "1px solid #e8f0fe" }}>
            <div className="relative h-[500px]" style={{ background: "linear-gradient(175deg,#b8d9f0 0%,#a0cce0 25%,#c8e0a8 55%,#d4c880 78%,#c8b060 100%)" }}>
              <div className="absolute top-5 right-5 bg-white/90 backdrop-blur rounded-xl px-4 py-2 text-xs font-semibold text-gray-700 shadow-md">🗺️ ليبيا — شبكة الآبار</div>
              {WELLS.map((w, i) => <WellDot key={i} w={w} />)}
            </div>
            <div className="bg-gray-50 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6 text-sm">
                {[{ c: "#22c55e", l: "بئر فعال" }, { c: "#f97316", l: "تحت الصيانة" }, { c: "#ef4444", l: "متعطل" }].map(x => (
                  <div key={x.l} className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: x.c }} /><span className="text-gray-600">{x.l}</span></div>
                ))}
              </div>
              <Link href="/dashboard/wells/map" className="text-sm font-bold flex items-center gap-1 transition-opacity hover:opacity-70" style={{ color: "#1565C0" }}>
                الخريطة التفاعلية الكاملة <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {WELLS.map((w, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 flex items-center gap-4" style={{ border: "1px solid #e8f0fe" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: w.color + "20" }}>
                  <Droplets className="w-5 h-5" style={{ color: w.color }} />
                </div>
                <div className="flex-1 min-w-0"><p className="font-bold text-gray-800 text-sm">{w.name}</p><p className="text-gray-500 text-xs">{w.count} بئر</p></div>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0"
                  style={{ backgroundColor: w.status === "فعال" ? "#dcfce7" : "#ffedd5", color: w.status === "فعال" ? "#16a34a" : "#ea580c" }}>
                  {w.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PROJECTS ═══ */}
      <section id="projects" className="py-32" style={{ backgroundColor: "#f8faff" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: "#dbeafe", color: "#1565C0" }}>مشاريعنا</span>
            <h2 className="text-4xl font-black mt-5 mb-3" style={{ color: "#0d2137" }}>أبرز المشاريع المنجزة</h2>
            <p className="text-gray-500">إنجازات حقيقية على أرض الواقع في خدمة الشعب الليبي</p>
          </div>
          <div className="grid md:grid-cols-3 gap-7">
            {displayProjects.map((p, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden transition-all duration-400 cursor-pointer"
                style={{ boxShadow: "0 4px 24px rgba(21,101,192,0.07)", border: "1px solid #e8f0fe" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-8px)"; e.currentTarget.style.boxShadow = "0 20px 50px rgba(21,101,192,0.2)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(21,101,192,0.07)"; }}>
                <div className="relative h-52 overflow-hidden">
                  <img src={p.img} alt={p.title} className="w-full h-full object-cover transition-transform duration-500"
                    onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")} />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(13,33,55,0.7),transparent)" }} />
                  <div className="absolute bottom-4 right-4">
                    <span className="px-3 py-1.5 rounded-full text-xs font-bold text-white" style={{ background: "rgba(33,150,243,0.8)", backdropFilter: "blur(8px)" }}>{p.count}</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "#dbeafe", color: "#1565C0" }}>{p.region}</span>
                    <span className="text-xs text-gray-400">{p.date}</span>
                  </div>
                  <h3 className="font-black text-gray-800 mb-2 text-lg leading-snug">{p.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-5">{p.desc}</p>
                  <button className="text-sm font-bold flex items-center gap-1.5 transition-all hover:gap-3" style={{ color: "#1565C0" }}>
                    عرض التفاصيل <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CONTACT ═══ */}
      <section id="contact" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: "#dbeafe", color: "#1565C0" }}>تواصل معنا</span>
            <h2 className="text-4xl font-black mt-5 mb-3" style={{ color: "#0d2137" }}>نحن هنا للمساعدة</h2>
            <p className="text-gray-500">تواصل معنا لأي استفسار أو طلب خدمة</p>
          </div>
          <div className="grid md:grid-cols-2 gap-10">
            <div className="relative rounded-3xl overflow-hidden" style={{ minHeight: "500px", boxShadow: "0 20px 60px rgba(13,33,55,0.3)" }}>
              <img src={IMAGES.water} alt="مياه" className="absolute inset-0 w-full h-full object-cover" style={{ filter: "brightness(0.25) saturate(0.7)" }} />
              <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,rgba(13,33,55,0.92),rgba(21,101,192,0.85))" }} />
              <div className="relative p-8 h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-black text-white mb-2">معلومات التواصل</h3>
                  <p className="text-blue-200 text-sm mb-10">فريقنا جاهز لخدمتك في أي وقت</p>
                  <div className="space-y-6">
                    {[
                      { icon: MapPin, title: "العنوان",          value: c("contact_address", "طرابلس، ليبيا — شارع عمر المختار") },
                      { icon: Phone,  title: "الهاتف",           value: c("contact_phone", "+218 21 333 0000") },
                      { icon: Mail,   title: "البريد الإلكتروني", value: c("contact_email", "info@wellsagency.ly") },
                      { icon: Clock,  title: "ساعات العمل",       value: c("contact_hours", "الأحد – الخميس: ٨:٠٠ – ١٥:٠٠") },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}>
                          <item.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-blue-300 text-xs mb-0.5 font-medium">{item.title}</p>
                          <p className="text-white font-semibold text-sm">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-10 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}>
                  <p className="text-blue-200 text-xs">نرد على جميع الاستفسارات خلال ٢٤ ساعة</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl p-8" style={{ background: "linear-gradient(135deg,#0d2137,#1565C0)", boxShadow: "0 20px 60px rgba(21,101,192,0.25)" }}>
              <h3 className="text-2xl font-black text-white mb-2">أرسل رسالتك</h3>
              <p className="text-blue-200 text-sm mb-8">سنتواصل معك في أقرب وقت</p>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ background: "linear-gradient(135deg,#04101f,#0d1f35)" }}>
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-3 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <Logo size={40} />
                <div>
                  <p className="font-black text-white text-sm">الجهاز التنفيذي</p>
                  <p className="text-gray-500 text-xs">حفر وصيانة آبار المياه</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                {c("footer_desc", "مؤسسة حكومية ليبية متخصصة في توفير المياه النقية لجميع مناطق ليبيا بأعلى معايير الجودة والاحترافية.")}
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-5">روابط سريعة</h4>
              <div className="grid grid-cols-2 gap-2">
                {NAV.map(l => (
                  <a key={l.href} href={l.href} className="text-gray-400 text-sm hover:text-blue-400 transition-colors py-1">{l.label}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold mb-5">تواصل معنا</h4>
              <div className="space-y-3 text-sm text-gray-400">
                <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-400" />{c("contact_address", "طرابلس، ليبيا")}</p>
                <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-blue-400" />{c("contact_phone", "+218 21 333 0000")}</p>
                <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-blue-400" />{c("contact_email", "info@wellsagency.ly")}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-gray-600 text-sm">{c("footer_copyright", "© 2024 الجهاز التنفيذي لحفر وصيانة آبار المياه — جميع الحقوق محفوظة")}</p>
            <Link href="/login" className="text-xs text-gray-600 hover:text-blue-400 transition-colors">بوابة الموظفين</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
