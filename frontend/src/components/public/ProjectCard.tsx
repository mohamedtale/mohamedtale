'use client';

import { useTranslations } from 'next-intl';

interface Project {
  id: string;
  title: string;
  location: string;
  status: 'completed' | 'ongoing' | 'planned';
  description: string;
  year: string;
  wellsCount: number;
}

interface ProjectCardProps {
  project: Project;
}

const statusColors = {
  completed: 'bg-green-100 text-green-800',
  ongoing: 'bg-blue-100 text-blue-800',
  planned: 'bg-yellow-100 text-yellow-800',
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const t = useTranslations('public');

  return (
    <div className="bg-white rounded-2xl border border-gray-100 hover:border-[#42A5F5] hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Top accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-[#1565C0] to-[#42A5F5]" />

      <div className="p-6">
        {/* Status & Year */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[project.status]}`}>
            {t(`projects.status.${project.status}`)}
          </span>
          <span className="text-gray-400 text-sm">{project.year}</span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-[#1565C0] transition-colors leading-snug">
          {project.title}
        </h3>

        {/* Description */}
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
          {project.description}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-gray-500 text-sm">
            <svg className="w-4 h-4 text-[#42A5F5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {project.location}
          </div>
          <div className="flex items-center gap-1.5 text-[#1565C0] font-semibold text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
            </svg>
            {project.wellsCount} {t('projects.wells')}
          </div>
        </div>
      </div>
    </div>
  );
}

export type { Project };
