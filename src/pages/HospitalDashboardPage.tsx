import React, { useState } from 'react';
import {
  Hospital,
  Doctor,
  IncomingPatientRecord,
  BedWardType,
  PatientTrackerStep,
  getHospitalOccupancyPercent,
} from '../types/hospital';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  Building2,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Minus,
  Stethoscope,
  Users,
  Bed,
  Radio,
} from 'lucide-react';

interface HospitalDashboardPageProps {
  hospitals: Hospital[];
  doctors: Doctor[];
  incomingPatients: IncomingPatientRecord[];
  onUpdateBeds: (
    hospitalId: string,
    ward: BedWardType,
    available: number
  ) => void;
  onToggleDoctorDuty: (doctorId: string) => void;
  onUpdatePatientStatus: (
    referenceId: string,
    statusStep: PatientTrackerStep
  ) => void;
}

export const HospitalDashboardPage: React.FC<HospitalDashboardPageProps> = ({
  hospitals,
  doctors,
  incomingPatients,
  onUpdateBeds,
  onToggleDoctorDuty,
  onUpdatePatientStatus,
}) => {
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(
    hospitals[0]?.id || 'hosp-apollo-blr'
  );

  const activeHospital =
    hospitals.find((h) => h.id === selectedHospitalId) || hospitals[0];

  const occupancyPercent = getHospitalOccupancyPercent(activeHospital);
  const isHighOccupancyAlert = occupancyPercent > 85;

  const hospitalDoctors = doctors.filter(
    (d) => d.hospitalId === activeHospital.id
  );

  // Prepare Recharts data for ward capacity
  const wardChartData = [
    {
      ward: 'General Ward',
      Available: activeHospital.beds.general.available,
      Occupied:
        activeHospital.beds.general.total -
        activeHospital.beds.general.available,
    },
    {
      ward: 'ICU',
      Available: activeHospital.beds.icu.available,
      Occupied:
        activeHospital.beds.icu.total - activeHospital.beds.icu.available,
    },
    {
      ward: 'Emergency',
      Available: activeHospital.beds.emergency.available,
      Occupied:
        activeHospital.beds.emergency.total -
        activeHospital.beds.emergency.available,
    },
    {
      ward: 'Oxygen Ward',
      Available: activeHospital.beds.oxygen.available,
      Occupied:
        activeHospital.beds.oxygen.total - activeHospital.beds.oxygen.available,
    },
  ];

  const wardsList: Array<{
    key: BedWardType;
    title: string;
    subtitle: string;
  }> = [
    {
      key: 'general',
      title: 'General Recovery Beds',
      subtitle: 'Standard inpatient medical & surgical wards',
    },
    {
      key: 'icu',
      title: 'ICU & Critical Care Beds',
      subtitle: 'Ventilator & intensive monitoring units',
    },
    {
      key: 'emergency',
      title: 'Emergency Triage Beds',
      subtitle: 'Immediate ER intake & trauma stabilization',
    },
    {
      key: 'oxygen',
      title: 'Oxygen-Supported Beds',
      subtitle: 'High-flow nasal cannula & piped oxygen',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Staff Header & Hospital Switcher */}
      <div className="bg-white rounded-2xl p-6 border border-[#DCE6EF] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0B7285]">
            <Radio className="w-3.5 h-3.5 text-[#16A34A]" aria-hidden="true" />
            <span>Hospital Staff Portal · Live Socket.IO Broadcast</span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-[#12324A]">
            Ward Capacity &amp; Triage Coordinator Dashboard
          </h1>
          <p className="text-sm text-[#475569] mt-0.5">
            Any bed or doctor update you make here is broadcast immediately to
            patients searching across the network.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
          <label
            htmlFor="staff-hosp-select"
            className="text-xs font-semibold text-[#12324A]"
          >
            Active Hospital Desk:
          </label>
          <select
            id="staff-hosp-select"
            value={selectedHospitalId}
            onChange={(e) => setSelectedHospitalId(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-[#F4F8FB] border border-[#DCE6EF] text-xs sm:text-sm font-semibold text-[#12324A] focus:bg-white focus:border-[#0B7285] focus:outline-none"
          >
            {hospitals.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} ({h.city})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Occupancy > 85% Warning Banner */}
      {isHighOccupancyAlert ? (
        <div
          role="alert"
          className="rounded-2xl bg-[#FFFBEB] border-2 border-[#D97706] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3.5">
            <AlertTriangle
              className="w-6 h-6 text-[#D97706] shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <h2 className="font-display text-base font-bold text-[#92400E]">
                High Occupancy Alert: {activeHospital.name} is at{' '}
                {occupancyPercent}% Capacity
              </h2>
              <p className="text-xs sm:text-sm text-[#92400E]/90 mt-0.5">
                Overall ward occupancy has exceeded the 85% threshold. Non-critical
                auto-match registrations in {activeHospital.city} are being
                prioritized to neighboring partner hospitals with open beds.
              </p>
            </div>
          </div>
          <span className="font-mono-tabular text-sm font-bold text-[#B45309] shrink-0">
            {occupancyPercent}% Occupied
          </span>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] px-5 py-3.5 flex flex-wrap items-center justify-between gap-2 text-xs text-[#15803D]">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>
              Normal Ward Operations: {activeHospital.name} is currently at{' '}
              {occupancyPercent}% overall occupancy (below the 85% alert threshold).
            </span>
          </div>
          <span className="font-mono-tabular font-bold">
            {occupancyPercent}% Occupied
          </span>
        </div>
      )}

      {/* Main Grid: Ward Bed Controls (Left) + Recharts Capacity Chart (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Update Bed Counts by Ward */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#DCE6EF] shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Bed className="w-5 h-5 text-[#0B7285]" aria-hidden="true" />
              <h2 className="font-display text-lg font-bold text-[#12324A]">
                Update Live Bed Availability by Ward
              </h2>
            </div>
            <span className="text-xs text-[#475569]">
              Click − or + to broadcast changes
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {wardsList.map((w) => {
              const wardData = activeHospital.beds[w.key];
              const pctUsed = Math.round(
                ((wardData.total - wardData.available) /
                  Math.max(1, wardData.total)) *
                  100
              );

              return (
                <div
                  key={w.key}
                  className="rounded-xl bg-[#F4F8FB] border border-[#DCE6EF] p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-sm font-bold text-[#12324A]">
                        {w.title}
                      </h3>
                      <span className="font-mono-tabular text-xs font-semibold text-[#0B7285]">
                        {pctUsed}% full
                      </span>
                    </div>
                    <p className="text-xs text-[#475569] mt-0.5">{w.subtitle}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#DCE6EF] flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-[#475569]">Free Beds</div>
                      <div className="font-mono-tabular text-2xl font-bold text-[#12324A]">
                        {wardData.available}{' '}
                        <span className="text-xs font-normal text-[#475569]">
                          / {wardData.total}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`Decrease available ${w.title}`}
                        onClick={() =>
                          onUpdateBeds(
                            activeHospital.id,
                            w.key,
                            wardData.available - 1
                          )
                        }
                        disabled={wardData.available <= 0}
                        className="w-9 h-9 rounded-xl bg-white border border-[#DCE6EF] hover:border-[#0B7285] disabled:opacity-40 flex items-center justify-center text-[#12324A] cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Increase available ${w.title}`}
                        onClick={() =>
                          onUpdateBeds(
                            activeHospital.id,
                            w.key,
                            wardData.available + 1
                          )
                        }
                        disabled={wardData.available >= wardData.total}
                        className="w-9 h-9 rounded-xl bg-[#0B7285] hover:bg-[#095C6B] disabled:opacity-40 flex items-center justify-center text-white cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Simple Capacity Chart */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#DCE6EF] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#0B7285]" aria-hidden="true" />
                <h2 className="font-display text-lg font-bold text-[#12324A]">
                  Ward Capacity Overview
                </h2>
              </div>
              <span className="font-mono-tabular text-xs font-semibold text-[#0B7285]">
                {occupancyPercent}% Total Load
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={wardChartData}
                  margin={{ top: 10, right: 10, left: -18, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E2E8F0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="ward"
                    tick={{ fill: '#12324A', fontSize: 11 }}
                    axisLine={{ stroke: '#CBD5E1' }}
                  />
                  <YAxis
                    tick={{ fill: '#475569', fontSize: 11 }}
                    axisLine={{ stroke: '#CBD5E1' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#DCE6EF',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar
                    dataKey="Available"
                    stackId="a"
                    fill="#16A34A"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="Occupied"
                    stackId="a"
                    fill="#CBD5E1"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-[#475569] flex items-center justify-between">
            <span>Alert threshold configured at 85% ward occupancy</span>
            <span className="font-semibold text-[#12324A]">Live Sync Active</span>
          </div>
        </div>
      </div>

      {/* Doctors Duty Roster Management */}
      <div className="bg-white rounded-2xl p-6 border border-[#DCE6EF] shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-[#0B7285]" aria-hidden="true" />
            <h2 className="font-display text-lg font-bold text-[#12324A]">
              Doctors &amp; Specialists Duty Roster ({activeHospital.name})
            </h2>
          </div>
          <span className="text-xs text-[#475569]">
            Toggle doctor status between On Duty and Off Duty
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#DCE6EF] text-xs font-bold uppercase text-[#475569] bg-[#F4F8FB]">
                <th className="py-3 px-4 rounded-tl-xl">Doctor Name</th>
                <th className="py-3 px-4">Specialty</th>
                <th className="py-3 px-4">Shift Schedule</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4 text-right rounded-tr-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(hospitalDoctors.length > 0 ? hospitalDoctors : doctors.slice(0, 5)).map(
                (doc) => (
                  <tr key={doc.id} className="hover:bg-[#F4F8FB]/60">
                    <td className="py-3.5 px-4 font-semibold text-[#12324A]">
                      {doc.name}
                      <div className="text-xs font-normal text-[#475569]">
                        {doc.qualification}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-[#0B7285]">
                      {doc.specialty}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#475569] font-mono-tabular">
                      {doc.shiftHours}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                          doc.onDuty ? 'text-[#15803D]' : 'text-[#B45309]'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{doc.onDuty ? 'On Duty' : 'Off Duty'}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onToggleDoctorDuty(doc.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                          doc.onDuty
                            ? 'bg-white border-[#DCE6EF] text-[#12324A] hover:border-[#DC2626] hover:text-[#DC2626]'
                            : 'bg-[#0B7285] border-[#0B7285] text-white hover:bg-[#095C6B]'
                        }`}
                      >
                        {doc.onDuty ? 'Mark Off Duty' : 'Mark On Duty'}
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incoming Registered Patients Queue */}
      <div className="bg-white rounded-2xl p-6 border border-[#DCE6EF] shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#0B7285]" aria-hidden="true" />
            <h2 className="font-display text-lg font-bold text-[#12324A]">
              Incoming Pre-Registered Patients (Network Triage Queue)
            </h2>
          </div>
          <span className="text-xs text-[#475569]">
            Update arrival stage as beds are prepared
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#DCE6EF] text-xs font-bold uppercase text-[#475569] bg-[#F4F8FB]">
                <th className="py-3 px-4 rounded-tl-xl">Reference ID &amp; Patient</th>
                <th className="py-3 px-4">Urgency</th>
                <th className="py-3 px-4">Symptoms &amp; Need</th>
                <th className="py-3 px-4">Assigned Hospital &amp; Ward</th>
                <th className="py-3 px-4 text-right rounded-tr-xl">Readiness Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {incomingPatients.map((pt) => {
                const urgencyColor =
                  pt.urgency === 'Critical'
                    ? 'text-[#DC2626] font-bold'
                    : pt.urgency === 'Urgent'
                    ? 'text-[#D97706] font-bold'
                    : 'text-[#0B7285] font-semibold';

                return (
                  <tr key={pt.referenceId} className="hover:bg-[#F4F8FB]/60">
                    <td className="py-3.5 px-4">
                      <div className="font-mono-tabular text-xs font-bold text-[#0B7285]">
                        {pt.referenceId}
                      </div>
                      <div className="font-semibold text-[#12324A]">
                        {pt.patientName}
                      </div>
                      <div className="text-xs text-[#475569]">
                        {pt.age} yrs · {pt.gender} · {pt.city}
                      </div>
                    </td>
                    <td className={`py-3.5 px-4 text-xs ${urgencyColor}`}>
                      {pt.urgency}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="text-xs text-[#12324A] line-clamp-2">
                        {pt.symptoms}
                      </div>
                      <div className="text-[11px] text-[#475569] mt-0.5">
                        Specialty: {pt.specialtyNeeded}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="font-semibold text-[#12324A]">
                        {pt.assignedHospitalName}
                      </div>
                      <div className="text-[#0B7285]">{pt.assignedWardLabel}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <select
                        aria-label={`Readiness stage for ${pt.patientName}`}
                        value={pt.statusStep}
                        onChange={(e) =>
                          onUpdatePatientStatus(
                            pt.referenceId,
                            e.target.value as PatientTrackerStep
                          )
                        }
                        className="px-3 py-1.5 rounded-xl bg-[#F4F8FB] border border-[#DCE6EF] text-xs font-semibold text-[#12324A] focus:bg-white focus:border-[#0B7285]"
                      >
                        <option value="Registered">1. Registered</option>
                        <option value="Hospital notified">2. Hospital Notified</option>
                        <option value="Bed ready">3. Bed Ready</option>
                        <option value="Arrived">4. Arrived</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
