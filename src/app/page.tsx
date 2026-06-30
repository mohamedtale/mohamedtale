"use client";
import { useRef, Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Float, Stars, Torus } from "@react-three/drei";
import * as THREE from "three";
import {
  Droplets, MapPin, Activity, Drill, Wrench, FlaskConical,
  Settings, Globe, Truck, FileSearch, Building2, CheckCircle2,
  Users, ArrowLeft, Phone, Mail, ChevronDown, TrendingUp, Shield, Award,
} from "lucide-react";

// ── 3D Hero Scene ────────────────────────────────────────────────────────────
function HeroOrb({ pos, color, speed, distort }: any) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (mesh.current) {
      mesh.current.rotation.x = clock.getElapsedTime() * 0.2 * speed;
      mesh.current.rotation.z = clock.getElapsedTime() * 0.15 * speed;
    }
  });
  return (
    <Float speed={speed} rotationIntensity={0.3} floatIntensity={1}>
      <Sphere ref={mesh} args={[1, 64, 64]} position={pos}>
        <MeshDistortMaterial color={color} distort={distort} speed={1.5} roughness={0.05} metalness={0.2} transparent opacity={0.65} />
      </Sphere>
    </Float>
  );
}

function Ring({ pos, color }: any) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (mesh.current) {
      mesh.current.rotation.x = clock.getElapsedTime() * 0.3;
      mesh.current.rotation.y = clock.getElapsedTime() * 0.2;
    }
  });
  return (
    <Float speed={0.8} floatIntensity={0.5}>
      <Torus ref={mesh} args={[1.4, 0.06, 16, 60]} position={pos}>
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} transparent opacity={0.4} />
      </Torus>
    </Float>
  );
}

function WaterSurface() {
  const geo = useRef<THREE.PlaneGeometry>(null);
  useFrame(({ clock }) => {
    if (!geo.current) return;
    const t = clock.getElapsedTime();
    const pos = geo.current.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i);
      pos.setZ(i, Math.sin(x * 1.2 + t * 0.8) * 0.2 + Math.cos(y * 1.0 + t * 0.6) * 0.15);
    }
    pos.needsUpdate = true;
  });
  return (
    <mesh rotation={[-Math.PI / 2.2, 0, 0]} position={[0, -4.5, -3]}>
      <planeGeometry ref={geo} args={[22, 12, 80, 50]} />
      <meshStandardMaterial color="#1e3a8a" wireframe transparent opacity={0.12} />
    </mesh>
  );
}

function Particles3D() {
  const count = 200;
  const pts = useRef(Float32Array.from({ length: count * 3 }, () => (Math.random() - 0.5) * 25));
  const mesh = useRef<THREE.Points>(null);
  useFrame(({ clock }) => { if (mesh.current) mesh.current.rotation.y = clock.getElapsedTime() * 0.02; });
  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pts.current, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#93c5fd" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

function HeroScene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 8, 5]} intensity={2} color="#3b82f6" />
      <pointLight position={[-6, -2, -4]} intensity={1.5} color="#7c3aed" />
      <pointLight position={[0, -2, 6]} intensity={1} color="#0ea5e9" />
      <Stars radius={60} depth={40} count={800} factor={2.5} saturation={0.6} fade />
      <Particles3D />
      <WaterSurface />
      <HeroOrb pos={[-5, 1, -4]}  color="#1d4ed8" speed={0.8}  distort={0.45} />
      <HeroOrb pos={[5.5, 0, -5]} color="#7c3aed" speed={1.2}  distort={0.3} />
      <HeroOrb pos={[0, 3.5, -6]} color="#0891b2" speed={0.6}  distort={0.5} />
      <HeroOrb pos={[-2, -3, -5]} color="#1e40af" speed={0.9}  distort={0.35} />
      <HeroOrb pos={[3, 2.5, -3]} color="#6d28d9" speed={0.7}  distort={0.4} />
      <Ring pos={[-4.5, 0, -3]}  color="#60a5fa" />
      <Ring pos={[4, 1.5, -4]}   color="#a78bfa" />
    </>
  );
}

// ── Counter animation ─────────────────────────────────────────────────────────
function CountUp({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = end / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setVal(end); clearInterval(timer); }
      else setVal(Math.floor(start));
    }, 20);
    return () => clearInterval(timer);
  }, [end]);
  return <>{val}{suffix}</>;
}

