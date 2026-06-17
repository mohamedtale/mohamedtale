"use client";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, FileText } from "lucide-react";

export default function ApprovalPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/reports?status=قيد المراجعة").then(r => r.json()).then(d => setReports(Array.isArray(d) ? d : [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const action = async (id: string, status: string) => {
    setUpdating(id);
    await fetch(`/api/reports/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, approvedAt: status === "معتمد" ? new Date() : null }),
    });
    setMsg(status === "معتمد" ? "تم اعتماد التقرير ✓" : "تم رفض التقرير");
    setUpdating(null);
    load();
    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-800">اعتماد التقارير</h1>
        <p className="text-gray-500 text-sm mt-1">التقارير المنتظرة للمراجعة والاعتماد</p>
      </div>

      {msg && <div className="mb-4 px-4 py-3 rounded-xl bg-blue-50 text-blue-700 text-sm border border-blue-200">{msg}</div>}

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-24" />)}</div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
          <CheckCircle className="w-12 h-12 text-green-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">لا توجد تقارير بانتظار الاعتماد</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((r: any) => (
            <div key={r.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#fef3c7" }}>
                  <FileText className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800">{r.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.type} • الكاتب: {r.author} • {new Date(r.createdAt).toLocaleDateString("ar-LY")}</p>
                  {r.content && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{r.content}</p>}
                </div>
              </div>
              <div className="flex gap-3 mt-4 justify-end">
                <button onClick={() => action(r.id, "مرفوض")} disabled={updating === r.id}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-red-600 border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50">
                  <XCircle className="w-4 h-4" /> رفض
                </button>
                <button onClick={() => action(r.id, "معتمد")} disabled={updating === r.id}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#16a34a,#22c55e)" }}>
                  <CheckCircle className="w-4 h-4" /> اعتماد
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
