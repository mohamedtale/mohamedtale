'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

const VALUES = [
  { icon: '🎯', title: 'الكفاءة', titleEn: 'Efficiency', desc: 'إنجاز المشاريع بأعلى معايير الجودة وفي الوقت المحدد' },
  { icon: '🤝', title: 'الشفافية', titleEn: 'Transparency', desc: 'العمل بشفافية تامة ومساءلة مع جميع أصحاب المصلحة' },
  { icon: '🌿', title: 'الاستدامة', titleEn: 'Sustainability', desc: 'الحفاظ على الموارد المائية للأجيال القادمة' },
  { icon: '💡', title: 'الابتكار', titleEn: 'Innovation', desc: 'تبني أحدث التقنيات في حفر وصيانة الآبار' },
];

const DEPARTMENTS = [
  { name: 'قسم الحفر والتنقيب', nameEn: 'Drilling & Exploration', icon: '🔩' },
  { name: 'قسم الصيانة والتشغيل', nameEn: 'Maintenance & Operations', icon: '🔧' },
  { name: 'قسم الدراسات والتصميم', nameEn: 'Studies & Design', icon: '📐' },
  { name: 'قسم جودة المياه', nameEn: 'Water Quality', icon: '💧' },
  { name: 'قسم التقنية والمعلوماتية', nameEn: 'Technology & IT', icon: '💻' },
  { name: 'قسم المشتريات والعقود', nameEn: 'Procurement & Contracts', icon: '📋' },
];

export default function AboutPage() {
  const t = useTranslations('public');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0D47A1] to-[#1565C0] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">{t('about.title')}</h1>
          <p className="text-[#BBDEFB] text-lg max-w-2xl mx-auto">{t('about.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        {/* Mission & Vision */}
        <section className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 hover:border-[#42A5F5] transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#E3F2FD] rounded-xl flex items-center justify-center text-2xl">🎯</div>
              <h2 className="text-2xl font-bold text-[#1565C0]">{t('about.mission')}</h2>
            </div>
            <p className="text-gray-600 leading-relaxed text-lg">{t('about.missionText')}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 hover:border-[#42A5F5] transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#E3F2FD] rounded-xl flex items-center justify-center text-2xl">🔭</div>
              <h2 className="text-2xl font-bold text-[#1565C0]">{t('about.vision')}</h2>
            </div>
            <p className="text-gray-600 leading-relaxed text-lg">{t('about.visionText')}</p>
          </div>
        </section>

        {/* History */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#E3F2FD] rounded-xl flex items-center justify-center text-2xl">📖</div>
            <h2 className="text-2xl font-bold text-[#1565C0]">{t('about.history')}</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <p className="text-gray-600 leading-loose text-lg">{t('about.historyText')}</p>

            {/* Timeline visual */}
            <div className="space-y-4">
              {[
                { year: '1990s', event: 'تأسيس الجهاز التنفيذي', eventEn: 'Authority Established' },
                { year: '2000s', event: 'توسعة العمليات عبر ليبيا', eventEn: 'Nationwide Expansion' },
                { year: '2010s', event: 'تبني تقنيات الحفر الحديثة', eventEn: 'Modern Tech Adoption' },
                { year: '2020s', event: 'التحول الرقمي وأنظمة المعلومات', eventEn: 'Digital Transformation' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-20 h-8 bg-[#1565C0] text-white text-sm font-bold rounded-lg flex items-center justify-center flex-shrink-0">
                    {item.year}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{item.event}</p>
                    <p className="text-xs text-gray-400">{item.eventEn}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section>
          <h2 className="text-2xl font-bold text-[#1565C0] mb-8 text-center">{t('about.values')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {VALUES.map((v, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 hover:border-[#42A5F5] hover:shadow-lg transition-all p-6 text-center">
                <div className="text-4xl mb-3">{v.icon}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{v.title}</h3>
                <p className="text-xs text-gray-400 mb-2">{v.titleEn}</p>
                <p className="text-gray-500 text-sm">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Departments */}
        <section>
          <h2 className="text-2xl font-bold text-[#1565C0] mb-8 text-center">{t('about.departments')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {DEPARTMENTS.map((dept, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 hover:border-[#42A5F5] hover:shadow-md transition-all p-5 flex items-center gap-4">
                <div className="w-14 h-14 bg-[#E3F2FD] rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {dept.icon}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{dept.name}</p>
                  <p className="text-xs text-gray-400">{dept.nameEn}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
