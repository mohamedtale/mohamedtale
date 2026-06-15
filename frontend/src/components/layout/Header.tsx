'use client';

import { useRouter, useParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/lib/api';

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const locale = params.locale as string;
  const { user, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    logout();
    router.replace(`/${locale}/login`);
  };

  const switchLocale = () => {
    const newLocale = locale === 'ar' ? 'en' : 'ar';
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-20">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title || 'لوحة التحكم'}</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          {new Date().toLocaleDateString(locale === 'ar' ? 'ar-LY' : 'en-GB', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })}
        </p>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-3">
        {/* Language switcher */}
        <button
          onClick={switchLocale}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          {locale === 'ar' ? 'English' : 'عربي'}
        </button>

        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 py-1.5 px-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-ministry-700 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user?.full_name_ar?.charAt(0) || 'م'}
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.full_name_ar}</p>
              <p className="text-xs text-gray-500">{user?.username}</p>
            </div>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
              <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-20 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.full_name_ar}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {t('nav.logout')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
