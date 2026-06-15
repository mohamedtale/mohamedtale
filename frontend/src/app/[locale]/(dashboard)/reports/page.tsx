'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { reportsApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { canAccess } from '@/lib/auth';
import type { Report } from '@/types';

const TYPE_LABELS: Record<string, string> = {
  weekly: 'أسبوعي', monthly: 'شهري', annual: 'سنوي', technical: 'تقني', maintenance: 'صيانة'
};
const STATUS_LABELS: Record<string, string> = {
  draft: 'مسودة', submitted: 'مُقدّم', under_review: 'قيد المراجعة', approved: 'معتمد', rejected: 'مرفوض'
};

export default function ReportsPage() {
  const t = useTranslations('reports');
  const { user } = useAuthStore();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    report_type: 'monthly',
    title_ar: '',
    title_en: '',
    report_date: new Date().toISOString().split('T')[0],
    period_start: '',
    period_end: '',
    summary_ar: '',
  });

  const loadReports = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (typeFilter) params.report_type = typeFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await reportsApi.getAll(params);
      setReports(res.data.reports);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReports(); }, [typeFilter, statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await reportsApi.create(form as Record<string, unknown>);
      setShowAddModal(false);
      setForm({ report_type: 'monthly', title_ar: '', title_en: '', report_date: new Date().toISOString().split('T')[0], period_start: '', period_end: '', summary_ar: '' });
      loadReports();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleApprove = async (id: string) => {
    try {
      await reportsApi.approve(id);
      loadReports();
      setSelectedReport(null);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (id: string) => {
    try {
      await reportsApi.submit(id);
      loadReports();
    } catch (err) { console.error(err); }
  };

  const exportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF();
    doc.text('Reports List', 14, 15);
    autoTable(doc, {
      startY: 25,
      head: [['Title', 'Type', 'Date', 'Status']],
      body: reports.map(r => [r.title_ar, TYPE_LABELS[r.report_type] || r.report_type, formatDate(r.report_date), STATUS_LABELS[r.status] || r.status]),
      headStyles: { fillColor: [27, 94, 32] },
    });
    doc.save('reports.pdf');
  };

  return (
    <div>
      <Header title={t('title')} />
      <div className="p-6 animate-fadeIn">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex gap-3 flex-wrap">
            <div className="w-40">
              <Select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                <option value="">جميع الأنواع</option>
                {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
            </div>
            <div className="w-44">
              <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">جميع الحالات</option>
                {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportPDF}>PDF</Button>
            <Button onClick={() => setShowAddModal(true)}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              {t('addReport')}
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>عنوان التقرير</th>
                <th>النوع</th>
                <th>تاريخ التقرير</th>
                <th>القسم</th>
                <th>الحالة</th>
                <th>أنشأه</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">جاري التحميل...</td></tr>
              ) : reports.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">{t('noReports')}</td></tr>
              ) : reports.map(r => (
                <tr key={r.id}>
                  <td>
                    <p className="font-medium text-gray-900">{r.title_ar}</p>
                    {r.title_en && <p className="text-xs text-gray-400">{r.title_en}</p>}
                  </td>
                  <td><Badge variant={r.report_type}>{TYPE_LABELS[r.report_type] || r.report_type}</Badge></td>
                  <td className="text-sm text-gray-500">{formatDate(r.report_date)}</td>
                  <td className="text-sm text-gray-500">{r.section || '—'}</td>
                  <td><Badge variant={r.status}>{STATUS_LABELS[r.status] || r.status}</Badge></td>
                  <td className="text-sm text-gray-500">{r.created_by_name || '—'}</td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => setSelectedReport(r)} className="p-1.5 text-gray-400 hover:text-ministry-700 hover:bg-gray-100 rounded-lg" title="عرض">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </button>
                      {r.status === 'draft' && (
                        <button onClick={() => handleSubmit(r.id)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="تقديم">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Report Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={t('addReport')} size="lg">
        <form onSubmit={handleCreate} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input label="عنوان التقرير (عربي) *" value={form.title_ar} onChange={e => setForm(prev => ({ ...prev, title_ar: e.target.value }))} required />
            </div>
            <Input label="عنوان التقرير (English)" value={form.title_en} onChange={e => setForm(prev => ({ ...prev, title_en: e.target.value }))} />
            <Select label="نوع التقرير" value={form.report_type} onChange={e => setForm(prev => ({ ...prev, report_type: e.target.value }))}>
              {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
            <Input label="تاريخ التقرير" type="date" value={form.report_date} onChange={e => setForm(prev => ({ ...prev, report_date: e.target.value }))} dir="ltr" />
            <div></div>
            <Input label="بداية الفترة" type="date" value={form.period_start} onChange={e => setForm(prev => ({ ...prev, period_start: e.target.value }))} dir="ltr" />
            <Input label="نهاية الفترة" type="date" value={form.period_end} onChange={e => setForm(prev => ({ ...prev, period_end: e.target.value }))} dir="ltr" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الملخص</label>
            <textarea
              value={form.summary_ar}
              onChange={e => setForm(prev => ({ ...prev, summary_ar: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-ministry-500 outline-none resize-none"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>إلغاء</Button>
            <Button type="submit" disabled={saving}>{saving ? 'جاري الحفظ...' : 'إنشاء التقرير'}</Button>
          </div>
        </form>
      </Modal>

      {/* Report detail modal */}
      <Modal isOpen={!!selectedReport} onClose={() => setSelectedReport(null)} title={selectedReport?.title_ar} size="lg">
        {selectedReport && (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant={selectedReport.status}>{STATUS_LABELS[selectedReport.status]}</Badge>
              <Badge variant={selectedReport.report_type}>{TYPE_LABELS[selectedReport.report_type]}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">تاريخ التقرير:</span> <span className="mr-2">{formatDate(selectedReport.report_date)}</span></div>
              <div><span className="text-gray-500">أنشأه:</span> <span className="mr-2">{selectedReport.created_by_name || '—'}</span></div>
              {selectedReport.period_start && <div><span className="text-gray-500">الفترة:</span> <span className="mr-2">{formatDate(selectedReport.period_start)} - {formatDate(selectedReport.period_end)}</span></div>}
            </div>
            {selectedReport.summary_ar && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">الملخص</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedReport.summary_ar}</p>
              </div>
            )}
            {canAccess(user, 'section_head') && selectedReport.status === 'submitted' && (
              <div className="flex gap-3 pt-2">
                <Button onClick={() => handleApprove(selectedReport.id)} className="flex-1">اعتماد التقرير</Button>
                <Button variant="destructive" className="flex-1">رفض</Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