// ── Data ──────────────────────────────────────────────────────────────────────
const SERVICES = [
  { icon: Drill,       title: "حفر الآبار",          desc: "حفر آبار المياه الإنتاجية والاستكشافية والاختبارية وآبار المراقبة" },
  { icon: Wrench,      title: "صيانة الآبار",         desc: "صيانة وقتل وتصوير الآبار الارتوازية بمختلف أنحاء ليبيا" },
  { icon: Truck,       title: "الآليات والمعدات",      desc: "توفير وتوريد وتأجير الآليات والمعدات الخاصة بحفر الآبار" },
  { icon: Globe,       title: "الدراسات الجيولوجية",   desc: "إعداد الدراسات الجيولوجية مع الهيئة العامة للموارد المائية" },
  { icon: FlaskConical,title: "التحاليل المخبرية",     desc: "تحليل جودة المياه وإصدار التقارير الفنية المتخصصة" },
  { icon: FileSearch,  title: "الاستكشاف المائي",     desc: "دراسة وتحديد مواقع حفر الآبار الجديدة في مختلف مناطق ليبيا" },
  { icon: Settings,    title: "تركيب المضخات",         desc: "تركيب وصيانة مضخات المياه وتوفير مستلزماتها" },
  { icon: Building2,   title: "إدارة المشاريع",        desc: "تنفيذ مشاريع الحفر والصيانة وفق أعلى معايير الجودة" },
];

const PROJECTS = [
  { title: "عقد حفر 60,000 متر طولي", partner: "الهيئة العامة للمياه", desc: "حفر 60 ألف متر طولي في مختلف أنحاء ليبيا ضمن عقد شامل", region: "ليبيا", icon: Drill, value: "450M د.ل" },
  { title: "مشروع قرارة القطف - بني وليد", partner: "جهاز استثمار مياه النهر", desc: "حفر 14 بئراً بعمق 1200 متر للبئر الواحد بمشروع جبل الحساونة جفارة", region: "بني وليد", icon: Activity, value: "180M د.ل" },
  { title: "صيانة 88 بئراً ارتوازياً", partner: "الهيئة العامة للمياه", desc: "صيانة وقتل وتصوير 88 بئراً ارتوازياً بالمنطقة الوسطى", region: "المنطقة الوسطى", icon: Wrench, value: "95M د.ل" },
  { title: "حفر آبار طرابلس والجبل الغربي", partner: "تكليفات حكومية", desc: "تنفيذ تكليفات حفر عدة آبار في طرابلس وباطن الجبل الغربي", region: "طرابلس", icon: MapPin, value: "70M د.ل" },
];

const STATS = [
  { value: 150, suffix: "+", label: "موظف متخصص", icon: Users },
  { value: 1971, suffix: "", label: "سنة التأسيس", icon: Award },
  { value: 3, suffix: "", label: "فروع تشغيلية", icon: MapPin },
  { value: 200, suffix: "+", label: "مشروع منجز", icon: TrendingUp },
];

const BRANCHES = [
  { name: "المقر الرئيسي", city: "طرابلس", desc: "الإدارة العامة والمقر الرئيسي للجهاز التنفيذي" },
  { name: "المنطقة الشرقية", city: "بنغازي", desc: "فرع المنطقة الشرقية — يغطي شرق ليبيا" },
  { name: "المنطقة الجنوبية", city: "الكفرة", desc: "فرع المنطقة الجنوبية — يغطي الجنوب الليبي" },
];

// ── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className="min-h-screen bg-[#020817]" dir="rtl">

      {/* ── Navbar ── */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-[#020817]/95 backdrop-blur border-b border-white/5 shadow-lg" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}>
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-none">الجهاز التنفيذي</p>
              <p className="text-[10px] text-blue-400">حفر وصيانة آبار المياه</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-white/60">
            {[["#about","عن الجهاز"],["#services","الخدمات"],["#projects","المشاريع"],["#branches","الفروع"],["#contact","تواصل"]].map(([href,label]) => (
              <a key={href} href={href} className="hover:text-white transition-colors">{label}</a>
            ))}
          </div>
          <Link href="/dashboard"
            className="px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:shadow-lg hover:shadow-blue-900/40"
            style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}>
            بوابة الموظفين ←
          </Link>
        </div>
      </nav>

      {/* ── Hero 3D ── */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        {/* 3D canvas */}
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
            <Suspense fallback={null}>
              <HeroScene />
            </Suspense>
          </Canvas>
        </div>
        {/* gradient overlay */}
        <div className="absolute inset-0 z-10" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(2,8,23,0.1) 0%, rgba(2,8,23,0.75) 100%)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-40 z-10" style={{ background: "linear-gradient(to top, #020817, transparent)" }} />

        {/* Hero content */}
        <div className="relative z-20 max-w-5xl mx-auto px-6 text-center pt-24 pb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs mb-8 border border-white/10 text-white/60 bg-white/5 backdrop-blur">
            <Activity className="w-3 h-3 text-blue-400" />
            <span>تأسس عام 1971م · الجمهورية الليبية</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight">
            الجهاز التنفيذي
            <br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg,#60a5fa,#a78bfa,#38bdf8)" }}>
              لحفر وصيانة آبار المياه
            </span>
          </h1>

          <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            من أكبر الجهات العاملة في مجال حفر وصيانة آبار المياه الجوفية داخل ليبيا،
            نعمل على توفير المياه لجميع المناطق باستخدام أحدث التقنيات
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-20">
            <a href="#projects"
              className="px-7 py-3.5 rounded-xl text-white font-bold flex items-center gap-2 transition-all hover:shadow-xl hover:shadow-blue-900/30"
              style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}>
              <ArrowLeft className="w-4 h-4" /> استعرض المشاريع
            </a>
            <Link href="/dashboard"
              className="px-7 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all hover:bg-white/20"
              style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "white" }}>
              <Shield className="w-4 h-4" /> بوابة الموظفين
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s, i) => (
              <div key={i} className="rounded-2xl p-5 text-center backdrop-blur-sm"
                style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <s.icon className="w-5 h-5 mx-auto mb-2 text-blue-400" />
                <p className="text-3xl font-black text-white mb-1">
                  <CountUp end={s.value} suffix={s.suffix} />
                </p>
                <p className="text-white/40 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-20 flex justify-center pb-8">
          <a href="#about" className="animate-bounce text-white/30 hover:text-white/60 transition-colors">
            <ChevronDown className="w-6 h-6" />
          </a>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="py-24 bg-[#0a0f1e]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs mb-5 font-semibold"
                style={{ backgroundColor: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)" }}>
                <Building2 className="w-3 h-3" /> تأسس عام 1971م
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-5 leading-tight">
                عن الجهاز التنفيذي
              </h2>
              <p className="text-white/50 leading-relaxed mb-4">
                يُعدّ الجهاز التنفيذي لحفر وصيانة آبار المياه من أكبر الجهات العاملة في مجال حفر وصيانة
                آبار المياه داخل ليبيا. تأسس عام 1971م ويضم أكثر من 150 موظفاً متخصصاً.
              </p>
              <p className="text-white/40 leading-relaxed mb-8">
                يمتلك الجهاز فروعاً في المنطقة الشرقية ببنغازي والمنطقة الجنوبية بالكفرة، ويعمل على
                تنفيذ مشاريع الحفر والصيانة في مختلف أنحاء ليبيا بالتنسيق مع الهيئة العامة للموارد المائية.
              </p>
              <div className="space-y-3">
                {[
                  "حفر الآبار الإنتاجية والاستكشافية والاختبارية وآبار المراقبة",
                  "صيانة وقتل وتصوير الآبار الارتوازية",
                  "توفير وتوريد الآليات والمعدات الخاصة بالحفر",
                  "إعداد الدراسات الجيولوجية مع الهيئة العامة للموارد المائية",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-white/60">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-400" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "موظف متخصص", value: "+150", gradient: "from-blue-600 to-blue-500" },
                { label: "سنة خبرة", value: "+50", gradient: "from-violet-600 to-purple-500" },
                { label: "فروع تشغيلية", value: "3", gradient: "from-cyan-600 to-sky-500" },
                { label: "مشروع منجز", value: "+200", gradient: "from-indigo-600 to-blue-500" },
              ].map((s, i) => (
                <div key={i} className={`rounded-2xl p-8 text-center bg-gradient-to-br ${s.gradient}`}>
                  <p className="text-4xl font-black text-white mb-2">{s.value}</p>
                  <p className="text-white/70 text-sm">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section id="services" className="py-24 bg-[#020817]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs mb-5 font-semibold"
              style={{ backgroundColor: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)" }}>
              خدماتنا
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">ما نقدمه من خدمات</h2>
            <p className="text-white/40">خدمات متكاملة لحفر وصيانة آبار المياه في ليبيا</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {SERVICES.map((s, i) => (
              <div key={i}
                className="rounded-2xl p-6 text-center transition-all hover:scale-105 cursor-default group"
                style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 transition-all group-hover:shadow-lg"
                  style={{ background: "linear-gradient(135deg,rgba(29,78,216,0.3),rgba(59,130,246,0.2))", border: "1px solid rgba(59,130,246,0.2)" }}>
                  <s.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-bold text-white mb-2 text-sm">{s.title}</h3>
                <p className="text-white/35 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Projects ── */}
      <section id="projects" className="py-24 bg-[#0a0f1e]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs mb-5 font-semibold"
              style={{ backgroundColor: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)" }}>
              المشاريع
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">أبرز المشاريع والعقود</h2>
            <p className="text-white/40">مشاريع حفر وصيانة آبار المياه في مختلف مناطق ليبيا</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {PROJECTS.map((p, i) => (
              <div key={i}
                className="rounded-2xl p-6 transition-all hover:scale-[1.02] group"
                style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}>
                    <p.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ backgroundColor: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)" }}>
                        {p.region}
                      </span>
                      <span className="text-xs text-white/30">{p.partner}</span>
                    </div>
                    <h3 className="font-bold text-white mb-1">{p.title}</h3>
                    <p className="text-white/40 text-sm leading-relaxed mb-3">{p.desc}</p>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-white/25">القيمة التقديرية:</span>
                      <span className="text-xs font-bold text-blue-400">{p.value}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Branches ── */}
      <section id="branches" className="py-24 bg-[#020817]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs mb-5 font-semibold"
              style={{ backgroundColor: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)" }}>
              الفروع
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">فروع الجهاز</h2>
            <p className="text-white/40">نغطي مختلف مناطق ليبيا من خلال فروعنا الثلاثة</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {BRANCHES.map((b, i) => (
              <div key={i} className="rounded-2xl p-8 text-center transition-all hover:scale-105"
                style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(59,130,246,0.15)" }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{ background: "linear-gradient(135deg,rgba(29,78,216,0.3),rgba(59,130,246,0.2))", border: "1px solid rgba(59,130,246,0.2)" }}>
                  <MapPin className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="font-black text-white text-lg mb-1">{b.name}</h3>
                <p className="font-bold text-blue-400 mb-2">{b.city}</p>
                <p className="text-white/40 text-sm">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="py-24 bg-[#0a0f1e]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">تواصل معنا</h2>
          <p className="text-white/40 mb-12">للاستفسار عن خدماتنا أو المشاريع تواصل مع الجهاز التنفيذي</p>
          <div className="grid md:grid-cols-3 gap-5 mb-12">
            {[
              { icon: Phone,  label: "الهاتف", value: "+218 21 XXX XXXX" },
              { icon: Mail,   label: "البريد الإلكتروني", value: "info@water.gov.ly" },
              { icon: MapPin, label: "العنوان", value: "طرابلس، ليبيا" },
            ].map((c, i) => (
              <div key={i} className="rounded-2xl p-6"
                style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <c.icon className="w-8 h-8 mx-auto mb-3 text-blue-400" />
                <p className="text-white font-bold mb-1">{c.label}</p>
                <p className="text-white/40 text-sm">{c.value}</p>
              </div>
            ))}
          </div>
          <Link href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-black text-sm shadow-2xl shadow-blue-900/30"
            style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}>
            <Shield className="w-4 h-4" /> دخول بوابة الموظفين
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 border-t border-white/5 bg-[#020817]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}>
              <Droplets className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white text-sm font-bold">الجهاز التنفيذي لحفر وصيانة آبار المياه</p>
              <p className="text-white/30 text-xs">تأسس عام 1971م · ليبيا</p>
            </div>
          </div>
          <p className="text-white/20 text-xs">جميع الحقوق محفوظة © 2024</p>
        </div>
      </footer>
    </div>
  );
}
