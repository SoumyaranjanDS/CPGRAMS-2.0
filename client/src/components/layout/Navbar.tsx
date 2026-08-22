import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Menu,
  X,
  Globe,
  ChevronDown,
  User as UserIcon,
  ArrowRight,
  PhoneCall,
  FileText,
  Search,
  Building2,
  ShieldCheck,
  LogOut,
  Scale,
} from "lucide-react";
import { Button } from "../common/Button.js";
import { Badge } from "../common/Badge.js";
import { useAuth } from "../../context/AuthContext.js";

export interface NavbarProps {
  currentView?: string;
  onNavigate?: (view: string) => void;
  onLodgeClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView = "home",
  onNavigate,
  onLodgeClick,
}) => {
  const { user, logout, openAuthModal, switchRolePreset } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("English");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Gracefully close drawer with smooth animation
  const handleCloseMobileMenu = () => {
    setIsClosing(true);
    setTimeout(() => {
      setMobileMenuOpen(false);
      setIsClosing(false);
    }, 340);
  };

  const handleOpenMobileMenu = () => {
    setIsClosing(false);
    setMobileMenuOpen(true);
  };

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    {
      id: "home",
      label: "File Complaint",
      description: "Report an issue with live guidance",
      icon: <FileText className="w-4 h-4 text-[#2563EB]" />,
    },
    {
      id: "track",
      label: "Track Status",
      description: "View status & official reports",
      icon: <Search className="w-4 h-4 text-[#0A2540]" />,
    },
    {
      id: "directory",
      label: "Directory",
      description: "Nodal Officers & SLAs",
      icon: <Building2 className="w-4 h-4 text-slate-500" />,
    },
  ];

  const handleNavClick = (id: string) => {
    onNavigate?.(id);
    handleCloseMobileMenu();

    if (id === "home") {
      const el = document.getElementById("lodge");
      el?.scrollIntoView({ behavior: "smooth" });
    } else if (id === "track") {
      const el = document.getElementById("track-section");
      el?.scrollIntoView({ behavior: "smooth" });
    } else if (id === "directory") {
      const el = document.getElementById("directory");
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* ========================================================================= */}
            {/* LEFT: BRAND WORDMARK & LOGO                                               */}
            {/* ========================================================================= */}
            <div
              className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
              onClick={() => handleNavClick("home")}
            >
              <div className="w-8 h-8 rounded-lg bg-[#0A2540] text-white flex items-center justify-center font-black text-xs shadow-xs">
                <span className="text-[#2563EB]">C</span>P
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#0A2540]">
                  CPGRAMS <span className="text-[#6F0047]">2.0</span>
                </span>
                <span className="hidden lg:inline-block text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  National Portal
                </span>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* CENTER: NAVIGATION LINKS                                                  */}
            {/* ========================================================================= */}
            <nav className="hidden md:flex items-center gap-1 shrink-0">
              {navLinks.map((item) => {
                const active = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`px-3 py-1.5 rounded-md text-xs lg:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      active
                        ? "text-[#2563EB] bg-blue-50"
                        : "text-slate-600 hover:text-[#0A2540] hover:bg-slate-50"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* ========================================================================= */}
            {/* RIGHT: ACTIONS & USER PROFILE                                             */}
            {/* ========================================================================= */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Language Switcher */}
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="px-2.5 py-1.5 rounded-md text-xs lg:text-sm font-semibold text-slate-600 hover:text-[#0A2540] hover:bg-slate-100 inline-flex items-center gap-1.5 transition-colors cursor-pointer border border-transparent hover:border-slate-200 whitespace-nowrap"
                  aria-label="Select Language"
                >
                  <Globe className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>{selectedLang}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>

                {langOpen && (
                  <div
                    className="absolute right-0 mt-2 w-36 rounded-xl bg-white border border-slate-200 shadow-xl py-1 z-50 animate-in fade-in zoom-in-95"
                    onMouseLeave={() => setLangOpen(false)}
                  >
                    {[
                      "English",
                      "हिन्दी",
                      "ଓଡ଼ିଆ",
                      "বাংলা",
                      "मराठी",
                      "தமிழ்",
                    ].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setSelectedLang(lang);
                          setLangOpen(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left text-xs font-semibold transition-colors ${
                          selectedLang === lang
                            ? "text-[#2563EB] font-bold bg-blue-50"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* User Authentication or Profile Dropdown */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 pl-2.5 pr-2 py-1 rounded-xl border border-slate-200 transition-colors cursor-pointer shrink-0"
                  >
                    <div className="w-6 h-6 rounded-lg bg-[#0A2540] text-white flex items-center justify-center text-xs font-black shadow-2xs">
                      {user.name?.charAt(0) || "U"}
                    </div>
                    <div className="text-left hidden lg:block">
                      <span className="text-xs font-bold text-slate-900 block leading-tight truncate max-w-[120px]">
                        {user.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
                        {user.role === "GRO_OFFICER"
                          ? "Nodal GRO"
                          : user.role === "APPELLATE_OFFICER"
                            ? "Appellate IAS"
                            : "Citizen"}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 text-left space-y-1"
                      onMouseLeave={() => setUserDropdownOpen(false)}
                    >
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                        <strong className="text-xs font-bold text-slate-900 block">
                          {user.name}
                        </strong>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {user.phone}
                        </p>
                        <Badge
                          variant={
                            user.role === 'GRO_OFFICER'
                              ? 'saffron'
                              : user.role === 'APPELLATE_OFFICER'
                              ? 'blue'
                              : 'success'
                          }
                          size="sm"
                        >
                          {user.role.replace('_', ' ')}
                        </Badge>
                      </div>

                      {/* Demo Quick Role Switcher */}
                      <div className="p-1 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                          Switch Demo Role:
                        </span>
                        <button
                          onClick={() => {
                            switchRolePreset("CITIZEN");
                            setUserDropdownOpen(false);
                          }}
                          className="w-full px-2.5 py-1.5 text-left text-xs font-semibold rounded-lg hover:bg-slate-50 text-slate-700 flex items-center justify-between cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <UserIcon className="w-3.5 h-3.5 text-[#2563EB]" />{" "}
                            Citizen View
                          </span>
                          {user.role === "CITIZEN" && (
                            <span className="text-xs text-emerald-600 font-bold">
                              ●
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            switchRolePreset("GRO_OFFICER");
                            setUserDropdownOpen(false);
                          }}
                          className="w-full px-2.5 py-1.5 text-left text-xs font-semibold rounded-lg hover:bg-slate-50 text-slate-700 flex items-center justify-between cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-[#6F0047]" />{" "}
                            GRO Officer View
                          </span>
                          {user.role === "GRO_OFFICER" && (
                            <span className="text-xs text-emerald-600 font-bold">
                              ●
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            switchRolePreset("APPELLATE_OFFICER");
                            setUserDropdownOpen(false);
                          }}
                          className="w-full px-2.5 py-1.5 text-left text-xs font-semibold rounded-lg hover:bg-slate-50 text-slate-700 flex items-center justify-between cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <Scale className="w-3.5 h-3.5 text-indigo-600" />{" "}
                            Appellate Authority
                          </span>
                          {user.role === "APPELLATE_OFFICER" && (
                            <span className="text-xs text-emerald-600 font-bold">
                              ●
                            </span>
                          )}
                        </button>
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full px-2.5 py-2 text-left text-xs font-bold rounded-lg text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={openAuthModal}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs lg:text-sm font-bold text-[#0A2540] hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200 shadow-2xs whitespace-nowrap"
                >
                  <UserIcon className="w-4 h-4 text-[#2563EB]" />
                  <span>Sign In</span>
                </button>
              )}

              {/* Primary Action Button */}
              <Button
                variant="primary"
                size="sm"
                onClick={onLodgeClick}
                className="font-bold text-xs sm:text-sm px-3.5 sm:px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-xs whitespace-nowrap"
              >
                + File Complaint
              </Button>

              {/* Mobile Hamburger Button */}
              <button
                onClick={handleOpenMobileMenu}
                className="md:hidden p-2 rounded-lg text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none"
                aria-label="Open mobile navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* PORTAL-MOUNTED MOBILE DRAWER WITH SMOOTH SLIDE IN & SLIDE OUT             */}
      {/* ========================================================================= */}
      {mounted &&
        mobileMenuOpen &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex isolate">
            {/* Backdrop Blur Overlay with Smooth Fade In/Out */}
            <div
              className={`fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity ${
                isClosing
                  ? "animate-backdrop-fade-out"
                  : "animate-backdrop-fade-in"
              }`}
              onClick={handleCloseMobileMenu}
              aria-hidden="true"
            />

            {/* Left-Side Drawer with Smooth Slow Slide In/Out */}
            <div
              className={`relative w-[300px] max-w-[85vw] bg-white h-screen shadow-2xl z-[100000] flex flex-col justify-between overflow-y-auto border-r border-slate-200 ${
                isClosing
                  ? "animate-drawer-slide-out"
                  : "animate-drawer-slide-in"
              }`}
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-[#0A2540] text-white flex items-center justify-center font-black text-xs">
                    <span className="text-[#2563EB]">C</span>P
                  </div>
                  <span className="font-extrabold text-base tracking-tight text-[#0A2540]">
                    CPGRAMS <span className="text-[#6F0047]">2.0</span>
                  </span>
                </div>
                <button
                  onClick={handleCloseMobileMenu}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Navigation Links */}
              <div className="p-4 space-y-4 flex-1 text-left">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 pb-1">
                    Navigation Menu
                  </div>
                  {navLinks.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className="w-full flex items-center justify-between p-3 rounded-xl text-left hover:bg-slate-50 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-blue-50 transition-colors">
                          {item.icon}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">
                            {item.label}
                          </div>
                          <div className="text-xs text-slate-500">
                            {item.description}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#2563EB] transition-colors" />
                    </button>
                  ))}
                </div>

                {/* Language Selection */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                    Select Language
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      "English",
                      "हिन्दी",
                      "ଓଡ଼ିଆ",
                      "বাংলা",
                      "मराठी",
                      "தமிழ்",
                    ].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setSelectedLang(lang);
                          handleCloseMobileMenu();
                        }}
                        className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-center ${
                          selectedLang === lang
                            ? "bg-[#2563EB] text-white font-bold"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drawer Bottom Actions */}
              <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/70 text-left">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full justify-center text-xs font-bold py-3 bg-[#2563EB] hover:bg-[#1D4ED8]"
                  onClick={() => {
                    onLodgeClick?.();
                    handleCloseMobileMenu();
                  }}
                >
                  + File a Public Complaint
                </Button>

                {!user ? (
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full justify-center text-xs font-semibold py-2.5 bg-white"
                    onClick={() => {
                      handleCloseMobileMenu();
                      openAuthModal();
                    }}
                    leftIcon={<UserIcon className="w-4 h-4" />}
                  >
                    Citizen Sign In
                  </Button>
                ) : (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-[#0A2540] text-white flex items-center justify-center font-bold text-xs">
                        {user.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <strong className="text-slate-900 font-bold block leading-tight">
                          {user.name}
                        </strong>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          {user.role}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => logout()}
                      className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                      title="Sign Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Toll-Free Banner */}
                <a
                  href="tel:1800114000"
                  className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <PhoneCall className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span className="font-semibold text-slate-700">
                      Toll-Free 24x7
                    </span>
                  </div>
                  <strong className="font-mono text-xs font-bold text-slate-900">
                    1800-11-4000
                  </strong>
                </a>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#6F0047]" />
                  <span>DARPG Digital Infrastructure</span>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};
