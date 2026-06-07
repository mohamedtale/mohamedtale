'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/layout/Header';
import { wellsApi, reportsApi, workflowsApi } from '@/lib/api';
import { formatDate, STATUS_COLORS } from '@/lib/utils';
import type { DashboardStats, Well, Report, Workflow } from '@/types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#22c55e', '#94a3b8', '#f59e0b', '#3b82f6', '#f97316', '#ef4444'];

const WELL_REGION_DATA = [
  { name: 'طرابلس', value: 4 },
  { name: 'مصراتة', value: 2 },
  { name: 'الزاوية', value: 1 },
  { name: 'غريان', value: 1 },
  { name: 'بني وليد', value: 1 },
  { name: 'نالوت', value: 1 },
];

const MONTHLY_DATA = [
  { month: 'يناير', حفر: 1, صيانة: 3 },
  { month: 'فبراير', حفر: 0, صيانة: 2 },
  { month: 'مارس', حفر: 2, صيانة: 4 },
  { month: 'أبريل', حفر: 1, صيانة: 2 },
  { month: 'مايو', حفر: 0, صيانة: 3 },
  { month: 'يونيو', حفر: 1, صيانة: 1 },
];

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentWells, setRecentWells] = useState<Well[]>([]);
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [recentWorkflows, setRecentWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, wellsRes, reportsRes, workflowsRes] = await Promise.all([
          wellsApi.getStats(),
          wellsApi.getAll({ limit: 5 }),
          reportsApi.getAll({ limit: 5 }),
          workflowsApi.getAll({ limit: 5 }),
        ]);
        setStats(statsRes.data);
        setRecentWells(wellsRes.data.wells);
        setRecentReports(reportsRes.data.reports);
        setRecentWorkflows(workflowsRes.data);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const pieData = stats ? [
    { name: 'نشط', value: parseInt(stats.active) || 0 },
    { name: 'متوقف', value: parseInt(stats.inactive) || 0 },
    { name: 'تحت الصيانة', value: parseInt(stats.under_maintenance) || 0 },
    { name: 'قيد الحفر', value: parseInt(stats.drilling) || 0 },
    { name: 'معلق', value: parseInt(stats.suspended) || 0 },
  ].filter(d => d.value > 0) : [];

  const statCards = stats ? [
    { label: t('totalWells'), value: stats.total || '0', icon: '🏗️', color: 'bg-blue-500', change: '+2 هذا الشهر' },
    { label: t('activeWells'), value: stats.active || '0', icon: '✅', color: 'bg-green-500', change: 'نشط ومنتج' },
    { label: t('maintenanceWells'), value: stats.under_maintenance || '0', icon: '🔧', color: 'bg-yellow-500', change: 'تحت المتابعة' },
    { label: t('drillingWells'), value: stats.drilling || '0', icon: '⛏️', color: 'bg-blue-400', change: 'قيد التنفيذ' },
    { label: 'متوسط العمق', value: `${Math.round(parseFloat(stats.avg_depth || '0'))} م`, icon: '📏', color: 'bg-purple-500', change: 'متوسط جميع الآبار' },
    { label: 'متوسط التدفق', value: `${Math.round(parseFloat(stats.avg_discharge || '0'))} م³/س`, icon: '💧', color: 'bg-cyan-500', change: 'متوسط معدل التدفق' },
  ] : [];

  return (
    <div>
      <Header title={t('title')} />
      <div className="p-6 space-y-6 animate-fadeIn">

        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-ministry-800 to-ministry-600 rounded-xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-1">{t('welcomeMessage')}</h2>
          <p className="text-ministry-200">الجهاز التنفيذي لحفر وصيانة آبار المياه - وزارة الموارد المائية</p>
          <div className="mt-4 flex gap-4">
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <p className="text-xs text-ministry-200">إجمالي الآبار</p>
              <p className="text-2xl font-bold">{stats?.total || '—'}</p>
            </div>
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <p className="text-xs text-ministry-200">نشطة</p>
              <p className="text-2xl font-bold text-green-300">{stats?.active || '—'}</p>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="stat-card animate-pulse h-28">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {statCards.map((card) => (
              <div key={card.label} className="stat-card hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center text-xl mb-3`}>
                  {card.icon}
                </div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-500 mt-1">{card.label}</p>
                <p className="text-xs text-gray-400 mt-1">{card.change}</p>
              </div>
            ))}
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('wellsByStatus')}</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-400">جاري تحميل البيانات...</div>
            )}
          </div>

          {/* Bar chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('monthlyDrilling')}</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={MONTHLY_DATA}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="حفر" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="صيانة" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Region Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('wellsByRegion')}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={WELL_REGION_DATA} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
              <Tooltip />
              <Bar dataKey="value" fill="#1B5E20" radius={[0, 4, 4, 0]} name="عدد الآبار" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent data tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Reports */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">{t('recentReports')}</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {recentReports.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-6">لا توجد تقارير</p>
              ) : recentReports.map((r) => (
                <div key={r.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{r.title_ar}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(r.report_date)}</p>
                  </div>
                  <span className={`status-badge ${STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-800'}`}>
                    {r.status === 'approved' ? 'معتمد' : r.status === 'draft' ? 'مسودة' : r.status === 'submitted' ? 'مُقدّم' : r.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Workflows */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">{t('recentWorkflows')}</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {recentWorkflows.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-6">لا توجد طلبات</p>
              ) : recentWorkflows.map((w) => (
                <div key={w.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{w.title_ar}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{w.submitted_by_name || w.workflow_type}</p>
                  </div>
                  <span className={`status-badge ${STATUS_COLORS[w.current_status] || ''}`}>
                    {w.current_status === 'submitted' ? 'مُقدّم' :
                     w.current_status === 'approved' ? 'معتمد' :
                     w.current_status === 'rejected' ? 'مرفوض' : w.current_status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
