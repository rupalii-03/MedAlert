import React, { useState } from 'react';
import {
  HeartPulse,
  PhoneCall,
  Mail,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  Send,
} from 'lucide-react';

export const AboutAndContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Patient Support / General Inquiry');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!message.trim() || message.trim().length < 8) {
      setError('Please write a brief message so our team can assist you.');
      return;
    }

    setSent(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
      {/* Mission & Team Codec Note */}
      <section className="bg-white rounded-2xl p-6 sm:p-10 border border-[#DCE6EF] shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0B7285]">
            <HeartPulse className="w-4 h-4" />
            <span>Our Mission · Built by Team Codec</span>
          </div>
          <h1
            className="font-display text-2xl sm:text-4xl font-bold text-[#12324A]"
            style={{ textWrap: 'balance' }}
          >
            Making Hospital Resources Visible When Every Minute Counts
          </h1>
          <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
            MedAlert Grid was created to solve a painful reality faced by
            thousands of families: arriving at an emergency room only to learn
            that no ICU or oxygen bed is free, while another hospital a few
            kilometers away has both beds and specialists ready.
          </p>
          <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
            By connecting hospital ward desks and patient registrations over a
            live Socket.IO network, we help patients reach the right care facility
            on the first trip—and give hospital staff precious advance notice to
            prepare before arrival.
          </p>
        </div>

        <div className="lg:col-span-5 bg-[#F4F8FB] rounded-2xl p-6 border border-[#DCE6EF] space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#0B7285] text-white flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-[#12324A]">
                About Team Codec
              </h2>
              <p className="text-xs text-[#475569]">
                Digital Health Infrastructure Engineering
              </p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
            Team Codec is a healthcare technology group focused on practical,
            human-centered clinical systems. We design accessible tools that work
            reliably for patients, families, and busy hospital nursing stations
            alike.
          </p>
          <div className="pt-3 border-t border-[#DCE6EF] grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="font-bold text-[#12324A]">9 Partner Hospitals</div>
              <div className="text-[#475569]">Live in demo network</div>
            </div>
            <div>
              <div className="font-bold text-[#12324A]">5 Metro Regions</div>
              <div className="text-[#475569]">Real-time bed visibility</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Helpline Section */}
      <section
        id="contact-section"
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
      >
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl p-6 border border-[#DCE6EF] space-y-4">
            <h2 className="font-display text-xl font-bold text-[#12324A]">
              Helpline &amp; Regional Coordination Office
            </h2>
            <p className="text-xs sm:text-sm text-[#475569]">
              For immediate medical emergencies, please dial <strong>108</strong>{' '}
              or use our live availability search to notify the nearest hospital.
            </p>

            <div className="space-y-3 pt-2 text-sm">
              <div className="flex items-start gap-3">
                <PhoneCall className="w-4 h-4 text-[#F58220] shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-[#12324A]">
                    24/7 Patient Care Helpline
                  </div>
                  <div className="font-mono-tabular text-xs text-[#0B7285]">
                    1800-108-4455 (Toll-Free) · Emergency: 108
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#0B7285] shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-[#12324A]">
                    Email Support &amp; Hospital Desk
                  </div>
                  <div className="text-xs text-[#475569]">
                    caredesk@medalertgrid.org
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#0B7285] shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-[#12324A]">
                    Coordination Center Address
                  </div>
                  <div className="text-xs text-[#475569]">
                    Team Codec Digital Health Hub, 4th Floor, Healthcare Plaza,
                    Residency Road, Bengaluru 560025
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-[#DCE6EF] shadow-xs">
          {sent ? (
            <div role="status" className="py-10 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-[#16A34A] mx-auto" />
              <h3 className="font-display text-2xl font-bold text-[#12324A]">
                Message Received
              </h3>
              <p className="text-sm text-[#475569] max-w-md mx-auto">
                Thank you for reaching out, <strong>{name}</strong>. Our care
                coordination desk will respond to <strong>{email}</strong>{' '}
                shortly.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setName('');
                  setEmail('');
                  setMessage('');
                }}
                className="px-5 py-2.5 rounded-xl bg-[#0B7285] text-white text-xs font-semibold cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4" noValidate>
              <h2 className="font-display text-xl font-bold text-[#12324A]">
                Send Us a Message
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="about-name"
                    className="block text-xs font-semibold text-[#12324A] mb-1"
                  >
                    Your Name *
                  </label>
                  <input
                    id="about-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8FB] border border-[#DCE6EF] text-sm text-[#12324A] focus:bg-white focus:border-[#0B7285] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="about-email"
                    className="block text-xs font-semibold text-[#12324A] mb-1"
                  >
                    Email Address *
                  </label>
                  <input
                    id="about-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8FB] border border-[#DCE6EF] text-sm text-[#12324A] focus:bg-white focus:border-[#0B7285] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="about-subject"
                  className="block text-xs font-semibold text-[#12324A] mb-1"
                >
                  Topic
                </label>
                <select
                  id="about-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8FB] border border-[#DCE6EF] text-sm text-[#12324A] focus:bg-white focus:border-[#0B7285] focus:outline-none"
                >
                  <option value="Patient Support / General Inquiry">
                    Patient Support / General Inquiry
                  </option>
                  <option value="Hospital Network Partnership">
                    Hospital Network Partnership
                  </option>
                  <option value="Feedback on Live Availability">
                    Feedback on Live Availability
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="about-message"
                  className="block text-xs font-semibold text-[#12324A] mb-1"
                >
                  Message *
                </label>
                <textarea
                  id="about-message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can our care coordination team help you?"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F8FB] border border-[#DCE6EF] text-sm text-[#12324A] focus:bg-white focus:border-[#0B7285] focus:outline-none"
                />
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl bg-[#FEF2F2] border border-[#FECACA] p-3 text-xs font-semibold text-[#DC2626] flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#0B7285] hover:bg-[#095C6B] text-white font-display text-sm font-semibold transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Send Message</span>
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
