import React, { useState, useEffect } from 'react';
import {
  PageRoute,
  BedWardType,
  SpecialtyType,
  Hospital,
  Doctor,
} from './types/hospital';
import { useHospitalFeed } from './hooks/useHospitalFeed';
import { HeaderLayout } from './components/layout/HeaderLayout';
import { FooterLayout } from './components/layout/FooterLayout';
import { HomePage } from './pages/HomePage';
import { LiveAvailabilityPage } from './pages/LiveAvailabilityPage';
import { PatientRegistrationPage } from './pages/PatientRegistrationPage';
import { HospitalDashboardPage } from './pages/HospitalDashboardPage';
import { ForHospitalsPage } from './pages/ForHospitalsPage';
import { AboutAndContactPage } from './pages/AboutAndContactPage';
import { Radio, X } from 'lucide-react';

export default function App() {
  const {
    hospitals,
    doctors,
    incomingPatients,
    demoRequests,
    contactInquiries,
    latestToast,
    dismissToast,
    isLoading,
    lastUpdated,
    updateHospitalBeds,
    toggleDoctorDuty,
    addDoctorToHospital,
    updatePatientTrackerStatus,
    registerPatient,
    lookupPatientByReferenceId,
    loginHospitalStaff,
    submitHospitalDemoRequest,
    submitContactInquiry,
    resetBackendDatabase,
  } = useHospitalFeed();

  const [currentPage, setCurrentPage] = useState<PageRoute>('home');
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  // Shared filter state when navigating from Home SearchCard to Live Availability
  const [availCityFilter, setAvailCityFilter] = useState<string>('All');
  const [availWardFilter, setAvailWardFilter] = useState<
    BedWardType | 'doctor_consultation' | 'all'
  >('all');
  const [availSpecFilter, setAvailSpecFilter] = useState<
    SpecialtyType | 'all'
  >('all');

  // Preselected hospital / specialty when clicking "Register & Notify Hospital" or "Register for Consultation"
  const [preselectedHospitalId, setPreselectedHospitalId] = useState<
    string | 'auto'
  >('auto');
  const [preselectedSpecialty, setPreselectedSpecialty] =
    useState<SpecialtyType>('Emergency Medicine');

  // Auto-dismiss live update toast after 5.5 seconds
  useEffect(() => {
    if (!latestToast) return;
    const timer = setTimeout(() => {
      dismissToast();
    }, 5500);
    return () => clearTimeout(timer);
  }, [latestToast, dismissToast]);

  const handleNavigate = (page: PageRoute, query?: string) => {
    if (typeof query === 'string') {
      setGlobalSearchQuery(query);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHeroSearchSubmit = (filters: {
    city: string;
    careNeed: BedWardType | 'doctor_consultation' | 'all';
    specialty: SpecialtyType | 'all';
  }) => {
    setAvailCityFilter(filters.city);
    setAvailWardFilter(filters.careNeed);
    setAvailSpecFilter(filters.specialty);
    setCurrentPage('availability');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRegisterWithHospital = (hospital: Hospital) => {
    setPreselectedHospitalId(hospital.id);
    setPreselectedSpecialty(hospital.specialties[0] || 'Emergency Medicine');
    setCurrentPage('register');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConsultDoctor = (doctor: Doctor) => {
    setPreselectedHospitalId(doctor.hospitalId);
    setPreselectedSpecialty(doctor.specialty);
    setCurrentPage('register');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F8FB] text-[#1E293B]">
      <HeaderLayout
        currentPage={currentPage}
        onNavigate={handleNavigate}
        globalSearchQuery={globalSearchQuery}
        onGlobalSearchChange={setGlobalSearchQuery}
      />

      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            hospitals={hospitals}
            doctors={doctors}
            lastUpdated={lastUpdated}
            onNavigate={handleNavigate}
            onSearchFilterSubmit={handleHeroSearchSubmit}
            onRegisterWithHospital={handleRegisterWithHospital}
            onConsultDoctor={handleConsultDoctor}
          />
        )}

        {currentPage === 'availability' && (
          <LiveAvailabilityPage
            hospitals={hospitals}
            isLoading={isLoading}
            lastUpdated={lastUpdated}
            initialCityFilter={availCityFilter}
            initialWardFilter={availWardFilter}
            initialSpecialtyFilter={availSpecFilter}
            globalSearchQuery={globalSearchQuery}
            onRegisterWithHospital={handleRegisterWithHospital}
          />
        )}

        {currentPage === 'register' && (
          <PatientRegistrationPage
            hospitals={hospitals}
            preselectedHospitalId={preselectedHospitalId}
            preselectedSpecialty={preselectedSpecialty}
            onRegisterSubmit={registerPatient}
            onLookupReferenceId={lookupPatientByReferenceId}
            onUpdateTrackerStep={updatePatientTrackerStatus}
          />
        )}

        {currentPage === 'dashboard' && (
          <HospitalDashboardPage
            hospitals={hospitals}
            doctors={doctors}
            incomingPatients={incomingPatients}
            demoRequests={demoRequests}
            contactInquiries={contactInquiries}
            onUpdateBeds={updateHospitalBeds}
            onToggleDoctorDuty={toggleDoctorDuty}
            onAddDoctor={addDoctorToHospital}
            onUpdatePatientStatus={updatePatientTrackerStatus}
            onStaffLogin={loginHospitalStaff}
            onResetDatabase={resetBackendDatabase}
          />
        )}

        {currentPage === 'for-hospitals' && (
          <ForHospitalsPage
            onNavigate={handleNavigate}
            onSubmitDemoRequest={submitHospitalDemoRequest}
          />
        )}

        {currentPage === 'about' && (
          <AboutAndContactPage onSubmitInquiry={submitContactInquiry} />
        )}
      </main>

      {/* Non-intrusive Live Update Toast Notification */}
      {latestToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 max-w-sm bg-white rounded-2xl border border-[#0B7285] shadow-[0_12px_28px_-6px_rgba(18,50,74,0.18)] p-4 flex items-start gap-3"
        >
          <div className="w-8 h-8 rounded-xl bg-[#EAF3F8] text-[#0B7285] flex items-center justify-center shrink-0 mt-0.5">
            <Radio className="w-4 h-4 text-[#16A34A]" aria-hidden="true" />
          </div>
          <div className="text-xs flex-1">
            <div className="font-bold text-[#0B7285] flex items-center justify-between">
              <span>Live Hospital Network Update</span>
              <span className="font-mono-tabular text-[10px] text-[#475569]">
                {new Date(latestToast.timestampIso).toLocaleTimeString([], {
                  hour12: false,
                })}
              </span>
            </div>
            <p className="text-[#12324A] font-medium mt-0.5 leading-snug">
              {latestToast.summary}
            </p>
          </div>
          <button
            type="button"
            onClick={dismissToast}
            aria-label="Dismiss notification"
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <FooterLayout onNavigate={handleNavigate} />
    </div>
  );
}
