import React from 'react';
import { PageRoute } from '../../types/hospital';
import { HeartPulse, PhoneCall, Mail, MapPin, ShieldCheck } from 'lucide-react';

interface FooterLayoutProps {
  onNavigate: (page: PageRoute) => void;
}

export const FooterLayout: React.FC<FooterLayoutProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#12324A] text-slate-200 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-700/70">
          {/* Column 1: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#0B7285] flex items-center justify-center text-white">
                <HeartPulse className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="font-display text-xl font-bold text-white">
                MedAlert Grid
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
              A connected hospital-capacity network built by Team Codec. We help
              patients and families find nearby hospitals with available beds and
              on-duty doctors right now, notifying the receiving care team before
              you arrive.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-300 pt-1">
              <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" aria-hidden="true" />
              <span>Encrypted Patient Routing · Hospital-Verified Live Feeds</span>
            </div>
          </div>

          {/* Column 2: Patient Care Services */}
          <div className="space-y-3">
            <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">
              For Patients &amp; Families
            </h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('availability')}
                  className="hover:text-[#F58220] transition-colors cursor-pointer"
                >
                  Check Live Bed Availability
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="hover:text-[#F58220] transition-colors cursor-pointer"
                >
                  Register &amp; Notify Hospital
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="hover:text-[#F58220] transition-colors cursor-pointer"
                >
                  Find On-Duty Specialists
                </button>
              </li>
              <li>
                <a href="tel:108" className="hover:text-[#F58220] transition-colors">
                  Emergency Ambulance (108)
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Hospital Network & Staff */}
          <div className="space-y-3">
            <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">
              For Partner Hospitals
            </h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-[#F58220] transition-colors cursor-pointer"
                >
                  Hospital Staff Dashboard
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('for-hospitals')}
                  className="hover:text-[#F58220] transition-colors cursor-pointer"
                >
                  Join the Hospital Network
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('for-hospitals')}
                  className="hover:text-[#F58220] transition-colors cursor-pointer"
                >
                  HMS &amp; HL7 Integration
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('about')}
                  className="hover:text-[#F58220] transition-colors cursor-pointer"
                >
                  About Team Codec
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Helpline & Contact */}
          <div className="space-y-3">
            <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">
              24/7 Care Support
            </h3>
            <div className="space-y-2.5 text-sm text-slate-300">
              <p className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-[#F58220] shrink-0" />
                <span className="font-mono-tabular font-semibold text-white">
                  108 / 1800-108-4455
                </span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#F58220] shrink-0" />
                <span>caredesk@medalertgrid.org</span>
              </p>
              <p className="flex items-start gap-2 text-xs text-slate-300">
                <MapPin className="w-4 h-4 text-[#F58220] shrink-0 mt-0.5" />
                <span>
                  Team Codec Digital Health Hub, Residency Road, Bengaluru 560025
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Demo Notice */}
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} MedAlert Grid · Built by Team Codec.</p>
          <p className="max-w-2xl">
            <strong>Demo Notice:</strong> All hospital capacities, doctor
            schedules, and patient registrations shown on this site are
            simulated demo data for demonstration purposes. In a real medical
            emergency, please dial 108 or visit your nearest emergency room.
          </p>
        </div>
      </div>
    </footer>
  );
};
