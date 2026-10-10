import React from 'react';
import { Doctor } from '../../types/hospital';
import { Stethoscope, Clock, Building2, CheckCircle2, Calendar } from 'lucide-react';

interface DoctorCardProps {
  doctor: Doctor;
  onConsultDoctor: (doctor: Doctor) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  onConsultDoctor,
}) => {
  return (
    <article className="bg-white rounded-2xl border border-[#DCE6EF] shadow-[0_4px_18px_-4px_rgba(18,50,74,0.05)] p-5 flex flex-col justify-between hover:border-[#0B7285]/45 transition-all">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-[#0B7285]">
              {doctor.specialty} · {doctor.experienceYears} yrs exp
            </div>
            <h3 className="mt-1 font-display text-base font-bold text-[#12324A]">
              {doctor.name}
            </h3>
            <p className="text-xs text-[#475569] mt-0.5">{doctor.qualification}</p>
          </div>

          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold shrink-0 ${
              doctor.onDuty ? 'text-[#15803D]' : 'text-[#B45309]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{doctor.onDuty ? 'On Duty Now' : 'Next Shift'}</span>
          </span>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-[#475569]">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-[#0B7285] shrink-0" aria-hidden="true" />
            <span className="truncate font-medium text-[#12324A]">
              {doctor.hospitalName}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#0B7285]" aria-hidden="true" />
              <span>Shift: {doctor.shiftHours}</span>
            </span>
            <span className="font-mono-tabular font-semibold text-[#12324A]">
              Wait: ~{doctor.consultationWaitMins}m
            </span>
          </div>
          <div className="text-[11px] text-[#475569]">
            Languages: {doctor.languages.join(' · ')}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => onConsultDoctor(doctor)}
          className="w-full py-2 px-3.5 rounded-xl bg-[#F4F8FB] hover:bg-[#0B7285] text-[#0B7285] hover:text-white border border-[#DCE6EF] hover:border-[#0B7285] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Register for Consultation</span>
        </button>
      </div>
    </article>
  );
};
