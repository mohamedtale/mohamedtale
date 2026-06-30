"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight, Droplets, MapPin, Wrench, FileText, Calendar, DollarSign,
  Edit, Trash2, Activity, AlertTriangle, CheckCircle, Clock, RefreshCw
} from "lucide-react";

interface Well {
  id: string; wellId: string; name: string; region: string; location: string | null;
  latitude: number | null; longitude: number | null; depth: number | null;
  type: string; status: string; casingType: string | null; pumpType: string | null;
  waterQuality: string | null; cost: number | null; notes: string | null;
  drillingDate: string | null; createdAt: string;
}

interface Maintenance {
  id: string; type: string; status: string; description: string | null;
  technician: string; cost: number | null; priority: string; createdAt: string;
}

interface Report {
  id: string; title: string; type: string; status: string;
  author: string; fileSize: string | null; createdAt: string;
}

const statusConfig: Record<string, { bg: string; color: string; icon: any }> = {
  "فعال":        { bg: "#dcfce7", color: "#16a34a", icon: CheckCircle },
  "صيانة":       { bg: "#fef3c7", color: "#d97706", icon: Wrench },
  "متعطل":       { bg: "#fee2e2", color: "#dc2626", icon: AlertTriangle },
  "قيد الإنشاء": { bg: "#ede9fe", color: "#7c3aed", icon: Clock },
};

