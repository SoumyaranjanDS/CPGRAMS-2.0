import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Globe,
  ChevronDown,
  User as UserIcon,
  Search,
  MapPin,
  LayoutGrid,
  Scale,
  Plus,
  LogOut,
  Sparkles,
  LayoutDashboard,
  X,
} from 'lucide-react';
import { Badge } from '../common/Badge.js';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';

export interface NavbarProps {
  currentView?: string;
  onNavigate?: (view: string) => void;
  onLodgeClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  onLodgeClick,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { currentLanguage, setLanguage, languages, t, isTranslating } = useLanguage();

  const [langModalOpen, setLangModalOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const langDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setLangModalOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Smooth scroll helper for Area Directory & Track sections
  const scrollToSection = (id: string) => {
    onNavigate?.(id);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filter languages in searchable dropdown
  const filteredLanguages = languages.filter(
    (l) =>
      l.name.toLowerCase().includes(langSearch.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(langSearch.toLowerCase()) ||
      l.region.toLowerCase().includes(langSearch.toLowerCase())
  );

  return (
    <>
      {/* ================= TOP HEADER (DESKTOP & MOBILE) ================= */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 font-sans shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-15 sm:h-18">
            
            {/* BRAND LOGO: Only Logo on Mobile, Logo + Text on Desktop */}
            <div
              className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
              onClick={() => {
                navigate('/');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <div className="w-8 h-8 rounded-xl bg-[#0A2540] text-white flex items-center justify-center font-black text-xs shadow-xs">
                <span className="text-[#2563EB]">C</span>P
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#0A2540]">
                  CPGRAMS <span className="text-[#6F0047]">2.0</span>
                </span>
                <span className="hidden lg:inline-block text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {t('National Portal')}
                </span>
              </div>
            </div>

            {/* RIGHT: AREA DIRECTORY + LANGUAGE SWITCHER + USER PROFILE */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              
              {/* Desktop Area Directory Button (Scrolls to Jurisdiction & Nodal Area Directory Lookup) */}
              <button
                type="button"
                onClick={() => scrollToSection('area-directory')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:text-[#2563EB] hover:bg-blue-50/80 transition-colors cursor-pointer border border-slate-200/90 shadow-2xs whitespace-nowrap"
              >
                <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>{t('Area Directory')}</span>
              </button>

              {/* 22 Regional Languages Switcher */}
              <div className="relative" ref={langDropdownRef}>
                <button
                  onClick={() => {
                    setLangModalOpen(!langModalOpen);
                    setLangSearch('');
                  }}
                  className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#0A2540] hover:bg-slate-100 inline-flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200/90 shadow-2xs"
                  aria-label="Select Language"
                >
                  <Globe className={`w-3.5 h-3.5 text-[#2563EB] ${isTranslating ? 'animate-spin' : ''}`} />
                  <span className="font-bold">{currentLanguage.nativeName}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>

                {/* Searchable Language Popover — mobile: fixed panel below navbar, desktop: anchored dropdown */}
                {langModalOpen && (
                  <>
                    {/* Mobile backdrop */}
                    <div
                      className="sm:hidden fixed inset-0 z-40 bg-black/30"
                      onClick={() => setLangModalOpen(false)}
                    />
                    <div className="
                      fixed inset-x-3 top-14 z-50 rounded-2xl bg-white border border-slate-200 shadow-2xl p-2 text-left ring-1 ring-black/5 animate-in slide-in-from-top-2 duration-200
                      sm:absolute sm:inset-auto sm:top-full sm:right-0 sm:bottom-auto sm:mt-2 sm:w-80
                    ">
                      <div className="p-2 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                          <span>22 Indian Languages</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setLangModalOpen(false)}
                          className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="p-1.5">
                        <div className="relative flex items-center">
                          <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search language / भाषा..."
                            value={langSearch}
                            onChange={(e) => setLangSearch(e.target.value)}
                            className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#2563EB] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="max-h-52 sm:max-h-60 overflow-y-auto divide-y divide-slate-50 py-1">
                        {filteredLanguages.map((lang) => {
                          const isSelected = currentLanguage.code === lang.code;
                          return (
                            <button
                              key={lang.code}
                              onClick={() => {
                                setLanguage(lang.code);
                                setLangModalOpen(false);
                              }}
                              className={`w-full px-3 py-2.5 text-left text-xs transition-colors flex items-center justify-between group cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-50/80 text-[#2563EB] font-bold'
                                  : 'text-slate-700 hover:bg-slate-50 hover:text-[#2563EB]'
                              }`}
                            >
                              <div>
                                <strong className="text-sm block font-sans">{lang.nativeName}</strong>
                                <span className="text-[11px] text-slate-500 font-normal">
                                  {lang.name} • <span className="text-slate-400">{lang.region}</span>
                                </span>
                              </div>
                              {isSelected && (
                                <span className="w-2 h-2 rounded-full bg-[#2563EB] shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* User Profile or Sign In */}
              {user ? (
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 sm:gap-2 bg-slate-50 hover:bg-slate-100 p-1.5 sm:px-2.5 sm:py-1 rounded-xl border border-slate-200 transition-colors cursor-pointer shrink-0"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#0A2540] text-white flex items-center justify-center text-xs font-black shadow-2xs">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <div className="text-left hidden lg:block">
                      <span className="text-xs font-bold text-slate-900 block leading-tight truncate max-w-[110px]">
                        {user.name}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 text-left space-y-2 ring-1 ring-black/5"
                    >
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                        <strong className="text-xs font-bold text-slate-900 block truncate">{user.name}</strong>
                        <p className="text-[11px] text-slate-500 font-mono truncate">{user.email || user.phone}</p>
                        <Badge variant="blue" size="sm">
                          {user.role ? user.role.replace('_', ' ') : 'Citizen'}
                        </Badge>
                      </div>

                      <div className="border-t border-slate-100 pt-1 space-y-1">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            navigate('/dashboard');
                          }}
                          className="w-full px-2.5 py-2 text-left text-xs font-bold rounded-lg text-slate-800 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-[#2563EB]" />
                          <span>{t('Citizen Dashboard')}</span>
                        </button>

                        <button
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                            navigate('/');
                          }}
                          className="w-full px-2.5 py-2 text-left text-xs font-bold rounded-lg text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>{t('Sign Out')}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold text-[#0A2540] hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200 shadow-2xs"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>{t('Sign In')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ================= MOBILE BOTTOM FLOATING NAVIGATION BAR ================= */}
      {/* 5-Option App Dock: Applications, Appeals, Highlighted Create Report (+), Track, Profile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 px-2 py-1 shadow-2xl flex items-center justify-around font-sans">
        
        {/* Tab 1: All Applications */}
        <button
          type="button"
          onClick={() => {
            if (user) {
              navigate('/dashboard?tab=grievances');
            } else {
              navigate('/login?redirect=' + encodeURIComponent('/dashboard?tab=grievances'));
            }
          }}
          className="flex flex-col items-center justify-center p-1 rounded-xl text-slate-600 hover:text-[#2563EB] transition-all cursor-pointer min-w-[56px]"
        >
          <LayoutGrid className="w-5 h-5 text-[#2563EB]" />
          <span className="text-[10px] mt-0.5 font-semibold leading-tight">{t('Applications')}</span>
        </button>

        {/* Tab 2: Appeals */}
        <button
          type="button"
          onClick={() => {
            if (user) {
              navigate('/dashboard?tab=appeals');
            } else {
              navigate('/login?redirect=' + encodeURIComponent('/dashboard?tab=appeals'));
            }
          }}
          className="flex flex-col items-center justify-center p-1 rounded-xl text-slate-600 hover:text-[#6F0047] transition-all cursor-pointer min-w-[56px]"
        >
          <Scale className="w-5 h-5 text-[#6F0047]" />
          <span className="text-[10px] mt-0.5 font-semibold leading-tight">{t('Appeals')}</span>
        </button>

        {/* Tab 3: Highlighted Prominent Create Report Action Button */}
        <button
          type="button"
          onClick={() => {
            if (location.pathname === '/' && onLodgeClick) {
              onLodgeClick();
            } else {
              navigate('/dashboard?tab=lodge');
            }
          }}
          className="flex flex-col items-center justify-center -mt-5 transition-all cursor-pointer group min-w-[60px]"
          aria-label="Create Report"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#0A2540] via-[#1D4ED8] to-[#2563EB] text-white flex items-center justify-center shadow-lg shadow-blue-500/40 ring-4 ring-white group-hover:scale-105 group-active:scale-95 transition-all">
            <Plus className="w-6 h-6 text-white stroke-[2.5]" />
          </div>
          <span className="text-[10px] mt-0.5 font-bold text-[#2563EB] leading-tight">{t('Report')}</span>
        </button>

        {/* Tab 4: Track Status */}
        <button
          type="button"
          onClick={() => {
            onNavigate?.('track');
          }}
          className="flex flex-col items-center justify-center p-1 rounded-xl text-slate-600 hover:text-[#2563EB] transition-all cursor-pointer min-w-[56px]"
        >
          <Search className="w-5 h-5 text-slate-700" />
          <span className="text-[10px] mt-0.5 font-semibold leading-tight">{t('Track')}</span>
        </button>

        {/* Tab 5: Profile / Account */}
        <button
          type="button"
          onClick={() => {
            if (user) {
              navigate('/dashboard');
            } else {
              navigate('/login');
            }
          }}
          className="flex flex-col items-center justify-center p-1 rounded-xl text-slate-600 hover:text-[#2563EB] transition-all cursor-pointer min-w-[56px]"
        >
          <UserIcon className="w-5 h-5 text-slate-700" />
          <span className="text-[10px] mt-0.5 font-semibold leading-tight">
            {user ? t('Account') : t('Sign In')}
          </span>
        </button>
      </nav>
    </>
  );
};
