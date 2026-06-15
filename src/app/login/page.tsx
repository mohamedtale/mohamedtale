"use client";
import { useState } from "react";
import { Droplets } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f1c35] to-[#1e2d4e] flex items-center justify-center p-6" dir="rtl">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-4">
              <Droplets size={32} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-[#1e2d4e]">الجهاز التنفيذي</h1>
            <p className="text-gray-500 text-sm mt-1">حفر وصيانة آبار المياه</p>
          </div>

          <h2 className="text-lg font-semibold text-gray-800 mb-6 text-center">تسجيل الدخول</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="example@water.gov.ly"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Link
              href="/dashboard"
              className="w-full bg-[#3b82f6] hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors text-center block"
            >
              تسجيل الدخول
            </Link>
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="text-blue-500 hover:text-blue-700 text-sm">
              العودة للصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
