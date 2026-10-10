import React, { useState } from 'react';
import {
  Hospital,
  getWardStatus,
  getOverallHospitalStatus,
} from '../../types/hospital';
import { StatusBadge } from './StatusBadge';
import {
  MapPin,
  Clock,
  Stethoscope,
  Phone,
  Navigation,
  ArrowRight,
  ShieldCheck,
  Truck,
} from 'lucide-react';

interface HospitalCardProps {
  hospital: Hospital;
  onRegisterWithHospital: (hospital: Hospital) => void;
  compact?: boolean;
}

export const HospitalCard: React.FC<HospitalCardProps> = ({
  hospital,
  onRegisterWithHospital,
  compact = false,
}) => {
  const [showDirectionsInfo, setShowDirectionsInfo] = useState(false);

  const overallStatus = getOverallHospitalStatus(hospital);

  const wards = [
    { key: 'general', label: 'General Beds', data: hospital.beds.general },
    { key: 'icu', label: 'ICU Beds', data: hospital.beds.icu },
    { key: 'emergency', label: 'Emergency', data: hospital.beds.emergency },
    { key: 'oxygen', label: 'Oxygen Beds', data: hospital.beds.oxygen },
  ] as const;

  const wardColorClasses = {
    available: 'bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]',
    limited: 'bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]',
    full: 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]',
  };

  return (
    <article className="bg-white rounded-2xl border border-[#DCE6EF] shadow-[0_4px_20px_-4px_rgba(18,50,74,0.06)] hover:border-[#0B7285]/50 transition-all p-5 sm:p-6 flex flex-col justify-between">
      <div>
        {/* Top metadata row: unboxed clean text with separators */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#475569]">
          <div className="flex flex-wrap items-center gap-1.5">
            {hospital.verifiedPartner && (
              <>
                <span className="inline-flex items-center gap-1 font-semibold text-[#0B7285]">
                  <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                  Verified Partner
                </span>
                <span aria-hidden="true">·</span>
              </>
            )}
            <span>{hospital.city}</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 font-mono-tabular">
              <MapPin className="w-3.5 h-3.5 text-[#0B7285]" aria-hidden="true" />
              {hospital.distanceKm.toFixed(1)} km away
            </span>
          </div>

          <StatusBadge status={overallStatus} />
        </div>

        {/* Hospital Name & Address */}
        <h3 className="mt-2 font-display text-lg font-bold text-[#12324A] leading-snug">
          {hospital.name}
        </h3>
        {!compact && (
          <p className="mt-1 text-xs text-[#475569]">{hospital.address}</p>
        )}

        {/* 4 Ward Bed Breakdown Tiles */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {wards.map((w) => {
            const st = getWardStatus(w.data);
            return (
              <div
                key={w.key}
                className={`rounded-xl border px-3 py-2.5 ${wardColorClasses[st]}`}
              >
                <div className="text-[11px] font-medium opacity-90">
                  {w.label}
                </div>
                <div className="mt-0.5 flex items-baseline gap-1 font-mono-tabular">
                  <span className="text-lg font-bold">{w.data.available}</span>
                  <span className="text-xs opacity-75">/ {w.data.total}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Doctors on Duty, Wait Time, and Specialties */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-[#475569]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 font-medium text-[#12324A]">
              <Stethoscope className="w-4 h-4 text-[#0B7285]" aria-hidden="true" />
              <span className="font-mono-tabular font-bold">
                {hospital.doctorsOnDutyCount}
              </span>{' '}
              Doctors on duty
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5 font-medium text-[#12324A]">
              <Clock className="w-4 h-4 text-[#F58220]" aria-hidden="true" />
              Est. wait:{' '}
              <span className="font-mono-tabular font-bold">
                ~{hospital.estimatedWaitMinutes} mins
              </span>
            </span>
            {hospital.ambulanceAvailable && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 text-[#15803D] font-medium">
                  <Truck className="w-3.5 h-3.5" aria-hidden="true" />
                  Ambulance Ready
                </span>
              </>
            )}
          </div>
        </div>

        {!compact && (
          <div className="mt-2.5 text-xs text-[#475569]">
            <span className="font-semibold text-[#12324A]">On-call specialties: </span>
            {hospital.specialties.join(' · ')}
          </div>
        )}
      </div>

      {/* Directions Expandable Panel */}
      {showDirectionsInfo && (
        <div className="mt-4 p-3.5 rounded-xl bg-[#F4F8FB] border border-[#DCE6EF] text-xs text-[#12324A] space-y-1.5">
          <div className="font-semibold flex items-center justify-between">
            <span>Hospital Route &amp; Emergency Desk</span>
            <span className="font-mono-tabular text-[#0B7285]">
              {hospital.coordinates.lat.toFixed(4)}° N, {hospital.coordinates.lng.toFixed(4)}° E
            </span>
          </div>
          <p className="text-[#475569]">{hospital.address}</p>
          <div className="flex flex-wrap items-center gap-4 pt-1 font-medium text-[#0B7285]">
            <span className="inline-flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" />
              Emergency Desk: {hospital.phone}
            </span>
            <span>Est. Drive: {Math.max(5, Math.round(hospital.distanceKm * 3))} mins</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
        <button
          type="button"
          onClick={() => setShowDirectionsInfo((prev) => !prev)}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#DCE6EF] hover:border-[#0B7285] text-xs font-semibold text-[#12324A] hover:text-[#0B7285] bg-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Navigation className="w-3.5 h-3.5 text-[#0B7285]" aria-hidden="true" />
          <span>{showDirectionsInfo ? 'Hide Directions' : 'Get Directions'}</span>
        </button>

        <button
          type="button"
          onClick={() => onRegisterWithHospital(hospital)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#F58220] hover:bg-[#E06D0B] text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer whitespace-nowrap shrink-0"
        >
          <span>Register &amp; Notify Hospital</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
};
