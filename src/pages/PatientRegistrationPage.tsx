import React, { useState } from 'react';
import {
  Hospital,
  Doctor,
  PatientRegistrationPayload,
  IncomingPatientRecord,
  UrgencyLevel,
  BedWardType,
  SpecialtyType,
  PatientTrackerStep,
} from '../types/hospital';
import { CITIES } from '../data/seedData';
import { StepTracker } from '../components/ui/StepTracker';
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Navigation,
  Phone,
  Stethoscope,
  Bed,
  Clock,
  RefreshCw,
  FileCheck2,
} from 'lucide-react';

interface PatientRegistrationPageProps {
  hospitals: Hospital[];
  preselectedHospitalId?: string;
  preselectedSpecialty?: SpecialtyType;
  onRegisterSubmit: (
    payload: PatientRegistrationPayload
  ) => Promise<{
    record: IncomingPatientRecord;
    hospital: Hospital;
    doctor: Doctor;
  }>;
  onUpdateTrackerStep: (referenceId: string, step: PatientTrackerStep) => void;
}

export const PatientRegistrationPage: React.FC<
  PatientRegistrationPageProps
> = ({
  hospitals,
  preselectedHospitalId = 'auto',
  preselectedSpecialty = 'Emergency Medicine',
  onRegisterSubmit,
  onUpdateTrackerStep,
}) => {
  const [formStep, setFormStep] = useState<1 | 2 | 3>(1);

  // Step 1: Personal Details
  const [fullName, setFullName] = useState('Aarav Sharma (Demo Patient)');
  const [age, setAge] = useState('46');
  const [gender, setGender] = useState<'Female' | 'Male' | 'Other'>('Male');
  const [phone, setPhone] = useState('+91 98450 11223');

  // Step 2: Symptoms & Urgency
  const [symptoms, setSymptoms] = useState(
    'Sudden chest discomfort, shortness of breath, and dizziness for the past 40 minutes'
  );
  const [urgency, setUrgency] = useState<UrgencyLevel>('Urgent');
  const [requiredCare, setRequiredCare] = useState<
    BedWardType | 'doctor_consultation'
  >('emergency');
  const [specialtyNeeded, setSpecialtyNeeded] =
    useState<SpecialtyType>(preselectedSpecialty);

  // Step 3: Location & Hospital Preference
  const preselectedHospObj = hospitals.find(
    (h) => h.id === preselectedHospitalId
  );
  const [city, setCity] = useState<string>(
    preselectedHospObj ? preselectedHospObj.city : 'Bengaluru'
  );
  const [preferredHospitalId, setPreferredHospitalId] = useState<
    string | 'auto'
  >(preselectedHospitalId);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{
    record: IncomingPatientRecord;
    hospital: Hospital;
    doctor: Doctor;
  } | null>(null);

  const validateCurrentStep = (): boolean => {
    setValidationError(null);
    if (formStep === 1) {
      if (!fullName.trim() || fullName.trim().length < 2) {
        setValidationError('Please enter the patient’s full name.');
        return false;
      }
      const numAge = Number(age);
      if (!age || Number.isNaN(numAge) || numAge < 1 || numAge > 120) {
        setValidationError('Please enter a valid age between 1 and 120.');
        return false;
      }
      if (!phone.trim() || phone.trim().length < 8) {
        setValidationError('Please enter a valid contact phone number.');
        return false;
      }
    }
    if (formStep === 2) {
      if (!symptoms.trim() || symptoms.trim().length < 6) {
        setValidationError(
          'Please describe the patient’s main symptoms or medical need.'
        );
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (!validateCurrentStep()) return;
    if (formStep === 1) setFormStep(2);
    else if (formStep === 2) setFormStep(3);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    setTimeout(async () => {
      const result = await onRegisterSubmit({
        fullName: fullName.trim(),
        age: Number(age),
        gender,
        phone: phone.trim(),
        city,
        symptoms: symptoms.trim(),
        urgency,
        requiredCare,
        specialtyNeeded,
        preferredHospitalId,
      });
      setConfirmationData(result);
      setIsSubmitting(false);
    }, 650);
  };

  const cityHospitals = hospitals.filter((h) => h.city === city);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#DCE6EF] shadow-xs">
        <div className="text-xs font-bold uppercase tracking-wider text-[#0B7285]">
          Instant Pre-Arrival Hospital Registration · Demo Mode
        </div>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-[#12324A]">
          Register Patient &amp; Notify Hospital Care Team
        </h1>
        <p className="mt-1.5 text-sm text-[#475569]">
          Complete this quick 3-step form so we can match you with an available
          bed and alert the receiving hospital’s triage desk before you arrive.
        </p>

        {/* Multi-Step Form Progress Bar */}
        {!confirmationData && (
          <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-3 gap-3">
            {[
              { step: 1, label: '1. Patient Details' },
              { step: 2, label: '2. Symptoms & Urgency' },
              { step: 3, label: '3. Location & Hospital Match' },
            ].map((item) => {
              const active = formStep === item.step;
              const done = formStep > item.step;
              return (
                <button
                  key={item.step}
                  type="button"
                  onClick={() => {
                    if (item.step < formStep) setFormStep(item.step as any);
                  }}
                  className={`text-left p-3 rounded-xl border text-xs font-semibold transition-all ${
                    active
                      ? 'bg-[#EAF3F8] border-[#0B7285] text-[#12324A]'
                      : done
                      ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D] cursor-pointer'
                      : 'bg-[#F4F8FB] border-[#DCE6EF] text-[#475569]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation State */}
      {confirmationData ? (
        <div
          role="status"
          aria-live="polite"
          className="space-y-6 animate-fadeIn"
        >
          <div className="bg-white rounded-2xl border-2 border-[#16A34A] shadow-[0_12px_32px_-8px_rgba(22,163,74,0.15)] p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#15803D]">
                    Hospital Notified &amp; Bed Pre-Allocated
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-[#12324A]">
                    {confirmationData.hospital.name}
                  </h2>
                </div>
              </div>

              <div className="bg-[#F4F8FB] px-4 py-2 rounded-xl border border-[#DCE6EF] text-right">
                <div className="text-[11px] text-[#475569]">Reference ID</div>
                <div className="font-mono-tabular text-base font-bold text-[#0B7285]">
                  {confirmationData.record.referenceId}
                </div>
              </div>
            </div>

            {/* Key Assignment Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#F4F8FB] border border-[#DCE6EF]">
                <div className="text-xs text-[#475569] flex items-center gap-1.5">
                  <Bed className="w-4 h-4 text-[#0B7285]" />
                  <span>Assigned Ward / Bed</span>
                </div>
                <div className="mt-1 font-display text-sm font-bold text-[#12324A]">
                  {confirmationData.record.assignedWardLabel}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F4F8FB] border border-[#DCE6EF]">
                <div className="text-xs text-[#475569] flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-[#0B7285]" />
                  <span>Doctor on Duty</span>
                </div>
                <div className="mt-1 font-display text-sm font-bold text-[#12324A]">
                  {confirmationData.record.assignedDoctorName}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F4F8FB] border border-[#DCE6EF]">
                <div className="text-xs text-[#475569] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#F58220]" />
                  <span>Estimated Triage Wait</span>
                </div>
                <div className="mt-1 font-mono-tabular text-base font-bold text-[#15803D]">
                  ~{confirmationData.record.estimatedWaitMinutes} mins
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F4F8FB] border border-[#DCE6EF]">
                <div className="text-xs text-[#475569] flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-[#0B7285]" />
                  <span>Distance &amp; Travel</span>
                </div>
                <div className="mt-1 font-mono-tabular text-base font-bold text-[#12324A]">
                  {confirmationData.record.distanceKm.toFixed(1)} km away
                </div>
              </div>
            </div>

            {/* Status Tracker (Registered -> Hospital notified -> Bed ready -> Arrived) */}
            <StepTracker
              currentStep={confirmationData.record.statusStep}
              onChangeStep={(nextStep) => {
                onUpdateTrackerStep(confirmationData.record.referenceId, nextStep);
                setConfirmationData((prev) =>
                  prev
                    ? {
                        ...prev,
                        record: { ...prev.record, statusStep: nextStep },
                      }
                    : null
                );
              }}
            />

            {/* Hospital Directions & Contact Box */}
            <div className="rounded-xl bg-[#EAF3F8]/70 border border-[#DCE6EF] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase text-[#0B7285]">
                  Directions &amp; Emergency Gate Instructions
                </div>
                <p className="text-sm font-semibold text-[#12324A]">
                  {confirmationData.hospital.address}
                </p>
                <p className="text-xs text-[#475569]">
                  Show Reference ID{' '}
                  <strong className="text-[#12324A]">
                    {confirmationData.record.referenceId}
                  </strong>{' '}
                  at the Triage Desk upon arrival.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <a
                  href={`tel:${confirmationData.hospital.phone}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#DCE6EF] text-xs font-semibold text-[#12324A] hover:border-[#0B7285]"
                >
                  <Phone className="w-3.5 h-3.5 text-[#0B7285]" />
                  <span>{confirmationData.hospital.phone}</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmationData(null);
                    setFormStep(1);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#0B7285] hover:bg-[#095C6B] text-white text-xs font-semibold cursor-pointer"
                >
                  Register Another Patient
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Multi-step Registration Form */
        <form
          onSubmit={handleFinalSubmit}
          className="bg-white rounded-2xl p-6 sm:p-8 border border-[#DCE6EF] shadow-xs space-y-6"
          noValidate
        >
          {formStep === 1 && (
            <div className="space-y-5">
              <h2 className="font-display text-lg font-bold text-[#12324A]">
                Step 1: Patient Personal Details (Sample Demo Data)
              </h2>

              <div>
                <label
                  htmlFor="reg-fullname"
                  className="block text-xs font-semibold text-[#12324A] mb-1.5"
                >
                  Patient Full Name *
                </label>
                <input
                  id="reg-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F4F8FB] border border-[#DCE6EF] text-sm text-[#12324A] focus:bg-white focus:border-[#0B7285] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="reg-age"
                    className="block text-xs font-semibold text-[#12324A] mb-1.5"
                  >
                    Age (Years) *
                  </label>
                  <input
                    id="reg-age"
                    type="number"
                    min={1}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F4F8FB] border border-[#DCE6EF] text-sm font-mono-tabular text-[#12324A] focus:bg-white focus:border-[#0B7285] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="reg-gender"
                    className="block text-xs font-semibold text-[#12324A] mb-1.5"
                  >
                    Gender
                  </label>
                  <select
                    id="reg-gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F4F8FB] border border-[#DCE6EF] text-sm text-[#12324A] focus:bg-white focus:border-[#0B7285] focus:outline-none"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="reg-phone"
                    className="block text-xs font-semibold text-[#12324A] mb-1.5"
                  >
                    Contact Phone Number *
                  </label>
                  <input
                    id="reg-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F4F8FB] border border-[#DCE6EF] text-sm font-mono-tabular text-[#12324A] focus:bg-white focus:border-[#0B7285] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {formStep === 2 && (
            <div className="space-y-5">
              <h2 className="font-display text-lg font-bold text-[#12324A]">
                Step 2: Medical Condition, Symptoms &amp; Urgency
              </h2>

              <div>
                <span className="block text-xs font-semibold text-[#12324A] mb-2">
                  Urgency Level *
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(
                    [
                      {
                        level: 'Routine',
                        desc: 'Non-life-threatening consultation or planned admission',
                      },
                      {
                        level: 'Urgent',
                        desc: 'Prompt medical attention & bed required within 30 mins',
                      },
                      {
                        level: 'Critical',
                        desc: 'Immediate emergency, ICU, or resuscitation care required',
                      },
                    ] as const
                  ).map((item) => {
                    const selected = urgency === item.level;
                    return (
                      <button
                        key={item.level}
                        type="button"
                        onClick={() => setUrgency(item.level)}
                        className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                          selected
                            ? 'bg-[#EAF3F8] border-[#0B7285] ring-2 ring-[#0B7285]/15'
                            : 'bg-[#F4F8FB] border-[#DCE6EF] hover:border-[#0B7285]/50'
                        }`}
                      >
                        <div className="font-display text-sm font-bold text-[#12324A]">
                          {item.level}
                        </div>
                        <p className="text-xs text-[#475569] mt-0.5">
                          {item.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="reg-care-type"
                    className="block text-xs font-semibold text-[#12324A] mb-1.5"
                  >
                    Type of Bed or Care Needed *
                  </label>
                  <select
                    id="reg-care-type"
                    value={requiredCare}
                    onChange={(e) => setRequiredCare(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F4F8FB] border border-[#DCE6EF] text-sm text-[#12324A] focus:bg-white focus:border-[#0B7285] focus:outline-none"
                  >
                    <option value="emergency">Emergency Triage Bed</option>
                    <option value="icu">ICU / Critical Care Bed</option>
                    <option value="oxygen">Oxygen-Supported Bed</option>
                    <option value="general">General Recovery Bed</option>
                    <option value="doctor_consultation">
                      Specialist Doctor Consultation
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="reg-specialty"
                    className="block text-xs font-semibold text-[#12324A] mb-1.5"
                  >
                    Relevant Medical Specialty
                  </label>
                  <select
                    id="reg-specialty"
                    value={specialtyNeeded}
                    onChange={(e) => setSpecialtyNeeded(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F4F8FB] border border-[#DCE6EF] text-sm text-[#12324A] focus:bg-white focus:border-[#0B7285] focus:outline-none"
                  >
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
              </div>

              <div>
                <label
                  htmlFor="reg-symptoms"
                  className="block text-xs font-semibold text-[#12324A] mb-1.5"
                >
                  Brief Description of Symptoms / Condition *
                </label>
                <textarea
                  id="reg-symptoms"
                  rows={3}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F4F8FB] border border-[#DCE6EF] text-sm text-[#12324A] focus:bg-white focus:border-[#0B7285] focus:outline-none"
                />
              </div>
            </div>
          )}

          {formStep === 3 && (
            <div className="space-y-5">
              <h2 className="font-display text-lg font-bold text-[#12324A]">
                Step 3: Location &amp; Preferred Hospital Selection
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="reg-city"
                    className="block text-xs font-semibold text-[#12324A] mb-1.5"
                  >
                    Your Current City *
                  </label>
                  <select
                    id="reg-city"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      setPreferredHospitalId('auto');
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F4F8FB] border border-[#DCE6EF] text-sm text-[#12324A] focus:bg-white focus:border-[#0B7285] focus:outline-none"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="reg-pref-hosp"
                    className="block text-xs font-semibold text-[#12324A] mb-1.5"
                  >
                    Hospital Selection Mode
                  </label>
                  <select
                    id="reg-pref-hosp"
                    value={preferredHospitalId}
                    onChange={(e) => setPreferredHospitalId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F4F8FB] border border-[#DCE6EF] text-sm text-[#12324A] focus:bg-white focus:border-[#0B7285] focus:outline-none"
                  >
                    <option value="auto">
                      Auto-Match Best Nearby Hospital (Recommended)
                    </option>
                    {cityHospitals.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} ({h.distanceKm} km · Wait ~{h.estimatedWaitMinutes}m)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-xl bg-[#F4F8FB] border border-[#DCE6EF] p-4 text-xs text-[#475569] space-y-1">
                <div className="font-bold text-[#12324A] flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-[#0B7285]" />
                  <span>Summary of Pre-Arrival Notification</span>
                </div>
                <p>
                  Patient: <strong className="text-[#12324A]">{fullName}</strong> ({age} yrs, {gender}) · Urgency:{' '}
                  <strong className="text-[#12324A]">{urgency}</strong> · Specialty:{' '}
                  <strong className="text-[#12324A]">{specialtyNeeded}</strong>
                </p>
              </div>
            </div>
          )}

          {validationError && (
            <div
              role="alert"
              className="rounded-xl bg-[#FEF2F2] border border-[#FECACA] p-3.5 text-xs font-semibold text-[#DC2626] flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
            {formStep > 1 ? (
              <button
                type="button"
                onClick={() => setFormStep((prev) => (prev - 1) as any)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#DCE6EF] text-xs font-semibold text-[#12324A] hover:bg-[#F4F8FB] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>
            ) : (
              <div />
            )}

            {formStep < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#0B7285] hover:bg-[#095C6B] text-white font-display text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F58220] hover:bg-[#E06D0B] disabled:opacity-60 text-white font-display text-sm font-semibold transition-colors shadow-sm cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Matching &amp; Notifying Hospital...</span>
                  </>
                ) : (
                  <>
                    <span>Submit &amp; Notify Hospital Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};
