"use client";
import { Plus, Search, Filter, AlertTriangle, CheckCircle, Clock, Pause, User, Calendar } from "lucide-react";

const tasks = {
  متأخرة: [
    { id: 1, well: "بئر بنغازي الجنوبي", num: "W-002", type: "استبدال قطع", priority: "عالية", user: "صالح حسن", date: "2024-06-08", progress: 0 },
  ],
  مكتملة: [
    { id: 2, well: "بئر الزيان الزراعي", num: "W-008", type: "فحص دوري", priority: "متوسطة", user: "محمد علي", date: "2024-06-10", progress: 100 },
  ],
  "قيد التنفيذ": [
    { id: 3, well: "بئر الزاوية الشمالي", num: "W-011", type: "صيانة دورية", priority: "عالية", user: "أحمد محمد", date: "2024-06-15", progress: 60 },
    { id: 4, well: "بئر سبها الغربي", num: "W-004", type: "تنظيف", priority: "متوسطة", user: "يوسف سالم", date: "2024-06-19", progress: 40 },
  ],
  معلقة: [
    { id: 5, well: "بئر مصراتة المركزي", num: "W-003", type: "إصلاح طارئ", priority: "عالية", user: "خالد أحمد", date: "2024-06-12", progress: 0 },
  ],
};

const colConfig: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  متأخرة: { bg: "bg-red-500", text: "text-red-600", icon: AlertTriangle },
  مكتملة: { bg: "bg-green-500", text: "text-green-600", icon: CheckCircle },
  "قيد التنفيذ": { bg: "bg-blue-500", text: "text-blue-600", icon: Clock },
  معلقة: { bg: "bg-gray-500", text: "text-gray-600", icon: Pause },
};

export default function MaintenancePage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">المتابعة والصيانة</h1>
          <p className="text-gray-500 text-sm mt-1">إدارة ومتابعة أعمال الصيانة الدورية والطارئة</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus size={16} />
          <span>إضافة مهمة جديدة</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "متأخرة", value: 1, color: "bg-red-500" },
          { label: "مكتملة", value: 1, color: "bg-green-500" },
          { label: "قيد الانتظار", value: 1, color: "bg-gray-400" },
          { label: "الصواميل النشطة", value: 2, color: "bg-blue-500" },
        ].map((s, i) => (
          <div key={i} className={`${s.color} text-white rounded-2xl p-5`}>
            <div className="text-4xl font-black">{s.value}</div>
            <div className="text-sm mt-1 opacity-90">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2">
          <Search size={16} className="text-gray-400" />
          <input placeholder="البحث عن مهمة..." className="bg-transparent text-sm outline-none flex-1 text-right" />
        </div>
        <button className="flex items-center gap-2 border border-gray-200 bg-white rounded-xl px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
          <Filter size={16} />
          <span>تصفية</span>
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(tasks).map(([col, items]) => {
          const conf = colConfig[col];
          const Icon = conf.icon;
          return (
            <div key={col} className="bg-gray-100 rounded-2xl p-3">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2 h-2 rounded-full ${conf.bg}`} />
                <span className="text-sm font-bold text-slate-700">{col}</span>
                <span className="text-xs bg-white rounded-full px-2 py-0.5 text-gray-500 mr-auto">{items.length}</span>
              </div>
              <div className="space-y-3">
                {items.map(task => (
                  <div key={task.id} className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="font-semibold text-slate-800 text-sm">{task.well}</div>
                    <div className="text-xs text-gray-400 mb-2">{task.num}</div>
                    <div className="text-xs text-gray-600 mb-2">{task.type}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      task.priority === "عالية" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-700"
                    }`}>{task.priority}</span>
                    {task.progress > 0 && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>المدم</span>
                          <span>{task.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full">
                          <div className="h-1.5 bg-blue-500 rounded-full" style={{ width: `${task.progress}%` }} />
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><User size={10} /> {task.user}</span>
                      <span className="flex items-center gap-1"><Calendar size={10} /> {task.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
