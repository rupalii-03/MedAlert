import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Hospital, getOverallHospitalStatus } from '../../types/hospital';

interface HospitalMapProps {
  hospitals: Hospital[];
  onSelectHospital: (hospital: Hospital) => void;
}

export const HospitalMap: React.FC<HospitalMapProps> = ({
  hospitals,
  onSelectHospital,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialCenter: [number, number] =
      hospitals.length > 0
        ? [hospitals[0].coordinates.lat, hospitals[0].coordinates.lng]
        : [19.076, 72.8777];

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 11,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    markersLayerRef.current = markersGroup;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    if (hospitals.length === 0) return;

    const bounds: Array<[number, number]> = [];

    hospitals.forEach((hosp) => {
      const status = getOverallHospitalStatus(hosp);
      const color =
        status === 'available'
          ? '#16A34A'
          : status === 'limited'
          ? '#D97706'
          : '#DC2626';

      const totalOpenBeds =
        hosp.beds.general.available +
        hosp.beds.icu.available +
        hosp.beds.emergency.available +
        hosp.beds.oxygen.available;

      const iconHtml = `
        <div style="
          background: #FFFFFF;
          border: 2px solid ${color};
          border-radius: 10px;
          padding: 4px 8px;
          box-shadow: 0 4px 12px rgba(18,50,74,0.18);
          font-family: 'Open Sans', sans-serif;
          font-size: 11px;
          font-weight: 700;
          color: #12324A;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        ">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};"></span>
          <span>${totalOpenBeds} Beds · ${hosp.doctorsOnDutyCount} Dr</span>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'medalert-custom-marker',
        iconSize: [110, 28],
        iconAnchor: [55, 14],
      });

      const marker = L.marker([hosp.coordinates.lat, hosp.coordinates.lng], {
        icon: customIcon,
      });

      marker.on('click', () => {
        onSelectHospital(hosp);
      });

      marker.bindTooltip(
        `<strong>${hosp.name}</strong><br/>ICU: ${hosp.beds.icu.available} | Emergency: ${hosp.beds.emergency.available} | General: ${hosp.beds.general.available}<br/>Click marker to register & notify hospital`,
        { direction: 'top', offset: [0, -10] }
      );

      marker.addTo(markersGroup);
      bounds.push([hosp.coordinates.lat, hosp.coordinates.lng]);
    });

    if (bounds.length === 1) {
      map.setView(bounds[0], 13);
    } else if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }
  }, [hospitals, onSelectHospital]);

  return (
    <div className="rounded-2xl overflow-hidden border border-[#DCE6EF] bg-white shadow-xs">
      <div className="px-4 py-3 bg-[#F4F8FB] border-b border-[#DCE6EF] flex flex-wrap items-center justify-between gap-2 text-xs text-[#475569]">
        <span className="font-semibold text-[#12324A]">
          Interactive Hospital Capacity Map (Click any hospital marker to register)
        </span>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" /> Available
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" /> Limited
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" /> Full
          </span>
        </div>
      </div>
      <div
        ref={mapContainerRef}
        className="w-full h-[460px]"
        aria-label="Map showing hospitals and real-time bed counts"
      />
    </div>
  );
};
