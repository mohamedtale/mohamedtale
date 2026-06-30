"use client";
import { useState, useEffect } from "react";
import {
  CheckCircle, XCircle, FileText, Clock, Shield, AlertTriangle,
  Eye, ChevronDown, ChevronUp, User, Calendar, Tag, BarChart2
} from "lucide-react";

const TYPE_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  "فني":       { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200" },
  "مالي":      { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  "بيئي":      { bg: "bg-teal-50",   text: "text-teal-700",   border: "border-teal-200" },
  "إداري":     { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
};

const PRIORITY_CFG: Record<string, { label: string; color: string; dot: string }> = {
  "عالية":   { label: "عالية",   color: "text-red-600 bg-red-50 border-red-200",    dot: "bg-red-500" },
  "متوسطة":  { label: "متوسطة", color: "text-amber-600 bg-amber-50 border-amber-200", dot: "bg-amber-500" },
  "منخفضة":  { label: "منخفضة", color: "text-green-600 bg-green-50 border-green-200", dot: "bg-green-500" },
};

const STATIC_QUEUE = [
  { id: "r1", title: "تقرير صيانة بئر BW-0012 — ليبيا الوسطى", type: "فني",  author: "م. علي الزروق",     priority: "عالية",  createdAt: "2026-06-25T08:30:00", content: "تم فحص المضخة الرئيسية وتبديل الصمام الثلاثي، كما جرى قياس معدل التدفق وتسجيل نتائج جودة المياه. يُوصى بمتابعة دورية كل 3 أشهر.", wellId: "BW-0012", region: "سبها" },
  { id: "r2", title: "تقرير جودة المياه — بئر BW-0034",         type: "بيئي", author: "م. سارة الفيتوري",  priority: "متوسطة", createdAt: "2026-06-26T10:15:00", content: "قياسات التحليل الكيميائي تُشير إلى نسبة TDS بلغت 412 جزء بالمليون، وهي ضمن حدود منظمة الصحة العالمية. تم تسجيل ارتفاع طفيف في نسبة الكلور.", wellId: "BW-0034", region: "مصراتة" },
  { id: "r3", title: "تقرير التكاليف الربعي — Q2 2026",          type: "مالي", author: "أ. فاطمة البرعصي",  priority: "عالية",  createdAt: "2026-06-27T09:00:00", content: "إجمالي نفقات الصيانة للربع الثاني بلغ 284,500 دينار ليبي موزعة على 18 بئراً. نسبة الصرف مقارنة بالميزانية المقررة 73%.", wellId: null, region: "طرابلس" },
  { id: "r4", title: "تقرير الحفر التشغيلي — بئر BW-0051",       type: "إداري", author: "م. خالد العبيدي",  priority: "منخفضة", createdAt: "2026-06-28T14:00:00", content: "اكتمل حفر البئر على عمق 380 متر. تم تركيب الغلاف الفولاذي وأُجريت اختبارات ضخ تجريبية لمدة 72 ساعة بمعدل تدفق 15 م³/ساعة.", wellId: "BW-0051", region: "بنغازي" },
];

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-black text-gray-800">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function ApprovalPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("الكل");
  const [done, setDone] = useState<{ id: string; status: "معتمد" | "مرفوض" }[]>([]);

  const load = () => {
    setLoading(true);
    fetch("/api/reports?status=قيد المراجعة")
      .then(r => r.json())
      .then(d => setReports(Array.isArray(d) && d.length ? d : STATIC_QUEUE))
      .catch(() => setReports(STATIC_QUEUE))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const action = async (id: string, status: "معتمد" | "مرفوض") => {
    setUpdating(id);
    try {
      await fetch(`/api/reports/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, approvedAt: status === "معتمد" ? new Date() : null }),
      });
    } catch { /* static demo */ }
    setDone(prev => [...prev, { id, status }]);
    showToast(status === "معتمد" ? "تم اعتماد التقرير بنجاح ✓" : "تم رفض التقرير", status === "معتمد" ? "success" : "error");
    setUpdating(null);
  };

  const visible = reports.filter(r => {
    if (done.find(d => d.id === r.id)) return false;
    if (filter === "الكل") return true;
    return r.type === filter || r.priority === filter;
  });

  const pendingCount = reports.filter(r => !done.find(d => d.id === r.id)).length;
  const approvedCount = done.filter(d => d.status === "معتمد").length;
  const rejectedCount = done.filter(d => d.status === "مرفوض").length;
  const highPriority = reports.filter(r => r.priority === "عالية" && !done.find(d => d.id === r.id)).length;

  const FILTERS = ["الكل", "فني", "مالي", "بيئي", "إداري", "عالية", "متوسطة", "منخفضة"];

  return (
    <div className="p-6 lg:p-8" dir="rtl">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-xl text-sm font-bold flex items-center gap-2 transition-all ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.type === "success" ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)" }}>
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-800">اعتماد التقارير</h1>
            <p className="text-gray-400 text-sm">مراجعة واعتماد التقارير المعلقة</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Clock}        label="بانتظار الاعتماد" value={pendingCount}    color="bg-amber-50 text-amber-600" />
        <StatCard icon={AlertTriangle} label="أولوية عالية"    value={highPriority}   color="bg-red-50 text-red-600" />
        <StatCard icon={CheckCircle}   label="معتمدة"          value={approvedCount}  color="bg-emerald-50 text-emerald-600" />
        <StatCard icon={XCircle}       label="مرفوضة"          value={rejectedCount}  color="bg-gray-100 text-gray-500" />
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all border ${filter === f ? "bg-violet-600 text-white border-violet-600 shadow-sm" : "bg-white text-gray-500 border-gray-200 hover:border-violet-300"}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Queue */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-28" />)}
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
          <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <p className="text-gray-700 font-bold text-lg">لا توجد تقارير بانتظار الاعتماد</p>
          <p className="text-gray-400 text-sm mt-1">جميع التقارير تمت معالجتها</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((r: any) => {
            const tc = TYPE_COLOR[r.type] ?? { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200" };
            const pc = PRIORITY_CFG[r.priority] ?? PRIORITY_CFG["منخفضة"];
            const isExpanded = expanded === r.id;
            const days = Math.floor((Date.now() - new Date(r.createdAt).getTime()) / 86400000);

            return (
              <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all">
                {/* Priority stripe */}
                <div className={`h-1 w-full ${pc.dot}`} />

                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${tc.bg}`}>
                      <FileText className={`w-5 h-5 ${tc.text}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <p className="font-bold text-gray-800 leading-snug">{r.title}</p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${tc.bg} ${tc.text} ${tc.border}`}>{r.type}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 ${pc.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${pc.dot}`} />
                            {pc.label}
                          </span>
                        </div>
                      </div>

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{r.author}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(r.createdAt).toLocaleDateString("ar-LY")}</span>
                        {r.region && <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{r.region}</span>}
                        {r.wellId && <span className="flex items-center gap-1"><BarChart2 className="w-3 h-3" />بئر: {r.wellId}</span>}
                        <span className={`font-semibold ${days > 3 ? "text-red-400" : "text-gray-400"}`}>{days === 0 ? "اليوم" : `منذ ${days} أيام`}</span>
                      </div>

                      {/* Preview text */}
                      {r.content && !isExpanded && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-1">{r.content}</p>
                      )}

                      {/* Expanded content */}
                      {isExpanded && r.content && (
                        <div className="mt-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                          <p className="text-sm text-gray-600 leading-relaxed">{r.content}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                    <button onClick={() => setExpanded(isExpanded ? null : r.id)}
                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                      {isExpanded ? "إخفاء التفاصيل" : "عرض التفاصيل"}
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    <div className="flex gap-3">
                      <button onClick={() => action(r.id, "مرفوض")} disabled={updating === r.id}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-red-600 border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-40">
                        <XCircle className="w-4 h-4" /> رفض
                      </button>
                      <button onClick={() => action(r.id, "معتمد")} disabled={updating === r.id}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40 shadow-sm hover:shadow-md"
                        style={{ background: "linear-gradient(135deg,#059669,#10b981)" }}>
                        {updating === r.id
                          ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : <CheckCircle className="w-4 h-4" />}
                        اعتماد
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary bar */}
      {done.length > 0 && (
        <div className="mt-8 p-5 rounded-2xl border border-violet-100 bg-violet-50">
          <p className="text-sm font-bold text-violet-700 mb-3">ملخص جلسة الاعتماد</p>
          <div className="flex items-center gap-6 text-sm">
            <span className="flex items-center gap-2 text-emerald-700 font-bold">
              <CheckCircle className="w-4 h-4" /> {approvedCount} معتمد
            </span>
            <span className="flex items-center gap-2 text-red-600 font-bold">
              <XCircle className="w-4 h-4" /> {rejectedCount} مرفوض
            </span>
            <span className="text-gray-400">{pendingCount} متبقي</span>
          </div>
        </div>
      )}
    </div>
  );
}
