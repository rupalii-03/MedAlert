import React, { useState } from 'react';
import {
  Hospital,
  Doctor,
  BedWardType,
  SpecialtyType,
  PageRoute,
} from '../types/hospital';
import { SearchCard } from '../components/ui/SearchCard';
import { HospitalCard } from '../components/ui/HospitalCard';
import { DoctorCard } from '../components/ui/DoctorCard';
import { FAQItem } from '../components/ui/FAQItem';
import {
  HeartPulse,
  Bed,
  Stethoscope,
  Truck,
  ClipboardCheck,
  Activity,
  ShieldCheck,
  Lock,
  CheckCircle2,
  ArrowRight,
  Clock,
  Building2,
  BellRing,
} from 'lucide-react';

interface HomePageProps {
  hospitals: Hospital[];
  doctors: Doctor[];
  lastUpdated: Date;
  onNavigate: (page: PageRoute) => void;
  onSearchFilterSubmit: (filters: {
    city: string;
    careNeed: BedWardType | 'doctor_consultation' | 'all';
    specialty: SpecialtyType | 'all';
  }) => void;
  onRegisterWithHospital: (hospital: Hospital) => void;
  onConsultDoctor: (doctor: Doctor) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  hospitals,
  doctors,
  lastUpdated,
  onNavigate,
  onSearchFilterSubmit,
  onRegisterWithHospital,
  onConsultDoctor,
}) => {
  const [selectedSpecialtyTab, setSelectedSpecialtyTab] = useState<
    SpecialtyType | 'All'
  >('All');
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-socket');

  const quickServices = [
    {
      title: 'Emergency Care',
      subtitle: 'Immediate trauma & triage beds',
      Icon: HeartPulse,
      action: () =>
        onSearchFilterSubmit({
          city: 'All',
          careNeed: 'emergency',
          specialty: 'Emergency Medicine',
        }),
    },
    {
      title: 'ICU Beds',
      subtitle: 'Ventilator & critical care units',
      Icon: Activity,
      action: () =>
        onSearchFilterSubmit({
          city: 'All',
          careNeed: 'icu',
          specialty: 'Critical Care',
        }),
    },
    {
      title: 'General Beds',
      subtitle: 'Inpatient recovery & observation',
      Icon: Bed,
      action: () =>
        onSearchFilterSubmit({
          city: 'All',
          careNeed: 'general',
          specialty: 'all',
        }),
    },
    {
      title: 'Doctor on Duty',
      subtitle: 'Active specialists on shift now',
      Icon: Stethoscope,
      action: () => {
        document
          .getElementById('doctors-preview')
          ?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      title: 'Ambulance Support',
      subtitle: 'Hospitals with dispatch units ready',
      Icon: Truck,
      action: () => onNavigate('availability'),
    },
    {
      title: 'Hospital Registration',
      subtitle: 'Pre-arrival notification & match',
      Icon: ClipboardCheck,
      action: () => onNavigate('register'),
    },
  ];

  const partnerHospitalNames = [
    'Apollo Care Network',
    'Manipal Lifeline Hospitals',
    'Kokilaben Heart Institute',
    'Medanta Metro Medicity',
    'Kauvery Multi-Specialty',
    'Yashoda Care Foundation',
  ];

  const faqs = [
    {
      id: 'faq-socket',
      question: 'How do live bed and doctor updates work without refreshing the page?',
      answer:
        'MedAlert Grid maintains a persistent real-time Socket.IO connection between each partner hospital’s nursing desk and your browser. Whenever a ward nurse updates a bed count or a doctor starts their shift, the change appears on your screen within seconds.',
    },
    {
      id: 'faq-security',
      question: 'How are my medical details and personal privacy protected?',
      answer:
        'Your registration details are encrypted in transit and shared strictly with the receiving triage team at your matched hospital so they can prepare a bed before you arrive. We never sell or expose patient information.',
    },
    {
      id: 'faq-integration',
      question: 'Can MedAlert Grid work alongside existing hospital management software?',
      answer:
        'Yes. Hospitals can update availability directly through our clean web dashboard or connect their existing Hospital Management System (HMS) and HL7 admission feeds without changing daily clinical routines.',
    },
    {
      id: 'faq-training',
      question: 'Is training and support provided for hospital reception and nursing staff?',
      answer:
        'Every partner hospital receives guided onboarding sessions for ward coordinators, emergency triage nurses, and duty managers, backed by our 24/7 technical support desk.',
    },
  ];

  const filteredDoctors =
    selectedSpecialtyTab === 'All'
      ? doctors.slice(0, 6)
      : doctors.filter((d) => d.specialty === selectedSpecialtyTab).slice(0, 6);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="bg-gradient-to-b from-[#EAF3F8] to-[#F4F8FB] pt-8 sm:pt-12 pb-12 border-b border-[#DCE6EF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#0B7285]">
                <ShieldCheck className="w-4 h-4 text-[#16A34A]" aria-hidden="true" />
                <span>Trusted Real-Time Hospital &amp; Emergency Care Network</span>
              </div>

              <h1
                className="font-display text-3xl sm:text-5xl font-bold text-[#12324A] leading-[1.15] tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                Find the Right Hospital Bed &amp; Doctor—Without the Wait.
              </h1>

              <p className="text-base sm:text-lg text-[#475569] leading-relaxed max-w-2xl">
                During a medical urgency, every minute spent searching for an
                open bed matters. MedAlert Grid shows you live bed availability
                and on-duty specialists across nearby hospitals, and alerts the
                receiving care team the moment you register.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="px-6 py-3.5 rounded-xl bg-[#F58220] hover:bg-[#E06D0B] text-white font-display text-sm sm:text-base font-semibold transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>Register &amp; Get Matched Now</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('availability')}
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-[#F4F8FB] text-[#12324A] border border-[#DCE6EF] hover:border-[#0B7285] font-display text-sm sm:text-base font-semibold transition-colors inline-flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>View All Live Hospitals</span>
                </button>
              </div>
            </div>

            {/* Right Bright Hospital Photography */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-[#DCE6EF] shadow-[0_14px_34px_-10px_rgba(18,50,74,0.14)] bg-white">
                <img
                  src="/src/assets/images/bright_hospital_hero_team_1791635818721.jpg"
                  alt="Smiling doctors and nurse coordinating patient care in a bright, sunlit hospital lobby"
                  referrerPolicy="no-referrer"
                  className="w-full h-[280px] sm:h-[330px] object-cover"
                />
                <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="font-semibold text-[#12324A]">
                      Pre-Arrival Hospital Notification
                    </div>
                    <div className="text-[#475569]">
                      Your matched hospital prepares a bed before you reach the door
                    </div>
                  </div>
                  <span className="font-mono-tabular font-bold text-[#15803D] shrink-0">
                    24/7 Live Sync
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Search Card */}
          <div className="mt-8 sm:mt-10">
            <SearchCard
              reportingHospitalsCount={hospitals.length}
              onSearchSubmit={onSearchFilterSubmit}
            />
          </div>
        </div>
      </section>

      {/* 2. QUICK SERVICES ROW OF TILES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#12324A]">
              Quick Care &amp; Capacity Services
            </h2>
            <p className="text-sm text-[#475569]">
              Select a care category to check real-time availability or register immediately
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickServices.map((srv) => {
            const Icon = srv.Icon;
            return (
              <button
                key={srv.title}
                type="button"
                onClick={srv.action}
                className="group text-left bg-white hover:bg-[#F4F8FB] rounded-2xl p-4 border border-[#DCE6EF] hover:border-[#0B7285] shadow-xs transition-all flex flex-col justify-between cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7285]"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EAF3F8] group-hover:bg-[#0B7285] text-[#0B7285] group-hover:text-white flex items-center justify-center transition-colors">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="mt-4">
                  <h3 className="font-display text-sm font-bold text-[#12324A] group-hover:text-[#0B7285] transition-colors">
                    {srv.title}
                  </h3>
                  <p className="text-xs text-[#475569] mt-0.5 leading-snug">
                    {srv.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. "LIVE NEAR YOU" STRIP (4 Hospital Cards updating in real time) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#0B7285]">
              Real-Time Hospital Status · Demo Data
            </div>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-[#12324A]">
              Hospitals Reporting Live Near You
            </h2>
            <p className="text-sm text-[#475569] mt-1">
              Bed counts and on-duty doctor rosters update automatically as hospital staff log changes.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-[#475569] font-mono-tabular">
              Updated at {lastUpdated.toLocaleTimeString([], { hour12: false })}
            </span>
            <button
              type="button"
              onClick={() => onNavigate('availability')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B7285] hover:text-[#12324A] cursor-pointer whitespace-nowrap"
            >
              <span>See all {hospitals.length} hospitals</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {hospitals.slice(0, 4).map((hosp) => (
            <HospitalCard
              key={hosp.id}
              hospital={hosp}
              onRegisterWithHospital={onRegisterWithHospital}
            />
          ))}
        </div>
      </section>

      {/* 4. HOW IT WORKS IN 3 SIMPLE STEPS */}
      <section className="bg-white py-16 border-y border-[#DCE6EF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="text-xs font-bold uppercase tracking-wider text-[#0B7285]">
              Simple, Reassuring Care Coordination
            </div>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-[#12324A]">
              How MedAlert Grid Connects You to Care in 3 Steps
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#475569]">
              We remove the guesswork of calling multiple hospitals or arriving
              at a full emergency department.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-[#F4F8FB] border border-[#DCE6EF] p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono-tabular text-xs font-bold text-[#0B7285]">
                    STEP 01
                  </span>
                  <ClipboardCheck className="w-5 h-5 text-[#0B7285]" aria-hidden="true" />
                </div>
                <h3 className="mt-3 font-display text-lg font-bold text-[#12324A]">
                  1. Search or Register Your Need
                </h3>
                <p className="mt-2 text-sm text-[#475569] leading-relaxed">
                  Share your location, symptoms, and whether you need a general
                  bed, ICU support, oxygen therapy, or a specialist consultation.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#DCE6EF] text-xs font-semibold text-[#12324A]">
                Takes less than 60 seconds on mobile or desktop
              </div>
            </div>

            <div className="rounded-2xl bg-[#F4F8FB] border border-[#0B7285] p-6 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono-tabular text-xs font-bold text-[#0B7285]">
                    STEP 02 · INSTANT HOSPITAL ALERT
                  </span>
                  <BellRing className="w-5 h-5 text-[#F58220]" aria-hidden="true" />
                </div>
                <h3 className="mt-3 font-display text-lg font-bold text-[#12324A]">
                  2. Get Matched &amp; Hospital Is Notified
                </h3>
                <p className="mt-2 text-sm text-[#475569] leading-relaxed">
                  Our platform checks live ward capacity and on-duty doctors,
                  assigns the best-fit nearby hospital, and sends an immediate
                  alert to their admission desk.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#DCE6EF] flex items-center gap-2 text-xs font-semibold text-[#15803D]">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Receiving triage team alerted before you arrive</span>
              </div>
            </div>

            <div className="rounded-2xl bg-[#F4F8FB] border border-[#DCE6EF] p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono-tabular text-xs font-bold text-[#0B7285]">
                    STEP 03
                  </span>
                  <HeartPulse className="w-5 h-5 text-[#16A34A]" aria-hidden="true" />
                </div>
                <h3 className="mt-3 font-display text-lg font-bold text-[#12324A]">
                  3. Arrive Prepared with Reference ID
                </h3>
                <p className="mt-2 text-sm text-[#475569] leading-relaxed">
                  Receive your confirmed reference ID, assigned doctor name,
                  estimated wait time, and directions so you can go straight to
                  a prepared care team.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#DCE6EF] text-xs font-semibold text-[#12324A]">
                Direct admission intake · Clear status tracking
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHY IT MATTERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5">
            <div className="rounded-2xl overflow-hidden border border-[#DCE6EF] bg-white shadow-sm">
              <img
                src="/src/assets/images/bright_nurse_coordination_desk_1791635843427.jpg"
                alt="Nurse and doctor reviewing live hospital bed capacity at a bright reception desk"
                referrerPolicy="no-referrer"
                loading="lazy"
                className="w-full h-[300px] sm:h-[340px] object-cover"
              />
              <div className="p-4 bg-[#F4F8FB] text-xs text-[#475569]">
                Coordinated triage helps nursing teams prepare beds before the patient walks in.
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#0B7285]">
                Why Live Capacity Visibility Matters
              </div>
              <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-[#12324A]">
                Better Visibility Means Faster Care for Every Family
              </h2>
              <p className="mt-2 text-sm sm:text-base text-[#475569] leading-relaxed">
                When hospitals cannot share their open beds in real time,
                families lose precious hours going from one emergency gate to
                another while nearby wards sit under-utilized.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-[#DCE6EF]">
                <Clock className="w-5 h-5 text-[#F58220]" aria-hidden="true" />
                <h3 className="mt-3 font-display text-base font-bold text-[#12324A]">
                  Ending Multi-Hour Waits
                </h3>
                <p className="mt-1.5 text-xs text-[#475569] leading-relaxed">
                  Patients avoid overcrowded waiting halls by heading directly to
                  a hospital that has confirmed an open bed for their condition.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-[#DCE6EF]">
                <Building2 className="w-5 h-5 text-[#0B7285]" aria-hidden="true" />
                <h3 className="mt-3 font-display text-base font-bold text-[#12324A]">
                  Uncovering Hidden Capacity
                </h3>
                <p className="mt-1.5 text-xs text-[#475569] leading-relaxed">
                  Real-time ward updates reveal available oxygen, ICU, and
                  recovery beds across neighboring hospitals across the city.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-[#DCE6EF]">
                <Stethoscope className="w-5 h-5 text-[#16A34A]" aria-hidden="true" />
                <h3 className="mt-3 font-display text-base font-bold text-[#12324A]">
                  Supporting Care Teams
                </h3>
                <p className="mt-1.5 text-xs text-[#475569] leading-relaxed">
                  Balanced patient arrivals prevent sudden emergency bottlenecks
                  and allow doctors and nurses to focus on attentive care.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. DOCTORS AND SPECIALTIES PREVIEW */}
      <section id="doctors-preview" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#0B7285]">
              On-Duty Specialists · Demo Profiles
            </div>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-[#12324A]">
              Doctors Currently Available Across Our Network
            </h2>
          </div>

          {/* Interactive Specialty Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-white p-1.5 rounded-xl border border-[#DCE6EF]">
            {(
              [
                'All',
                'Emergency Medicine',
                'Cardiology',
                'Neurology',
                'Pediatrics',
                'Pulmonology',
              ] as const
            ).map((spec) => (
              <button
                key={spec}
                type="button"
                onClick={() => setSelectedSpecialtyTab(spec)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  selectedSpecialtyTab === spec
                    ? 'bg-[#0B7285] text-white'
                    : 'text-[#475569] hover:text-[#12324A]'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDoctors.map((doc) => (
            <DoctorCard
              key={doc.id}
              doctor={doc}
              onConsultDoctor={onConsultDoctor}
            />
          ))}
        </div>
      </section>

      {/* 7. TRUST SECTION & PARTNER HOSPITAL LOGOS */}
      <section className="bg-white py-14 border-y border-[#DCE6EF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-10 border-b border-slate-100">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#EAF3F8] text-[#0B7285] flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-[#12324A]">
                  Strict Patient Data Privacy
                </h3>
                <p className="text-xs text-[#475569] mt-1 leading-relaxed">
                  All registration transmissions use TLS encryption and are
                  routed solely to the authorized triage desk at your matched
                  hospital.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#EAF3F8] text-[#0B7285] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-[#12324A]">
                  Hospital-Verified Live Feeds
                </h3>
                <p className="text-xs text-[#475569] mt-1 leading-relaxed">
                  Bed and doctor counts are updated directly by verified hospital
                  ward managers and automated admission systems.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#EAF3F8] text-[#0B7285] flex items-center justify-center shrink-0">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-[#12324A]">
                  Zero Cost for Patients
                </h3>
                <p className="text-xs text-[#475569] mt-1 leading-relaxed">
                  Checking live hospital bed availability and pre-notifying an
                  emergency department is completely free for patients and
                  families.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <p className="text-xs font-semibold text-center text-[#475569] uppercase tracking-wider mb-5">
              Sample Participating Hospital Network (Illustrative Demo Partners)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {partnerHospitalNames.map((name) => (
                <div
                  key={name}
                  className="px-4 py-3 rounded-xl bg-[#F4F8FB] border border-[#DCE6EF] text-center font-display text-xs font-bold text-[#12324A] flex items-center justify-center"
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS (Sample Content) & FAQ ACCORDION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Sample Patient & Doctor Testimonials */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#0B7285]">
                Sample Community Experiences (Demo Content)
              </div>
              <h2 className="mt-1 font-display text-2xl font-bold text-[#12324A]">
                Reassurance When Families Need It Most
              </h2>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#DCE6EF] shadow-xs space-y-3">
              <p className="text-sm text-[#1E293B] leading-relaxed italic">
                “When my father needed an oxygen-supported bed late in the
                evening, MedAlert Grid showed us that Apollo Care had open
                capacity 2 km away. By the time we reached the entrance, the
                nursing staff already had his registration and bed ready.”
              </p>
              <div className="pt-2 border-t border-slate-100 text-xs text-[#475569]">
                <strong className="text-[#12324A]">Karthik Subramanian</strong> ·
                Family Caregiver, Bengaluru (Sample Testimonial)
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#DCE6EF] shadow-xs space-y-3">
              <p className="text-sm text-[#1E293B] leading-relaxed italic">
                “Receiving advance notice of an incoming patient’s symptoms and
                urgency lets our emergency triage team assign the right
                specialist and prepare resuscitation or ICU equipment minutes
                ahead of arrival.”
              </p>
              <div className="pt-2 border-t border-slate-100 text-xs text-[#475569]">
                <strong className="text-[#12324A]">Dr. Ananya Deshmukh</strong> ·
                Senior Cardiologist, Partner Hospital (Sample Testimonial)
              </div>
            </div>
          </div>

          {/* Right: FAQ Accordion */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#0B7285]">
                Frequently Asked Questions
              </div>
              <h2 className="mt-1 font-display text-2xl font-bold text-[#12324A]">
                How Our Live Hospital Network Operates
              </h2>
            </div>

            <div className="space-y-3.5">
              {faqs.map((faq) => (
                <FAQItem
                  key={faq.id}
                  id={faq.id}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openFaqId === faq.id}
                  onToggle={() =>
                    setOpenFaqId((prev) => (prev === faq.id ? null : faq.id))
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 9. CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-[#0B7285] text-white p-8 sm:p-10 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Need a Hospital Bed or Specialist Right Now?
            </h2>
            <p className="text-sm sm:text-base text-slate-100">
              Register your symptoms in under a minute to get matched with the
              nearest verified hospital and notify their care team immediately.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="px-6 py-3.5 rounded-xl bg-[#F58220] hover:bg-[#E06D0B] text-white font-display text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              Register as Patient
            </button>
            <button
              type="button"
              onClick={() => onNavigate('for-hospitals')}
              className="px-5 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/30 font-display text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              Partner Your Hospital
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
