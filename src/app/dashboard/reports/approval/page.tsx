"use client";
import { CheckCircle, XCircle, FileText, User, Calendar } from "lucide-react";

const pending = [
  { id: 1, title: "تقرير فحص جودة المياه - بئر طرابلس الجديد", author: "د. محمد الصقم", well: "بئر طرابلس الجديد", date: "2024-06-05", page: "3 من 5" },
  { id: 2, title: "تقرير الصيانة الدورية - بئر سرت", author: "م. خالد أحمد", well: "بئر سرت", date: "2024-06-07", page: "2 من 5" },
  { id: 3, title: "دراسة جيولوجية - منطقة الكفرة الشرقي", author: "د. فاطمة علي", well: "بئر الكفرة الشرقي", date: "2024-06-08", page: "4 من 5" },
];

export default function ReportApprovalPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">اعتماد التقارير</h1>
        <p className="text-gray-500 text-sm mt-1">متابعة سير العمل واعتماد التقارير الفنية</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-bold text-slate-800">التقارير قيد المراجعة</h2>
          <p className="text-xs text-gray-500 mt-1">متابعة سير العمل واعتماد التقارير الفنية</p>
        </div>
        <div className="divide-y divide-gray-50">
          {pending.map((report) => (
            <div key={report.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <FileText size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs text-orange-600 font-medium bg-orange-50 inline-block px-2 py-0.5 rounded-full mb-1">قيد المراجعة</div>
                    <h3 className="font-semibold text-slate-800 text-sm">{report.title}</h3>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><User size={12} /> الكاتب: {report.author}</span>
                      <span className="flex items-center gap-1"><Calendar size={12} /> {report.date}</span>
                      <span className="text-blue-600 font-medium">الصفحة {report.page}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-green-700 transition-colors">
                    <CheckCircle size={14} />
                    <span>اعتماد</span>
                  </button>
                  <button className="flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">
                    <XCircle size={14} />
                    <span>رفض</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
