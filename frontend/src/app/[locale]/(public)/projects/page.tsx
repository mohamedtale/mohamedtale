'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import ProjectCard, { Project } from '@/components/public/ProjectCard';

const ALL_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'حفر آبار المياه في منطقة الجفارة',
    location: 'طرابلس الكبرى',
    status: 'completed',
    description: 'مشروع حفر 25 بئراً ارتوازياً في منطقة الجفارة لتأمين المياه لأكثر من 50,000 مواطن. شمل المشروع تركيب مضخات ومحطات معالجة.',
    year: '2023',
    wellsCount: 25,
  },
  {
    id: '2',
    title: 'صيانة شبكة آبار محافظة مصراتة',
    location: 'مصراتة',
    status: 'ongoing',
    description: 'مشروع صيانة شامل لـ 40 بئراً موزعة على مختلف أحياء ومناطق محافظة مصراتة، يشمل استبدال المعدات وتحديث أنظمة الضخ.',
    year: '2024',
    wellsCount: 40,
  },
  {
    id: '3',
    title: 'مشروع آبار الجنوب الليبي - سبها',
    location: 'سبها',
    status: 'completed',
    description: 'حفر آبار عميقة في منطقة سبها للوصول إلى المياه الجوفية في أعماق تتجاوز 400 متر، مع تركيب منظومة طاقة شمسية للضخ.',
    year: '2022',
    wellsCount: 15,
  },
  {
    id: '4',
    title: 'حفر آبار طرابلس الكبرى',
    location: 'طرابلس',
    status: 'ongoing',
    description: 'مشروع متكامل لحفر وتجهيز آبار المياه في مناطق طرابلس الكبرى لدعم شبكة المياه الحضرية وتقليل الضغط على الشبكة الرئيسية.',
    year: '2024',
    wellsCount: 18,
  },
  {
    id: '5',
    title: 'مشروع تطوير منظومة المياه - بنغازي',
    location: 'بنغازي',
    status: 'planned',
    description: 'مشروع طموح لتطوير منظومة آبار المياه في بنغازي وضواحيها بأحدث التقنيات الأوروبية في حفر الآبار العميقة.',
    year: '2025',
    wellsCount: 30,
  },
  {
    id: '6',
    title: 'آبار الزنتان والجبل الغربي',
    location: 'الزنتان',
    status: 'completed',
    description: 'تأمين المياه لمنطقة الجبل الغربي عبر حفر آبار متعددة وتشغيل محطات ضخ متطورة تخدم عشرات القرى والتجمعات السكنية.',
    year: '2022',
    wellsCount: 12,
  },
  {
    id: '7',
    title: 'مشروع آبار زليتن الساحلية',
    location: 'زليتن',
    status: 'completed',
    description: 'حفر وتجهيز آبار في منطقة زليتن الساحلية مع دراسة متكاملة لجودة المياه ومعدلات الاستخراج الآمنة للحفاظ على المخزون المائي.',
    year: '2021',
    wellsCount: 10,
  },
  {
    id: '8',
    title: 'مشروع آبار طبرق والشرق الليبي',
    location: 'طبرق',
    status: 'completed',
    description: 'تعزيز منظومة المياه الجوفية في منطقة طبرق وما يحيط بها من مناطق الشرق الليبي عبر حفر وصيانة منظومة متكاملة من الآبار.',
    year: '2021',
    wellsCount: 20,
  },
  {
    id: '9',
    title: 'مشروع الخمس وتاجوراء',
    location: 'الخمس',
    status: 'ongoing',
    description: 'توسعة شبكة آبار المياه في منطقة الخمس وتاجوراء لمواكبة النمو السكاني المتزايد وتأمين المياه لأحياء جديدة.',
    year: '2024',
    wellsCount: 14,
  },
];

type FilterStatus = 'all' | 'completed' | 'ongoing' | 'planned';

export default function ProjectsPage() {
  const t = useTranslations('public');
  const [filter, setFilter] = useState<FilterStatus>('all');

  const filtered = filter === 'all'
    ? ALL_PROJECTS
    : ALL_PROJECTS.filter((p) => p.status === filter);

  const filters: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: t('projects.filterAll') },
    { key: 'completed', label: t('projects.status.completed') },
    { key: 'ongoing', label: t('projects.status.ongoing') },
    { key: 'planned', label: t('projects.filterAll') === 'الكل' ? 'مخطط' : 'Planned' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#0D47A1] to-[#1565C0] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">{t('projects.allProjects')}</h1>
          <p className="text-[#BBDEFB] text-lg">{t('projects.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3 mb-10 justify-center">
          {[
            { key: 'all' as FilterStatus, label: t('projects.filterAll') },
            { key: 'completed' as FilterStatus, label: t('projects.status.completed') },
            { key: 'ongoing' as FilterStatus, label: t('projects.status.ongoing') },
            { key: 'planned' as FilterStatus, label: t('projects.filterAll') === 'الكل' ? 'مخطط' : 'Planned' },
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

        {filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-20">{t('projects.noProjects')}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
