'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/layout/Header';
import { Select } from '@/components/ui/select';
import { logsApi } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import type { AuditLog } from '@/types';

const ACTION_LABELS: Record<string, string> = {
  login: 'تسجيل دخول', logout: 'تسجيل خروج',
  create: 'إنشاء', update: 'تعديل', delete: 'حذف',
  create_user: 'إنشاء مستخدم',
};
const ACTION_COLORS: Record<string, string> = {
  login: 'bg-green-100 text-green-700', logout: 'bg-gray-100 text-gray-600',
  create: 'bg-blue-100 text-blue-700', update: 'bg-yellow-100 text-yellow-700',
  delete: 'bg-red-100 text-red-700', create_user: 'bg-purple-100 text-purple-700',
};
const ENTITY_LABELS: Record<string, string> = {
  user: 'مستخدم', well: 'بئر', report: 'تقرير', maintenance: 'صيانة', workflow: 'طلب عمل'
};

export default function LogsPage() {
  const t = useTranslations('logs');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 50;

  const load = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { limit, offset };
      if (entityFilter) params.entity_type = entityFilter;
      if (actionFilter) params.action = actionFilter;
      const res = await logsApi.getAll(params);
      setLogs(res.data.logs);
      setTotal(res.data.total);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [entityFilter, actionFilter, offset]);

  return (
    <div>
      <Header title={t('title')} />
      <div className="p-6 animate-fadeIn">
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="w-44">
            <Select value={entityFilter} onChange={e => setEntityFilter(e.target.value)}>
              <option value="">جميع الكيانات</option>
              {Object.entries(ENTITY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
          </div>
          <div className="w-44">
            <Select value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
              <option value="">جميع الإجراءات</option>
              {Object.entries(ACTION_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
          </div>
          <span className="self-center text-sm text-gray-500">الإجمالي: {total}</span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>المستخدم</th>
                <th>الإجراء</th>
                <th>الكيان</th>
                <th>عنوان IP</th>
                <th>التوقيت</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">جاري التحميل...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">{t('noLogs')}</td></tr>
              ) : logs.map(log => (
                <tr key={log.id}>
                  <td>
                    <p className="text-sm font-medium text-gray-900">{log.full_name_ar || '—'}</p>
                    <p className="text-xs text-gray-400">{log.username || ''}</p>
                  </td>
                  <td>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-700'}`}>
                      {ACTION_LABELS[log.action] || log.action}
                    </span>
                  </td>
                  <td className="text-sm text-gray-500">
                    {log.entity_type ? (ENTITY_LABELS[log.entity_type] || log.entity_type) : '—'}
                  </td>
                  <td className="text-xs text-gray-400 font-mono">{log.ip_address || '—'}</td>
                  <td className="text-xs text-gray-400">{formatDateTime(log.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-500">
            عرض {offset + 1} - {Math.min(offset + limit, total)} من {total}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              السابق
            </button>
            <button
              onClick={() => setOffset(offset + limit)}
              disabled={offset + limit >= total}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              التالي
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
