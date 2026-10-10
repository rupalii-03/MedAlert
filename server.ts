import express from 'express';
import { createServer as createHttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbStore } from './src/data/dbStore.ts';
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
} from './src/types/hospital.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function matchBestHospitalForPatient(payload: PatientRegistrationPayload): {
  hospital: Hospital;
  doctor: Doctor;
  wardLabel: string;
} {
  const state = dbStore.getState();
  const hospitalsState = state.hospitals;
  const doctorsState = state.doctors;

  if (payload.preferredHospitalId !== 'auto') {
    const chosen = hospitalsState.find((h) => h.id === payload.preferredHospitalId);
    if (chosen) {
      const doc =
        doctorsState.find(
          (d) =>
            d.hospitalId === chosen.id &&
            d.specialty === payload.specialtyNeeded &&
            d.onDuty
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

      dbStore.saveToDisk();

      return {
        hospital: chosen,
        doctor: doc,
        wardLabel: `${wardNames[wardKey]} (Reserved)`,
      };
    }
  }

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

  dbStore.saveToDisk();

  return {
    hospital: bestHospital,
    doctor: matchedDoctor,
    wardLabel: `${wardNames[wardKey]} · Bed #${Math.max(
      1,
      bestHospital.beds[wardKey].available + 1
    )}`,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  const httpServer = createHttpServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: { origin: '*' },
  });

  const broadcastState = (latestNotification?: LiveFeedNotification) => {
    const state = dbStore.getState();
    io.emit('state:update', {
      hospitals: state.hospitals,
      doctors: state.doctors,
      incomingPatients: state.incomingPatients,
      demoRequests: state.demoRequests,
      contactInquiries: state.contactInquiries,
      latestNotification,
    });
  };

  // ============================================================================
  // REST API ROUTES
  // ============================================================================

  // 1. Health & Full Backend State
  app.get('/api/health', (_req, res) => {
    const state = dbStore.getState();
    res.json({
      status: 'ok',
      engine: 'Express + Socket.IO + Persistent JSON DB',
      lastSavedIso: state.lastSavedIso,
      counts: {
        hospitals: state.hospitals.length,
        doctors: state.doctors.length,
        patients: state.incomingPatients.length,
        demoRequests: state.demoRequests.length,
        inquiries: state.contactInquiries.length,
      },
    });
  });

  app.get('/api/state', (_req, res) => {
    const state = dbStore.getState();
    res.json({
      hospitals: state.hospitals,
      doctors: state.doctors,
      incomingPatients: state.incomingPatients,
      notifications: state.notifications,
      demoRequests: state.demoRequests,
      contactInquiries: state.contactInquiries,
    });
  });

  // 2. Hospitals Endpoints
  app.get('/api/hospitals', (req, res) => {
    const state = dbStore.getState();
    const { city, specialty } = req.query;
    let results = state.hospitals;
    if (city && city !== 'All') {
      results = results.filter((h) => h.city === city);
    }
    if (specialty && specialty !== 'all') {
      results = results.filter((h) =>
        h.specialties.includes(specialty as any)
      );
    }
    res.json({ hospitals: results });
  });

  app.patch('/api/hospitals/:id/beds', (req, res) => {
    const { id } = req.params;
    const { ward, available } = req.body as {
      ward: BedWardType;
      available: number;
    };
    const state = dbStore.getState();
    const target = state.hospitals.find((h) => h.id === id);
    if (!target || !target.beds[ward]) {
      res.status(404).json({ error: 'Hospital or ward not found' });
      return;
    }

    const clamped = Math.max(
      0,
      Math.min(target.beds[ward].total, Number(available))
    );
    target.beds[ward].available = clamped;
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
      summary: `${target.name} updated ${wardLabels[ward]} to ${clamped} free beds`,
      category: 'bed_update',
    };
    state.notifications = [notification, ...state.notifications.slice(0, 19)];
    dbStore.saveToDisk();

    broadcastState(notification);
    res.json({ hospital: target, notification });
  });

  // 3. Doctors Endpoints
  app.get('/api/doctors', (_req, res) => {
    const state = dbStore.getState();
    res.json({ doctors: state.doctors });
  });

  app.post('/api/doctors', (req, res) => {
    const payload = req.body as DoctorAddPayload;
    const state = dbStore.getState();
    const hosp = state.hospitals.find((h) => h.id === payload.hospitalId);
    if (!hosp) {
      res.status(400).json({ error: 'Invalid hospitalId' });
      return;
    }

    const newDoctor = dbStore.addDoctor(payload, hosp.name, hosp.city);

    const notification: LiveFeedNotification = {
      id: `notif-doc-${Date.now()}`,
      timestampIso: new Date().toISOString(),
      hospitalId: hosp.id,
      hospitalName: hosp.name,
      city: hosp.city,
      summary: `New specialist ${newDoctor.name} (${newDoctor.specialty}) added on duty at ${hosp.name}`,
      category: 'doctor_duty',
    };
    state.notifications = [notification, ...state.notifications.slice(0, 19)];
    dbStore.saveToDisk();

    broadcastState(notification);
    res.status(201).json({ doctor: newDoctor });
  });

  app.patch('/api/doctors/:id/duty', (req, res) => {
    const { id } = req.params;
    const state = dbStore.getState();
    const doc = state.doctors.find((d) => d.id === id);
    if (!doc) {
      res.status(404).json({ error: 'Doctor not found' });
      return;
    }

    doc.onDuty = !doc.onDuty;

    const hosp = state.hospitals.find((h) => h.id === doc.hospitalId);
    if (hosp) {
      const activeDocs = state.doctors.filter(
        (d) => d.hospitalId === hosp.id && d.onDuty
      ).length;
      hosp.doctorsOnDutyCount = Math.max(
        activeDocs,
        hosp.doctorsOnDutyCount + (doc.onDuty ? 1 : -1)
      );
      hosp.lastUpdatedIso = new Date().toISOString();
    }

    const notification: LiveFeedNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestampIso: new Date().toISOString(),
      hospitalId: doc.hospitalId,
      hospitalName: doc.hospitalName,
      city: doc.city,
      summary: `${doc.name} (${doc.specialty}) is now ${
        doc.onDuty ? 'On Duty' : 'Off Duty'
      }`,
      category: 'doctor_duty',
    };
    state.notifications = [notification, ...state.notifications.slice(0, 19)];
    dbStore.saveToDisk();

    broadcastState(notification);
    res.json({ doctor: doc, notification });
  });

  // 4. Patient Registration & Lookup by Reference ID
  app.get('/api/patients/:referenceId', (req, res) => {
    const { referenceId } = req.params;
    const state = dbStore.getState();
    const normalized = referenceId.trim().toUpperCase();
    const record = state.incomingPatients.find(
      (p) => p.referenceId.toUpperCase() === normalized
    );
    if (!record) {
      res.status(404).json({
        error: `No registration found with Reference ID "${normalized}". Try MAG-849201 or MAG-849174.`,
      });
      return;
    }
    const hospital =
      state.hospitals.find((h) => h.id === record.assignedHospitalId) ||
      state.hospitals[0];
    res.json({ record, hospital });
  });

  app.post('/api/register-patient', (req, res) => {
    const payload = req.body as PatientRegistrationPayload;
    const state = dbStore.getState();
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

    state.incomingPatients = [record, ...state.incomingPatients.slice(0, 29)];

    const notification: LiveFeedNotification = {
      id: `notif-${Date.now()}`,
      timestampIso: new Date().toISOString(),
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      city: hospital.city,
      summary: `Patient ${record.referenceId} matched & bed pre-allocated at ${hospital.name}`,
      category: 'patient_matched',
    };
    state.notifications = [notification, ...state.notifications.slice(0, 19)];
    dbStore.saveToDisk();

    broadcastState(notification);
    res.status(201).json({ record, hospital, doctor });
  });

  app.patch('/api/patients/:referenceId/status', (req, res) => {
    const { referenceId } = req.params;
    const { statusStep } = req.body as { statusStep: PatientTrackerStep };
    const state = dbStore.getState();
    const pt = state.incomingPatients.find(
      (p) => p.referenceId.toUpperCase() === referenceId.toUpperCase()
    );
    if (!pt) {
      res.status(404).json({ error: 'Patient record not found' });
      return;
    }

    pt.statusStep = statusStep;
    dbStore.saveToDisk();
    broadcastState();
    res.json({ record: pt });
  });

  // 5. Hospital Staff Authentication Endpoint
  app.post('/api/staff/login', (req, res) => {
    const { staffId, passcode } = req.body as {
      staffId: string;
      passcode: string;
    };
    const state = dbStore.getState();
    const matched = state.staffCredentials.find(
      (c) =>
        c.staffId.toUpperCase() === (staffId || '').trim().toUpperCase() &&
        c.passcode === (passcode || '').trim()
    );

    if (!matched) {
      res.status(401).json({
        error:
          'Invalid Staff ID or Passcode. Use demo credentials: STAFF-BLR-01 / medalert2026',
      });
      return;
    }

    res.json({
      session: {
        token: `tok-${Date.now()}-${matched.staffId}`,
        staffId: matched.staffId,
        name: matched.name,
        role: matched.role,
        hospitalId: matched.hospitalId,
      },
    });
  });

  // 6. For Hospitals: Demo Onboarding Requests
  app.get('/api/hospital-demo-requests', (_req, res) => {
    const state = dbStore.getState();
    res.json({ demoRequests: state.demoRequests });
  });

  app.post('/api/hospital-demo-requests', (req, res) => {
    const payload = req.body as HospitalDemoRequestPayload;
    const state = dbStore.getState();
    const newReq: HospitalDemoRequestRecord = {
      id: `DEMO-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAtIso: new Date().toISOString(),
      hospitalName: payload.hospitalName,
      contactPerson: payload.contactPerson,
      email: payload.email,
      phone: payload.phone || 'Not provided',
      city: payload.city || 'Bengaluru',
      bedCapacity: Number(payload.bedCapacity) || 150,
      notes: payload.notes || '',
      status: 'Pending Review',
    };
    state.demoRequests = [newReq, ...state.demoRequests];
    dbStore.saveToDisk();
    broadcastState();
    res.status(201).json({ demoRequest: newReq });
  });

  // 7. About & Contact: Inquiries Endpoint
  app.get('/api/contact-inquiries', (_req, res) => {
    const state = dbStore.getState();
    res.json({ contactInquiries: state.contactInquiries });
  });

  app.post('/api/contact-inquiries', (req, res) => {
    const payload = req.body as ContactInquiryPayload;
    const state = dbStore.getState();
    const newInq: ContactInquiryRecord = {
      id: `INQ-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAtIso: new Date().toISOString(),
      name: payload.name,
      email: payload.email,
      subject: payload.subject,
      message: payload.message,
    };
    state.contactInquiries = [newInq, ...state.contactInquiries];
    dbStore.saveToDisk();
    broadcastState();
    res.status(201).json({ inquiry: newInq });
  });

  // 8. Reset Database to Initial Seed State
  app.post('/api/admin/reset-seed', (_req, res) => {
    const fresh = dbStore.resetToSeed();
    broadcastState();
    res.json({ message: 'Database reset to initial seed state', state: fresh });
  });

  // ============================================================================
  // SOCKET.IO REAL-TIME HANDLERS
  // ============================================================================
  io.on('connection', (socket) => {
    const state = dbStore.getState();
    socket.emit('state:init', {
      hospitals: state.hospitals,
      doctors: state.doctors,
      incomingPatients: state.incomingPatients,
      notifications: state.notifications,
      demoRequests: state.demoRequests,
      contactInquiries: state.contactInquiries,
    });

    socket.on(
      'hospital:updateBeds',
      (data: { hospitalId: string; ward: BedWardType; available: number }) => {
        const currentState = dbStore.getState();
        const target = currentState.hospitals.find(
          (h) => h.id === data.hospitalId
        );
        if (!target) return;

        const wardCap = target.beds[data.ward];
        const clamped = Math.max(
          0,
          Math.min(wardCap.total, Number(data.available))
        );
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
        currentState.notifications = [
          notification,
          ...currentState.notifications.slice(0, 19),
        ];
        dbStore.saveToDisk();
        broadcastState(notification);
      }
    );

    socket.on('doctor:toggleDuty', (data: { doctorId: string }) => {
      const currentState = dbStore.getState();
      const doc = currentState.doctors.find((d) => d.id === data.doctorId);
      if (!doc) return;

      doc.onDuty = !doc.onDuty;

      const hosp = currentState.hospitals.find((h) => h.id === doc.hospitalId);
      if (hosp) {
        const activeDocs = currentState.doctors.filter(
          (d) => d.hospitalId === hosp.id && d.onDuty
        ).length;
        hosp.doctorsOnDutyCount = Math.max(
          activeDocs,
          hosp.doctorsOnDutyCount + (doc.onDuty ? 1 : -1)
        );
        hosp.lastUpdatedIso = new Date().toISOString();
      }

      const notification: LiveFeedNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestampIso: new Date().toISOString(),
        hospitalId: doc.hospitalId,
        hospitalName: doc.hospitalName,
        city: doc.city,
        summary: `${doc.name} (${doc.specialty}) is now ${
          doc.onDuty ? 'On Duty' : 'Off Duty'
        }`,
        category: 'doctor_duty',
      };
      currentState.notifications = [
        notification,
        ...currentState.notifications.slice(0, 19),
      ];
      dbStore.saveToDisk();
      broadcastState(notification);
    });

    socket.on(
      'patient:updateStatus',
      (data: { referenceId: string; statusStep: PatientTrackerStep }) => {
        const currentState = dbStore.getState();
        const pt = currentState.incomingPatients.find(
          (p) => p.referenceId === data.referenceId
        );
        if (!pt) return;
        pt.statusStep = data.statusStep;
        dbStore.saveToDisk();
        broadcastState();
      }
    );
  });

  // Periodic background hospital capacity simulation via Socket.IO every 8 seconds
  const wardKeys: BedWardType[] = ['general', 'icu', 'emergency', 'oxygen'];
  let tickIndex = 0;

  setInterval(() => {
    const state = dbStore.getState();
    tickIndex += 1;
    const hosp = state.hospitals[tickIndex % state.hospitals.length];
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
      state.notifications = [
        notification,
        ...state.notifications.slice(0, 19),
      ];
      dbStore.saveToDisk();
      broadcastState(notification);
    }
  }, 8000);

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
    console.log(
      `MedAlert Grid Express + Socket.IO + Persistent DB server running on port ${PORT}`
    );
  });
}

startServer();
