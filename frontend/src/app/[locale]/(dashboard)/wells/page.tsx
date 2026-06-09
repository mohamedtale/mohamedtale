'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { wellsApi } from '@/lib/api';
import { ImportWellsModal } from '@/components/wells/ImportWellsModal';
import { formatDate, formatNumber } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { canAccess } from '@/lib/auth';
import type { Well } from '@/types';

const STATUS_LABELS: Record<string, string> = {
  active: 'نشط', inactive: 'متوقف', under_maintenance: 'تحت الصيانة',
  drilling: 'قيد الحفر', suspended: 'معلق', abandoned: 'مهجور'
};
const TYPE_LABELS: Record<string, string> = {
  artesian: 'ارتوازي', semi_artesian: 'شبه ارتوازي', drilled: 'محفور', dug: 'منقور', spring: 'نبع'
};
const QUALITY_LABELS: Record<string, string> = {
  excellent: 'ممتاز', good: 'جيد', acceptable: 'مقبول', poor: 'سيئ'
};

export default function WellsPage() {
  const t = useTranslations('wells');
  const params = useParams();
  const locale = params.locale as string;
  const { user } = useAuthStore();

  const [wells, setWells] = useState<Well[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedWell, setSelectedWell] = useState<Well | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const loadWells = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await wellsApi.getAll(params);
      setWells(res.data.wells);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadWells(); }, [search, statusFilter]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await wellsApi.delete(deleteId);
      setDeleteId(null);
      loadWells();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const exportExcel = async () => {
    const XLSX = await import('xlsx');
    const data = wells.map(w => ({
      'رمز البئر': w.well_code,
      'الاسم': w.name_ar,
      'النوع': TYPE_LABELS[w.well_type] || w.well_type,
      'الحالة': STATUS_LABELS[w.status] || w.status,
      'البلدية': w.municipality || '',
      'المنطقة': w.region || '',
      'العمق (م)': w.depth_meters || '',
      'التدفق (م³/س)': w.discharge_rate_m3h || '',
      'جودة المياه': w.water_quality ? QUALITY_LABELS[w.water_quality] : '',
      'تاريخ الحفر': w.drilling_date ? formatDate(w.drilling_date) : '',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'الآبار');
    XLSX.writeFile(wb, 'wells_report.xlsx');
  };

  const exportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFont('helvetica', 'bold');
    doc.text('Water Wells Report', 14, 15);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 22);
    autoTable(doc, {
      startY: 30,
      head: [['Code', 'Name', 'Type', 'Status', 'Municipality', 'Depth (m)', 'Discharge (m3/h)']],
      body: wells.map(w => [
        w.well_code, w.name_ar || w.name_en || '', TYPE_LABELS[w.well_type] || w.well_type,
        STATUS_LABELS[w.status] || w.status, w.municipality || '',
        w.depth_meters || '', w.discharge_rate_m3h || ''
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [27, 94, 32] },
    });
    doc.save('wells_report.pdf');
  };

  return (
    <div>
      <Header title={t('title')} />
      <div className="p-6 animate-fadeIn">
        {/* Controls */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-64">
              <Input placeholder="بحث برمز أو اسم البئر..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="w-44">
              <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">جميع الحالات</option>
                {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportPDF}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={exportExcel}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Excel
            </Button>
            {canAccess(user, 'section_head') && (
              <>
                <Button variant="outline" size="sm" onClick={() => setShowImport(true)}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  استيراد Excel
                </Button>
                <Link href={`/${locale}/wells/new`}>
                  <Button>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    {t('addWell')}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
          <span>إجمالي النتائج: <strong className="text-gray-900">{total}</strong></span>
          {statusFilter && <span>· تصفية: <strong>{STATUS_LABELS[statusFilter]}</strong></span>}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>رمز البئر</th>
                  <th>الاسم</th>
                  <th>النوع</th>
                  <th>الحالة</th>
                  <th>البلدية</th>
                  <th>العمق (م)</th>
                  <th>التدفق (م³/س)</th>
                  <th>جودة المياه</th>
                  <th>تاريخ الحفر</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={10} className="text-center py-12 text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-ministry-600 border-t-transparent rounded-full animate-spin"></div>
                      جاري التحميل...
                    </div>
                  </td></tr>
                ) : wells.length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-12 text-gray-400">{t('noWells')}</td></tr>
                ) : wells.map((well) => (
                  <tr key={well.id}>
                    <td><span className="font-mono text-sm font-medium text-ministry-700">{well.well_code}</span></td>
                    <td>
                      <div>
                        <p className="font-medium text-gray-900">{well.name_ar}</p>
                        {well.name_en && <p className="text-xs text-gray-400">{well.name_en}</p>}
                      </div>
                    </td>
                    <td><span className="text-gray-600">{TYPE_LABELS[well.well_type] || well.well_type}</span></td>
                    <td><Badge variant={well.status}>{STATUS_LABELS[well.status] || well.status}</Badge></td>
                    <td><span className="text-gray-600">{well.municipality || '—'}</span></td>
                    <td><span className="text-gray-700">{formatNumber(well.depth_meters, 1)}</span></td>
                    <td><span className="text-gray-700">{formatNumber(well.discharge_rate_m3h, 1)}</span></td>
                    <td>
                      {well.water_quality ? (
                        <Badge variant={well.water_quality}>{QUALITY_LABELS[well.water_quality]}</Badge>
                      ) : '—'}
                    </td>
                    <td><span className="text-gray-500 text-xs">{well.drilling_date ? formatDate(well.drilling_date) : '—'}</span></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedWell(well)}
                          className="p-1.5 text-gray-400 hover:text-ministry-700 hover:bg-ministry-50 rounded-lg transition-colors"
                          title="عرض التفاصيل"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        {canAccess(user, 'department_manager') && (
                          <button
                            onClick={() => setDeleteId(well.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="حذف"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
      </div>

      {/* Well detail modal */}
      <Modal isOpen={!!selectedWell} onClose={() => setSelectedWell(null)} title={selectedWell?.name_ar} size="lg">
        {selectedWell && (
          <div className="p-6 space-y-6">
            {/* General info */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 pb-2 border-b">معلومات عامة</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">الرمز:</span> <span className="font-mono font-medium mr-2">{selectedWell.well_code}</span></div>
                <div><span className="text-gray-500">النوع:</span> <span className="mr-2">{TYPE_LABELS[selectedWell.well_type]}</span></div>
                <div><span className="text-gray-500">الحالة:</span> <Badge variant={selectedWell.status} className="mr-2">{STATUS_LABELS[selectedWell.status]}</Badge></div>
                <div><span className="text-gray-500">المنطقة:</span> <span className="mr-2">{selectedWell.region || '—'}</span></div>
                <div><span className="text-gray-500">البلدية:</span> <span className="mr-2">{selectedWell.municipality || '—'}</span></div>
                <div><span className="text-gray-500">المقاول:</span> <span className="mr-2">{selectedWell.contractor_name || '—'}</span></div>
              </div>
            </div>
            {/* Technical data */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 pb-2 border-b">البيانات الفنية</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-gray-500 text-xs mb-1">العمق</p>
                  <p className="font-bold text-lg">{formatNumber(selectedWell.depth_meters, 1)}</p>
                  <p className="text-xs text-gray-400">متر</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-gray-500 text-xs mb-1">القطر</p>
                  <p className="font-bold text-lg">{formatNumber(selectedWell.diameter_mm, 0)}</p>
                  <p className="text-xs text-gray-400">مم</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-gray-500 text-xs mb-1">التدفق</p>
                  <p className="font-bold text-lg">{formatNumber(selectedWell.discharge_rate_m3h, 1)}</p>
                  <p className="text-xs text-gray-400">م³/س</p>
                </div>
              </div>
            </div>
            {/* Water quality */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 pb-2 border-b">تحليل المياه</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">جودة المياه:</span> {selectedWell.water_quality ? <Badge variant={selectedWell.water_quality} className="mr-2">{QUALITY_LABELS[selectedWell.water_quality]}</Badge> : '—'}</div>
                <div><span className="text-gray-500">درجة الحموضة (pH):</span> <span className="font-medium mr-2">{formatNumber(selectedWell.ph_value, 1)}</span></div>
                <div><span className="text-gray-500">الموصلية (μS/cm):</span> <span className="font-medium mr-2">{formatNumber(selectedWell.ec_microsiemens, 0)}</span></div>
                <div><span className="text-gray-500">المواد الصلبة (mg/L):</span> <span className="font-medium mr-2">{formatNumber(selectedWell.tds_mg_l, 0)}</span></div>
              </div>
            </div>
            {/* Dates */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 pb-2 border-b">التواريخ</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">تاريخ الحفر:</span> <span className="mr-2">{formatDate(selectedWell.drilling_date)}</span></div>
                <div><span className="text-gray-500">آخر صيانة:</span> <span className="mr-2">{formatDate(selectedWell.last_maintenance_date)}</span></div>
                <div><span className="text-gray-500">الصيانة القادمة:</span> <span className="mr-2">{formatDate(selectedWell.next_maintenance_date)}</span></div>
              </div>
            </div>
            {selectedWell.notes && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">ملاحظات</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedWell.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Import modal */}
      <ImportWellsModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onSuccess={loadWells}
      />

      {/* Delete confirm modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="تأكيد الحذف" size="sm">
        <div className="p-6">
          <p className="text-gray-600 mb-6">{t('deleteConfirm')}</p>
          <div className="flex gap-3">
            <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="flex-1">
              {deleting ? 'جاري الحذف...' : 'حذف'}
            </Button>
            <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1">إلغاء</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
