import React, { useState } from 'react';
import { BedWardType, SpecialtyType } from '../../types/hospital';
import { CITIES } from '../../data/seedData';
import { MapPin, Bed, Stethoscope, Search, Radio } from 'lucide-react';

interface SearchCardProps {
  reportingHospitalsCount: number;
  initialCity?: string;
  onSearchSubmit: (filters: {
    city: string;
    careNeed: BedWardType | 'doctor_consultation' | 'all';
    specialty: SpecialtyType | 'all';
  }) => void;
}

export const SearchCard: React.FC<SearchCardProps> = ({
  reportingHospitalsCount,
  initialCity = 'Bengaluru',
  onSearchSubmit,
}) => {
  const [city, setCity] = useState<string>(initialCity);
  const [careNeed, setCareNeed] = useState<
    BedWardType | 'doctor_consultation' | 'all'
  >('all');
  const [specialty, setSpecialty] = useState<SpecialtyType | 'all'>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit({ city, careNeed, specialty });
  };

  return (
    <div className="bg-white rounded-2xl border border-[#DCE6EF] shadow-[0_12px_32px_-8px_rgba(18,50,74,0.08)] p-6 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-100">
        <div>
          <h2 className="font-display text-lg sm:text-xl font-bold text-[#12324A]">
            Find Available Hospital Care Near You
          </h2>
          <p className="text-xs sm:text-sm text-[#475569] mt-0.5">
            Search verified hospitals reporting live bed and doctor capacity right now
          </p>
        </div>

        {/* Live reporting indicator */}
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#0B7285] bg-[#F4F8FB] px-3 py-1.5 rounded-lg border border-[#DCE6EF]">
          <Radio className="w-3.5 h-3.5 text-[#16A34A] shrink-0" aria-hidden="true" />
          <span className="font-mono-tabular">
            {reportingHospitalsCount} hospitals reporting live
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        {/* Location Selector */}
        <div className="md:col-span-3">
          <label
            htmlFor="hero-search-city"
            className="block text-xs font-semibold text-[#12324A] mb-1.5"
          >
            City / Location
          </label>
          <div className="relative">
            <MapPin
              className="w-4 h-4 text-[#0B7285] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <select
              id="hero-search-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#F4F8FB] border border-[#DCE6EF] text-sm font-medium text-[#12324A] focus:bg-white focus:border-[#0B7285] focus:outline-none focus:ring-2 focus:ring-[#0B7285]/20"
            >
              <option value="All">All Cities</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Type of Care Needed */}
        <div className="md:col-span-3">
          <label
            htmlFor="hero-search-need"
            className="block text-xs font-semibold text-[#12324A] mb-1.5"
          >
            Care or Bed Needed
          </label>
          <div className="relative">
            <Bed
              className="w-4 h-4 text-[#0B7285] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <select
              id="hero-search-need"
              value={careNeed}
              onChange={(e) => setCareNeed(e.target.value as any)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#F4F8FB] border border-[#DCE6EF] text-sm font-medium text-[#12324A] focus:bg-white focus:border-[#0B7285] focus:outline-none focus:ring-2 focus:ring-[#0B7285]/20"
            >
              <option value="all">All Bed &amp; Care Types</option>
              <option value="emergency">Emergency Triage Bed</option>
              <option value="icu">ICU / Critical Care Bed</option>
              <option value="oxygen">Oxygen-Supported Bed</option>
              <option value="general">General Recovery Bed</option>
              <option value="doctor_consultation">Doctor Consultation</option>
            </select>
          </div>
        </div>

        {/* Medical Specialty */}
        <div className="md:col-span-3">
          <label
            htmlFor="hero-search-specialty"
            className="block text-xs font-semibold text-[#12324A] mb-1.5"
          >
            Department / Specialty
          </label>
          <div className="relative">
            <Stethoscope
              className="w-4 h-4 text-[#0B7285] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <select
              id="hero-search-specialty"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value as any)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#F4F8FB] border border-[#DCE6EF] text-sm font-medium text-[#12324A] focus:bg-white focus:border-[#0B7285] focus:outline-none focus:ring-2 focus:ring-[#0B7285]/20"
            >
              <option value="all">Any Specialty</option>
              <option value="Emergency Medicine">Emergency Medicine</option>
              <option value="Cardiology">Cardiology &amp; Heart Care</option>
              <option value="Neurology">Neurology &amp; Stroke</option>
              <option value="Pediatrics">Pediatrics &amp; Child Care</option>
              <option value="Orthopedics">Orthopedics &amp; Trauma</option>
              <option value="Pulmonology">Pulmonology &amp; Respiratory</option>
              <option value="Critical Care">Critical Care / ICU</option>
              <option value="General Medicine">General Medicine</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="md:col-span-3">
          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-[#F58220] hover:bg-[#E06D0B] text-white font-display text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#12324A]"
          >
            <Search className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Check Live Availability</span>
          </button>
        </div>
      </form>
    </div>
  );
};
