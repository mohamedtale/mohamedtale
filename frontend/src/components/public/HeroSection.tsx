'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function HeroSection() {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('public');

  return (
    <section className="relative bg-gradient-to-br from-[#0D47A1] via-[#1565C0] to-[#1976D2] overflow-hidden min-h-[600px] flex items-center">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Decorative circles */}
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[#42A5F5] opacity-10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-[#42A5F5] opacity-10 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-28 h-28 bg-white rounded-full p-3 shadow-2xl">
            <Image src="/logo.svg" alt="Authority Logo" width={96} height={96} className="w-full h-full" />
          </div>
        </div>

        {/* Arabic name */}
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2 leading-tight">
          {t('hero.titleAr')}
        </h1>

        {/* English name */}
        <h2 className="text-lg sm:text-xl text-[#90CAF9] mb-6 font-medium">
          {t('hero.titleEn')}
        </h2>

        {/* Divider */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px w-16 bg-[#42A5F5]" />
          <div className="w-2 h-2 rounded-full bg-[#42A5F5]" />
          <div className="h-px w-16 bg-[#42A5F5]" />
        </div>

        {/* Tagline */}
        <p className="text-xl text-[#BBDEFB] mb-8 max-w-2xl mx-auto leading-relaxed">
          {t('hero.tagline')}
        </p>

        {/* CTA buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href={`/${locale}/projects`}
            className="bg-white text-[#1565C0] hover:bg-[#E3F2FD] px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg"
          >
            {t('hero.cta.projects')}
          </Link>
          <Link
            href={`/${locale}/contact`}
            className="border-2 border-white text-white hover:bg-white hover:text-[#1565C0] px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            {t('hero.cta.contact')}
          </Link>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-12 fill-white">
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z"/>
          </svg>
        </div>
      </div>
    </section>
  );
}
