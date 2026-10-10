import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  INITIAL_HOSPITALS,
  INITIAL_DOCTORS,
  INITIAL_INCOMING_PATIENTS,
} from './seedData.ts';
import {
  Hospital,
  Doctor,
  IncomingPatientRecord,
  LiveFeedNotification,
  HospitalDemoRequestRecord,
  ContactInquiryRecord,
  DoctorAddPayload,
} from '../types/hospital.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DB_DIR, 'medalert_db.json');

export interface DatabaseSchema {
  hospitals: Hospital[];
  doctors: Doctor[];
  incomingPatients: IncomingPatientRecord[];
  notifications: LiveFeedNotification[];
  demoRequests: HospitalDemoRequestRecord[];
  contactInquiries: ContactInquiryRecord[];
  staffCredentials: Array<{
    staffId: string;
    passcode: string;
    name: string;
    role: string;
    hospitalId: string;
  }>;
  lastSavedIso: string;
}

function createInitialDb(): DatabaseSchema {
  return {
    hospitals: structuredClone(INITIAL_HOSPITALS),
    doctors: structuredClone(INITIAL_DOCTORS),
    incomingPatients: structuredClone(INITIAL_INCOMING_PATIENTS),
    notifications: [
      {
        id: 'notif-seed-1',
        timestampIso: new Date().toISOString(),
        hospitalId: 'hosp-apollo-blr',
        hospitalName: 'Apollo Care Multi-Specialty Hospital, Bannerghatta',
        city: 'Bengaluru',
        summary: '2 General Ward beds prepared and marked available',
        category: 'bed_update',
      },
    ],
    demoRequests: [
      {
        id: 'DEMO-1042',
        createdAtIso: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
        hospitalName: 'Fortis Relief Memorial Hospital (Sample Request)',
        contactPerson: 'Dr. Vivek Kulkarni, Medical Director',
        email: 'v.kulkarni@fortisrelief-demo.org',
        phone: '+91 98450 77889',
        city: 'Bengaluru',
        bedCapacity: 220,
        notes: 'Interested in HL7 admission feed sync for 30 ICU beds.',
        status: 'Reviewed',
      },
    ],
    contactInquiries: [
      {
        id: 'INQ-3091',
        createdAtIso: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
        name: 'Deepa Krishnan (Sample Inquiry)',
        email: 'deepa.k@samplemail.org',
        subject: 'Feedback on Live Availability',
        message: 'Thank you for providing real-time oxygen bed numbers in Chennai.',
      },
    ],
    staffCredentials: [
      {
        staffId: 'STAFF-BLR-01',
        passcode: 'medalert2026',
        name: 'Sister Lakshmi Nair',
        role: 'Chief Triage & Ward Coordinator',
        hospitalId: 'hosp-apollo-blr',
      },
      {
        staffId: 'STAFF-MUM-01',
        passcode: 'medalert2026',
        name: 'Dr. Rakesh Verma',
        role: 'Emergency Duty Supervisor',
        hospitalId: 'hosp-kokilaben-mum',
      },
    ],
    lastSavedIso: new Date().toISOString(),
  };
}

class PersistentStore {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadFromDisk();
  }

  private loadFromDisk(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw) as DatabaseSchema;
        if (
          parsed &&
          Array.isArray(parsed.hospitals) &&
          Array.isArray(parsed.doctors)
        ) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Failed to read medalert_db.json, initializing fresh DB:', err);
    }

    const fresh = createInitialDb();
    this.saveToDisk(fresh);
    return fresh;
  }

  public saveToDisk(nextData?: DatabaseSchema): void {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      if (nextData) {
        this.data = nextData;
      }
      this.data.lastSavedIso = new Date().toISOString();
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting medalert_db.json:', err);
    }
  }

  public getState(): DatabaseSchema {
    return this.data;
  }

  public resetToSeed(): DatabaseSchema {
    const fresh = createInitialDb();
    this.saveToDisk(fresh);
    return this.data;
  }

  public addDoctor(payload: DoctorAddPayload, hospitalName: string, city: string): Doctor {
    const newDoc: Doctor = {
      id: `doc-${Date.now()}`,
      name: payload.name,
      qualification: payload.qualification,
      specialty: payload.specialty,
      experienceYears: Number(payload.experienceYears) || 8,
      hospitalId: payload.hospitalId,
      hospitalName,
      city,
      onDuty: true,
      shiftHours: payload.shiftHours || '08:00 – 20:00',
      languages: payload.languages.length > 0 ? payload.languages : ['English', 'Hindi'],
      consultationWaitMins: 10,
    };

    this.data.doctors.unshift(newDoc);

    const hosp = this.data.hospitals.find((h) => h.id === payload.hospitalId);
    if (hosp) {
      hosp.doctorsOnDutyCount += 1;
      if (!hosp.specialties.includes(payload.specialty)) {
        hosp.specialties.push(payload.specialty);
      }
      hosp.lastUpdatedIso = new Date().toISOString();
    }

    this.saveToDisk();
    return newDoc;
  }
}

export const dbStore = new PersistentStore();
