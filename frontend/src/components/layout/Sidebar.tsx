'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { canAccess } from '@/lib/auth';

const NAV_ITEMS = [
  {
    key: 'dashboard',
    href: '/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    minRole: 'employee',
  },
  {
    key: 'map',
    href: '/map',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
    minRole: 'employee',
  },
  {
    key: 'wells',
    href: '/wells',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    minRole: 'employee',
  },
  {
    key: 'reports',
    href: '/reports',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    minRole: 'employee',
  },
  {
    key: 'workflows',
    href: '/workflows',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
    minRole: 'employee',
  },
  {
    key: 'users',
    href: '/users',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    minRole: 'department_manager',
  },
  {
    key: 'logs',
    href: '/logs',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    minRole: 'department_manager',
  },
];

export function Sidebar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;
  const { user } = useAuthStore();

  const isActive = (href: string) => {
    const fullPath = `/${locale}${href}`;
    return pathname === fullPath || pathname.startsWith(`/${locale}${href}/`);
  };

  return (
    <aside className="w-64 bg-ministry-900 text-white flex flex-col min-h-screen fixed right-0 top-0 z-30 shadow-2xl">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-ministry-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 p-1">
            <Image src="/logo.png" alt="شعار الجهاز" width={36} height={36} />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight text-white">الجهاز التنفيذي</p>
            <p className="text-ministry-300 text-xs">لحفر وصيانة الآبار</p>
          </div>
        </div>
      </div>

      {/* User info */}
      {user && (
        <div className="px-5 py-3 bg-ministry-800 border-b border-ministry-700">
          <p className="text-sm font-medium text-white truncate">{user.full_name_ar}</p>
          <p className="text-xs text-ministry-300 mt-0.5">
            {user.role === 'system_admin' ? 'مدير النظام' :
             user.role === 'department_manager' ? 'مدير القسم' :
             user.role === 'section_head' ? 'رئيس الوحدة' : 'موظف'}
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="space-y-1 px-3">
          {NAV_ITEMS.filter(item => canAccess(user, item.minRole)).map((item) => (
            <Link
              key={item.key}
              href={`/${locale}${item.href}`}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group',
                isActive(item.href)
                  ? 'bg-ministry-600 text-white shadow-md'
                  : 'text-ministry-200 hover:bg-ministry-800 hover:text-white'
              )}
            >
              <span className={cn(
                'flex-shrink-0',
                isActive(item.href) ? 'text-white' : 'text-ministry-400 group-hover:text-white'
              )}>
                {item.icon}
              </span>
              <span className="text-sm font-medium">{t(item.key)}</span>
              {isActive(item.href) && (
                <span className="mr-auto w-1.5 h-1.5 bg-white rounded-full"></span>
              )}
            </Link>
          ))}
        </div>

        {/* Sections Label */}
        <div className="px-5 mt-6 mb-2">
          <p className="text-xs font-semibold text-ministry-500 uppercase tracking-wider">الأقسام</p>
        </div>
        <div className="px-3 space-y-0.5">
          {[
            { label: 'خريطة الآبار والتخصيص', icon: '📍' },
            { label: 'التقارير الفنية', icon: '📊' },
            { label: 'المتابعة الأسبوعية', icon: '🔧' },
            { label: 'قاعدة بيانات المياه والتربة', icon: '🧪' },
            { label: 'تصميم الآبار والصخور', icon: '⚙️' },
            { label: 'العقود والإشعارات', icon: '📋' },
          ].map((section) => (
            <div key={section.label}
              className="flex items-center gap-2 px-3 py-1.5 text-ministry-400 text-xs rounded-lg">
              <span>{section.icon}</span>
              <span className="truncate">{section.label}</span>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-ministry-700">
        <p className="text-xs text-ministry-500 text-center">
          وزارة الموارد المائية - ليبيا
        </p>
        <p className="text-xs text-ministry-600 text-center mt-0.5">v1.0.0</p>
      </div>
    </aside>
  );
}
