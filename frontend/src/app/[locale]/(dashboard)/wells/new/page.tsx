'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { wellsApi } from '@/lib/api';

export default function NewWellPage() {
  const t = useTranslations('wells');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    well_code: '',
    name_ar: '',
    name_en: '',
    well_type: 'drilled',
    status: 'active',
    latitude: '',
    longitude: '',
    region: '',
    municipality: '',
    depth_meters: '',
    diameter_mm: '',
    water_level_meters: '',
    discharge_rate_m3h: '',
    water_quality: '',
    ec_microsiemens: '',
    ph_value: '',
    tds_mg_l: '',
    drilling_date: '',
    last_maintenance_date: '',
    next_maintenance_date: '',
    contractor_name: '',
    contract_number: '',
    notes: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { ...form };
      // Convert numeric fields
      ['latitude', 'longitude', 'depth_meters', 'diameter_mm', 'water_level_meters',
       'discharge_rate_m3h', 'ec_microsiemens', 'ph_value', 'tds_mg_l'].forEach(f => {
        if (payload[f] === '') payload[f] = null;
        else if (payload[f]) payload[f] = parseFloat(payload[f] as string);
      });
      ['drilling_date', 'last_maintenance_date', 'next_maintenance_date'].forEach(f => {
        if (payload[f] === '') payload[f] = null;
      });
      await wellsApi.create(payload);
      router.push(`/${locale}/wells`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message_ar?: string; error?: string } } };
      setError(axiosErr.response?.data?.message_ar || axiosErr.response?.data?.error || 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Header title={t('addWell')} />
      <div className="p-6 max-w-4xl animate-fadeIn">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{error}</div>
          )}

          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b">المعلومات الأساسية</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label={t('wellCode') + ' *'} value={form.well_code} onChange={e => handleChange('well_code', e.target.value)} placeholder="مثال: WL-2024-011" required />
              <Select label={t('wellType') + ' *'} value={form.well_type} onChange={e => handleChange('well_type', e.target.value)}>
                <option value="drilled">محفور</option>
                <option value="artesian">ارتوازي</option>
                <option value="semi_artesian">شبه ارتوازي</option>
                <option value="dug">منقور</option>
                <option value="spring">نبع</option>
              </Select>
              <Input label={t('wellName') + ' (عربي) *'} value={form.name_ar} onChange={e => handleChange('name_ar', e.target.value)} required />
              <Input label={t('wellName') + ' (English)'} value={form.name_en} onChange={e => handleChange('name_en', e.target.value)} />
              <Input label={t('region')} value={form.region} onChange={e => handleChange('region', e.target.value)} />
              <Input label={t('municipality')} value={form.municipality} onChange={e => handleChange('municipality', e.target.value)} />
              <Select label={t('status')} value={form.status} onChange={e => handleChange('status', e.target.value)}>
                <option value="active">نشط</option>
                <option value="inactive">متوقف</option>
                <option value="drilling">قيد الحفر</option>
                <option value="under_maintenance">تحت الصيانة</option>
                <option value="suspended">معلق</option>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b">الموقع الجغرافي</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label={t('latitude')} type="number" step="any" value={form.latitude} onChange={e => handleChange('latitude', e.target.value)} placeholder="32.9" dir="ltr" />
              <Input label={t('longitude')} type="number" step="any" value={form.longitude} onChange={e => handleChange('longitude', e.target.value)} placeholder="13.18" dir="ltr" />
            </div>
            <p className="text-xs text-gray-400 mt-2">مثال لموقع طرابلس: خط العرض 32.9 - خط الطول 13.18</p>
          </div>

          {/* Technical Data */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b">البيانات الفنية</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Input label="العمق (م)" type="number" step="any" value={form.depth_meters} onChange={e => handleChange('depth_meters', e.target.value)} dir="ltr" />
              <Input label="القطر (مم)" type="number" step="any" value={form.diameter_mm} onChange={e => handleChange('diameter_mm', e.target.value)} dir="ltr" />
              <Input label="مستوى المياه (م)" type="number" step="any" value={form.water_level_meters} onChange={e => handleChange('water_level_meters', e.target.value)} dir="ltr" />
              <Input label="معدل التدفق (م³/س)" type="number" step="any" value={form.discharge_rate_m3h} onChange={e => handleChange('discharge_rate_m3h', e.target.value)} dir="ltr" />
            </div>
          </div>

          {/* Water Quality */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b">تحليل المياه</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Select label="جودة المياه" value={form.water_quality} onChange={e => handleChange('water_quality', e.target.value)}>
                <option value="">اختر الجودة</option>
                <option value="excellent">ممتاز</option>
                <option value="good">جيد</option>
                <option value="acceptable">مقبول</option>
                <option value="poor">سيئ</option>
              </Select>
              <Input label="pH" type="number" step="0.1" value={form.ph_value} onChange={e => handleChange('ph_value', e.target.value)} dir="ltr" />
              <Input label="الموصلية (μS/cm)" type="number" step="any" value={form.ec_microsiemens} onChange={e => handleChange('ec_microsiemens', e.target.value)} dir="ltr" />
              <Input label="TDS (mg/L)" type="number" step="any" value={form.tds_mg_l} onChange={e => handleChange('tds_mg_l', e.target.value)} dir="ltr" />
            </div>
          </div>

          {/* Contract & Dates */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b">العقد والتواريخ</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Input label="المقاول" value={form.contractor_name} onChange={e => handleChange('contractor_name', e.target.value)} />
              <Input label="رقم العقد" value={form.contract_number} onChange={e => handleChange('contract_number', e.target.value)} />
              <Input label="تاريخ الحفر" type="date" value={form.drilling_date} onChange={e => handleChange('drilling_date', e.target.value)} dir="ltr" />
              <Input label="آخر صيانة" type="date" value={form.last_maintenance_date} onChange={e => handleChange('last_maintenance_date', e.target.value)} dir="ltr" />
              <Input label="الصيانة القادمة" type="date" value={form.next_maintenance_date} onChange={e => handleChange('next_maintenance_date', e.target.value)} dir="ltr" />
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b">ملاحظات</h3>
            <textarea
              value={form.notes}
              onChange={e => handleChange('notes', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-ministry-500 focus:border-ministry-500 outline-none resize-none"
              placeholder="أي ملاحظات إضافية..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => router.back()}>إلغاء</Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'جاري الحفظ...' : 'حفظ البئر'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
