"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight, Droplets, MapPin, Wrench, FileText, Calendar, DollarSign,
  Edit, Trash2, Activity, AlertTriangle, CheckCircle, Clock, RefreshCw,
  Gauge, Layers, ThermometerSun, FlaskConical, Hash, ExternalLink,
} from "lucide-react";

interface Well {
  id: string; wellId: string; name: string; region: string; location: string | null;
  latitude: number | null; longitude: number | null; depth: number | null;
  type: string; status: string; casingType: string | null; pumpType: string | null;
  waterQuality: string | null; cost: number | null; notes: string | null;
  drillingDate: string | null; createdAt: string;
}

const STATUS_CFG: Record<string, { bg: string; color: string; dot: string; icon: any }> = {
  "فعال":        { bg: "#dcfce7", color: "#16a34a", dot: "#22c55e", icon: CheckCircle },
  "صيانة":       { bg: "#fef3c7", color: "#d97706", dot: "#f59e0b", icon: Wrench },
  "متعطل":       { bg: "#fee2e2", color: "#dc2626", dot: "#ef4444", icon: AlertTriangle },
  "قيد الإنشاء": { bg: "#ede9fe", color: "#7c3aed", dot: "#8b5cf6", icon: Clock },
};

export default function WellDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [well, setWell] = useState<Well | null>(null);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/wells/${id}`).then(r => r.json()),
      fetch(`/api/maintenance?wellId=${id}`).then(r => r.json()),
      fetch(`/api/reports?wellId=${id}`).then(r => r.json()),
    ]).then(([w, m, rep]) => {
      if (w.error) setError(w.error);
      else setWell(w);
      setMaintenance(Array.isArray(m) ? m : []);
      setReports(Array.isArray(rep) ? rep : []);
    }).catch(() => setError("فشل تحميل بيانات البئر")).finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm(`هل تريد حذف البئر "${well?.name}"؟ لا يمكن التراجع.`)) return;
    await fetch(`/api/wells/${id}`, { method: "DELETE" });
    router.push("/dashboard/wells");
  };

  if (loading) return (
    <div className="min-h-96 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
        <p className="text-gray-400 text-sm">جاري التحميل...</p>
      </div>
    </div>
  );

  if (error || !well) return (
    <div className="p-8 text-center min-h-96 flex flex-col items-center justify-center">
      <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-red-400" />
      </div>
      <p className="text-red-600 font-semibold">{error || "البئر غير موجود"}</p>
      <Link href="/dashboard/wells" className="text-blue-500 text-sm mt-3 hover:underline">← العودة للقائمة</Link>
    </div>
  );

  const st = STATUS_CFG[well.status] || { bg: "#f3f4f6", color: "#6b7280", dot: "#9ca3af", icon: Activity };
  const StatusIcon = st.icon;

  const mCosts = maintenance.reduce((s, m) => s + (m.cost || 0), 0);

  return (
    <div className="p-5 lg:p-7 space-y-5 max-w-6xl" dir="rtl">

      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href="/dashboard/wells" className="p-2 rounded-xl hover:bg-gray-100 transition-colors mt-1 shrink-0">
          <ArrowRight className="w-4 h-4 text-gray-500" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-black text-gray-800">{well.name}</h1>
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-bold"
              style={{ backgroundColor: st.bg, color: st.color }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: st.dot }} />
              {well.status}
            </span>
            <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded-lg">{well.wellId}</span>
          </div>
          <p className="text-gray-400 text-sm mt-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> {well.region}{well.location ? ` — ${well.location}` : ""}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link href={`/dashboard/wells/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors bg-white">
            <Edit className="w-3.5 h-3.5" /> تعديل
          </Link>
          <button onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm hover:bg-red-50 transition-colors bg-white">
            <Trash2 className="w-3.5 h-3.5" /> حذف
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "عمق البئر", value: well.depth ? `${well.depth} م` : "—", icon: Gauge, color: "#3b82f6", bg: "#dbeafe" },
          { label: "تكلفة الحفر", value: well.cost ? `${well.cost.toLocaleString()} د.ل` : "—", icon: DollarSign, color: "#16a34a", bg: "#dcfce7" },
          { label: "سجلات الصيانة", value: maintenance.length, icon: Wrench, color: "#d97706", bg: "#fef3c7" },
          { label: "التقارير", value: reports.length, icon: FileText, color: "#8b5cf6", bg: "#ede9fe" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: s.bg }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <p className="text-lg font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Left: main content ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Technical data */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-500" />
              <h2 className="font-black text-gray-800 text-sm">البيانات الفنية</h2>
            </div>
            <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: "نوع البئر",    value: well.type,            icon: Hash },
                { label: "نوع الغلاف",  value: well.casingType || "—", icon: Layers },
                { label: "نوع المضخة",  value: well.pumpType || "—",  icon: Gauge },
                { label: "جودة المياه", value: well.waterQuality || "—", icon: FlaskConical },
                { label: "تاريخ الحفر", value: well.drillingDate ? new Date(well.drillingDate).toLocaleDateString("ar-LY") : "—", icon: Calendar },
                { label: "تاريخ التسجيل", value: new Date(well.createdAt).toLocaleDateString("ar-LY"), icon: Calendar },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Icon className="w-3 h-3 text-gray-400" />
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{label}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-800">{value}</p>
                </div>
              ))}
            </div>
            {well.notes && (
              <div className="mx-5 mb-5 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs text-blue-500 font-bold mb-1.5">ملاحظات</p>
                <p className="text-sm text-blue-800 leading-relaxed">{well.notes}</p>
              </div>
            )}
          </div>

          {/* Maintenance */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-500" />
                <h2 className="font-black text-gray-800 text-sm">سجلات الصيانة ({maintenance.length})</h2>
              </div>
              <div className="flex items-center gap-3">
                {mCosts > 0 && <span className="text-xs text-gray-400">إجمالي: <span className="font-bold text-gray-600">{mCosts.toLocaleString("ar-LY")} د.ل</span></span>}
                <Link href="/dashboard/maintenance" className="text-xs text-blue-500 hover:underline">عرض الكل</Link>
              </div>
            </div>
            <div className="p-5">
              {maintenance.length === 0 ? (
                <div className="text-center py-8">
                  <Wrench className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-300 text-sm">لا توجد سجلات صيانة</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {maintenance.slice(0, 5).map((m: any) => {
                    const statusClr = m.status === "مكتملة" ? { bg: "#dcfce7", color: "#16a34a" } : m.status === "قيد التنفيذ" ? { bg: "#fef3c7", color: "#d97706" } : { bg: "#fee2e2", color: "#dc2626" };
                    const prioClr = m.priority === "عالية" ? "#ef4444" : m.priority === "متوسطة" ? "#f59e0b" : "#22c55e";
                    return (
                      <div key={m.id} className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: prioClr }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800">{m.type}</p>
                          <p className="text-xs text-gray-400">{m.technician} · {new Date(m.createdAt).toLocaleDateString("ar-LY")}</p>
                        </div>
                        <div className="text-left shrink-0">
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={statusClr}>{m.status}</span>
                          {m.cost && <p className="text-xs text-gray-400 mt-0.5 text-center">{m.cost.toLocaleString()} د.ل</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Reports */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-violet-500" />
                <h2 className="font-black text-gray-800 text-sm">التقارير ({reports.length})</h2>
              </div>
              <Link href="/dashboard/reports" className="text-xs text-blue-500 hover:underline">عرض الكل</Link>
            </div>
            <div className="p-5">
              {reports.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-300 text-sm">لا توجد تقارير</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {reports.slice(0, 5).map((r: any) => {
                    const sc = r.status === "معتمد" ? { bg: "#dcfce7", color: "#16a34a" } : r.status === "قيد المراجعة" ? { bg: "#fef3c7", color: "#d97706" } : { bg: "#f3f4f6", color: "#6b7280" };
                    return (
                      <div key={r.id} className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-violet-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{r.title}</p>
                          <p className="text-xs text-gray-400">{r.author} · {new Date(r.createdAt).toLocaleDateString("ar-LY")}</p>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold shrink-0" style={sc}>{r.status}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right: sidebar ── */}
        <div className="space-y-5">

          {/* Status */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-black text-gray-800 text-sm mb-4">الحالة الراهنة</h2>
            <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: st.bg }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: st.color + "20" }}>
                <StatusIcon className="w-5 h-5" style={{ color: st.color }} />
              </div>
              <div>
                <p className="font-black text-lg leading-none" style={{ color: st.color }}>{well.status}</p>
                <p className="text-xs mt-0.5" style={{ color: st.color, opacity: 0.6 }}>الحالة الحالية</p>
              </div>
            </div>
          </div>

          {/* Location */}
          {(well.latitude && well.longitude) && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-black text-gray-800 text-sm mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-400" /> الموقع الجغرافي
              </h2>
              <div className="space-y-3 mb-4">
                {[
                  { label: "خط العرض", value: well.latitude.toFixed(5) },
                  { label: "خط الطول", value: well.longitude.toFixed(5) },
                ].map(c => (
                  <div key={c.label} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-xl">
                    <span className="text-xs text-gray-400">{c.label}</span>
                    <span className="font-mono text-sm font-bold text-gray-700">{c.value}</span>
                  </div>
                ))}
              </div>
              <a href={`https://www.google.com/maps?q=${well.latitude},${well.longitude}`}
                target="_blank" rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-blue-200 text-blue-600 text-sm font-semibold hover:bg-blue-50 transition-colors">
                <ExternalLink className="w-3.5 h-3.5" /> فتح في خرائط Google
              </a>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-black text-gray-800 text-sm mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" /> التواريخ
            </h2>
            <div className="space-y-3">
              {well.drillingDate && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">تاريخ الحفر</p>
                    <p className="text-sm font-bold text-gray-700">{new Date(well.drillingDate).toLocaleDateString("ar-LY")}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">تاريخ التسجيل</p>
                  <p className="text-sm font-bold text-gray-700">{new Date(well.createdAt).toLocaleDateString("ar-LY")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-black text-gray-800 text-sm mb-4">إجراءات سريعة</h2>
            <div className="space-y-2">
              <Link href="/dashboard/maintenance"
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors border border-gray-100 group">
                <Wrench className="w-4 h-4 text-amber-400 group-hover:text-amber-600" />
                إضافة سجل صيانة
              </Link>
              <Link href="/dashboard/reports"
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors border border-gray-100 group">
                <FileText className="w-4 h-4 text-violet-400 group-hover:text-violet-600" />
                إضافة تقرير
              </Link>
              <Link href="/dashboard/wells/map"
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors border border-gray-100 group">
                <MapPin className="w-4 h-4 text-blue-400 group-hover:text-blue-600" />
                عرض على الخريطة
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
