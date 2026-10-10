import React, { useState } from 'react';
import { PageRoute } from '../../types/hospital';
import {
  PhoneCall,
  Globe,
  UserCheck,
  Building2,
  HeartPulse,
  Search,
  Menu,
  X,
} from 'lucide-react';

interface HeaderLayoutProps {
  currentPage: PageRoute;
  onNavigate: (page: PageRoute, query?: string) => void;
  globalSearchQuery: string;
  onGlobalSearchChange: (q: string) => void;
}

export const HeaderLayout: React.FC<HeaderLayoutProps> = ({
  currentPage,
  onNavigate,
  globalSearchQuery,
  onGlobalSearchChange,
}) => {
  const [language, setLanguage] = useState<'EN' | 'HI' | 'KN' | 'TA'>('EN');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: Array<{ label: string; route: PageRoute }> = [
    { label: 'Find Hospitals', route: 'availability' },
    { label: 'Find Doctors', route: 'home' },
    { label: 'Live Availability', route: 'availability' },
    { label: 'For Hospitals', route: 'for-hospitals' },
    { label: 'About', route: 'about' },
    { label: 'Contact', route: 'about' },
  ];

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('availability', globalSearchQuery);
  };

  return (
    <div className="sticky top-0 z-50 bg-white shadow-[0_2px_15px_-4px_rgba(18,50,74,0.07)]">
      {/* Top Hospital Utility Bar */}
      <div className="bg-[#12324A] text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between gap-4">
          {/* Emergency Helpline */}
          <div className="flex items-center gap-4">
            <a
              href="tel:108"
              className="inline-flex items-center gap-1.5 font-semibold text-white hover:text-[#F58220] transition-colors whitespace-nowrap"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#F58220] shrink-0" aria-hidden="true" />
              <span>Emergency: 108</span>
              <span aria-hidden="true" className="opacity-50">|</span>
              <span className="hidden sm:inline font-mono-tabular">
                24/7 Care Helpline: 1800-108-4455
              </span>
            </a>
          </div>

          {/* Language Selector, Patient Login, Hospital Staff Login */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-slate-300" aria-hidden="true" />
              <label htmlFor="utility-lang" className="sr-only">
                Select Language
              </label>
              <select
                id="utility-lang"
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="EN" className="text-slate-900">
                  English
                </option>
                <option value="HI" className="text-slate-900">
                  हिन्दी (Hindi)
                </option>
                <option value="KN" className="text-slate-900">
                  ಕನ್ನಡ (Kannada)
                </option>
                <option value="TA" className="text-slate-900">
                  தமிழ் (Tamil)
                </option>
              </select>
            </div>

            <span aria-hidden="true" className="opacity-30">|</span>

            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="inline-flex items-center gap-1 hover:text-[#F58220] transition-colors cursor-pointer whitespace-nowrap"
            >
              <UserCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Patient Login / Status</span>
            </button>

            <span aria-hidden="true" className="opacity-30">|</span>

            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className={`inline-flex items-center gap-1 font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                currentPage === 'dashboard'
                  ? 'text-[#F58220]'
                  : 'text-white hover:text-[#F58220]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Hospital Staff Login</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header className="border-b border-[#DCE6EF] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          {/* Brand Logo */}
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7285] rounded-lg cursor-pointer shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-[#0B7285] flex items-center justify-center text-white shadow-xs">
              <HeartPulse className="w-5 h-5" aria-hidden="true" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-[#12324A] whitespace-nowrap">
              MedAlert Grid
            </span>
          </button>

          {/* Prominent Search Bar */}
          <form
            onSubmit={handleQuickSearchSubmit}
            className="hidden lg:flex items-center flex-1 max-w-xs relative"
          >
            <Search
              className="w-4 h-4 text-[#475569] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={globalSearchQuery}
              onChange={(e) => onGlobalSearchChange(e.target.value)}
              placeholder="Search hospital, city, or specialty..."
              aria-label="Search hospital, city, or specialty"
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#F4F8FB] border border-[#DCE6EF] text-xs text-[#12324A] placeholder-[#475569] focus:bg-white focus:border-[#0B7285] focus:outline-none"
            />
          </form>

          {/* Navigation Links */}
          <nav
            aria-label="Main Navigation"
            className="hidden md:flex items-center gap-5 text-sm font-semibold text-[#12324A]"
          >
            {navItems.map((item) => {
              const isActive =
                (item.label === 'Live Availability' && currentPage === 'availability') ||
                (item.label === 'For Hospitals' && currentPage === 'for-hospitals') ||
                (item.label === 'About' && currentPage === 'about');

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    if (item.label === 'Find Doctors') {
                      onNavigate('home');
                      setTimeout(() => {
                        document
                          .getElementById('doctors-preview')
                          ?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    } else if (item.label === 'Contact') {
                      onNavigate('about');
                      setTimeout(() => {
                        document
                          .getElementById('contact-section')
                          ?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    } else {
                      onNavigate(item.route);
                    }
                  }}
                  className={`py-1 border-b-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'border-[#0B7285] text-[#0B7285]'
                      : 'border-transparent hover:text-[#0B7285]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Primary CTA: Warm Orange "Register as Patient" */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="px-4 py-2 rounded-xl bg-[#F58220] hover:bg-[#E06D0B] text-white font-display text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#12324A]"
            >
              Register as Patient
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle Menu"
              className="md:hidden p-2 rounded-xl text-[#12324A] hover:bg-[#F4F8FB]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-[#DCE6EF] px-4 py-4 space-y-3">
            <form onSubmit={handleQuickSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-[#475569] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={globalSearchQuery}
                onChange={(e) => onGlobalSearchChange(e.target.value)}
                placeholder="Search hospital, city, or specialty..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F4F8FB] border border-[#DCE6EF] text-sm"
              />
            </form>
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate(item.route);
                  }}
                  className="text-left px-3 py-2 rounded-xl text-sm font-semibold text-[#12324A] hover:bg-[#F4F8FB]"
                >
                  {item.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('dashboard');
                }}
                className="text-left px-3 py-2 rounded-xl text-sm font-semibold text-[#0B7285] hover:bg-[#F4F8FB]"
              >
                Hospital Staff Dashboard
              </button>
            </div>
          </div>
        )}
      </header>
    </div>
  );
};
