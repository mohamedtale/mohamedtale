"use client";
import { useState } from "react";
import { Download } from "lucide-react";

const geologicalLayers = [
  { name: "تربة سطحية", depth: "0-5 م", color: "#d4a574" },
  { name: "طمي ورمل ناعم", depth: "5-30 م", color: "#c9956a" },
  { name: "رمل خشن وحصى", depth: "30-80 م", color: "#b8845a" },
  { name: "حجر رملي", depth: "80-150 م", color: "#8b6347" },
  { name: "طبقة حاملة للمياه", depth: "150-200 م", color: "#4a9eff" },
];

export default function WellDesignPage() {
  const [depth, setDepth] = useState(200);
  const [casing, setCasing] = useState("PVC");

  const drillingCost = Math.round(depth * 150);
  const casingCost = Math.round(depth * 67.5);
  const pumpCost = 4200;
  const installCost = Math.round((drillingCost + casingCost) * 0.15);
  const total = drillingCost + casingCost + pumpCost + installCost;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">تصميم البئر والميزانية</h1>
          <p className="text-gray-500 text-sm mt-1">أداة لحساب تكاليف حفر وتجهيز البئر</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          <Download size={16} />
          <span>تصدير التصميم</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cross Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800">المقطع العرضي للبئر</h2>
          </div>
          <div className="relative">
            <div className="flex">
              {/* Labels */}
              <div className="w-32 text-left text-xs text-gray-500 space-y-0">
                {geologicalLayers.map((layer, i) => (
                  <div key={i} style={{ height: `${i === geologicalLayers.length - 1 ? 60 : 40}px` }} className="flex items-center">
                    <span>{layer.depth}</span>
                  </div>
                ))}
              </div>
              {/* Visual */}
              <div className="flex-1 relative border-2 border-gray-300 rounded-lg overflow-hidden">
                {geologicalLayers.map((layer, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: layer.color,
                      height: `${i === geologicalLayers.length - 1 ? 60 : 40}px`,
                      opacity: 0.85,
                    }}
                    className="flex items-center justify-end px-3"
                  >
                    <span className="text-white text-xs font-medium drop-shadow">{layer.name}</span>
                  </div>
                ))}
                {/* Well casing */}
                <div className="absolute inset-x-1/2 top-0 w-8 -translate-x-1/2 h-3/4 bg-gray-300 opacity-60 rounded-b-sm" />
              </div>
            </div>
          </div>

          {/* Geological Legend */}
          <div className="mt-4 space-y-2">
            {geologicalLayers.map((layer, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: layer.color }} />
                  <span className="text-xs text-gray-700">{layer.name}</span>
                </div>
                <span className="text-xs text-gray-500">{layer.depth}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Specs & Budget */}
        <div className="space-y-6">
          {/* Technical Specs */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-slate-800 mb-4">المواصفات الفنية</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">العمق الحلي (متر)</span>
                  <span className="font-bold text-blue-600">{depth} م</span>
                </div>
                <input
                  type="range" min={50} max={500} value={depth}
                  onChange={e => setDepth(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <label className="text-sm text-gray-500 block mb-2">نوع التغليف (Casing)</label>
                <div className="grid grid-cols-3 gap-2">
                  {["PVC", "HDPE", "فولاذ"].map(type => (
                    <button
                      key={type}
                      onClick={() => setCasing(type)}
                      className={`py-2 rounded-lg text-sm font-medium transition-colors border ${
                        casing === type
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">نوع التربة</label>
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-right">
                    <option>رملية</option>
                    <option>طينية</option>
                    <option>صخرية</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">المنطقة</label>
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-right">
                    <option>طرابلس</option>
                    <option>بنغازي</option>
                    <option>مصراتة</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Budget */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-slate-800 mb-4">التفاصيل المزانية</h2>
            <div className="space-y-3">
              {[
                { label: "تكلفة الحفر", value: drillingCost },
                { label: "تكلفة التغليف والأنابيب", value: casingCost },
                { label: "تكلفة المضخة", value: pumpCost },
                { label: "التركيب والتجهيز", value: installCost },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className="text-sm font-semibold text-slate-800">{item.value.toLocaleString("ar-LY")} د.ل</span>
                </div>
              ))}
              <div className="flex items-center justify-between bg-blue-600 text-white rounded-xl px-4 py-3 mt-2">
                <span className="font-bold">الكلفة الإجمالية</span>
                <span className="text-xl font-black">{total.toLocaleString("ar-LY")} د.ل</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3 leading-relaxed">ملاحظة عامة: التكاليف المذكورة تقديرية وقد تختلف حسب ظروف الموقع والأسعار السائدة</p>
          </div>
        </div>
      </div>
    </div>
  );
}
