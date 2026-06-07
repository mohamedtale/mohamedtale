'use client';

import { useEffect, useRef } from 'react';
import type { Well } from '@/types';
import { WELL_STATUS_MAP_COLORS } from '@/lib/utils';

interface WellsMapProps {
  wells: Well[];
  onWellClick?: (well: Well) => void;
}

export function WellsMap({ wells, onWellClick }: WellsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markersRef = useRef<unknown[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamically import leaflet
    import('leaflet').then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return;

      // Fix leaflet default icon
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, {
        center: [27.0, 17.0],
        zoom: 5,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add satellite layer option
      const satellite = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { attribution: '© Esri', maxZoom: 19 }
      );

      L.control.layers(
        {
          'خريطة الطرق': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }),
          'صورة الأقمار الصناعية': satellite,
        },
        undefined,
        { position: 'bottomright' }
      ).addTo(map);

      mapInstanceRef.current = map;

      // Add wells to map
      addWellMarkers(L, map, wells, onWellClick);
    });

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when wells change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    import('leaflet').then((L) => {
      const map = mapInstanceRef.current as { removeLayer: (m: unknown) => void; fitBounds: (b: unknown) => void };
      // Remove old markers
      markersRef.current.forEach(m => map.removeLayer(m));
      markersRef.current = [];
      addWellMarkers(L, mapInstanceRef.current as unknown, wells, onWellClick, markersRef);
    });
  }, [wells]);

  function addWellMarkers(L: typeof import('leaflet'), map: unknown, wells: Well[], onWellClick?: (w: Well) => void, ref?: React.MutableRefObject<unknown[]>) {
    const leafletMap = map as import('leaflet').Map;
    const bounds: [number, number][] = [];

    wells.forEach((well) => {
      if (!well.latitude || !well.longitude) return;

      const color = WELL_STATUS_MAP_COLORS[well.status] || '#94a3b8';

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width: 30px; height: 30px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
        ">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 14 6 14s6-8.75 6-14c0-3.314-2.686-6-6-6zm0 8c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2z"/>
          </svg>
        </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -20],
      });

      const statusLabels: Record<string, string> = {
        active: 'نشط', inactive: 'متوقف', under_maintenance: 'تحت الصيانة',
        drilling: 'قيد الحفر', suspended: 'معلق', abandoned: 'مهجور'
      };
      const qualityLabels: Record<string, string> = {
        excellent: 'ممتاز', good: 'جيد', acceptable: 'مقبول', poor: 'سيئ'
      };

      const popup = L.popup({ maxWidth: 280, className: 'well-popup' }).setContent(`
        <div style="font-family: 'Cairo', sans-serif; direction: rtl; padding: 12px;">
          <div style="background: ${color}; margin: -12px -12px 12px; padding: 10px 12px; border-radius: 4px 4px 0 0;">
            <h3 style="color: white; font-size: 14px; font-weight: bold; margin: 0;">${well.name_ar}</h3>
            <p style="color: rgba(255,255,255,0.8); font-size: 11px; margin: 2px 0 0;">${well.well_code}</p>
          </div>
          <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
            <tr><td style="color: #666; padding: 3px 0;">الحالة:</td><td style="font-weight: 600;">${statusLabels[well.status] || well.status}</td></tr>
            ${well.municipality ? `<tr><td style="color: #666; padding: 3px 0;">البلدية:</td><td>${well.municipality}</td></tr>` : ''}
            ${well.depth_meters ? `<tr><td style="color: #666; padding: 3px 0;">العمق:</td><td>${well.depth_meters} م</td></tr>` : ''}
            ${well.discharge_rate_m3h ? `<tr><td style="color: #666; padding: 3px 0;">التدفق:</td><td>${well.discharge_rate_m3h} م³/س</td></tr>` : ''}
            ${well.water_quality ? `<tr><td style="color: #666; padding: 3px 0;">جودة المياه:</td><td>${qualityLabels[well.water_quality] || well.water_quality}</td></tr>` : ''}
            ${well.drilling_date ? `<tr><td style="color: #666; padding: 3px 0;">تاريخ الحفر:</td><td>${new Date(well.drilling_date).toLocaleDateString('ar-LY')}</td></tr>` : ''}
          </table>
          ${well.contractor_name ? `<p style="font-size: 11px; color: #888; margin-top: 8px; border-top: 1px solid #eee; padding-top: 8px;">المقاول: ${well.contractor_name}</p>` : ''}
        </div>
      `);

      const marker = L.marker([well.latitude, well.longitude], { icon });
      marker.bindPopup(popup);
      marker.on('click', () => { if (onWellClick) onWellClick(well); });
      marker.addTo(leafletMap);

      if (ref) ref.current.push(marker);
      bounds.push([well.latitude, well.longitude]);
    });

    if (bounds.length > 0) {
      leafletMap.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    }
  }

  return (
    <div ref={mapRef} className="w-full h-full rounded-xl" style={{ minHeight: '500px' }} />
  );
}
