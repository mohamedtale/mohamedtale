import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string | undefined, locale: string = 'ar'): string {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString(locale === 'ar' ? 'ar-LY' : 'en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string | undefined, locale: string = 'ar'): string {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleString(locale === 'ar' ? 'ar-LY' : 'en-GB');
  } catch {
    return dateStr;
  }
}

export function formatNumber(num: number | string | undefined, decimals: number = 2): string {
  if (num === undefined || num === null || num === '') return '-';
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return '-';
  return n.toFixed(decimals);
}

export const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800 border-green-200',
  inactive: 'bg-gray-100 text-gray-800 border-gray-200',
  under_maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  drilling: 'bg-blue-100 text-blue-800 border-blue-200',
  suspended: 'bg-orange-100 text-orange-800 border-orange-200',
  abandoned: 'bg-red-100 text-red-800 border-red-200',
  draft: 'bg-gray-100 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  under_review: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  returned: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  normal: 'bg-blue-100 text-blue-800',
  low: 'bg-gray-100 text-gray-800',
  excellent: 'bg-emerald-100 text-emerald-800',
  good: 'bg-green-100 text-green-800',
  acceptable: 'bg-yellow-100 text-yellow-800',
  poor: 'bg-red-100 text-red-800',
};

export const WELL_STATUS_MAP_COLORS: Record<string, string> = {
  active: '#22c55e',
  inactive: '#94a3b8',
  under_maintenance: '#f59e0b',
  drilling: '#3b82f6',
  suspended: '#f97316',
  abandoned: '#ef4444',
};
