"use client";
import { MapPin, Droplets } from "lucide-react";

const wells = [
  { name: "بئر الزاوية الشمالي", id: "W-001", loc: "طرابلس", status: "فعال", x: "20%", y: "30%" },
  { name: "بئر مصراتة المركزي", id: "W-003", loc: "مصراتة", status: "فعال", x: "35%", y: "35%" },
  { name: "بئر الزيان الزراعي", id: "W-008", loc: "بنغازي", status: "صيانة", x: "70%", y: "40%" },
  { name: "بئر سبها الغربي", id: "W-004", loc: "سبها", status: "فعال", x: "50%", y: "65%" },
];

export default function WellsMapPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">خريطة الآبار</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="relative h-96 md:h-[500px]" style={{ background: "linear-gradient(135deg, #d4e8c2 0%, #a8d5a2 30%, #e8c87a 60%, #c4a96a 100%)" }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white text-opacity-50">
              <MapPin size={48} className="mx-auto opacity-30 mb-2" />
              <p className="text-gray-600 opacity-50">خريطة ليبيا التفاعلية</p>
            </div>
          </div>
          {wells.map((w, i) => (
            <div
              key={i}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{ left: w.x, top: w.y }}
            >
              <div className={`w-5 h-5 rounded-full border-2 border-white shadow-lg ${w.status === "فعال" ? "bg-green-500" : "bg-orange-500"}`} />
              <div className="absolute bottom-full mb-2 right-0 bg-white rounded-lg shadow-lg p-2 text-xs min-w-max opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="font-bold text-gray-800">{w.name}</p>
                <p className="text-gray-500">{w.id} • {w.loc}</p>
                <span className={`inline-block px-1.5 py-0.5 rounded-full text-xs mt-1 ${w.status === "فعال" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>{w.status}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span> فعال</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500"></span> صيانة</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span> متعطل</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {wells.map((w, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Droplets size={16} className="text-blue-500" />
              <span className="text-xs text-gray-400">{w.id}</span>
            </div>
            <p className="font-medium text-sm text-gray-800">{w.name}</p>
            <p className="text-xs text-gray-400 mt-1">{w.loc}</p>
            <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs ${w.status === "فعال" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>{w.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
