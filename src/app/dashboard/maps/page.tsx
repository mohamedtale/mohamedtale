"use client";
import { useState, useEffect } from "react";
import { Droplets, RefreshCw, TrendingUp, AlertTriangle, CheckCircle, Activity, ThumbsUp, FlaskConical } from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell,
} from "recharts";

// ── Static water quality data ───────────────────────────────────────────────
const MONTHS = ["يناير","فبراير","مارس","أبريل","مايو","يونيو"];

const TDS_DATA = [
  { m: "يناير", w1: 380, w2: 510, w3: 620, w4: 290, w5: 880 },
  { m: "فبراير", w1: 365, w2: 490, w3: 640, w4: 310, w5: 840 },
  { m: "مارس",  w1: 390, w2: 530, w3: 600, w4: 280, w5: 910 },
  { m: "أبريل", w1: 350, w2: 500, w3: 580, w4: 300, w5: 870 },
  { m: "مايو",  w1: 370, w2: 520, w3: 610, w4: 295, w5: 850 },
  { m: "يونيو", w1: 360, w2: 505, w3: 595, w4: 285, w5: 895 },
];

const RADAR_DATA = [
  { param: "TDS", A: 72, B: 48, fullMark: 100 },
  { param: "pH", A: 88, B: 65, fullMark: 100 },
  { param: "EC", A: 65, B: 55, fullMark: 100 },
  { param: "صلابة", A: 58, B: 70, fullMark: 100 },
  { param: "ملوحة", A: 80, B: 40, fullMark: 100 },
  { param: "نترات", A: 90, B: 75, fullMark: 100 },
];

const WELL_QUALITY = [
  { name: "بئر الزاوية",  tds: 380, ph: 7.2, ec: 620,  salinity: 0.24, quality: "ممتاز",  score: 91 },
  { name: "بئر مصراتة",  tds: 510, ph: 7.5, ec: 820,  salinity: 0.38, quality: "جيد",     score: 74 },
  { name: "بئر الزيان",  tds: 620, ph: 7.8, ec: 1010, salinity: 0.49, quality: "مقبول",   score: 62 },
  { name: "بئر سبها",    tds: 290, ph: 7.1, ec: 470,  salinity: 0.18, quality: "ممتاز",  score: 95 },
  { name: "بئر الكفرة",  tds: 880, ph: 8.1, ec: 1420, salinity: 0.71, quality: "رديء",    score: 38 },
];

const SCORE_BAR = [
  { name: "بئر الزاوية",  score: 91, color: "#22c55e" },
  { name: "بئر مصراتة",  score: 74, color: "#3b82f6" },
  { name: "بئر الزيان",  score: 62, color: "#f59e0b" },
  { name: "بئر سبها",    score: 95, color: "#22c55e" },
  { name: "بئر الكفرة",  score: 38, color: "#ef4444" },
];

const QUALITY_CONFIG: Record<string, { bg: string; color: string; icon: any }> = {
  "ممتاز": { bg: "#dcfce7", color: "#16a34a", icon: ThumbsUp },
  "جيد":   { bg: "#dbeafe", color: "#1d4ed8", icon: CheckCircle },
  "مقبول": { bg: "#fef3c7", color: "#d97706", icon: Activity },
  "رديء":  { bg: "#fee2e2", color: "#dc2626", icon: AlertTriangle },
};

const WHO_LIMITS: Record<string, { limit: number; unit: string; label: string }> = {
  tds:     { limit: 600,  unit: "mg/L", label: "المواد الذائبة (TDS)" },
  ph:      { limit: 8.5,  unit: "",     label: "حموضة (pH)" },
  ec:      { limit: 1000, unit: "μS/cm",label: "الموصلية (EC)" },
  salinity:{ limit: 0.5,  unit: "g/L",  label: "الملوحة" },
};

