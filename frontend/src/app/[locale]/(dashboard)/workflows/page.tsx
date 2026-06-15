'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { workflowsApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { canAccess } from '@/lib/auth';
import type { Workflow } from '@/types';

const STATUS_LABELS: Record<string, string> = {
  submitted: 'مُقدّم', under_review: 'قيد المراجعة', approved: 'معتمد', rejected: 'مرفوض', returned: 'مُعاد'
};
const PRIORITY_LABELS: Record<string, string> = {
  low: 'منخفض', normal: 'عادي', high: 'عالي', urgent: 'عاجل'
};

export default function WorkflowsPage() {
  const t = useTranslations('workflows');
  const { user } = useAuthStore();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionModal, setActionModal] = useState<{ id: string; action: string } | null>(null);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title_ar: '',
    title_en: '',
    workflow_type: 'maintenance_request',
    priority: 'normal',
    description_ar: '',
    due_date: '',
  });

  const load = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      const res = await workflowsApi.getAll(params);
      setWorkflows(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [statusFilter, priorityFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await workflowsApi.create(form as Record<string, unknown>);
      setShowAddModal(false);
      load();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleAction = async () => {
    if (!actionModal) return;
    setSaving(true);
    try {
      await workflowsApi.action(actionModal.id, actionModal.action, comment);
      setActionModal(null);
      setComment('');
      load();
      if (selectedWorkflow?.id === actionModal.id) {
        const res = await workflowsApi.getById(actionModal.id);
        setSelectedWorkflow(res.data);
      }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const viewDetail = async (id: string) => {
    try {
      const res = await workflowsApi.getById(id);
      setSelectedWorkflow(res.data);
    } catch (err) { console.error(err); }
  };

  return (
    <div>
      <Header title={t('title')} />
      <div className="p-6 animate-fadeIn">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex gap-3 flex-wrap">
            <div className="w-44">
              <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">جميع الحالات</option>
                {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
            </div>
            <div className="w-36">
              <Select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
                <option value="">جميع الأولويات</option>
                {Object.entries(PRIORITY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
            </div>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            {t('addWorkflow')}
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>الطلب</th>
                <th>النوع</th>
                <th>الحالة</th>
                <th>الأولوية</th>
                <th>مُقدّم من</th>
                <th>تاريخ الاستحقاق</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">جاري التحميل...</td></tr>
              ) : workflows.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">{t('noWorkflows')}</td></tr>
              ) : workflows.map(w => (
                <tr key={w.id}>
                  <td>
                    <p className="font-medium text-gray-900">{w.title_ar}</p>
                    {w.title_en && <p className="text-xs text-gray-400">{w.title_en}</p>}
                  </td>
                  <td className="text-sm text-gray-500">{w.workflow_type}</td>
                  <td><Badge variant={w.current_status}>{STATUS_LABELS[w.current_status] || w.current_status}</Badge></td>
                  <td><Badge variant={w.priority}>{PRIORITY_LABELS[w.priority] || w.priority}</Badge></td>
                  <td className="text-sm text-gray-500">{w.submitted_by_name || '—'}</td>
                  <td className="text-sm text-gray-500">{w.due_date ? formatDate(w.due_date) : '—'}</td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => viewDetail(w.id)} className="p-1.5 text-gray-400 hover:text-ministry-700 hover:bg-gray-100 rounded-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </button>
                      {canAccess(user, 'section_head') && w.current_status === 'submitted' && (
                        <>
                          <button onClick={() => setActionModal({ id: w.id, action: 'approved' })} className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg" title="اعتماد">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          </button>
                          <button onClick={() => setActionModal({ id: w.id, action: 'rejected' })} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="رفض">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedWorkflow} onClose={() => setSelectedWorkflow(null)} title={selectedWorkflow?.title_ar} size="lg">
        {selectedWorkflow && (
          <div className="p-6 space-y-4">
            <div className="flex gap-3">
              <Badge variant={selectedWorkflow.current_status}>{STATUS_LABELS[selectedWorkflow.current_status]}</Badge>
              <Badge variant={selectedWorkflow.priority}>{PRIORITY_LABELS[selectedWorkflow.priority]}</Badge>
            </div>
            {selectedWorkflow.description_ar && (
              <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">{selectedWorkflow.description_ar}</div>
            )}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">مُقدّم من:</span> <span className="mr-2">{selectedWorkflow.submitted_by_name || '—'}</span></div>
              <div><span className="text-gray-500">مُسند إلى:</span> <span className="mr-2">{selectedWorkflow.assigned_to_name || '—'}</span></div>
              <div><span className="text-gray-500">تاريخ التقديم:</span> <span className="mr-2">{formatDate(selectedWorkflow.created_at)}</span></div>
              {selectedWorkflow.due_date && <div><span className="text-gray-500">الاستحقاق:</span> <span className="mr-2">{formatDate(selectedWorkflow.due_date)}</span></div>}
            </div>
            {/* Steps */}
            {selectedWorkflow.steps && selectedWorkflow.steps.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">{t('steps')}</h4>
                <div className="space-y-2">
                  {selectedWorkflow.steps.map((step) => (
                    <div key={step.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-ministry-600 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">
                        {step.step_number}
                      </div>
                      <div className="flex-1 text-sm">
                        <p className="font-medium text-gray-900">{step.actor_name || '—'}</p>
                        <p className="text-gray-500">{step.action} · {formatDate(step.created_at)}</p>
                        {step.comment && <p className="text-gray-600 mt-1 text-xs">{step.comment}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {canAccess(user, 'section_head') && selectedWorkflow.current_status === 'submitted' && (
              <div className="flex gap-3 pt-2">
                <Button onClick={() => setActionModal({ id: selectedWorkflow.id, action: 'approved' })} className="flex-1">اعتماد</Button>
                <Button variant="destructive" onClick={() => setActionModal({ id: selectedWorkflow.id, action: 'rejected' })} className="flex-1">رفض</Button>
                <Button variant="outline" onClick={() => setActionModal({ id: selectedWorkflow.id, action: 'returned' })} className="flex-1">إعادة</Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={t('addWorkflow')} size="md">
        <form onSubmit={handleCreate} className="p-6 space-y-4">
          <Input label="عنوان الطلب (عربي) *" value={form.title_ar} onChange={e => setForm(p => ({ ...p, title_ar: e.target.value }))} required />
          <Input label="Title (English)" value={form.title_en} onChange={e => setForm(p => ({ ...p, title_en: e.target.value }))} />
          <Select label="نوع الطلب" value={form.workflow_type} onChange={e => setForm(p => ({ ...p, workflow_type: e.target.value }))}>
            <option value="maintenance_request">طلب صيانة</option>
            <option value="drilling_request">طلب حفر</option>
            <option value="report_approval">اعتماد تقرير</option>
            <option value="contract_request">طلب عقد</option>
            <option value="other">أخرى</option>
          </Select>
          <Select label="الأولوية" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
            <option value="low">منخفض</option>
            <option value="normal">عادي</option>
            <option value="high">عالي</option>
            <option value="urgent">عاجل</option>
          </Select>
          <Input label="تاريخ الاستحقاق" type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} dir="ltr" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
            <textarea
              value={form.description_ar}
              onChange={e => setForm(p => ({ ...p, description_ar: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-ministry-500 outline-none resize-none"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>إلغاء</Button>
            <Button type="submit" disabled={saving}>{saving ? 'جاري الإرسال...' : 'إرسال الطلب'}</Button>
          </div>
        </form>
      </Modal>

      {/* Action modal */}
      <Modal isOpen={!!actionModal} onClose={() => { setActionModal(null); setComment(''); }} title="تأكيد الإجراء" size="sm">
        <div className="p-6">
          <p className="text-gray-600 mb-4 text-sm">
            هل تريد {actionModal?.action === 'approved' ? 'اعتماد' : actionModal?.action === 'rejected' ? 'رفض' : 'إعادة'} هذا الطلب؟
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">تعليق</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-ministry-500 outline-none resize-none"
              placeholder="أضف تعليقاً (اختياري)..."
            />
          </div>
          <div className="flex gap-3 mt-4">
            <Button
              onClick={handleAction}
              disabled={saving}
              variant={actionModal?.action === 'approved' ? 'default' : 'destructive'}
              className="flex-1"
            >
              {saving ? 'جاري...' : 'تأكيد'}
            </Button>
            <Button variant="outline" onClick={() => { setActionModal(null); setComment(''); }} className="flex-1">إلغاء</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
