'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

export default function LocaleHome() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace(`/${locale}/dashboard`);
    } else {
      router.replace(`/${locale}/login`);
    }
  }, [locale, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-ministry-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-ministry-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">جاري التحميل...</p>
      </div>
    </div>
  );
}
