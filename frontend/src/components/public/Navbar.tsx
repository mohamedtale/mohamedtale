'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const params = useParams();
  const pathname = usePathname();
  const locale = params.locale as string;
  const t = useTranslations('public');
  const isRTL = locale === 'ar';

  const otherLocale = locale === 'ar' ? 'en' : 'ar';
  // Build locale-switched path
  const switchedPath = pathname.replace(`/${locale}`, `/${otherLocale}`);

  const navLinks = [
    { href: `/${locale}`, label: t('nav.home') },
    { href: `/${locale}/about`, label: t('nav.about') },
    { href: `/${locale}/projects`, label: t('nav.projects') },
    { href: `/${locale}/achievements`, label: t('nav.achievements') },
    { href: `/${locale}/news`, label: t('nav.news') },
    { href: `/${locale}/contact`, label: t('nav.contact') },
  ];

  return (
    <nav className="bg-[#1565C0] shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Title */}
          <Link href={`/${locale}`} className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1">
              <Image src="/logo.svg" alt="Logo" width={36} height={36} />
            </div>
            <div className="hidden sm:block">
              <p className="text-white font-bold text-sm leading-tight">
                {locale === 'ar' ? 'الجهاز التنفيذي لحفر وصيانة آبار المياه' : 'Executive Authority for Water Wells'}
              </p>
              <p className="text-[#90CAF9] text-xs">
                {locale === 'ar' ? 'ليبيا' : 'Libya'}
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white hover:text-[#BBDEFB] hover:bg-[#0D47A1] px-3 py-2 rounded text-sm font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Locale switcher */}
            <Link
              href={switchedPath}
              className="text-[#BBDEFB] hover:text-white border border-[#42A5F5] hover:border-white px-3 py-1.5 rounded text-sm transition-colors"
            >
              {otherLocale === 'ar' ? 'العربية' : 'English'}
            </Link>
            {/* Staff login */}
            <Link
              href={`/${locale}/login`}
              className="bg-white text-[#1565C0] hover:bg-[#E3F2FD] px-4 py-1.5 rounded font-semibold text-sm transition-colors"
            >
              {t('nav.staffLogin')}
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-white p-2 rounded hover:bg-[#0D47A1]"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0D47A1] border-t border-[#1976D2]">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block text-white hover:bg-[#1565C0] px-3 py-2 rounded text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-[#1976D2] pt-2 mt-2 flex gap-2">
              <Link href={switchedPath} className="text-[#BBDEFB] border border-[#42A5F5] px-3 py-1.5 rounded text-sm">
                {otherLocale === 'ar' ? 'العربية' : 'English'}
              </Link>
              <Link href={`/${locale}/login`} className="bg-white text-[#1565C0] px-4 py-1.5 rounded font-semibold text-sm">
                {t('nav.staffLogin')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
