import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  Globe,
  ChevronDown,
  User,
  ArrowRight,
  PhoneCall,
  FileText,
  Search,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { Badge } from '../common/Badge.js';

export interface NavbarProps {
  currentView?: string;
  onNavigate?: (view: string) => void;
  user?: any;
  onLoginClick?: () => void;
  onLodgeClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView = 'home',
  onNavigate,
  user,
  onLoginClick,
  onLodgeClick,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('English');

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    {
      id: 'home',
      label: 'Lodge Grievance',
      description: 'Submit an issue with live AI triage',
      icon: <FileText className="w-5 h-5 text-[#2563EB]" />,
    },
    {
      id: 'track',
      label: 'Track Status',
      description: 'Audit progression & Action Taken Reports',
      icon: <Search className="w-5 h-5 text-[#0A0A0B]" />,
    },
    {
      id: 'directory',
      label: 'Authority Directory',
      description: 'Central & State Nodal Officers & SLAs',
      icon: <Building2 className="w-5 h-5 text-[#71717A]" />,
    },
  ];

  const handleNavClick = (id: string) => {
    onNavigate?.(id);
    setMobileMenuOpen(false);

    if (id === 'home') {
      const el = document.getElementById('lodge');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (id === 'track') {
      const el = document.getElementById('track-section');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (id === 'directory') {
      const el = document.getElementById('directory');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E4E4E7] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* ========================================================================= */}
          {/* LEFT: BRAND WORDMARK & LOGO (SCALED UP)                                   */}
          {/* ========================================================================= */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => handleNavClick('home')}
          >
            <div className="w-9 h-9 rounded-lg bg-[#0A0A0B] text-white flex items-center justify-center font-black text-sm shadow-xs">
              <span className="text-[#2563EB]">C</span>P
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-lg sm:text-xl tracking-tight text-[#0A0A0B]">
                CPGRAMS <span className="text-[#2563EB]">2.0</span>
              </span>
              <span className="hidden sm:inline-block text-xs font-semibold uppercase tracking-wider text-[#52525B] bg-[#F4F4F5] px-2 py-0.5 rounded-md border border-[#E4E4E7]">
                India
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CENTER: NAVIGATION LINKS (SCALED UP FONT & PADDING)                       */}
          {/* ========================================================================= */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map((item) => {
              const active = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-4 py-2 rounded-lg text-sm sm:text-[15px] font-medium transition-colors cursor-pointer ${
                    active
                      ? 'text-[#0A0A0B] font-semibold bg-[#F4F4F5]'
                      : 'text-[#71717A] hover:text-[#0A0A0B] hover:bg-[#FAFAFA]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* ========================================================================= */}
          {/* RIGHT: ACTIONS & USER PROFILE (SCALED UP)                                 */}
          {/* ========================================================================= */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-[#71717A] hover:text-[#0A0A0B] hover:bg-[#F4F4F5] inline-flex items-center gap-1.5 transition-colors cursor-pointer border border-transparent hover:border-[#E4E4E7]"
                aria-label="Select Language"
              >
                <Globe className="w-4 h-4" />
                <span>{selectedLang}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {langOpen && (
                <div
                  className="absolute right-0 mt-2 w-40 rounded-xl bg-white border border-[#E4E4E7] shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95"
                  onMouseLeave={() => setLangOpen(false)}
                >
                  {['English', 'हिन्दी', 'ଓଡ଼ିଆ', 'বাংলা', 'मराठी', 'தமிழ்'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setSelectedLang(lang);
                        setLangOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm font-medium transition-colors ${
                        selectedLang === lang ? 'text-[#2563EB] font-bold bg-blue-50' : 'text-[#0A0A0B] hover:bg-[#F4F4F5]'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Auth or Sign In */}
            {user ? (
              <div className="flex items-center gap-2.5 bg-[#F4F4F5] pl-3 pr-2 py-1.5 rounded-lg border border-[#E4E4E7]">
                <span className="text-sm font-medium text-[#0A0A0B] hidden lg:inline">
                  {user.name}
                </span>
                <div className="w-7 h-7 rounded-md bg-[#0A0A0B] text-white flex items-center justify-center text-xs font-bold">
                  {user.name?.charAt(0) || 'U'}
                </div>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[#0A0A0B] hover:bg-[#F4F4F5] transition-colors cursor-pointer border border-[#E4E4E7]"
              >
                <User className="w-4 h-4 text-[#71717A]" />
                <span>Sign In</span>
              </button>
            )}

            {/* Primary Action Button */}
            <Button
              variant="accent"
              size="md"
              onClick={onLodgeClick}
              className="font-semibold text-sm px-5 py-2.5"
            >
              + Lodge Grievance
            </Button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-lg text-[#0A0A0B] hover:bg-[#F4F4F5] transition-colors cursor-pointer focus:outline-none"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* IMPROVED MOBILE DRAWER & FULL-SCREEN OVERLAY                              */}
      {/* ========================================================================= */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-20 bg-white border-b border-[#E4E4E7] shadow-2xl z-50 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="max-h-[calc(100vh-5rem)] overflow-y-auto px-6 py-7 space-y-7">
            
            {/* Core Navigation Items with Icons & Subtitles */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold uppercase tracking-wider text-[#71717A] px-3 pb-2">
                Navigation
              </div>
              {navLinks.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl text-left hover:bg-[#F4F4F5] transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-lg bg-[#F4F4F5] group-hover:bg-white transition-colors">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-base font-bold text-[#0A0A0B]">{item.label}</div>
                      <div className="text-xs text-[#71717A] mt-0.5">{item.description}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#A1A1AA] group-hover:text-[#0A0A0B] transition-colors" />
                </button>
              ))}
            </div>

            {/* Quick Actions (Lodge Grievance & Sign In) */}
            <div className="pt-3 border-t border-[#E4E4E7] space-y-3">
              <Button
                variant="accent"
                size="lg"
                className="w-full justify-center text-sm font-bold py-3.5"
                onClick={() => {
                  onLodgeClick?.();
                  setMobileMenuOpen(false);
                }}
              >
                + Lodge Public Grievance
              </Button>

              {!user ? (
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full justify-center text-sm font-semibold py-3"
                  onClick={() => {
                    onLoginClick?.();
                    setMobileMenuOpen(false);
                  }}
                  leftIcon={<User className="w-4 h-4" />}
                >
                  Citizen Sign In / Verify OTP
                </Button>
              ) : (
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F4F4F5] text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#0A0A0B] text-white flex items-center justify-center font-bold text-sm">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <strong className="text-[#0A0A0B] block font-bold">{user.name}</strong>
                      <span className="text-xs text-[#71717A]">{user.role || 'Citizen'}</span>
                    </div>
                  </div>
                  <Badge variant="success">Logged In</Badge>
                </div>
              )}
            </div>

            {/* Multi-Language Selector Pills */}
            <div className="pt-3 border-t border-[#E4E4E7] space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-[#71717A]">
                Select Language
              </div>
              <div className="flex flex-wrap gap-2">
                {['English', 'हिन्दी', 'ଓଡ଼ିଆ', 'বাংলা', 'मराठी', 'தமிழ்'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLang(lang)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      selectedLang === lang
                        ? 'bg-[#0A0A0B] text-white'
                        : 'bg-[#F4F4F5] text-[#52525B] hover:bg-[#E4E4E7]'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Official Toll-Free Helpline Footer */}
            <div className="pt-3 border-t border-[#E4E4E7]">
              <a
                href="tel:1800114000"
                className="flex items-center justify-between p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] text-xs hover:bg-[#F4F4F5] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-50 text-[#2563EB]">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#0A0A0B]">National Grievance Toll-Free</div>
                    <div className="text-xs text-[#71717A]">24x7 Statutory Citizen Support</div>
                  </div>
                </div>
                <strong className="font-mono text-base font-bold text-[#0A0A0B]">1800-11-4000</strong>
              </a>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#A1A1AA]">
                <ShieldCheck className="w-4 h-4 text-[#059669]" />
                <span>DARPG 2024 Statutory Redressal Infrastructure</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </header>
  );
};
