'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

function AnimatedNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <div ref={ref} className="text-5xl font-extrabold text-[#1565C0]">+{count.toLocaleString()}{suffix}</div>;
}

const REGION_DATA = [
  { region: 'طرابلس', regionEn: 'Tripoli', wells: 120, projects: 45, percentage: 24 },
  { region: 'بنغازي', regionEn: 'Benghazi', wells: 95, projects: 38, percentage: 19 },
  { region: 'مصراتة', regionEn: 'Misrata', wells: 75, projects: 28, percentage: 15 },
  { region: 'سبها', regionEn: 'Sabha', wells: 60, projects: 22, percentage: 12 },
  { region: 'الزنتان', regionEn: 'Zintan', wells: 45, projects: 18, percentage: 9 },
  { region: 'طبرق', regionEn: 'Tobruk', wells: 40, projects: 15, percentage: 8 },
  { region: 'زليتن', regionEn: 'Zliten', wells: 35, projects: 14, percentage: 7 },
  { region: 'أخرى', regionEn: 'Others', wells: 30, projects: 20, percentage: 6 },
];

const YEAR_DATA = [
  { year: '2018', wells: 28 },
  { year: '2019', wells: 35 },
  { year: '2020', wells: 22 },
  { year: '2021', wells: 45 },
  { year: '2022', wells: 58 },
  { year: '2023', wells: 72 },
  { year: '2024', wells: 65 },
];

const maxWells = Math.max(...YEAR_DATA.map((d) => d.wells));

export default function AchievementsPage() {
  const t = useTranslations('public');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0D47A1] to-[#1565C0] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">{t('achievements.title')}</h1>
          <p className="text-[#BBDEFB] text-lg">{t('achievements.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        {/* Overview Stats */}
        <section>
          <h2 className="text-2xl font-bold text-[#1565C0] mb-8 text-center">{t('achievements.overview')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: 500, label: t('achievements.wellsDrilled'), icon: '🔩' },
              { value: 200, label: t('stats.projectsCompleted'), icon: '✅' },
              { value: 1500000, label: t('achievements.waterVolume'), icon: '💧' },
              { value: 22, label: t('achievements.regions'), icon: '🗺️' },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 hover:border-[#42A5F5] hover:shadow-lg transition-all p-6 text-center">
                <div className="text-4xl mb-3">{stat.icon}</div>
                <AnimatedNumber target={stat.value} />
                <p className="mt-2 text-gray-600 text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* By Region */}
        <section>
          <h2 className="text-2xl font-bold text-[#1565C0] mb-8 text-center">{t('achievements.byRegion')}</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#E3F2FD]">
                  <tr>
                    <th className="px-6 py-4 text-start text-sm font-semibold text-[#1565C0]">المنطقة / Region</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-[#1565C0]">عدد الآبار / Wells</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-[#1565C0]">المشاريع / Projects</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-[#1565C0]">النسبة / Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {REGION_DATA.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{row.region}</div>
                        <div className="text-xs text-gray-400">{row.regionEn}</div>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-[#1565C0]">{row.wells}</td>
                      <td className="px-6 py-4 text-center text-gray-700">{row.projects}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-[#1565C0] to-[#42A5F5] h-2 rounded-full"
                              style={{ width: `${row.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-600 w-10 text-end">{row.percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* By Year Bar Chart */}
        <section>
          <h2 className="text-2xl font-bold text-[#1565C0] mb-8 text-center">{t('achievements.byYear')}</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="flex items-end gap-4 h-56 justify-center">
              {YEAR_DATA.map((d) => (
                <div key={d.year} className="flex flex-col items-center gap-2 flex-1 max-w-[72px]">
                  <span className="text-sm font-bold text-[#1565C0]">{d.wells}</span>
                  <div
                    className="w-full bg-gradient-to-t from-[#1565C0] to-[#42A5F5] rounded-t-lg transition-all hover:from-[#0D47A1] hover:to-[#1976D2]"
                    style={{ height: `${(d.wells / maxWells) * 180}px` }}
                  />
                  <span className="text-xs text-gray-500 font-medium">{d.year}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-gray-400 mt-4">عدد الآبار المحفورة سنوياً / Wells drilled per year</p>
          </div>
        </section>

      </div>
    </div>
  );
}
