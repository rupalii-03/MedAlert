import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Hospital,
  Doctor,
  IncomingPatientRecord,
  PatientRegistrationPayload,
  LiveFeedNotification,
  BedWardType,
  PatientTrackerStep,
  HospitalDemoRequestPayload,
  HospitalDemoRequestRecord,
  ContactInquiryPayload,
  ContactInquiryRecord,
  DoctorAddPayload,
  StaffSession,
} from '../types/hospital';
import {
  INITIAL_HOSPITALS,
  INITIAL_DOCTORS,
  INITIAL_INCOMING_PATIENTS,
} from '../data/seedData';

export function useHospitalFeed() {
  const [hospitals, setHospitals] = useState<Hospital[]>(INITIAL_HOSPITALS);
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [incomingPatients, setIncomingPatients] = useState<IncomingPatientRecord[]>(
    INITIAL_INCOMING_PATIENTS
  );
  const [demoRequests, setDemoRequests] = useState<HospitalDemoRequestRecord[]>([]);
  const [contactInquiries, setContactInquiries] = useState<ContactInquiryRecord[]>([]);
  const [latestToast, setLatestToast] = useState<LiveFeedNotification | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io({
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 450);

    socket.on('connect', () => {
      setIsConnected(true);
      setIsLoading(false);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on(
      'state:init',
      (payload: {
        hospitals: Hospital[];
        doctors: Doctor[];
        incomingPatients: IncomingPatientRecord[];
        demoRequests?: HospitalDemoRequestRecord[];
        contactInquiries?: ContactInquiryRecord[];
      }) => {
        if (payload?.hospitals) setHospitals(payload.hospitals);
        if (payload?.doctors) setDoctors(payload.doctors);
        if (payload?.incomingPatients) setIncomingPatients(payload.incomingPatients);
        if (payload?.demoRequests) setDemoRequests(payload.demoRequests);
        if (payload?.contactInquiries) setContactInquiries(payload.contactInquiries);
        setLastUpdated(new Date());
        setIsLoading(false);
      }
    );

    socket.on(
      'state:update',
      (payload: {
        hospitals: Hospital[];
        doctors: Doctor[];
        incomingPatients: IncomingPatientRecord[];
        demoRequests?: HospitalDemoRequestRecord[];
        contactInquiries?: ContactInquiryRecord[];
        latestNotification?: LiveFeedNotification;
      }) => {
        if (payload?.hospitals) setHospitals(payload.hospitals);
        if (payload?.doctors) setDoctors(payload.doctors);
        if (payload?.incomingPatients) setIncomingPatients(payload.incomingPatients);
        if (payload?.demoRequests) setDemoRequests(payload.demoRequests);
        if (payload?.contactInquiries) setContactInquiries(payload.contactInquiries);
        setLastUpdated(new Date());
        if (payload?.latestNotification) {
          setLatestToast(payload.latestNotification);
        }
      }
    );

    return () => {
      clearTimeout(loadingTimeout);
      socket.disconnect();
    };
  }, []);

  // Update bed count via REST PATCH + Socket.IO
  const updateHospitalBeds = useCallback(
    async (hospitalId: string, ward: BedWardType, available: number) => {
      setHospitals((prev) =>
        prev.map((h) => {
          if (h.id !== hospitalId) return h;
          const clamped = Math.max(0, Math.min(h.beds[ward].total, available));
          return {
            ...h,
            lastUpdatedIso: new Date().toISOString(),
            beds: {
              ...h.beds,
              [ward]: { ...h.beds[ward], available: clamped },
            },
          };
        })
      );
      setLastUpdated(new Date());

      try {
        await fetch(`/api/hospitals/${hospitalId}/beds`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ward, available }),
        });
      } catch {
        if (socketRef.current?.connected) {
          socketRef.current.emit('hospital:updateBeds', { hospitalId, ward, available });
        }
      }
    },
    []
  );

  // Toggle doctor duty via REST PATCH + Socket.IO
  const toggleDoctorDuty = useCallback(async (doctorId: string) => {
    setDoctors((prev) =>
      prev.map((d) => (d.id === doctorId ? { ...d, onDuty: !d.onDuty } : d))
    );
    setLastUpdated(new Date());

    try {
      await fetch(`/api/doctors/${doctorId}/duty`, {
        method: 'PATCH',
      });
    } catch {
      if (socketRef.current?.connected) {
        socketRef.current.emit('doctor:toggleDuty', { doctorId });
      }
    }
  }, []);

  // Add a new specialist doctor to a hospital via POST /api/doctors
  const addDoctorToHospital = useCallback(async (payload: DoctorAddPayload) => {
    const res = await fetch('/api/doctors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error('Failed to add doctor');
    }
    const data = await res.json();
    return data.doctor as Doctor;
  }, []);

  // Update incoming patient status tracker via REST PATCH
  const updatePatientTrackerStatus = useCallback(
    async (referenceId: string, statusStep: PatientTrackerStep) => {
      setIncomingPatients((prev) =>
        prev.map((p) => (p.referenceId === referenceId ? { ...p, statusStep } : p))
      );
      setLastUpdated(new Date());

      try {
        await fetch(`/api/patients/${encodeURIComponent(referenceId)}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ statusStep }),
        });
      } catch {
        if (socketRef.current?.connected) {
          socketRef.current.emit('patient:updateStatus', { referenceId, statusStep });
        }
      }
    },
    []
  );

  // Register patient via POST /api/register-patient
  const registerPatient = useCallback(
    async (
      payload: PatientRegistrationPayload
    ): Promise<{
      record: IncomingPatientRecord;
      hospital: Hospital;
      doctor: Doctor;
    }> => {
      try {
        const res = await fetch('/api/register-patient', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          setLastUpdated(new Date());
          return data;
        }
      } catch {
        // Fallback client-side matching if server route is unreachable
      }

      const cityHospitals = hospitals.filter((h) => h.city === payload.city);
      const pool = cityHospitals.length > 0 ? cityHospitals : hospitals;
      const chosenHosp =
        payload.preferredHospitalId !== 'auto'
          ? hospitals.find((h) => h.id === payload.preferredHospitalId) || pool[0]
          : pool[0];

      const matchedDoc =
        doctors.find(
          (d) =>
            d.hospitalId === chosenHosp.id &&
            d.specialty === payload.specialtyNeeded &&
            d.onDuty
        ) ||
        doctors.find((d) => d.hospitalId === chosenHosp.id && d.onDuty) ||
        doctors[0];

      const wardKey: BedWardType =
        payload.requiredCare === 'doctor_consultation' ? 'general' : payload.requiredCare;

      const record: IncomingPatientRecord = {
        referenceId: `MAG-${Math.floor(100000 + Math.random() * 900000)}`,
        createdAtIso: new Date().toISOString(),
        patientName: payload.fullName,
        age: payload.age,
        gender: payload.gender,
        phone: payload.phone,
        city: payload.city,
        symptoms: payload.symptoms,
        urgency: payload.urgency,
        requiredCare: payload.requiredCare,
        specialtyNeeded: payload.specialtyNeeded,
        assignedHospitalId: chosenHosp.id,
        assignedHospitalName: chosenHosp.name,
        assignedWardLabel: `${wardKey.toUpperCase()} Ward (Reserved)`,
        assignedDoctorName: matchedDoc.name,
        estimatedWaitMinutes: Math.max(4, chosenHosp.estimatedWaitMinutes - 2),
        distanceKm: chosenHosp.distanceKm,
        statusStep: 'Hospital notified',
      };

      setIncomingPatients((prev) => [record, ...prev]);
      return { record, hospital: chosenHosp, doctor: matchedDoc };
    },
    [hospitals, doctors]
  );

  // Lookup an existing patient registration by Reference ID via GET /api/patients/:referenceId
  const lookupPatientByReferenceId = useCallback(
    async (
      referenceId: string
    ): Promise<{ record: IncomingPatientRecord; hospital: Hospital }> => {
      const res = await fetch(
        `/api/patients/${encodeURIComponent(referenceId.trim())}`
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error || 'Could not find a registration with that Reference ID.'
        );
      }
      return data;
    },
    []
  );

  // Staff Login via POST /api/staff/login
  const loginHospitalStaff = useCallback(
    async (staffId: string, passcode: string): Promise<StaffSession> => {
      const res = await fetch('/api/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId, passcode }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }
      return data.session as StaffSession;
    },
    []
  );

  // Submit Hospital Demo Request via POST /api/hospital-demo-requests
  const submitHospitalDemoRequest = useCallback(
    async (
      payload: HospitalDemoRequestPayload
    ): Promise<HospitalDemoRequestRecord> => {
      const res = await fetch('/api/hospital-demo-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return data.demoRequest as HospitalDemoRequestRecord;
    },
    []
  );

  // Submit Contact Inquiry via POST /api/contact-inquiries
  const submitContactInquiry = useCallback(
    async (payload: ContactInquiryPayload): Promise<ContactInquiryRecord> => {
      const res = await fetch('/api/contact-inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return data.inquiry as ContactInquiryRecord;
    },
    []
  );

  // Reset backend database to clean seed state via POST /api/admin/reset-seed
  const resetBackendDatabase = useCallback(async () => {
    await fetch('/api/admin/reset-seed', { method: 'POST' });
  }, []);

  const dismissToast = useCallback(() => {
    setLatestToast(null);
  }, []);

  return {
    hospitals,
    doctors,
    incomingPatients,
    demoRequests,
    contactInquiries,
    latestToast,
    dismissToast,
    isConnected,
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
  };
}
