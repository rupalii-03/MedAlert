import express from 'express';
import { createServer as createHttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  INITIAL_HOSPITALS,
  INITIAL_DOCTORS,
  INITIAL_INCOMING_PATIENTS,
} from './src/data/seedData.ts';
import {
  Hospital,
  Doctor,
  IncomingPatientRecord,
  PatientRegistrationPayload,
  LiveFeedNotification,
  BedWardType,
  PatientTrackerStep,
} from './src/types/hospital.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Server-authoritative state (Demo Data)
let hospitalsState: Hospital[] = structuredClone(INITIAL_HOSPITALS);
let doctorsState: Doctor[] = structuredClone(INITIAL_DOCTORS);
let incomingPatientsState: IncomingPatientRecord[] = structuredClone(INITIAL_INCOMING_PATIENTS);
let feedNotifications: LiveFeedNotification[] = [
  {
    id: 'notif-seed-1',
    timestampIso: new Date().toISOString(),
    hospitalId: 'hosp-apollo-blr',
    hospitalName: 'Apollo Care Multi-Specialty Hospital, Bannerghatta',
    city: 'Bengaluru',
    summary: '2 General Ward beds prepared and marked available',
    category: 'bed_update',
  },
];

function matchBestHospitalForPatient(payload: PatientRegistrationPayload): {
  hospital: Hospital;
  doctor: Doctor;
  wardLabel: string;
} {
  // If preferred hospital was explicitly chosen and exists
  if (payload.preferredHospitalId !== 'auto') {
    const chosen = hospitalsState.find((h) => h.id === payload.preferredHospitalId);
    if (chosen) {
      const doc =
        doctorsState.find(
          (d) => d.hospitalId === chosen.id && d.specialty === payload.specialtyNeeded && d.onDuty
        ) ||
        doctorsState.find((d) => d.hospitalId === chosen.id && d.onDuty) ||
        doctorsState[0];

      const wardKey: BedWardType =
        payload.requiredCare === 'doctor_consultation' ? 'general' : payload.requiredCare;

      if (chosen.beds[wardKey].available > 0) {
        chosen.beds[wardKey].available -= 1;
      }
      chosen.lastUpdatedIso = new Date().toISOString();

      const wardNames: Record<BedWardType, string> = {
        general: 'General Recovery Ward',
        icu: 'Intensive Care Unit (ICU)',
        emergency: 'Emergency Triage Bay',
        oxygen: 'Oxygen-Supported Ward',
      };

      return {
        hospital: chosen,
        doctor: doc,
        wardLabel: `${wardNames[wardKey]} (Reserved)`,
      };
    }
  }

  // Score hospitals in the same city first, otherwise fallback to all
  const cityPool = hospitalsState.filter((h) => h.city === payload.city);
  const candidates = cityPool.length > 0 ? cityPool : hospitalsState;

  const wardKey: BedWardType =
    payload.requiredCare === 'doctor_consultation' ? 'general' : payload.requiredCare;

  const scored = candidates.map((h) => {
    let score = 0;
    const wardAvail = h.beds[wardKey].available;
    score += wardAvail * 4;
    if (h.specialties.includes(payload.specialtyNeeded)) score += 30;
    score += h.doctorsOnDutyCount * 1.5;
    score -= h.distanceKm * 3;
    score -= h.estimatedWaitMinutes;
    return { hospital: h, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const bestHospital = scored[0].hospital;

  if (bestHospital.beds[wardKey].available > 0) {
    bestHospital.beds[wardKey].available -= 1;
  }
  bestHospital.lastUpdatedIso = new Date().toISOString();

  const matchedDoctor =
    doctorsState.find(
      (d) =>
        d.hospitalId === bestHospital.id &&
        d.specialty === payload.specialtyNeeded &&
        d.onDuty
    ) ||
    doctorsState.find((d) => d.hospitalId === bestHospital.id && d.onDuty) ||
    doctorsState[0];

  const wardNames: Record<BedWardType, string> = {
    general: 'General Recovery Ward',
    icu: 'Intensive Care Unit (ICU)',
    emergency: 'Emergency Triage Bay',
    oxygen: 'Oxygen-Supported Ward',
  };

  return {
    hospital: bestHospital,
    doctor: matchedDoctor,
    wardLabel: `${wardNames[wardKey]} · Bed #${Math.max(1, bestHospital.beds[wardKey].available + 1)}`,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  const httpServer = createHttpServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: { origin: '*' },
  });

  // REST API fallback & inspection endpoints
  app.get('/api/state', (_req, res) => {
    res.json({
      hospitals: hospitalsState,
      doctors: doctorsState,
      incomingPatients: incomingPatientsState,
      notifications: feedNotifications,
    });
  });

  app.post('/api/register-patient', (req, res) => {
    const payload = req.body as PatientRegistrationPayload;
    const { hospital, doctor, wardLabel } = matchBestHospitalForPatient(payload);

    const record: IncomingPatientRecord = {
      referenceId: `MAG-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAtIso: new Date().toISOString(),
      patientName: payload.fullName,
      age: Number(payload.age) || 35,
      gender: payload.gender || 'Other',
      phone: payload.phone || '+91 98000 00000',
      city: payload.city,
      symptoms: payload.symptoms,
      urgency: payload.urgency,
      requiredCare: payload.requiredCare,
      specialtyNeeded: payload.specialtyNeeded,
      assignedHospitalId: hospital.id,
      assignedHospitalName: hospital.name,
      assignedWardLabel: wardLabel,
      assignedDoctorName: doctor.name,
      estimatedWaitMinutes: Math.max(3, hospital.estimatedWaitMinutes - 2),
      distanceKm: hospital.distanceKm,
      statusStep: 'Hospital notified',
    };

    incomingPatientsState = [record, ...incomingPatientsState.slice(0, 19)];

    const notification: LiveFeedNotification = {
      id: `notif-${Date.now()}`,
      timestampIso: new Date().toISOString(),
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      city: hospital.city,
      summary: `Patient ${record.referenceId} matched & bed pre-allocated at ${hospital.name}`,
      category: 'patient_matched',
    };
    feedNotifications = [notification, ...feedNotifications.slice(0, 14)];

    io.emit('state:update', {
      hospitals: hospitalsState,
      doctors: doctorsState,
      incomingPatients: incomingPatientsState,
      latestNotification: notification,
    });

    res.json({ record, hospital, doctor });
  });

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    // Send full authoritative initial state
    socket.emit('state:init', {
      hospitals: hospitalsState,
      doctors: doctorsState,
      incomingPatients: incomingPatientsState,
      notifications: feedNotifications,
    });

    // Staff Dashboard: Update hospital ward bed count
    socket.on(
      'hospital:updateBeds',
      (data: { hospitalId: string; ward: BedWardType; available: number }) => {
        const target = hospitalsState.find((h) => h.id === data.hospitalId);
        if (!target) return;

        const wardCap = target.beds[data.ward];
        const clamped = Math.max(0, Math.min(wardCap.total, Number(data.available)));
        wardCap.available = clamped;
        target.lastUpdatedIso = new Date().toISOString();

        const wardLabels: Record<BedWardType, string> = {
          general: 'General Ward',
          icu: 'ICU',
          emergency: 'Emergency',
          oxygen: 'Oxygen Ward',
        };

        const notification: LiveFeedNotification = {
          id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestampIso: target.lastUpdatedIso,
          hospitalId: target.id,
          hospitalName: target.name,
          city: target.city,
          summary: `${target.name} updated ${wardLabels[data.ward]} to ${clamped} free beds`,
          category: 'bed_update',
        };
        feedNotifications = [notification, ...feedNotifications.slice(0, 14)];

        io.emit('state:update', {
          hospitals: hospitalsState,
          doctors: doctorsState,
          incomingPatients: incomingPatientsState,
          latestNotification: notification,
        });
      }
    );

    // Staff Dashboard: Toggle doctor duty status
    socket.on('doctor:toggleDuty', (data: { doctorId: string }) => {
      const doc = doctorsState.find((d) => d.id === data.doctorId);
      if (!doc) return;

      doc.onDuty = !doc.onDuty;

      // Recompute on-duty doctor count for the hospital
      const hosp = hospitalsState.find((h) => h.id === doc.hospitalId);
      if (hosp) {
        const activeDocs = doctorsState.filter(
          (d) => d.hospitalId === hosp.id && d.onDuty
        ).length;
        hosp.doctorsOnDutyCount = Math.max(activeDocs, hosp.doctorsOnDutyCount + (doc.onDuty ? 1 : -1));
        hosp.lastUpdatedIso = new Date().toISOString();
      }

      const notification: LiveFeedNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestampIso: new Date().toISOString(),
        hospitalId: doc.hospitalId,
        hospitalName: doc.hospitalName,
        city: doc.city,
        summary: `${doc.name} (${doc.specialty}) is now ${doc.onDuty ? 'On Duty' : 'Off Duty'}`,
        category: 'doctor_duty',
      };
      feedNotifications = [notification, ...feedNotifications.slice(0, 14)];

      io.emit('state:update', {
        hospitals: hospitalsState,
        doctors: doctorsState,
        incomingPatients: incomingPatientsState,
        latestNotification: notification,
      });
    });

    // Staff Dashboard: Advance incoming patient tracker status
    socket.on(
      'patient:updateStatus',
      (data: { referenceId: string; statusStep: PatientTrackerStep }) => {
        const pt = incomingPatientsState.find((p) => p.referenceId === data.referenceId);
        if (!pt) return;
        pt.statusStep = data.statusStep;

        io.emit('state:update', {
          hospitals: hospitalsState,
          doctors: doctorsState,
          incomingPatients: incomingPatientsState,
        });
      }
    );
  });

  // Periodic background hospital capacity simulation via Socket.IO every 7 seconds
  const wardKeys: BedWardType[] = ['general', 'icu', 'emergency', 'oxygen'];
  let tickIndex = 0;

  setInterval(() => {
    tickIndex += 1;
    const hosp = hospitalsState[tickIndex % hospitalsState.length];
    const ward = wardKeys[tickIndex % wardKeys.length];
    const delta = tickIndex % 2 === 0 ? 1 : -1;

    const currentAvail = hosp.beds[ward].available;
    const maxTotal = hosp.beds[ward].total;
    const nextAvail = Math.max(0, Math.min(maxTotal, currentAvail + delta));

    if (nextAvail !== currentAvail) {
      hosp.beds[ward].available = nextAvail;
      hosp.lastUpdatedIso = new Date().toISOString();

      const wardLabels: Record<BedWardType, string> = {
        general: 'General',
        icu: 'ICU',
        emergency: 'Emergency',
        oxygen: 'Oxygen',
      };

      const notification: LiveFeedNotification = {
        id: `notif-sim-${Date.now()}`,
        timestampIso: hosp.lastUpdatedIso,
        hospitalId: hosp.id,
        hospitalName: hosp.name,
        city: hosp.city,
        summary: `${hosp.name}: ${wardLabels[ward]} beds updated (${nextAvail} available now)`,
        category: 'bed_update',
      };
      feedNotifications = [notification, ...feedNotifications.slice(0, 14)];

      io.emit('state:update', {
        hospitals: hospitalsState,
        doctors: doctorsState,
        incomingPatients: incomingPatientsState,
        latestNotification: notification,
      });
    }
  }, 7000);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`MedAlert Grid Express + Socket.IO server running on port ${PORT}`);
  });
}

startServer();
