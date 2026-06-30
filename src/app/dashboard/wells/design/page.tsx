"use client";
import { useRef, useState, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Cylinder, Box, Sphere, MeshTransmissionMaterial, Environment, Float } from "@react-three/drei";
import * as THREE from "three";
import { Download, RotateCw, Layers, DollarSign, Settings2, Info } from "lucide-react";

// ─── Geological layers ───────────────────────────────────────────────────────
const GEO_LAYERS = [
  { name: "تربة سطحية",       color: "#c8a97a", thickness: 0.4, depth: "0–5 م" },
  { name: "طمي ورمل ناعم",    color: "#b8845a", thickness: 1.0, depth: "5–30 م" },
  { name: "رمل خشن وحصى",     color: "#9e6b3f", thickness: 2.0, depth: "30–80 م" },
  { name: "حجر رملي",          color: "#7a5230", thickness: 2.8, depth: "80–150 م" },
  { name: "طبقة حاملة للمياه", color: "#1e6fcf", thickness: 2.0, depth: "150–200 م" },
];

const CASING_COLORS: Record<string, string> = {
  PVC:   "#e0f2fe",
  HDPE:  "#fef3c7",
  فولاذ: "#d1d5db",
};

// ─── 3D Scene components ──────────────────────────────────────────────────────

function GeologicalLayers() {
  let y = 0;
  return (
    <group>
      {GEO_LAYERS.map((layer, i) => {
        const posY = -(y + layer.thickness / 2);
        y += layer.thickness;
        return (
          <group key={i}>
            {/* Main block */}
            <Box args={[5, layer.thickness, 5]} position={[0, posY, 0]}>
              <meshStandardMaterial color={layer.color} roughness={0.9} metalness={0.0} />
            </Box>
            {/* Dashed texture overlay */}
            <Box args={[5.01, 0.02, 5.01]} position={[0, posY - layer.thickness / 2 + 0.01, 0]}>
              <meshStandardMaterial color={new THREE.Color(layer.color).multiplyScalar(0.7)} />
            </Box>
          </group>
        );
      })}
    </group>
  );
}

function WellCasing({ depth, casingType }: { depth: number; casingType: string }) {
  const color = CASING_COLORS[casingType] || "#e0f2fe";
  const scaleY = depth / 200;
  const h = 8.2 * scaleY;
  return (
    <group>
      {/* Outer casing */}
      <Cylinder args={[0.28, 0.28, h, 32, 1, true]} position={[0, -h / 2, 0]}>
        <meshStandardMaterial color={color} side={THREE.DoubleSide} roughness={0.3} metalness={0.6} transparent opacity={0.85} />
      </Cylinder>
      {/* Inner pipe */}
      <Cylinder args={[0.18, 0.18, h * 0.65, 24, 1, true]} position={[0, -h * 0.65 / 2, 0]}>
        <meshStandardMaterial color="#94a3b8" side={THREE.DoubleSide} roughness={0.2} metalness={0.8} transparent opacity={0.6} />
      </Cylinder>
      {/* Cap */}
      <Cylinder args={[0.32, 0.28, 0.12, 32]} position={[0, 0.06, 0]}>
        <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.7} />
      </Cylinder>
    </group>
  );
}

function WaterParticles() {
  const count = 40;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const positions = useMemo(() =>
    Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 0.3,
      y: -7.5 - Math.random() * 1.5,
      z: (Math.random() - 0.5) * 0.3,
      speed: 0.01 + Math.random() * 0.02,
      offset: Math.random() * Math.PI * 2,
    })), []);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.getElapsedTime();
    positions.forEach((p, i) => {
      dummy.position.set(p.x, p.y + Math.sin(t * p.speed * 60 + p.offset) * 0.2, p.z);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.03, 8, 8]} />
      <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={0.4} transparent opacity={0.7} />
    </instancedMesh>
  );
}

function Pump() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.8;
  });
  return (
    <group position={[0, 0.35, 0]}>
      {/* Motor body */}
      <Cylinder args={[0.22, 0.22, 0.45, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.9} />
      </Cylinder>
      {/* Spinning fan */}
      <group ref={ref} position={[0, 0.28, 0]}>
        {[0, 120, 240].map((deg, i) => (
          <Box key={i} args={[0.04, 0.04, 0.28]}
            rotation={[0, (deg * Math.PI) / 180, 0]}
            position={[Math.cos((deg * Math.PI) / 180) * 0.12, 0, Math.sin((deg * Math.PI) / 180) * 0.12]}>
            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
          </Box>
        ))}
      </group>
      {/* Pipe connector */}
      <Cylinder args={[0.06, 0.06, 0.3, 16]} position={[0, -0.37, 0]}>
        <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.3} />
      </Cylinder>
    </group>
  );
}

