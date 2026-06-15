'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

interface WellMarker {
  id: string;
  name: string;
  nameEn: string;
  lat: number;
  lng: number;
  status: 'active' | 'maintenance' | 'completed';
  region: string;
  depth: string;
}

const SAMPLE_WELLS: WellMarker[] = [
  { id: '1', name: 'بئر الجفارة - 01', nameEn: 'Jafara Well-01', lat: 32.9, lng: 13.18, status: 'active', region: 'طرابلس', depth: '280م' },
  { id: '2', name: 'بئر الجفارة - 02', nameEn: 'Jafara Well-02', lat: 32.85, lng: 13.25, status: 'active', region: 'طرابلس', depth: '310م' },
  { id: '3', name: 'بئر بنغازي - 01', nameEn: 'Benghazi Well-01', lat: 32.12, lng: 20.07, status: 'active', region: 'بنغازي', depth: '340م' },
  { id: '4', name: 'بئر بنغازي - 02', nameEn: 'Benghazi Well-02', lat: 32.18, lng: 20.12, status: 'maintenance', region: 'بنغازي', depth: '290م' },
  { id: '5', name: 'بئر مصراتة - 01', nameEn: 'Misrata Well-01', lat: 32.38, lng: 15.09, status: 'active', region: 'مصراتة', depth: '250م' },
  { id: '6', name: 'بئر سبها - 01', nameEn: 'Sabha Well-01', lat: 27.04, lng: 14.43, status: 'active', region: 'سبها', depth: '420م' },
  { id: '7', name: 'بئر سبها - 02', nameEn: 'Sabha Well-02', lat: 27.1, lng: 14.5, status: 'completed', region: 'سبها', depth: '380م' },
  { id: '8', name: 'بئر طبرق - 01', nameEn: 'Tobruk Well-01', lat: 32.08, lng: 23.97, status: 'active', region: 'طبرق', depth: '320م' },
  { id: '9', name: 'بئر زليتن - 01', nameEn: 'Zliten Well-01', lat: 32.47, lng: 14.57, status: 'active', region: 'زليتن', depth: '275م' },
  { id: '10', name: 'بئر الخمس - 01', nameEn: 'Khoms Well-01', lat: 32.65, lng: 14.27, status: 'maintenance', region: 'الخمس', depth: '295م' },
  { id: '11', name: 'بئر الزنتان - 01', nameEn: 'Zintan Well-01', lat: 31.93, lng: 12.25, status: 'active', region: 'الزنتان', depth: '350م' },
  { id: '12', name: 'بئر غريان - 01', nameEn: 'Gharyan Well-01', lat: 32.17, lng: 13.02, status: 'active', region: 'غريان', depth: '310م' },
];

const STATUS_COLORS: Record<string, string> = {
  active: '#22c55e',
  maintenance: '#f59e0b',
  completed: '#3b82f6',
};

export default function PublicMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const t = useTranslations('public');

  useEffect(() => {
    if (typeof window === 'undefined' || mapInstanceRef.current) return;

    const init = async () => {
      const L = (await import('leaflet')).default;

      if (!mapRef.current || mapInstanceRef.current) return;

      const map = L.map(mapRef.current, {
        center: [28.0, 17.0],
        zoom: 5,
        scrollWheelZoom: false,
      });

      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      SAMPLE_WELLS.forEach((well) => {
        const color = STATUS_COLORS[well.status] || '#3b82f6';

        const icon = L.divIcon({
          className: '',
          html: `<div style="
            width:16px;height:16px;
            background:${color};
            border:3px solid white;
            border-radius:50%;
            box-shadow:0 2px 6px rgba(0,0,0,0.35);
          "></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
          popupAnchor: [0, -10],
        });

        const statusLabel =
          well.status === 'active' ? 'نشط / Active' :
          well.status === 'maintenance' ? 'صيانة / Maintenance' :
          'مكتمل / Completed';

        L.marker([well.lat, well.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: Cairo, sans-serif; min-width:180px; direction:rtl; text-align:right;">
              <div style="font-weight:700;font-size:14px;color:#1565C0;margin-bottom:6px;">${well.name}</div>
              <div style="font-size:12px;color:#555;margin-bottom:4px;">${well.nameEn}</div>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:6px 0"/>
              <div style="font-size:12px;"><strong>المنطقة:</strong> ${well.region}</div>
              <div style="font-size:12px;"><strong>العمق:</strong> ${well.depth}</div>
              <div style="font-size:12px;margin-top:4px;">
                <span style="
                  background:${color}22;color:${color};
                  padding:2px 8px;border-radius:9999px;
                  font-size:11px;font-weight:600;
                ">${statusLabel}</span>
              </div>
            </div>
          `);
      });
    };

    init();

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-[#1565C0] mb-3">{t('map.title')}</h2>
          <p className="text-gray-500 max-w-xl mx-auto">{t('map.subtitle')}</p>
          <div className="w-16 h-1 bg-[#42A5F5] mx-auto rounded-full mt-3" />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {[
            { color: '#22c55e', label: 'نشط / Active' },
            { color: '#f59e0b', label: 'صيانة / Maintenance' },
            { color: '#3b82f6', label: 'مكتمل / Completed' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-3 h-3 rounded-full inline-block" style={{ background: item.color }} />
              {item.label}
            </div>
          ))}
        </div>

        <div
          ref={mapRef}
          className="w-full rounded-2xl overflow-hidden shadow-xl border border-gray-200"
          style={{ height: '480px' }}
        />
      </div>
    </section>
  );
}
