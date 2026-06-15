'use client';

import { useTranslations } from 'next-intl';

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: 'news' | 'announcement' | 'event';
}

const categoryColors: Record<string, string> = {
  news: 'bg-blue-100 text-blue-800',
  announcement: 'bg-amber-100 text-amber-800',
  event: 'bg-green-100 text-green-800',
};

interface NewsCardProps {
  item: NewsItem;
}

export default function NewsCard({ item }: NewsCardProps) {
  const t = useTranslations('public');

  return (
    <article className="bg-white rounded-2xl border border-gray-100 hover:border-[#42A5F5] hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Top accent */}
      <div className="h-1.5 bg-gradient-to-r from-[#42A5F5] to-[#1565C0]" />

      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${categoryColors[item.category]}`}>
            {t(`news.category.${item.category}`)}
          </span>
          <time className="text-gray-400 text-sm">{item.date}</time>
        </div>

        <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-[#1565C0] transition-colors leading-snug line-clamp-2">
          {item.title}
        </h3>

        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4">
          {item.excerpt}
        </p>

        <button className="text-[#1565C0] hover:text-[#42A5F5] text-sm font-semibold transition-colors flex items-center gap-1">
          {t('news.readMore')}
          <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </article>
  );
}
