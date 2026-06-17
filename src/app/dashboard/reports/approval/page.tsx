"use client";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, FileText, RefreshCw } from "lucide-react";

export default function ReportApprovalPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/reports").then(r => r.json()).then(d => {
      const pending = Array.isArray(d) ? d.filter((r: any) => r.status === "قيد المراجعة") : [];
      setReports(pending);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const action = async (id: string, status: string) => {
    setProcessing(id);
    try {
      const body: any = { status };
      if (status === "معتمد") body.approvedAt = new Date().toISOString();
      await fetch(`/api/reports/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      setMsg(status === "معتمد" ? "تم اعتماد التقرير ✓" : "تم رفض التقرير");
      load();
    } finally {
      setProcessing(null);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  return (
    <div className="p-6 lg:p-8" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800">اعتماد التقارير</h1>
          <p className="text-gray-500 text-sm mt-1">التقارير قيد المراجعة في انتظار القرار</p>
        </div>
        <button onClick={load} className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50">
          <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {msg && <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 text-green-700 text-sm border border-green-200">{msg}</div>}

      {loading ? (
        <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-24" />)}</div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
          <CheckCircle className="w-14 h-14 text-green-200 mx-auto mb-3" />
          <p className="text-gray-500 font-semibold">لا توجد تقارير معلقة</p>
          <p className="text-gray-400 text-sm mt-1">جميع التقارير تمت مراجعتها</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((r: any) => (
            <div key={r.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#fef3c7" }}>
                  <FileText className="w-6 h-6 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800">{r.title}</p>
                  <p className="text-sm text-gray-500 mt-1">النوع: {r.type}</p>
                  <p className="text-sm text-gray-500">المُعِد: {r.author}{r.reviewer ? ` • المراجع: ${r.reviewer}` : ""}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(r.createdAt).toLocaleDateString("ar-LY")}</p>
                  {r.content && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-600">{r.content}</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button onClick={() => action(r.id, "معتمد")} disabled={processing === r.id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-colors"
                    style={{ backgroundColor: "#16a34a" }}>
                    <CheckCircle className="w-4 h-4" /> اعتماد
                  </button>
                  <button onClick={() => action(r.id, "مرفوض")} disabled={processing === r.id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-colors"
                    style={{ backgroundColor: "#dc2626" }}>
                    <XCircle className="w-4 h-4" /> رفض
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
