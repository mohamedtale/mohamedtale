'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import NewsCard, { NewsItem } from '@/components/public/NewsCard';

const ALL_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'افتتاح مشروع آبار الجفارة الجديد',
    excerpt: 'أعلن الجهاز التنفيذي لحفر وصيانة آبار المياه عن الانتهاء من تنفيذ مشروع آبار منطقة الجفارة وتشغيله رسمياً، مما سيوفر المياه النقية لآلاف المواطنين في المنطقة.',
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
  {
    id: '4',
    title: 'اتفاقية تعاون مع شركة متخصصة في حفر الآبار العميقة',
    excerpt: 'وقّع الجهاز اتفاقية تعاون مع شركة دولية متخصصة في حفر الآبار العميقة بهدف الاستفادة من خبراتها في مشاريع الجنوب الليبي.',
    date: '5 مارس 2024',
    category: 'announcement',
  },
  {
    id: '5',
    title: 'زيارة ميدانية لمشاريع آبار سبها',
    excerpt: 'قام فريق فني من الجهاز بزيارة ميدانية لمشاريع آبار منطقة سبها للاطلاع على سير العمل ومستوى الإنجاز والتأكد من مطابقة المواصفات الفنية.',
    date: '28 فبراير 2024',
    category: 'news',
  },
  {
    id: '6',
    title: 'إطلاق برنامج تدريبي لكوادر الحفر الوطنية',
    excerpt: 'أطلق الجهاز برنامجاً تدريبياً مكثفاً يستهدف رفع كفاءة الكوادر الوطنية في مجال حفر وصيانة الآبار، بمشاركة خبراء محليين ودوليين.',
    date: '15 فبراير 2024',
    category: 'event',
  },
];

type CategoryFilter = 'all' | 'news' | 'announcement' | 'event';

export default function NewsPage() {
  const t = useTranslations('public');
  const [filter, setFilter] = useState<CategoryFilter>('all');

  const filtered = filter === 'all'
    ? ALL_NEWS
    : ALL_NEWS.filter((n) => n.category === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0D47A1] to-[#1565C0] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">{t('news.allNews')}</h1>
          <p className="text-[#BBDEFB] text-lg">{t('news.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-3 mb-10 justify-center">
          {[
            { key: 'all' as CategoryFilter, label: t('projects.filterAll') },
            { key: 'news' as CategoryFilter, label: t('news.category.news') },
            { key: 'announcement' as CategoryFilter, label: t('news.category.announcement') },
            { key: 'event' as CategoryFilter, label: t('news.category.event') },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-6 py-2 rounded-full font-medium text-sm transition-colors ${
                filter === f.key
                  ? 'bg-[#1565C0] text-white shadow-lg'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#42A5F5]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
