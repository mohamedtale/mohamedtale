'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { usersApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import type { User } from '@/types';

const ROLE_LABELS: Record<string, string> = {
  system_admin: 'مدير النظام', department_manager: 'مدير القسم',
  section_head: 'رئيس الوحدة', employee: 'موظف'
};
const SECTION_LABELS: Record<string, string> = {
  wells_map: 'خريطة الآبار', technical_reports: 'التقارير الفنية',
  weekly_followup: 'المتابعة الأسبوعية', water_soil_db: 'قاعدة المياه والتربة',
  well_rock_design: 'تصميم الآبار والصخور', contracts: 'العقود'
};

export default function UsersPage() {
  const t = useTranslations('users');
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    username: '', email: '', password: '',
    full_name_ar: '', full_name_en: '',
    role: 'employee', section: '', is_active: true
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await usersApi.getAll();
      setUsers(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await usersApi.create(form as Record<string, unknown>);
      setShowAddModal(false);
      setForm({ username: '', email: '', password: '', full_name_ar: '', full_name_en: '', role: 'employee', section: '', is_active: true });
      load();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message_ar?: string } } };
      setError(axiosErr.response?.data?.message_ar || 'حدث خطأ');
    } finally { setSaving(false); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setSaving(true);
    try {
      await usersApi.update(editUser.id, { full_name_ar: form.full_name_ar, full_name_en: form.full_name_en, role: form.role, section: form.section, is_active: form.is_active });
      setEditUser(null);
      load();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await usersApi.update(id, { is_active: !isActive });
      load();
    } catch (err) { console.error(err); }
  };

  return (
    <div>
      <Header title={t('title')} />
      <div className="p-6 animate-fadeIn">
        <div className="flex justify-end mb-6">
          {currentUser?.role === 'system_admin' && (
            <Button onClick={() => setShowAddModal(true)}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              {t('addUser')}
            </Button>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>المستخدم</th>
                <th>الدور</th>
                <th>القسم</th>
                <th>الحالة</th>
                <th>آخر دخول</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">جاري التحميل...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">{t('noUsers')}</td></tr>
              ) : users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-ministry-700 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {u.full_name_ar?.charAt(0) || 'م'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{u.full_name_ar}</p>
                        <p className="text-xs text-gray-400">{u.username} · {u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td><Badge variant={u.role}>{ROLE_LABELS[u.role] || u.role}</Badge></td>
                  <td className="text-sm text-gray-500">{u.section ? (SECTION_LABELS[u.section] || u.section) : '—'}</td>
                  <td>
                    {u.is_active ? (
                      <span className="status-badge bg-green-100 text-green-800 border-green-200">نشط</span>
                    ) : (
                      <span className="status-badge bg-gray-100 text-gray-700 border-gray-200">معطّل</span>
                    )}
                  </td>
                  <td className="text-sm text-gray-400">{u.last_login ? formatDate(u.last_login) : '—'}</td>
                  <td>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditUser(u);
                          setForm({ ...form, full_name_ar: u.full_name_ar, full_name_en: u.full_name_en || '', role: u.role, section: u.section || '', is_active: u.is_active, username: u.username, email: u.email, password: '' });
                        }}
                        className="p-1.5 text-gray-400 hover:text-ministry-700 hover:bg-gray-100 rounded-lg"
                        title="تعديل"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      {currentUser?.id !== u.id && (
                        <button
                          onClick={() => handleToggleActive(u.id, u.is_active)}
                          className={`p-1.5 rounded-lg ${u.is_active ? 'text-red-400 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                          title={u.is_active ? 'تعطيل' : 'تفعيل'}
                        >
                          {u.is_active ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          )}
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

      {/* Add User Modal */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setError(''); }} title={t('addUser')} size="lg">
        <form onSubmit={handleCreate} className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <Input label="اسم المستخدم *" value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} required dir="ltr" />
            <Input label="البريد الإلكتروني *" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required dir="ltr" />
            <Input label="كلمة المرور *" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
            <Select label="الدور" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
              {Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
            <Input label="الاسم الكامل (عربي) *" value={form.full_name_ar} onChange={e => setForm(p => ({ ...p, full_name_ar: e.target.value }))} required />
            <Input label="Full Name (English)" value={form.full_name_en} onChange={e => setForm(p => ({ ...p, full_name_en: e.target.value }))} />
            <Select label="القسم" value={form.section} onChange={e => setForm(p => ({ ...p, section: e.target.value }))}>
              <option value="">اختر القسم</option>
              {Object.entries(SECTION_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>إلغاء</Button>
            <Button type="submit" disabled={saving}>{saving ? 'جاري الإنشاء...' : 'إنشاء المستخدم'}</Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="تعديل المستخدم" size="md">
        <form onSubmit={handleUpdate} className="p-6 space-y-4">
          <Input label="الاسم الكامل (عربي)" value={form.full_name_ar} onChange={e => setForm(p => ({ ...p, full_name_ar: e.target.value }))} />
          <Input label="Full Name (English)" value={form.full_name_en} onChange={e => setForm(p => ({ ...p, full_name_en: e.target.value }))} />
          <Select label="الدور" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
            {Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select>
          <Select label="القسم" value={form.section} onChange={e => setForm(p => ({ ...p, section: e.target.value }))}>
            <option value="">بدون قسم</option>
            {Object.entries(SECTION_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setEditUser(null)}>إلغاء</Button>
            <Button type="submit" disabled={saving}>{saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
