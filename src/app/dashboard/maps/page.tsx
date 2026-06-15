"use client";
import { MapPin, Droplets } from "lucide-react";

const wellsOnMap = [
  { id: "W-001", name: "بئر الزاوية الشمالي", region: "طرابلس", x: 30, y: 25, status: "فعال" },
  { id: "W-002", name: "بئر مصراتة المركزي", region: "مصراتة", x: 50, y: 30, status: "فعال" },
  { id: "W-003", name: "بئر الزيان الزراعي", region: "بنغازي", x: 70, y: 28, status: "صيانة" },
  { id: "W-004", name: "بئر سبها الغربي", region: "سبها", x: 40, y: 65, status: "فعال" },
  { id: "W-005", name: "بئر الكفرة الجنوبي", region: "الكفرة", x: 75, y: 75, status: "متعطل" },
];

export default function MapsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">خريطة الآبار</h1>
        <p className="text-gray-500 text-sm mt-1">عرض جغرافي لمواقع الآبار في ليبيا</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="relative" style={{ height: "500px", background: "linear-gradient(135deg, #e8f4fd 0%, #dde8f5 100%)" }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <MapPin size={60} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">خريطة ليبيا التفاعلية</p>
                <p className="text-xs mt-1 opacity-60">(يتطلب مكتبة خرائط مثل Leaflet أو Mapbox)</p>
              </div>
            </div>
            {wellsOnMap.map(w => (
              <div
                key={w.id}
                className="absolute group cursor-pointer"
                style={{ left: `${w.x}%`, top: `${w.y}%`, transform: "translate(-50%, -50%)" }}
              >
                <div className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${
                  w.status === "فعال" ? "bg-green-500" :
                  w.status === "صيانة" ? "bg-orange-500" : "bg-red-500"
                }`} />
                <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg p-2 text-xs w-36 hidden group-hover:block z-10">
                  <div className="font-bold text-slate-800">{w.name}</div>
                  <div className="text-gray-500">{w.region}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="font-bold text-slate-800">قائمة الآبار</h3>
          {wellsOnMap.map(w => (
            <div key={w.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                w.status === "فعال" ? "bg-green-500" :
                w.status === "صيانة" ? "bg-orange-500" : "bg-red-500"
              }`} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-800 text-sm truncate">{w.name}</div>
                <div className="text-xs text-gray-400">{w.region}</div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                w.status === "فعال" ? "bg-green-100 text-green-700" :
                w.status === "صيانة" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"
              }`}>{w.status}</span>
            </div>
          ))}
          <div className="mt-4 p-3 bg-gray-50 rounded-xl">
            <div className="text-xs font-medium text-gray-600 mb-2">المفتاح</div>
            {[["bg-green-500", "فعال"], ["bg-orange-500", "صيانة"], ["bg-red-500", "متعطل"]].map(([c, l]) => (
              <div key={l} className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <div className={`w-3 h-3 rounded-full ${c}`} />
                <span>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
