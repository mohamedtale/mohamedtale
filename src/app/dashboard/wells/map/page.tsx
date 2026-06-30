"use client";
import { useEffect, useState, useRef } from "react";
import { RefreshCw, Layers } from "lucide-react";

interface Well {
  id: string; wellId: string; name: string; region: string;
  latitude: number | null; longitude: number | null; status: string; depth: number | null;
}

const STATUS_COLORS: Record<string, string> = {
  "فعال": "#22c55e",
  "صيانة": "#f59e0b",
  "متعطل": "#ef4444",
  "قيد الإنشاء": "#8b5cf6",
};

export default function WellsMapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [wells, setWells] = useState<Well[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [mapType, setMapType] = useState<"satellite" | "street">("satellite");

  useEffect(() => {
    fetch("/api/wells").then(r => r.json()).then(d => {
      setWells(Array.isArray(d) ? d : []);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || loading) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapRef.current!, {
        center: [27.0, 17.0],
        zoom: 5,
        zoomControl: true,
      });

      if (mapType === "satellite") {
        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          { attribution: "© Esri World Imagery" }
        ).addTo(map);
      } else {
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(map);
      }

      mapInstanceRef.current = map;

      const filtered = wells.filter(w =>
        w.latitude && w.longitude && (filter === "" || w.status === filter)
      );

      filtered.forEach(well => {
        const color = STATUS_COLORS[well.status] || "#6b7280";
        const icon = L.divIcon({
          html: `<div style="width:14px;height:14px;background:${color};border:2.5px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.5)"></div>`,
          className: "",
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        L.marker([well.latitude!, well.longitude!], { icon })
          .bindPopup(`
            <div dir="rtl" style="font-family:sans-serif;min-width:190px;padding:4px">
              <p style="font-weight:700;color:#1e293b;margin:0 0 6px;font-size:14px">${well.name}</p>
              <p style="color:#64748b;font-size:12px;margin:2px 0">🔑 ${well.wellId}</p>
              <p style="color:#64748b;font-size:12px;margin:2px 0">📍 ${well.region}</p>
              <p style="color:#64748b;font-size:12px;margin:2px 0">📏 العمق: ${well.depth ?? "—"} م</p>
              <div style="margin-top:8px;display:flex;align-items:center;justify-content:space-between">
                <span style="background:${color}22;color:${color};padding:2px 10px;border-radius:99px;font-size:11px;font-weight:700;border:1px solid ${color}44">${well.status}</span>
                <a href="/dashboard/wells/${well.id}" style="color:#3b82f6;font-size:12px;font-weight:600">التفاصيل ←</a>
              </div>
            </div>
          `)
          .addTo(map);
      });
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [wells, filter, mapType, loading]);

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 64px)" }} dir="rtl">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between flex-wrap gap-3 shrink-0">
        <div>
          <h1 className="text-lg font-bold text-gray-800">خريطة الآبار التفاعلية</h1>
          <p className="text-xs text-gray-400">{wells.length} بئر مسجل</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {["", "فعال", "صيانة", "متعطل", "قيد الإنشاء"].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: filter === s ? (STATUS_COLORS[s] || "#3b82f6") : "#f1f5f9",
                color: filter === s ? "white" : "#64748b",
              }}
            >
              {s === "" ? "الكل" : s}
              {s !== "" && <span className="mr-1">({wells.filter(w => w.status === s).length})</span>}
            </button>
          ))}
          <button
            onClick={() => setMapType(t => t === "satellite" ? "street" : "satellite")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 transition-colors"
          >
            <Layers size={12} />
            {mapType === "satellite" ? "خريطة عادية" : "صور جوية"}
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 bg-slate-50 border-b border-gray-100 flex items-center gap-5 shrink-0">
        {Object.entries(STATUS_COLORS).map(([s, c]) => (
          <div key={s} className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="w-3 h-3 rounded-full border-2 border-white shadow-sm" style={{ background: c }} />
            {s} <span className="text-gray-400">({wells.filter(w => w.status === s).length})</span>
          </div>
        ))}
      </div>

      {/* Map container */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full absolute inset-0" />
        {loading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-[1000]">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}
      </div>
    </div>
  );
}