function DepthMarkers() {
  const labels = ["0 م", "50 م", "100 م", "150 م", "200 م"];
  return (
    <group position={[-3.2, 0, 0]}>
      {labels.map((label, i) => (
        <group key={i} position={[0, -(i * 2.05), 0]}>
          <Text fontSize={0.22} color="#94a3b8" anchorX="right" anchorY="middle" font="/fonts/NotoSansArabic.ttf">
            {label}
          </Text>
          <Box args={[0.4, 0.015, 0.015]} position={[0.25, 0, 0]}>
            <meshStandardMaterial color="#334155" />
          </Box>
        </group>
      ))}
    </group>
  );
}

function LayerLabels() {
  let y = 0;
  return (
    <group position={[3.2, 0, 0]}>
      {GEO_LAYERS.map((layer, i) => {
        const posY = -(y + layer.thickness / 2);
        y += layer.thickness;
        return (
          <Text key={i} fontSize={0.18} color={layer.color} anchorX="left" anchorY="middle" position={[0.1, posY, 0]}
            font="/fonts/NotoSansArabic.ttf" maxWidth={2.5}>
            {layer.name}
          </Text>
        );
      })}
    </group>
  );
}

function Scene({ depth, casingType }: { depth: number; casingType: string }) {
  return (
    <>
      <Environment preset="city" />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
      <pointLight position={[0, -7, 0]} color="#3b82f6" intensity={2} distance={4} />

      <GeologicalLayers />
      <WellCasing depth={depth} casingType={casingType} />
      <WaterParticles />
      <Pump />
      <DepthMarkers />
      <LayerLabels />

      {/* Ground surface ring */}
      <Cylinder args={[2.8, 2.8, 0.06, 64]} position={[0, 0.03, 0]}>
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </Cylinder>

      <OrbitControls
        enablePan={false}
        minDistance={4}
        maxDistance={18}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 1.8}
        autoRotate
        autoRotateSpeed={0.4}
      />
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function WellDesignPage() {
  const [depth, setDepth] = useState(200);
  const [casingType, setCasingType] = useState("PVC");
  const [soilType, setSoilType] = useState("رملية");
  const [tab, setTab] = useState<"3d" | "section">("3d");

  const drillingCost = Math.round(depth * 150);
  const casingCost   = Math.round(depth * (casingType === "فولاذ" ? 95 : 67.5));
  const pumpCost     = 4200;
  const installCost  = Math.round((drillingCost + casingCost) * 0.15);
  const total        = drillingCost + casingCost + pumpCost + installCost;

  return (
    <div className="p-5 lg:p-7 space-y-5" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-800">تصميم البئر ثلاثي الأبعاد</h1>
          <p className="text-gray-400 text-sm mt-0.5">تصور تفاعلي 3D للبئر مع حساب التكاليف</p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-white">
            <button onClick={() => setTab("3d")}
              className={`px-4 py-2 text-sm font-bold transition-all ${tab === "3d" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}>
              🎮 3D
            </button>
            <button onClick={() => setTab("section")}
              className={`px-4 py-2 text-sm font-bold transition-all ${tab === "section" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}>
              📐 مقطع
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 bg-white">
            <Download className="w-4 h-4" /> تصدير
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 3D / Section viewer */}
        <div className="lg:col-span-2 bg-gray-900 rounded-3xl overflow-hidden shadow-2xl" style={{ minHeight: 520 }}>
          {tab === "3d" ? (
            <div className="relative w-full h-full" style={{ minHeight: 520 }}>
              <Canvas
                shadows
                camera={{ position: [6, 2, 8], fov: 45 }}
                style={{ background: "linear-gradient(180deg,#0f172a 0%,#1e293b 100%)" }}
              >
                <Suspense fallback={null}>
                  <Scene depth={depth} casingType={casingType} />
                </Suspense>
              </Canvas>
              {/* Overlay hints */}
              <div className="absolute bottom-4 left-4 text-white/50 text-xs flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-full">
                <RotateCw className="w-3 h-3" /> اسحب للتدوير • انقر للتكبير
              </div>
              <div className="absolute top-4 right-4 bg-black/40 px-3 py-1.5 rounded-full">
                <span className="text-blue-400 text-xs font-bold">⬡ Three.js 3D</span>
              </div>
            </div>
          ) : (
            /* 2D cross-section fallback */
            <div className="p-6 text-white" style={{ minHeight: 520 }}>
              <p className="text-sm text-white/60 mb-4 font-semibold">المقطع الجيولوجي العرضي</p>
              <div className="flex gap-4">
                <div className="text-xs text-white/40 space-y-0 text-left">
                  {GEO_LAYERS.map((l, i) => (
                    <div key={i} style={{ height: `${l.thickness * 36}px` }} className="flex items-center">
                      {l.depth}
                    </div>
                  ))}
                </div>
                <div className="flex-1 relative rounded-xl overflow-hidden border border-white/10">
                  {GEO_LAYERS.map((l, i) => (
                    <div key={i} style={{ backgroundColor: l.color, height: `${l.thickness * 36}px`, opacity: 0.88 }}
                      className="flex items-center px-4 text-white text-xs font-semibold">
                      {l.name}
                    </div>
                  ))}
                  {/* Casing line */}
                  <div className="absolute inset-x-1/2 top-0 w-6 -translate-x-1/2"
                    style={{ height: `${(depth / 200) * 100}%`, backgroundColor: CASING_COLORS[casingType], opacity: 0.7 }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls + Budget */}
        <div className="space-y-4">
          {/* Specs */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Settings2 className="w-4 h-4 text-blue-500" />
              <h2 className="font-black text-gray-800 text-sm">المواصفات الفنية</h2>
            </div>
            <div className="space-y-4">
              {/* Depth slider */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-500 font-semibold">عمق الحفر</span>
                  <span className="font-black text-blue-600">{depth} م</span>
                </div>
                <input type="range" min={50} max={500} value={depth}
                  onChange={e => setDepth(Number(e.target.value))}
                  className="w-full accent-blue-600 h-1.5" />
                <div className="flex justify-between text-[10px] text-gray-300 mt-1">
                  <span>50 م</span><span>500 م</span>
                </div>
              </div>

              {/* Casing type */}
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-2">نوع التغليف</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {Object.keys(CASING_COLORS).map(type => (
                    <button key={type} onClick={() => setCasingType(type)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        casingType === type
                          ? "text-white border-transparent shadow-lg shadow-blue-900/20"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-200"
                      }`}
                      style={casingType === type ? { background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" } : {}}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Soil type */}
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-2">نوع التربة</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {["رملية","طينية","صخرية"].map(s => (
                    <button key={s} onClick={() => setSoilType(s)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        soilType === s ? "bg-amber-500 text-white border-transparent" : "bg-gray-50 text-gray-600 border-gray-200"
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Layer legend */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-blue-500" />
              <h2 className="font-black text-gray-800 text-sm">الطبقات الجيولوجية</h2>
            </div>
            <div className="space-y-1.5">
              {GEO_LAYERS.map((l, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: l.color }} />
                    <span className="text-xs text-gray-600">{l.name}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">{l.depth}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-4 h-4 text-blue-500" />
              <h2 className="font-black text-gray-800 text-sm">الميزانية التقديرية</h2>
            </div>
            <div className="space-y-2">
              {[
                { label: "تكلفة الحفر",           value: drillingCost, pct: drillingCost / total },
                { label: "التغليف والأنابيب",       value: casingCost,   pct: casingCost / total },
                { label: "المضخة",                 value: pumpCost,     pct: pumpCost / total },
                { label: "التركيب والتجهيز",        value: installCost,  pct: installCost / total },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">{item.label}</span>
                    <span className="font-semibold text-gray-700">{item.value.toLocaleString("ar-LY")} د.ل</span>
                  </div>
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
                      style={{ width: `${item.pct * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-2xl px-4 py-3 text-white"
              style={{ background: "linear-gradient(135deg,#1d4ed8,#3b82f6)" }}>
              <span className="font-bold text-sm">الإجمالي</span>
              <span className="text-lg font-black">{total.toLocaleString("ar-LY")} <span className="text-xs font-normal opacity-80">د.ل</span></span>
            </div>
            <p className="text-[10px] text-gray-300 mt-2 flex items-start gap-1">
              <Info className="w-3 h-3 shrink-0 mt-0.5" />
              التكاليف تقديرية وتختلف حسب ظروف الموقع
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
