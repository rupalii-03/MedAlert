import React, { useState } from 'react';
import { PageRoute } from '../types/hospital';
import {
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Layers,
  Users,
  Send,
} from 'lucide-react';

interface ForHospitalsPageProps {
  onNavigate: (page: PageRoute) => void;
}

export const ForHospitalsPage: React.FC<ForHospitalsPageProps> = ({
  onNavigate,
}) => {
  const [hospitalName, setHospitalName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [bedCapacity, setBedCapacity] = useState('150');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!hospitalName.trim()) {
      setFormError('Please enter your hospital or medical institution name.');
      return;
    }
    if (!contactPerson.trim()) {
      setFormError('Please enter the primary contact person’s name and role.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setFormError('Please enter a valid official email address.');
      return;
    }

    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Hero Banner for Hospitals */}
      <div className="bg-white rounded-2xl border border-[#DCE6EF] shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center space-y-5">
          <div className="text-xs font-bold uppercase tracking-wider text-[#0B7285]">
            For Hospital Administrators &amp; Medical Directors
          </div>
          <h1
            className="font-display text-2xl sm:text-4xl font-bold text-[#12324A] leading-tight"
            style={{ textWrap: 'balance' }}
          >
            Streamline Emergency Admissions &amp; Balance Ward Occupancy
          </h1>
          <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
            When your hospital joins MedAlert Grid, patients and ambulances see
            your real-time bed availability and on-duty specialists before they
            set out. Your triage team receives structured pre-arrival alerts so
            every bed is prepared on time.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="#request-hospital-demo"
              className="px-5 py-3 rounded-xl bg-[#F58220] hover:bg-[#E06D0B] text-white font-display text-sm font-semibold transition-colors"
            >
              Request a Hospital Demo
            </a>
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="px-5 py-3 rounded-xl bg-[#F4F8FB] hover:bg-[#EAF3F8] text-[#12324A] border border-[#DCE6EF] font-display text-sm font-semibold transition-colors cursor-pointer"
            >
              Preview Live Staff Dashboard
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 bg-[#F4F8FB]">
          <img
            src="/src/assets/images/bright_hospital_exterior_sunny_1791635829621.jpg"
            alt="Modern sunlit multi-specialty hospital building with patient drop-off entrance"
            referrerPolicy="no-referrer"
            className="w-full h-full min-h-[280px] object-cover"
          />
        </div>
      </div>

      {/* Benefits Grid */}
      <section className="space-y-6">
        <div className="max-w-2xl">
          <div className="text-xs font-bold uppercase tracking-wider text-[#0B7285]">
            Operational &amp; Clinical Benefits
          </div>
          <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-[#12324A]">
            Designed Around Real Hospital Workflows
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-[#DCE6EF] space-y-3">
            <Clock className="w-6 h-6 text-[#0B7285]" aria-hidden="true" />
            <h3 className="font-display text-base font-bold text-[#12324A]">
              Advance Triage Readiness
            </h3>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              Know the patient’s age, symptoms, and urgency before they reach
              your emergency gate, cutting intake paperwork and triage wait times.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#DCE6EF] space-y-3">
            <Building2 className="w-6 h-6 text-[#F58220]" aria-hidden="true" />
            <h3 className="font-display text-base font-bold text-[#12324A]">
              Automated 85% Load Alerts
            </h3>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              When your ICU or general wards exceed 85% occupancy, our routing
              engine automatically balances new routine cases to partner clinics.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#DCE6EF] space-y-3">
            <Layers className="w-6 h-6 text-[#16A34A]" aria-hidden="true" />
            <h3 className="font-display text-base font-bold text-[#12324A]">
              Seamless HMS Integration
            </h3>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              Connect via standard HL7/FHIR endpoints or let nursing supervisors
              update ward counts in two clicks from any browser or tablet.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#DCE6EF] space-y-3">
            <Users className="w-6 h-6 text-[#0B7285]" aria-hidden="true" />
            <h3 className="font-display text-base font-bold text-[#12324A]">
              Full Staff Training &amp; Support
            </h3>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              We provide on-site and remote orientation for reception desks,
              nursing coordinators, and emergency duty managers.
            </p>
          </div>
        </div>
      </section>

      {/* Onboarding Steps & Request Demo Form */}
      <section
        id="request-hospital-demo"
        className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start"
      >
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#0B7285]">
              Fast 3-Stage Onboarding
            </div>
            <h2 className="mt-1 font-display text-2xl font-bold text-[#12324A]">
              Go Live on the Network in Under 7 Days
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                step: '01',
                title: 'Facility Verification & Ward Mapping',
                desc: 'We configure your General, ICU, Emergency, and Oxygen bed counts and specialist departments.',
              },
              {
                step: '02',
                title: 'HMS Bridge or Web Desk Setup',
                desc: 'Choose between automated API sync with your hospital management software or our simple browser dashboard.',
              },
              {
                step: '03',
                title: 'Staff Training & Live Activation',
                desc: 'A 45-minute guided walkthrough for your triage and nursing desk teams, followed by live network activation.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white rounded-2xl p-5 border border-[#DCE6EF] flex items-start gap-4"
              >
                <span className="font-mono-tabular text-sm font-bold text-[#0B7285] bg-[#EAF3F8] px-3 py-1.5 rounded-lg shrink-0">
                  {item.step}
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-[#12324A]">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#475569] mt-1">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Request a Demo Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-[#DCE6EF] shadow-xs">
          {submitted ? (
            <div role="status" className="py-10 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-[#16A34A] mx-auto" />
              <h3 className="font-display text-2xl font-bold text-[#12324A]">
                Hospital Demo Request Confirmed
              </h3>
              <p className="text-sm text-[#475569] max-w-md mx-auto">
                Thank you, <strong>{contactPerson}</strong>. Our hospital
                integration team will contact <strong>{email}</strong> to
                schedule a walkthrough for <strong>{hospitalName}</strong>.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="px-5 py-2.5 rounded-xl bg-[#0B7285] text-white text-xs font-semibold cursor-pointer"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleDemoSubmit} className="space-y-4" noValidate>
              <div>
                <h2 className="font-display text-xl font-bold text-[#12324A]">
                  Request a Hospital Onboarding Demo
                </h2>
                <p className="text-xs text-[#475569] mt-0.5">
                  Speak with our healthcare integration specialists
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="demo-hosp-name"
                    className="block text-xs font-semibold text-[#12324A] mb-1"
                  >
                    Hospital / Institution Name *
                  </label>
                  <input
                    id="demo-hosp-name"
                    type="text"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    placeholder="e.g. Cityside Multi-Specialty Hospital"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8FB] border border-[#DCE6EF] text-sm text-[#12324A] focus:bg-white focus:border-[#0B7285] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="demo-contact-person"
                    className="block text-xs font-semibold text-[#12324A] mb-1"
                  >
                    Your Name &amp; Designation *
                  </label>
                  <input
                    id="demo-contact-person"
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Dr. Sanjay Mehta, Medical Supt."
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8FB] border border-[#DCE6EF] text-sm text-[#12324A] focus:bg-white focus:border-[#0B7285] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="demo-email"
                    className="block text-xs font-semibold text-[#12324A] mb-1"
                  >
                    Official Email Address *
                  </label>
                  <input
                    id="demo-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@hospital.org"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8FB] border border-[#DCE6EF] text-sm text-[#12324A] focus:bg-white focus:border-[#0B7285] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="demo-phone"
                    className="block text-xs font-semibold text-[#12324A] mb-1"
                  >
                    Direct Phone Number
                  </label>
                  <input
                    id="demo-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98450 00000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8FB] border border-[#DCE6EF] text-sm text-[#12324A] focus:bg-white focus:border-[#0B7285] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="demo-city"
                    className="block text-xs font-semibold text-[#12324A] mb-1"
                  >
                    City / Region
                  </label>
                  <input
                    id="demo-city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8FB] border border-[#DCE6EF] text-sm text-[#12324A] focus:bg-white focus:border-[#0B7285] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="demo-beds"
                    className="block text-xs font-semibold text-[#12324A] mb-1"
                  >
                    Total Hospital Bed Strength
                  </label>
                  <input
                    id="demo-beds"
                    type="number"
                    value={bedCapacity}
                    onChange={(e) => setBedCapacity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8FB] border border-[#DCE6EF] text-sm font-mono-tabular text-[#12324A] focus:bg-white focus:border-[#0B7285] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="demo-notes"
                  className="block text-xs font-semibold text-[#12324A] mb-1"
                >
                  Current HMS Software or Integration Questions
                </label>
                <textarea
                  id="demo-notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Let us know if you use an existing Hospital Management System or prefer browser-based ward updates..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8FB] border border-[#DCE6EF] text-sm text-[#12324A] focus:bg-white focus:border-[#0B7285] focus:outline-none"
                />
              </div>

              {formError && (
                <div
                  role="alert"
                  className="rounded-xl bg-[#FEF2F2] border border-[#FECACA] p-3 text-xs font-semibold text-[#DC2626] flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-5 rounded-xl bg-[#F58220] hover:bg-[#E06D0B] text-white font-display text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Request Hospital Network Demo</span>
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
