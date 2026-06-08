'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('public');

  return (
    <footer className="bg-[#0D47A1] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Authority info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white rounded-full p-1.5 flex-shrink-0">
                <Image src="/logo.svg" alt="Logo" width={40} height={40} />
              </div>
              <div>
                <p className="font-bold text-sm leading-tight">
                  {locale === 'ar'
                    ? 'الجهاز التنفيذي لحفر وصيانة آبار المياه'
                    : 'Executive Authority for Drilling & Maintaining Water Wells'}
                </p>
                <p className="text-[#90CAF9] text-xs mt-0.5">
                  {locale === 'ar' ? 'ليبيا' : 'Libya'}
                </p>
              </div>
            </div>
            <p className="text-[#BBDEFB] text-sm leading-relaxed">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-semibold text-[#42A5F5] mb-4 text-sm uppercase tracking-wider">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-2">
              {[
                { href: `/${locale}`, label: t('nav.home') },
                { href: `/${locale}/about`, label: t('nav.about') },
                { href: `/${locale}/projects`, label: t('nav.projects') },
                { href: `/${locale}/news`, label: t('nav.news') },
                { href: `/${locale}/contact`, label: t('nav.contact') },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#BBDEFB] hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h3 className="font-semibold text-[#42A5F5] mb-4 text-sm uppercase tracking-wider">
              {t('footer.contactInfo')}
            </h3>
            <ul className="space-y-3 text-[#BBDEFB] text-sm">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#42A5F5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{t('footer.address')}</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0 text-[#42A5F5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span dir="ltr">+218 21 XXX XXXX</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0 text-[#42A5F5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>info@water-wells.ly</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#1565C0] mt-8 pt-6 text-center text-[#90CAF9] text-sm">
          <p>
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}
