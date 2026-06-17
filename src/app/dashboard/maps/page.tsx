"use client";
import { useState, useEffect } from "react";
import { Droplets, RefreshCw } from "lucide-react";

export default function MapsPage() {
  const [wells, setWells] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch("/api/wells").then(r => r.json()).then(d => setWells(Array.isArray(d) ? d : [])).finally(() => setLoading(false));
  }, []);

  const statusColor = (s: string) => s === "فعال" ? "#22c55e" : s === "صيانة" ? "#f97316" : "#ef4444";
  
  const mappedWells = wells.filter(w => w.latitude && w.longitude);
  const filtered = filter ? wells.filter(w => w.status === filter) : wells;

  const toPercent = (lat: number, lng: number) => ({
    x: ((lng - 9) / (25 - 9)) * 100,
    y: (1 - (lat - 19) / (33 - 19)) * 100,
  });

  return (
    <div className="p-6 lg:p-8" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800">خريطة الآبار</h1>
          <p className="text-gray-500 text-sm mt-1">التوزيع الجغرافي لشبكة الآبار</p>
        </div>
        <button onClick={() => { setLoading(true); fetch("/api/wells").then(r => r.json()).then(d => setWells(d)).finally(() => setLoading(false)); }}
          className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {["", "فعال", "صيانة", "متعطل"].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${filter === s ? "text-white" : "bg-white text-gray-600 border border-gray-200"}`}
            style={filter === s ? { background: "linear-gradient(135deg,#1565C0,#2196F3)" } : {}}>
            {s || "الكل"}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-3xl overflow-hidden shadow-xl border border-gray-100" style={{ height: "500px" }}>
          <div className="relative w-full h-full"
            style={{ background: "linear-gradient(175deg,#b8d9f0 0%,#a0cce0 25%,#c8e0a8 55%,#d4c880 78%,#c8b060 100%)" }}>
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm">
              ليبيا — {mappedWells.length} بئر مع إحداثيات
            </div>
            {mappedWells.map((w: any) => {
              const pos = toPercent(w.latitude, w.longitude);
              const color = statusColor(w.status);
              return (
                <div key={w.id} className="absolute" style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%,-50%)" }}>
                  <button onClick={() => setSelected(selected?.id === w.id ? null : w)} className="relative group">
                    <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ backgroundColor: color }} />
                    <span className="relative block w-4 h-4 rounded-full border-2 border-white shadow-lg" style={{ backgroundColor: color }} />
                    {selected?.id === w.id && (
                      <div className="absolute bottom-6 right-0 bg-white rounded-xl shadow-2xl p-3 min-w-max z-20 text-right border border-gray-100">
                        <p className="font-bold text-gray-800 text-xs">{w.name}</p>
                        <p className="text-gray-500 text-xs">{w.region}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: color + "20", color }}>
                          {w.status}
                        </span>
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
            {mappedWells.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/80 backdrop-blur rounded-2xl p-6 text-center">
                  <p className="text-gray-500 text-sm">لا توجد آبار بإحداثيات جغرافية</p>
                  <p className="text-gray-400 text-xs mt-1">أضف إحداثيات الآبار من صفحة إضافة بئر</p>
                </div>
              </div>
            )}
            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur rounded-xl p-2 shadow-sm">
              {[{ c: "#22c55e", l: "فعال" }, { c: "#f97316", l: "صيانة" }, { c: "#ef4444", l: "متعطل" }].map(x => (
                <div key={x.l} className="flex items-center gap-1.5 mb-1 last:mb-0">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: x.c }} />
                  <span className="text-xs text-gray-600">{x.l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 overflow-y-auto" style={{ maxHeight: "500px" }}>
          <p className="font-bold text-gray-700 text-sm mb-3">قائمة الآبار ({filtered.length})</p>
          {loading ? (
            <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-12" />)}</div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-300 text-sm py-8">لا توجد آبار</p>
          ) : filtered.map((w: any) => (
            <div key={w.id} onClick={() => setSelected(w)}
              className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer mb-1 transition-colors hover:bg-gray-50"
              style={selected?.id === w.id ? { backgroundColor: "#dbeafe" } : {}}>
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: statusColor(w.status) }} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-xs truncate">{w.name}</p>
                <p className="text-gray-400 text-xs">{w.region}</p>
              </div>
              <Droplets className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
