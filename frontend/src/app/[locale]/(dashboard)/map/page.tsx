'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { Header } from '@/components/layout/Header';
import { wellsApi } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import type { Well } from '@/types';

const WellsMap = dynamic(() => import('@/components/map/WellsMap').then(m => m.WellsMap), { ssr: false, loading: () => (
  <div className="flex items-center justify-center h-full bg-gray-100 rounded-xl">
    <div className="text-center">
      <div className="w-10 h-10 border-4 border-ministry-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
      <p className="text-gray-500 text-sm">جاري تحميل الخريطة...</p>
    </div>
  </div>
)});

const STATUS_LABELS: Record<string, string> = {
  active: 'نشط', inactive: 'متوقف', under_maintenance: 'تحت الصيانة',
  drilling: 'قيد الحفر', suspended: 'معلق', abandoned: 'مهجور'
};

export default function MapPage() {
  const t = useTranslations('map');
  const [wells, setWells] = useState<Well[]>([]);
  const [filteredWells, setFilteredWells] = useState<Well[]>([]);
  const [selectedWell, setSelectedWell] = useState<Well | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWells = async () => {
      try {
        const res = await wellsApi.getAll({ limit: 200 });
        setWells(res.data.wells);
        setFilteredWells(res.data.wells);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadWells();
  }, []);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredWells(wells);
    } else {
      setFilteredWells(wells.filter(w => w.status === statusFilter));
    }
  }, [statusFilter, wells]);

  return (
    <div className="flex flex-col h-screen">
      <Header title={t('title')} />
      <div className="flex flex-1 overflow-hidden p-4 gap-4">
        {/* Sidebar */}
        <div className="w-72 flex flex-col gap-4">
          {/* Filter */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">{t('filterByStatus')}</h3>
            <div className="space-y-2">
              {['all', 'active', 'inactive', 'under_maintenance', 'drilling', 'suspended'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${
                    statusFilter === s
                      ? 'bg-ministry-700 text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {s === 'all' ? 'جميع الآبار' : STATUS_LABELS[s]}
                  {s !== 'all' && (
                    <span className="mr-2 text-xs opacity-75">
                      ({wells.filter(w => w.status === s).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Well list */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="font-semibold text-gray-800 text-sm">
                {t('wellsCount')}: {filteredWells.length}
              </p>
            </div>
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-4 space-y-2">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : filteredWells.map((well) => (
                <button
                  key={well.id}
                  onClick={() => setSelectedWell(well)}
                  className={`w-full text-right px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    selectedWell?.id === well.id ? 'bg-ministry-50' : ''
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900 truncate">{well.name_ar}</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <Badge variant={well.status}>{STATUS_LABELS[well.status] || well.status}</Badge>
                    <span className="text-xs text-gray-400">{well.municipality}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Map + Detail */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex-1 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            <WellsMap wells={filteredWells} onWellClick={setSelectedWell} />
          </div>

          {/* Selected well info */}
          {selectedWell && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">{selectedWell.name_ar}</h3>
                  <p className="text-sm text-gray-500">{selectedWell.well_code} · {selectedWell.municipality}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={selectedWell.status}>{STATUS_LABELS[selectedWell.status]}</Badge>
                  <button onClick={() => setSelectedWell(null)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                <div><p className="text-gray-400 text-xs">العمق</p><p className="font-medium">{selectedWell.depth_meters ? `${selectedWell.depth_meters} م` : '—'}</p></div>
                <div><p className="text-gray-400 text-xs">التدفق</p><p className="font-medium">{selectedWell.discharge_rate_m3h ? `${selectedWell.discharge_rate_m3h} م³/س` : '—'}</p></div>
                <div><p className="text-gray-400 text-xs">جودة المياه</p><p className="font-medium">{selectedWell.water_quality || '—'}</p></div>
                <div><p className="text-gray-400 text-xs">الإحداثيات</p><p className="font-medium text-xs">{selectedWell.latitude?.toFixed(4)}, {selectedWell.longitude?.toFixed(4)}</p></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
