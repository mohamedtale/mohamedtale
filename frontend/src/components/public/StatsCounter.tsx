'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

interface StatItem {
  value: number;
  suffix: string;
  label: string;
  icon: React.ReactNode;
}

function CounterNumber({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 2000;
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

  return (
    <span ref={ref} className="text-5xl font-bold text-[#1565C0]">
      +{count.toLocaleString('ar-LY')}{suffix}
    </span>
  );
}

export default function StatsCounter() {
  const t = useTranslations('public');

  const stats: StatItem[] = [
    {
      value: 500,
      suffix: '',
      label: t('stats.wellsDrilled'),
      icon: (
        <svg className="w-10 h-10 text-[#1565C0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      value: 200,
      suffix: '',
      label: t('stats.projectsCompleted'),
      icon: (
        <svg className="w-10 h-10 text-[#1565C0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      value: 22,
      suffix: '',
      label: t('stats.governoratesCovered'),
      icon: (
        <svg className="w-10 h-10 text-[#1565C0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      value: 30,
      suffix: '',
      label: t('stats.yearsExperience'),
      icon: (
        <svg className="w-10 h-10 text-[#1565C0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#1565C0] mb-3">{t('stats.title')}</h2>
          <div className="w-16 h-1 bg-[#42A5F5] mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-2xl border border-[#E3F2FD] hover:border-[#42A5F5] hover:shadow-lg transition-all group bg-white"
            >
              <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <CounterNumber target={stat.value} suffix={stat.suffix} />
              <p className="mt-2 text-gray-600 font-medium text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