export default function WaterQualityPage() {
  const [wells, setWells] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWell, setSelectedWell] = useState(0);
  const [activeParam, setActiveParam] = useState<"tds" | "ph" | "ec" | "salinity">("tds");

  useEffect(() => {
    fetch("/api/wells").then(r => r.json())
      .then(d => setWells(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  const sel = WELL_QUALITY[selectedWell];
  const paramVal = sel[activeParam as keyof typeof sel] as number;
  const paramCfg = WHO_LIMITS[activeParam];
  const paramPct = Math.min((paramVal / paramCfg.limit) * 100, 130);
  const isExceeded = paramVal > paramCfg.limit;

  const overall = {
    excellent: WELL_QUALITY.filter(w => w.quality === "ممتاز").length,
    good:      WELL_QUALITY.filter(w => w.quality === "جيد").length,
    avg:       Math.round(WELL_QUALITY.reduce((s, w) => s + w.score, 0) / WELL_QUALITY.length),
    danger:    WELL_QUALITY.filter(w => w.quality === "رديء").length,
  };

  return (
    <div className="p-5 lg:p-7 space-y-5" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-800">تحليل جودة المياه</h1>
          <p className="text-gray-400 text-sm mt-0.5">مراقبة مستمرة لمعايير جودة المياه الجوفية</p>
        </div>
        <button onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 600); }}
          className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors">
          <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "جودة ممتازة", value: overall.excellent, icon: ThumbsUp, color: "#16a34a", bg: "#dcfce7" },
          { label: "جودة جيدة",  value: overall.good,      icon: CheckCircle, color: "#1d4ed8", bg: "#dbeafe" },
          { label: "متوسط الجودة", value: `${overall.avg}%`, icon: Activity, color: "#d97706", bg: "#fef3c7" },
          { label: "يحتاج تدخل", value: overall.danger,    icon: AlertTriangle, color: "#dc2626", bg: "#fee2e2" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: s.bg }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* TDS trend chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-black text-gray-800 text-sm">منحنى المواد الذائبة (TDS)</h2>
              <p className="text-xs text-gray-400 mt-0.5">مقارنة بين الآبار — 6 أشهر (mg/L)</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span>الحد المسموح: 600</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={TDS_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                {["w1","w2","w3","w4","w5"].map((k, i) => {
                  const colors = ["#3b82f6","#8b5cf6","#f59e0b","#22c55e","#ef4444"];
                  return (
                    <linearGradient key={k} id={`g${k}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors[i]} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={colors[i]} stopOpacity={0} />
                    </linearGradient>
                  );
                })}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="m" tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 11 }} />
              {["w1","w2","w3","w4","w5"].map((k, i) => {
                const colors = ["#3b82f6","#8b5cf6","#f59e0b","#22c55e","#ef4444"];
                return (
                  <Area key={k} type="monotone" dataKey={k} stroke={colors[i]} fill={`url(#g${k})`}
                    strokeWidth={2} dot={false} />
                );
              })}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Radar chart */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-black text-gray-800 text-sm mb-1">مقارنة معايير الجودة</h2>
          <p className="text-xs text-gray-400 mb-3">بئر سبها مقابل بئر الكفرة</p>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="#f1f5f9" />
              <PolarAngleAxis dataKey="param" tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <Radar name="بئر سبها" dataKey="A" stroke="#22c55e" fill="#22c55e" fillOpacity={0.25} strokeWidth={2} />
              <Radar name="بئر الكفرة" dataKey="B" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} strokeWidth={2} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 11 }} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1"><span className="w-3 h-0.5 bg-green-500 inline-block" />بئر سبها</div>
            <div className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-400 inline-block" />بئر الكفرة</div>
          </div>
        </div>
      </div>

      {/* Well selector + detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Score bar chart */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-black text-gray-800 text-sm mb-4">مؤشر جودة الآبار</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={SCORE_BAR} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: "#64748b" }} width={70} />
              <Tooltip formatter={(v: any) => [`${v}%`, "مؤشر الجودة"]} contentStyle={{ borderRadius: 12, fontSize: 11 }} />
              <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                {SCORE_BAR.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Well detail panel */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-gray-800 text-sm">تفاصيل جودة البئر</h2>
            <div className="flex gap-1.5">
              {WELL_QUALITY.map((w, i) => {
                const cfg = QUALITY_CONFIG[w.quality];
                return (
                  <button key={i} onClick={() => setSelectedWell(i)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all border"
                    style={selectedWell === i
                      ? { backgroundColor: cfg.color, color: "white", borderColor: cfg.color }
                      : { backgroundColor: cfg.bg, color: cfg.color, borderColor: "transparent" }}>
                    {w.name.replace("بئر ", "")}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected well */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              {/* Score ring */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-20 h-20">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none"
                      stroke={QUALITY_CONFIG[sel.quality].color}
                      strokeWidth="3"
                      strokeDasharray={`${sel.score} ${100 - sel.score}`}
                      strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-lg font-black text-gray-800">{sel.score}</span>
                    <span className="text-[9px] text-gray-400">%</span>
                  </div>
                </div>
                <div>
                  <p className="font-black text-gray-800">{sel.name}</p>
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold mt-1"
                    style={{ backgroundColor: QUALITY_CONFIG[sel.quality].bg, color: QUALITY_CONFIG[sel.quality].color }}>
                    {sel.quality}
                  </span>
                </div>
              </div>

              {/* Parameters */}
              <div className="space-y-2">
                {[
                  { key: "tds",      label: "TDS",     value: sel.tds,      unit: "mg/L",  limit: 600,  good: sel.tds <= 600 },
                  { key: "ph",       label: "pH",      value: sel.ph,       unit: "",      limit: 8.5,  good: sel.ph >= 6.5 && sel.ph <= 8.5 },
                  { key: "ec",       label: "EC",      value: sel.ec,       unit: "μS/cm", limit: 1000, good: sel.ec <= 1000 },
                  { key: "salinity", label: "ملوحة",  value: sel.salinity, unit: "g/L",   limit: 0.5,  good: sel.salinity <= 0.5 },
                ].map(p => (
                  <div key={p.key} onClick={() => setActiveParam(p.key as any)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                      activeParam === p.key ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50 border border-transparent"
                    }`}>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.good ? "#22c55e" : "#ef4444" }} />
                      <span className="text-xs font-semibold text-gray-600">{p.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-gray-800">{p.value} <span className="font-normal text-gray-400">{p.unit}</span></span>
                      {!p.good && <AlertTriangle className="w-3 h-3 text-red-400" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Parameter gauge */}
            <div className="flex flex-col items-center justify-center bg-gray-50 rounded-2xl p-4">
              <FlaskConical className="w-5 h-5 text-blue-500 mb-2" />
              <p className="text-xs font-bold text-gray-600 mb-1 text-center">{paramCfg.label}</p>
              <p className="text-3xl font-black text-gray-800">{paramVal}</p>
              <p className="text-xs text-gray-400 mb-4">{paramCfg.unit}</p>

              {/* Gauge bar */}
              <div className="w-full">
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(paramPct, 100)}%`,
                      background: isExceeded
                        ? "linear-gradient(90deg,#f59e0b,#ef4444)"
                        : "linear-gradient(90deg,#22c55e,#3b82f6)"
                    }} />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>0</span>
                  <span className={isExceeded ? "text-red-500 font-bold" : "text-green-600 font-bold"}>
                    {isExceeded ? "⚠ تجاوز الحد" : "✓ ضمن الحد"}
                  </span>
                  <span>الحد: {paramCfg.limit}</span>
                </div>
              </div>

              <div className="mt-4 text-center p-2.5 rounded-xl w-full"
                style={{ backgroundColor: isExceeded ? "#fee2e2" : "#dcfce7" }}>
                <p className="text-xs font-bold" style={{ color: isExceeded ? "#dc2626" : "#16a34a" }}>
                  {isExceeded
                    ? `تجاوز بمقدار ${(paramVal - paramCfg.limit).toFixed(2)} ${paramCfg.unit}`
                    : "ضمن المعايير الدولية (WHO)"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WHO standards table */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h2 className="font-black text-gray-800 text-sm mb-4 flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-blue-500" />
          مقارنة مع معايير منظمة الصحة العالمية (WHO)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-right">
                {["البئر","TDS (mg/L)","pH","EC (μS/cm)","ملوحة (g/L)","التقييم"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-xs font-bold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-blue-50 bg-blue-50/30">
                <td className="px-4 py-2.5 text-xs font-bold text-blue-700">الحد الأقصى (WHO)</td>
                <td className="px-4 py-2.5 text-xs text-blue-600 font-semibold">600</td>
                <td className="px-4 py-2.5 text-xs text-blue-600 font-semibold">6.5–8.5</td>
                <td className="px-4 py-2.5 text-xs text-blue-600 font-semibold">1000</td>
                <td className="px-4 py-2.5 text-xs text-blue-600 font-semibold">0.5</td>
                <td className="px-4 py-2.5"></td>
              </tr>
              {WELL_QUALITY.map((w, i) => {
                const cfg = QUALITY_CONFIG[w.quality];
                const Icon = cfg.icon;
                const tdsOk = w.tds <= 600, phOk = w.ph >= 6.5 && w.ph <= 8.5, ecOk = w.ec <= 1000, salOk = w.salinity <= 0.5;
                const cell = (ok: boolean, v: any) => (
                  <td key={String(v)} className="px-4 py-2.5 text-xs font-semibold" style={{ color: ok ? "#16a34a" : "#dc2626" }}>
                    {v} {!ok && "⚠"}
                  </td>
                );
                return (
                  <tr key={i} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-2.5 text-xs font-semibold text-gray-700">{w.name}</td>
                    {cell(tdsOk, w.tds)}
                    {cell(phOk, w.ph)}
                    {cell(ecOk, w.ec)}
                    {cell(salOk, w.salinity)}
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold"
                        style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                        <Icon className="w-3 h-3" />{w.quality}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
