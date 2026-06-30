"use client";
import { useState, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Float, Stars } from "@react-three/drei";
import * as THREE from "three";
import { Eye, EyeOff, Droplets, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";

// ── 3D Animated background objects ──────────────────────────────────────────
function AnimatedOrb({ position, color, speed = 1 }: { position: [number,number,number]; color: string; speed?: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (mesh.current) {
      mesh.current.rotation.x = clock.getElapsedTime() * 0.3 * speed;
      mesh.current.rotation.y = clock.getElapsedTime() * 0.5 * speed;
    }
  });
  return (
    <Float speed={speed * 1.5} rotationIntensity={0.4} floatIntensity={0.8}>
      <Sphere ref={mesh} args={[1, 64, 64]} position={position}>
        <MeshDistortMaterial color={color} distort={0.4} speed={2} roughness={0.1} metalness={0.3} transparent opacity={0.7} />
      </Sphere>
    </Float>
  );
}

function WaterWave() {
  const mesh = useRef<THREE.Mesh>(null);
  const geo = useRef<THREE.PlaneGeometry>(null);
  useFrame(({ clock }) => {
    if (!geo.current) return;
    const t = clock.getElapsedTime();
    const pos = geo.current.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i);
      pos.setZ(i, Math.sin(x * 1.5 + t) * 0.15 + Math.cos(y * 1.5 + t * 0.8) * 0.1);
    }
    pos.needsUpdate = true;
  });
  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -3, -2]}>
      <planeGeometry ref={geo} args={[18, 10, 60, 40]} />
      <meshStandardMaterial color="#1e40af" wireframe transparent opacity={0.15} />
    </mesh>
  );
}

function ParticleField() {
  const count = 120;
  const positions = useRef(
    Float32Array.from({ length: count * 3 }, () => (Math.random() - 0.5) * 20)
  );
  const mesh = useRef<THREE.Points>(null);
  useFrame(({ clock }) => {
    if (mesh.current) mesh.current.rotation.y = clock.getElapsedTime() * 0.03;
  });
  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.current, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#60a5fa" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

function Scene3D() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#3b82f6" />
      <pointLight position={[-5, -3, -5]} intensity={1} color="#8b5cf6" />
      <Stars radius={50} depth={30} count={600} factor={2} saturation={0.5} fade />
      <ParticleField />
      <WaterWave />
      <AnimatedOrb position={[-4, 1.5, -3]}  color="#1d4ed8" speed={0.7} />
      <AnimatedOrb position={[4.5, -1, -4]}  color="#7c3aed" speed={1.1} />
      <AnimatedOrb position={[0.5, 3, -5]}   color="#0891b2" speed={0.5} />
      <AnimatedOrb position={[-2.5, -2, -3]} color="#1e40af" speed={0.9} />
    </>
  );
}

// ── Login form ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "فشل تسجيل الدخول");
      else { router.push("/dashboard"); router.refresh(); }
    } catch { setError("حدث خطأ في الاتصال"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#020817]" dir="rtl">
      {/* 3D background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 55 }}>
          <Suspense fallback={null}>
            <Scene3D />
          </Suspense>
        </Canvas>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-10"
        style={{ background: "radial-gradient(ellipse at center, rgba(2,8,23,0.3) 0%, rgba(2,8,23,0.7) 100%)" }} />

      {/* Content */}
      <div className="relative z-20 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4 shadow-2xl shadow-blue-900/50"
              style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}>
              <Droplets className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white leading-tight">الجهاز التنفيذي</h1>
            <p className="text-blue-300 text-sm mt-1">لحفر وصيانة آبار المياه — ليبيا</p>
          </div>

          {/* Card */}
          <div className="rounded-3xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden"
            style={{ background: "rgba(15,23,42,0.85)", backdropFilter: "blur(24px)" }}>

            {/* Card header */}
            <div className="px-8 pt-8 pb-5 border-b border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-blue-400" />
                <h2 className="text-white font-bold">تسجيل الدخول الآمن</h2>
              </div>
              <p className="text-white/40 text-xs">أدخل بيانات حسابك للوصول إلى النظام</p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="px-8 py-6 space-y-5">
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@water.gov.ly"
                  required
                  className="w-full px-4 py-3.5 rounded-xl text-sm text-white placeholder:text-white/20 outline-none transition-all border"
                  style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}
                  onFocus={e => e.target.style.borderColor = "#3b82f6"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider">كلمة المرور</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3.5 rounded-xl text-sm text-white placeholder:text-white/20 outline-none transition-all border pl-12"
                    style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}
                    onFocus={e => e.target.style.borderColor = "#3b82f6"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-xl text-white font-black text-sm transition-all disabled:opacity-50 relative overflow-hidden group"
                style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}>
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "linear-gradient(135deg,#1e40af,#2563eb)" }} />
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      جارٍ التحقق...
                    </>
                  ) : "دخول إلى النظام →"}
                </span>
              </button>
            </form>

            {/* Demo credentials */}
            <div className="px-8 pb-8">
              <div className="rounded-xl p-3 text-center" style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
                <p className="text-blue-400/60 text-[11px] font-semibold uppercase tracking-wider mb-1.5">بيانات تجريبية</p>
                <button onClick={() => { setEmail("admin@water.gov.ly"); setPassword("admin123"); }}
                  className="text-blue-300 text-xs hover:text-blue-200 transition-colors font-mono">
                  admin@water.gov.ly / admin123
                </button>
              </div>
            </div>
          </div>

          {/* Back link */}
          <div className="text-center mt-6">
            <Link href="/" className="inline-flex items-center gap-1.5 text-white/30 hover:text-white/60 text-sm transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              العودة للصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
