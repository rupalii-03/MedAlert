export type PageRoute =
  | 'home'
  | 'availability'
  | 'register'
  | 'dashboard'
  | 'for-hospitals'
  | 'about';

export type BedWardType = 'general' | 'icu' | 'emergency' | 'oxygen';

export type AvailabilityStatus = 'available' | 'limited' | 'full';

export type SpecialtyType =
  | 'Emergency Medicine'
  | 'Cardiology'
  | 'Neurology'
  | 'Pediatrics'
  | 'Orthopedics'
  | 'Pulmonology'
  | 'General Medicine'
  | 'Critical Care';

export type UrgencyLevel = 'Routine' | 'Urgent' | 'Critical';

export interface WardCapacity {
  available: number;
  total: number;
}

export interface Hospital {
  id: string;
  name: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  distanceKm: number;
  estimatedWaitMinutes: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  beds: {
    general: WardCapacity;
    icu: WardCapacity;
    emergency: WardCapacity;
    oxygen: WardCapacity;
  };
  specialties: SpecialtyType[];
  doctorsOnDutyCount: number;
  ambulanceAvailable: boolean;
  verifiedPartner: boolean;
  lastUpdatedIso: string;
}

export interface Doctor {
  id: string;
  name: string;
  qualification: string;
  specialty: SpecialtyType;
  experienceYears: number;
  hospitalId: string;
  hospitalName: string;
  city: string;
  onDuty: boolean;
  shiftHours: string;
  languages: string[];
  consultationWaitMins: number;
}

export type PatientTrackerStep =
  | 'Registered'
  | 'Hospital notified'
  | 'Bed ready'
  | 'Arrived';

export interface PatientRegistrationPayload {
  fullName: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  phone: string;
  city: string;
  symptoms: string;
  urgency: UrgencyLevel;
  requiredCare: BedWardType | 'doctor_consultation';
  specialtyNeeded: SpecialtyType;
  preferredHospitalId: string | 'auto';
}

export interface IncomingPatientRecord {
  referenceId: string;
  createdAtIso: string;
  patientName: string;
  age: number;
  gender: string;
  phone: string;
  city: string;
  symptoms: string;
  urgency: UrgencyLevel;
  requiredCare: BedWardType | 'doctor_consultation';
  specialtyNeeded: SpecialtyType;
  assignedHospitalId: string;
  assignedHospitalName: string;
  assignedWardLabel: string;
  assignedDoctorName: string;
  estimatedWaitMinutes: number;
  distanceKm: number;
  statusStep: PatientTrackerStep;
}

export interface LiveFeedNotification {
  id: string;
  timestampIso: string;
  hospitalId: string;
  hospitalName: string;
  city: string;
  summary: string;
  category: 'bed_update' | 'doctor_duty' | 'patient_matched';
}

export function getWardStatus(ward: WardCapacity): AvailabilityStatus {
  if (ward.available <= 0) return 'full';
  const ratio = ward.available / Math.max(1, ward.total);
  if (ward.available <= 3 || ratio < 0.15) return 'limited';
  return 'available';
}

export function getOverallHospitalStatus(hospital: Hospital): AvailabilityStatus {
  const totalAvail =
    hospital.beds.general.available +
    hospital.beds.icu.available +
    hospital.beds.emergency.available +
    hospital.beds.oxygen.available;
  const totalCap =
    hospital.beds.general.total +
    hospital.beds.icu.total +
    hospital.beds.emergency.total +
    hospital.beds.oxygen.total;

  if (totalAvail <= 0) return 'full';
  if (totalAvail / Math.max(1, totalCap) < 0.15) return 'limited';
  return 'available';
}

export function getHospitalOccupancyPercent(hospital: Hospital): number {
  const totalAvail =
    hospital.beds.general.available +
    hospital.beds.icu.available +
    hospital.beds.emergency.available +
    hospital.beds.oxygen.available;
  const totalCap =
    hospital.beds.general.total +
    hospital.beds.icu.total +
    hospital.beds.emergency.total +
    hospital.beds.oxygen.total;

  return Math.round(((totalCap - totalAvail) / Math.max(1, totalCap)) * 100);
}
