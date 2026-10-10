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
      }) => {
        if (payload?.hospitals) setHospitals(payload.hospitals);
        if (payload?.doctors) setDoctors(payload.doctors);
        if (payload?.incomingPatients) setIncomingPatients(payload.incomingPatients);
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
        latestNotification?: LiveFeedNotification;
      }) => {
        if (payload?.hospitals) setHospitals(payload.hospitals);
        if (payload?.doctors) setDoctors(payload.doctors);
        if (payload?.incomingPatients) setIncomingPatients(payload.incomingPatients);
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

  // Update bed count from Staff Dashboard
  const updateHospitalBeds = useCallback(
    (hospitalId: string, ward: BedWardType, available: number) => {
      // Optimistic update
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

      if (socketRef.current?.connected) {
        socketRef.current.emit('hospital:updateBeds', { hospitalId, ward, available });
      }
    },
    []
  );

  // Toggle doctor duty from Staff Dashboard
  const toggleDoctorDuty = useCallback((doctorId: string) => {
    setDoctors((prev) =>
      prev.map((d) => (d.id === doctorId ? { ...d, onDuty: !d.onDuty } : d))
    );
    setLastUpdated(new Date());

    if (socketRef.current?.connected) {
      socketRef.current.emit('doctor:toggleDuty', { doctorId });
    }
  }, []);

  // Update incoming patient status tracker
  const updatePatientTrackerStatus = useCallback(
    (referenceId: string, statusStep: PatientTrackerStep) => {
      setIncomingPatients((prev) =>
        prev.map((p) => (p.referenceId === referenceId ? { ...p, statusStep } : p))
      );
      setLastUpdated(new Date());

      if (socketRef.current?.connected) {
        socketRef.current.emit('patient:updateStatus', { referenceId, statusStep });
      }
    },
    []
  );

  // Register patient via API (or local fallback if offline)
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

  const dismissToast = useCallback(() => {
    setLatestToast(null);
  }, []);

  return {
    hospitals,
    doctors,
    incomingPatients,
    latestToast,
    dismissToast,
    isConnected,
    isLoading,
    lastUpdated,
    updateHospitalBeds,
    toggleDoctorDuty,
    updatePatientTrackerStatus,
    registerPatient,
  };
}