export default function WellDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [well, setWell] = useState<Well | null>(null);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/wells/${id}`).then(r => r.json()),
      fetch(`/api/maintenance?wellId=${id}`).then(r => r.json()),
      fetch(`/api/reports?wellId=${id}`).then(r => r.json()),
    ]).then(([w, m, rep]) => {
      if (w.error) { setError(w.error); }
      else { setWell(w); }
      setMaintenance(Array.isArray(m) ? m : []);
      setReports(Array.isArray(rep) ? rep : []);
    }).catch(() => setError("فشل تحميل بيانات البئر")).finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm(`هل تريد حذف البئر "${well?.name}"؟ لا يمكن التراجع عن هذه العملية.`)) return;
    await fetch(`/api/wells/${id}`, { method: "DELETE" });
    router.push("/dashboard/wells");
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-96">
      <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  );

  if (error || !well) return (
    <div className="p-8 text-center">
      <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
      <p className="text-red-600 font-medium">{error || "البئر غير موجود"}</p>
      <Link href="/dashboard/wells" className="text-blue-500 text-sm mt-2 inline-block">← العودة للقائمة</Link>
    </div>
  );

  const st = statusConfig[well.status] || { bg: "#f3f4f6", color: "#6b7280", icon: Activity };
  const StatusIcon = st.icon;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/wells" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowRight className="w-5 h-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-black text-gray-800">{well.name}</h1>
            <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: st.bg, color: st.color }}>
              {well.status}
            </span>
            <span className="text-xs text-gray-400 font-mono">{well.wellId}</span>
          </div>
          <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
            <MapPin className="w-4 h-4" /> {well.region}{well.location ? ` — ${well.location}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/wells/${id}/edit`} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm hover:bg-gray-50 transition-colors">
            <Edit className="w-4 h-4" /> تعديل
          </Link>
          <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm hover:bg-red-50 transition-colors">
            <Trash2 className="w-4 h-4" /> حذف
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Details */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-500" /> بيانات البئر
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "نوع البئر", value: well.type },
                { label: "العمق", value: well.depth ? `${well.depth} م` : "—" },
                { label: "نوع الغلاف", value: well.casingType || "—" },
                { label: "نوع المضخة", value: well.pumpType || "—" },
                { label: "جودة المياه", value: well.waterQuality || "—" },
                { label: "تكلفة الحفر", value: well.cost ? `${well.cost.toLocaleString()} د.ل` : "—" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">{label}</p>
                  <p className="text-sm font-semibold text-gray-800">{value}</p>
                </div>
              ))}
            </div>
            {well.notes && (
              <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-600 font-medium mb-1">ملاحظات</p>
                <p className="text-sm text-blue-800">{well.notes}</p>
              </div>
            )}
          </div>

          {/* Maintenance */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-orange-500" /> سجلات الصيانة ({maintenance.length})
              </h2>
              <Link href="/dashboard/maintenance" className="text-xs text-blue-500 hover:underline">عرض الكل</Link>
            </div>
            {maintenance.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">لا توجد سجلات صيانة</p>
            ) : (
              <div className="space-y-3">
                {maintenance.slice(0, 5).map(m => (
                  <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{m.type}</p>
                      <p className="text-xs text-gray-500">{m.technician} · {new Date(m.createdAt).toLocaleDateString("ar-LY")}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs px-2 py-1 rounded-full" style={{
                        backgroundColor: m.status === "مكتملة" ? "#dcfce7" : m.status === "قيد التنفيذ" ? "#fef3c7" : "#fee2e2",
                        color: m.status === "مكتملة" ? "#16a34a" : m.status === "قيد التنفيذ" ? "#d97706" : "#dc2626",
                      }}>
                        {m.status}
                      </span>
                      {m.cost && <p className="text-xs text-gray-400 mt-1">{m.cost.toLocaleString()} د.ل</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reports */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-500" /> التقارير ({reports.length})
              </h2>
              <Link href="/dashboard/reports" className="text-xs text-blue-500 hover:underline">عرض الكل</Link>
            </div>
            {reports.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">لا توجد تقارير</p>
            ) : (
              <div className="space-y-3">
                {reports.slice(0, 5).map(r => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{r.title}</p>
                      <p className="text-xs text-gray-500">{r.author} · {new Date(r.createdAt).toLocaleDateString("ar-LY")}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full" style={{
                      backgroundColor: r.status === "معتمد" ? "#dcfce7" : r.status === "قيد المراجعة" ? "#fef3c7" : "#f3f4f6",
                      color: r.status === "معتمد" ? "#16a34a" : r.status === "قيد المراجعة" ? "#d97706" : "#6b7280",
                    }}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          {/* Status card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-800 mb-4">الحالة الراهنة</h2>
            <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ backgroundColor: st.bg }}>
              <StatusIcon className="w-8 h-8" style={{ color: st.color }} />
              <div>
                <p className="font-bold text-lg" style={{ color: st.color }}>{well.status}</p>
                <p className="text-xs" style={{ color: st.color, opacity: 0.7 }}>حالة البئر الحالية</p>
              </div>
            </div>
          </div>

          {/* Location */}
          {(well.latitude && well.longitude) && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500" /> الموقع الجغرافي
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">خط العرض</span>
                  <span className="font-mono font-medium">{well.latitude.toFixed(4)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">خط الطول</span>
                  <span className="font-mono font-medium">{well.longitude.toFixed(4)}</span>
                </div>
                <a
                  href={`https://www.google.com/maps?q=${well.latitude},${well.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-blue-200 text-blue-600 text-sm hover:bg-blue-50 transition-colors"
                >
                  <MapPin className="w-4 h-4" /> فتح في الخريطة
                </a>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" /> التواريخ
            </h2>
            <div className="space-y-3">
              {well.drillingDate && (
                <div>
                  <p className="text-xs text-gray-400">تاريخ الحفر</p>
                  <p className="text-sm font-medium">{new Date(well.drillingDate).toLocaleDateString("ar-LY")}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400">تاريخ التسجيل</p>
                <p className="text-sm font-medium">{new Date(well.createdAt).toLocaleDateString("ar-LY")}</p>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-gray-800 mb-4">إجراءات سريعة</h2>
            <div className="space-y-2">
              <Link href={`/dashboard/maintenance?wellId=${id}`} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors border border-gray-100">
                <Wrench className="w-4 h-4 text-orange-500" /> إضافة صيانة
              </Link>
              <Link href={`/dashboard/reports?wellId=${id}`} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors border border-gray-100">
                <FileText className="w-4 h-4 text-purple-500" /> إضافة تقرير
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
