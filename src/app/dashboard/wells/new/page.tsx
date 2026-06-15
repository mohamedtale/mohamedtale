"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const steps = ["المعلومات الأساسية", "الموقع الجغرافي", "المواصفات الفنية", "المعدات", "نتائج الحفر", "المراجعة"];

export default function NewWellPage() {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#1e2d4e] mb-6">إدخال بيانات بئر جديد</h1>

      {/* Progress */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-2 transition-colors ${
                i < currentStep ? 'bg-green-500 text-white' :
                i === currentStep ? 'bg-blue-500 text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                {i < currentStep ? '✓' : i + 1}
              </div>
              <div className={`text-xs text-center hidden md:block ${i === currentStep ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                {step}
              </div>
              {i < steps.length - 1 && (
                <div className={`hidden md:block absolute h-0.5 w-full top-4 right-1/2 ${i < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-center text-sm text-gray-500">الخطوة {currentStep + 1} من {steps.length}</div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-[#1e2d4e] mb-6">{steps[currentStep]}</h2>

        {currentStep === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم البئر</label>
              <input placeholder="أدخل اسم البئر" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم البئر</label>
              <input placeholder="W-001" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الحفر</label>
              <input type="date" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الموقع الجغرافي</label>
              <input placeholder="أدخل الموقع" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المنطقة</label>
              <select className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>اختر المنطقة</option>
                <option>طرابلس</option>
                <option>بنغازي</option>
                <option>مصراتة</option>
                <option>سبها</option>
                <option>الزاوية</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">خط العرض (Latitude)</label>
              <input placeholder="32.7576" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">خط الطول (Longitude)</label>
              <input placeholder="12.8738" className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        )}

        {currentStep > 0 && (
          <div className="flex items-center justify-center h-48 text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-3">📝</div>
              <div>محتوى الخطوة {currentStep + 1}</div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-6 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} />
          السابق
        </button>
        <span className="text-sm text-gray-500">الخطوة {currentStep + 1} من {steps.length}</span>
        <button
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep === steps.length - 1}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          التالي
          <ChevronLeft size={16} />
        </button>
      </div>
    </div>
  );
}
