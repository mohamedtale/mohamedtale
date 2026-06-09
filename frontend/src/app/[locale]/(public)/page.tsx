'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import HeroSection from '@/components/public/HeroSection';
import StatsCounter from '@/components/public/StatsCounter';
import ProjectCard, { Project } from '@/components/public/ProjectCard';
import NewsCard, { NewsItem } from '@/components/public/NewsCard';

const PublicMap = dynamic(() => import('@/components/public/PublicMap'), { ssr: false });

const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'حفر آبار المياه في منطقة الجفارة',
    location: 'طرابلس الكبرى',
    status: 'completed',
    description: 'مشروع حفر 25 بئراً ارتوازياً في منطقة الجفارة لتأمين المياه لأكثر من 50,000 مواطن.',
    year: '2023',
    wellsCount: 25,
  },
  {
    id: '2',
    title: 'صيانة شبكة آبار محافظة مصراتة',
    location: 'مصراتة',
    status: 'ongoing',
    description: 'مشروع صيانة شامل لـ 40 بئراً موزعة على مختلف أحياء ومناطق محافظة مصراتة.',
    year: '2024',
    wellsCount: 40,
  },
  {
    id: '3',
    title: 'مشروع آبار الجنوب الليبي - سبها',
    location: 'سبها',
    status: 'completed',
    description: 'حفر آبار عميقة في منطقة سبها للوصول إلى المياه الجوفية في أعماق تتجاوز 400 متر.',
    year: '2022',
    wellsCount: 15,
  },
  {
    id: '4',
    title: 'حفر آبار طرابلس الكبرى',
    location: 'طرابلس',
    status: 'ongoing',
    description: 'مشروع متكامل لحفر وتجهيز آبار المياه في مناطق طرابلس الكبرى لدعم شبكة المياه.',
    year: '2024',
    wellsCount: 18,
  },
  {
    id: '5',
    title: 'مشروع تطوير منظومة المياه - بنغازي',
    location: 'بنغازي',
    status: 'planned',
    description: 'مشروع طموح لتطوير منظومة آبار المياه في بنغازي وضواحيها بأحدث التقنيات.',
    year: '2025',
    wellsCount: 30,
  },
  {
    id: '6',
    title: 'آبار الزنتان والجبل الغربي',
    location: 'الزنتان',
    status: 'completed',
    description: 'تأمين المياه لمنطقة الجبل الغربي عبر حفر آبار متعددة وتشغيل محطات ضخ متطورة.',
    year: '2022',
    wellsCount: 12,
  },
];

const NEWS_ITEMS: NewsItem[] = [
  {
    id: '1',
    title: 'افتتاح مشروع آبار الجفارة الجديد',
    excerpt: 'أعلن الجهاز التنفيذي لحفر وصيانة آبار المياه عن الانتهاء من تنفيذ مشروع آبار منطقة الجفارة وتشغيله رسمياً، مما سيوفر المياه النقية لآلاف المواطنين.',
    date: '15 مايو 2024',
    category: 'news',
  },
  {
    id: '2',
    title: 'الجهاز ينجز 50 بئراً خلال الربع الأول من 2024',
    excerpt: 'أكد الجهاز التنفيذي إنجازه حفر وتجهيز 50 بئراً جديداً خلال الربع الأول من العام الجاري، في إطار خطة عمل طموحة لتعزيز الأمن المائي في ليبيا.',
    date: '10 أبريل 2024',
    category: 'announcement',
  },
  {
    id: '3',
    title: 'ورشة عمل حول تقنيات حفر الآبار الحديثة',
    excerpt: 'نظّم الجهاز ورشة عمل تقنية شارك فيها خبراء من مختلف المحافظات الليبية، تناولت أحدث تقنيات حفر الآبار وأساليب الصيانة الوقائية.',
    date: '20 مارس 2024',
    category: 'event',
  },
];

const GALLERY_COLORS = [
  'from-[#1565C0] to-[#42A5F5]',
  'from-[#0D47A1] to-[#1976D2]',
  'from-[#42A5F5] to-[#90CAF9]',
  'from-[#1976D2] to-[#42A5F5]',
  'from-[#0D47A1] to-[#42A5F5]',
  'from-[#1565C0] to-[#1976D2]',
];

const GALLERY_LABELS = [
  'حفر بئر الجفارة',
  'مشروع سبها',
  'صيانة آبار مصراتة',
  'فريق الميدان',
  'معدات الحفر',
  'آبار بنغازي',
];

export default function PublicHomePage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('public');

  return (
    <>
      <HeroSection />
      <StatsCounter />

      {/* Projects Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1565C0] mb-3">{t('projects.title')}</h2>
            <p className="text-gray-500 max-w-xl mx-auto">{t('projects.subtitle')}</p>
            <div className="w-16 h-1 bg-[#42A5F5] mx-auto rounded-full mt-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {PROJECTS.slice(0, 6).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          <div className="text-center">
            <Link
              href={`/${locale}/projects`}
              className="inline-flex items-center gap-2 bg-[#1565C0] hover:bg-[#0D47A1] text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg"
            >
              {t('projects.viewAll')}
              <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <PublicMap />

      {/* News Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1565C0] mb-3">{t('news.title')}</h2>
            <p className="text-gray-500 max-w-xl mx-auto">{t('news.subtitle')}</p>
            <div className="w-16 h-1 bg-[#42A5F5] mx-auto rounded-full mt-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {NEWS_ITEMS.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>

          <div className="text-center">
            <Link
              href={`/${locale}/news`}
              className="inline-flex items-center gap-2 border-2 border-[#1565C0] text-[#1565C0] hover:bg-[#1565C0] hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              {t('news.viewAll')}
              <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#1565C0] mb-3">{t('gallery.title')}</h2>
            <p className="text-gray-500 max-w-xl mx-auto">{t('gallery.subtitle')}</p>
            <div className="w-16 h-1 bg-[#42A5F5] mx-auto rounded-full mt-3" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1,2,3,4,5,6,7,8,9,10,11,12].map((i) => (
              <div
                key={i}
                className="relative rounded-2xl overflow-hidden h-56 group cursor-pointer hover:scale-[1.02] transition-transform shadow-lg bg-gray-200"
              >
                <img
                  src={`/images/photo${i}.jpg`}
                  alt={`صورة المشروع ${i}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-gradient-to-r from-[#0D47A1] to-[#1565C0] text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">{t('contact.title')}</h2>
          <p className="text-[#BBDEFB] mb-8 text-lg">{t('contact.subtitle')}</p>
          <Link
            href={`/${locale}/contact`}
            className="bg-white text-[#1565C0] hover:bg-[#E3F2FD] px-10 py-3 rounded-lg font-bold text-lg transition-colors shadow-xl"
          >
            {t('contact.title')}
          </Link>
        </div>
      </section>
    </>
  );
}
