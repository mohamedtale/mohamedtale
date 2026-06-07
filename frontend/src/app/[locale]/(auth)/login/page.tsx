'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import type { User } from '@/types';

const DEMO_CREDENTIALS = [
  { role: 'مدير النظام', username: 'admin', password: 'Admin@123' },
  { role: 'مدير القسم', username: 'manager', password: 'Admin@123' },
  { role: 'موظف', username: 'employee', password: 'Admin@123' },
];

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { login } = useAuthStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login(username, password);
      const { user, accessToken, refreshToken } = response.data;
      login(user as User, accessToken, refreshToken);
      router.replace(`/${locale}/dashboard`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message_ar?: string } } };
      setError(axiosErr.response?.data?.message_ar || 'بيانات الدخول غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (creds: typeof DEMO_CREDENTIALS[0]) => {
    setUsername(creds.username);
    setPassword(creds.password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ministry-900 via-ministry-800 to-ministry-700 flex items-center justify-center p-4" dir="rtl">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <svg className="w-14 h-14 text-ministry-700" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
              <path d="M3.5 12.5h17M3.5 8.5h17M3.5 16.5h17" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('auth.loginTitle')}</h1>
          <p className="text-ministry-200 text-lg">{t('auth.loginSubtitle')}</p>
          <div className="mt-2 w-20 h-1 bg-ministry-300 rounded mx-auto"></div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-ministry-800 to-ministry-600 py-4 px-6">
            <h2 className="text-white text-xl font-semibold text-center">{t('auth.loginWelcome')}</h2>
          </div>

          <div className="p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('auth.username')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ministry-500 focus:border-ministry-500 bg-gray-50 text-gray-900 pr-10"
                    placeholder="أدخل اسم المستخدم"
                    required
                    dir="ltr"
                  />
                  <span className="absolute right-3 top-3.5 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ministry-500 focus:border-ministry-500 bg-gray-50 text-gray-900 pr-10"
                    placeholder="أدخل كلمة المرور"
                    required
                  />
                  <span className="absolute right-3 top-3.5 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-ministry-700 hover:bg-ministry-800 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    جاري الدخول...
                  </span>
                ) : t('auth.loginButton')}
              </button>
            </form>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('auth.demoCredentials')} - للتجربة
          </h3>
          <div className="space-y-2">
            {DEMO_CREDENTIALS.map((cred) => (
              <button
                key={cred.username}
                onClick={() => fillDemo(cred)}
                className="w-full text-right px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center justify-between"
              >
                <span className="text-ministry-200 text-xs font-mono" dir="ltr">{cred.username} / {cred.password}</span>
                <span className="text-sm font-medium">{cred.role}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-ministry-300 text-sm mt-6">
          &copy; {new Date().getFullYear()} - وزارة الموارد المائية - ليبيا
        </p>
      </div>
    </div>
  );
}
