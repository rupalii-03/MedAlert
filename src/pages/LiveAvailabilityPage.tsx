import React, { useState } from 'react';
import {
  Hospital,
  BedWardType,
  SpecialtyType,
} from '../types/hospital';
import { CITIES } from '../data/seedData';
import { HospitalCard } from '../components/ui/HospitalCard';
import { HospitalMap } from '../components/ui/HospitalMap';
import {
  ListFilter,
  Map,
  LayoutGrid,
  Radio,
  RotateCcw,
  Search,
} from 'lucide-react';

interface LiveAvailabilityPageProps {
  hospitals: Hospital[];
  isLoading: boolean;
  lastUpdated: Date;
  initialCityFilter: string;
  initialWardFilter: BedWardType | 'doctor_consultation' | 'all';
  initialSpecialtyFilter: SpecialtyType | 'all';
  globalSearchQuery: string;
  onRegisterWithHospital: (hospital: Hospital) => void;
}

export const LiveAvailabilityPage: React.FC<LiveAvailabilityPageProps> = ({
  hospitals,
  isLoading,
  lastUpdated,
  initialCityFilter,
  initialWardFilter,
  initialSpecialtyFilter,
  globalSearchQuery,
  onRegisterWithHospital,
}) => {
  const [cityFilter, setCityFilter] = useState<string>(initialCityFilter || 'All');
  const [wardFilter, setWardFilter] = useState<
    BedWardType | 'doctor_consultation' | 'all'
  >(initialWardFilter || 'all');
  const [specialtyFilter, setSpecialtyFilter] = useState<SpecialtyType | 'all'>(
    initialSpecialtyFilter || 'all'
  );
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(10);
  const [searchText, setSearchText] = useState<string>(globalSearchQuery || '');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const filteredHospitals = hospitals.filter((h) => {
    if (cityFilter !== 'All' && h.city !== cityFilter) return false;
    if (h.distanceKm > maxDistanceKm) return false;
    if (
      wardFilter !== 'all' &&
      wardFilter !== 'doctor_consultation' &&
      h.beds[wardFilter].available <= 0
    ) {
      return false;
    }
    if (specialtyFilter !== 'all' && !h.specialties.includes(specialtyFilter)) {
      return false;
    }
    const q = searchText.trim().toLowerCase();
    if (q) {
      const matchName = h.name.toLowerCase().includes(q);
      const matchCity = h.city.toLowerCase().includes(q);
      const matchSpec = h.specialties.some((s) => s.toLowerCase().includes(q));
      if (!matchName && !matchCity && !matchSpec) return false;
    }
    return true;
  });

  const resetFilters = () => {
    setCityFilter('All');
    setWardFilter('all');
    setSpecialtyFilter('all');
    setMaxDistanceKm(10);
    setSearchText('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header & Live Status */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white rounded-2xl p-6 border border-[#DCE6EF] shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0B7285]">
            <Radio className="w-3.5 h-3.5 text-[#16A34A]" aria-hidden="true" />
            <span>Live Hospital Bed &amp; Doctor Directory · Demo Data</span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-[#12324A]">
            Real-Time Hospital Availability
          </h1>
          <p className="text-sm text-[#475569] mt-1">
            Filter hospitals by city, bed type, on-duty specialty, and distance.
            All numbers update automatically without refreshing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="text-xs font-medium text-[#15803D] bg-[#F0FDF4] border border-[#BBF7D0] px-3 py-1.5 rounded-xl font-mono-tabular">
            Updated just now ({lastUpdated.toLocaleTimeString([], { hour12: false })})
          </div>

          {/* List / Map Toggle */}
          <div className="inline-flex items-center bg-[#F4F8FB] p-1 rounded-xl border border-[#DCE6EF]">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#0B7285] text-white'
                  : 'text-[#475569] hover:text-[#12324A]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Card List</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-[#0B7285] text-white'
                  : 'text-[#475569] hover:text-[#12324A]'
              }`}
            >
              <Map className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Interactive Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-5 border border-[#DCE6EF] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#12324A]">
            <ListFilter className="w-4 h-4 text-[#0B7285]" aria-hidden="true" />
            <span>Filter Available Hospitals</span>
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B7285] hover:text-[#12324A] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search by name */}
          <div>
            <label
              htmlFor="avail-search"
              className="block text-xs font-semibold text-[#12324A] mb-1"
            >
              Keyword Search
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#475569] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="avail-search"
                type="search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Hospital or area..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#F4F8FB] border border-[#DCE6EF] text-xs text-[#12324A] focus:bg-white focus:border-[#0B7285] focus:outline-none"
              />
            </div>
          </div>

          {/* City Filter */}
          <div>
            <label
              htmlFor="avail-city"
              className="block text-xs font-semibold text-[#12324A] mb-1"
            >
              City
            </label>
            <select
              id="avail-city"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#F4F8FB] border border-[#DCE6EF] text-xs font-medium text-[#12324A] focus:bg-white focus:border-[#0B7285] focus:outline-none"
            >
              <option value="All">All Cities ({hospitals.length})</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Bed Type Filter */}
          <div>
            <label
              htmlFor="avail-ward"
              className="block text-xs font-semibold text-[#12324A] mb-1"
            >
              Bed Type Required
            </label>
            <select
              id="avail-ward"
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-[#F4F8FB] border border-[#DCE6EF] text-xs font-medium text-[#12324A] focus:bg-white focus:border-[#0B7285] focus:outline-none"
            >
              <option value="all">All Bed Types</option>
              <option value="emergency">Emergency Beds Open</option>
              <option value="icu">ICU Beds Open</option>
              <option value="oxygen">Oxygen Beds Open</option>
              <option value="general">General Ward Beds Open</option>
            </select>
          </div>

          {/* Specialty Filter */}
          <div>
            <label
              htmlFor="avail-spec"
              className="block text-xs font-semibold text-[#12324A] mb-1"
            >
              On-Duty Specialty
            </label>
            <select
              id="avail-spec"
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-[#F4F8FB] border border-[#DCE6EF] text-xs font-medium text-[#12324A] focus:bg-white focus:border-[#0B7285] focus:outline-none"
            >
              <option value="all">Any Specialty</option>
              <option value="Emergency Medicine">Emergency Medicine</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Pulmonology">Pulmonology</option>
              <option value="Critical Care">Critical Care</option>
              <option value="General Medicine">General Medicine</option>
            </select>
          </div>

          {/* Distance Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-[#12324A] mb-1">
              <label htmlFor="avail-distance">Max Distance</label>
              <span className="font-mono-tabular text-[#0B7285]">
                ≤ {maxDistanceKm} km
              </span>
            </div>
            <input
              id="avail-distance"
              type="range"
              min={2}
              max={10}
              step={0.5}
              value={maxDistanceKm}
              onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
              className="w-full accent-[#0B7285] cursor-pointer mt-1.5"
            />
          </div>
        </div>
      </div>

      {/* Results View */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" aria-busy="true">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl border border-[#DCE6EF] p-6 h-64 animate-pulse flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-3 w-36 bg-slate-200 rounded" />
                <div className="h-5 w-64 bg-slate-200 rounded" />
                <div className="grid grid-cols-4 gap-2 pt-3">
                  <div className="h-14 bg-slate-100 rounded-xl" />
                  <div className="h-14 bg-slate-100 rounded-xl" />
                  <div className="h-14 bg-slate-100 rounded-xl" />
                  <div className="h-14 bg-slate-100 rounded-xl" />
                </div>
              </div>
              <div className="h-9 bg-slate-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredHospitals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#DCE6EF] p-12 text-center space-y-4">
          <h2 className="font-display text-xl font-bold text-[#12324A]">
            No Hospitals Match Your Current Filters
          </h2>
          <p className="text-sm text-[#475569] max-w-md mx-auto">
            Try expanding your distance range or selecting “All Cities” to view
            additional hospitals reporting open beds right now.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-5 py-2.5 rounded-xl bg-[#0B7285] text-white text-xs font-semibold hover:bg-[#095C6B] transition-colors cursor-pointer"
          >
            Show All Available Hospitals
          </button>
        </div>
      ) : viewMode === 'map' ? (
        <div className="space-y-6">
          <HospitalMap
            hospitals={filteredHospitals}
            onSelectHospital={onRegisterWithHospital}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredHospitals.map((hosp) => (
              <HospitalCard
                key={hosp.id}
                hospital={hosp}
                onRegisterWithHospital={onRegisterWithHospital}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredHospitals.map((hosp) => (
            <HospitalCard
              key={hosp.id}
              hospital={hosp}
              onRegisterWithHospital={onRegisterWithHospital}
            />
          ))}
        </div>
      )}
    </div>
  );
};
