import React from 'react';
import { ArrowUpRight, ShieldCheck, PhoneCall, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer className="mt-8 sm:mt-10 border-t border-slate-200 bg-slate-50 text-slate-600 font-sans w-full max-w-full">
      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 lg:gap-12 pb-12 border-b border-slate-200 text-left">
          
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0A2540] text-white flex items-center justify-center font-black text-xs shadow-xs">
                <span className="text-[#2563EB]">C</span>P
              </div>
              <span className="font-extrabold text-lg sm:text-xl text-[#0A2540] tracking-tight">
                CPGRAMS <span className="text-[#6F0047]">2.0</span>
              </span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed max-w-sm font-normal">
              Centralised Public Grievance Redress and Monitoring System. Reimagined to deliver
              citizen-intent driven public service accountability across Indian Central & State
              departments.
            </p>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium pt-1">
              <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
              <span>DARPG Statutory Redressal Infrastructure</span>
            </div>
          </div>

          {/* Col 1: Citizen Services */}
          <div className="space-y-4">
            <h4 className="font-bold text-[#0A2540] text-sm sm:text-base tracking-tight">
              Citizen Portals
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li>
                <a href="#lodge" className="hover:text-[#2563EB] transition-colors">
                  Lodge Complaint
                </a>
              </li>
              <li>
                <a href="#track" className="hover:text-[#2563EB] transition-colors">
                  Track Status
                </a>
              </li>
              <li>
                <a href="#appeal" className="hover:text-[#2563EB] transition-colors">
                  Statutory First Appeal
                </a>
              </li>
              <li>
                <a href="#directory" className="hover:text-[#2563EB] transition-colors">
                  PIN Code Authority Lookup
                </a>
              </li>
            </ul>
          </div>

          {/* Col 2: Statutory Governance */}
          <div className="space-y-4">
            <h4 className="font-bold text-[#0A2540] text-sm sm:text-base tracking-tight">
              Governance Norms
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li>Standard 21-Day Redressal SLA</li>
              <li>Mandatory Officer ATR Upload</li>
              <li>3-Factor Anti-Fraud Verification</li>
              <li>Statutory 30-Day Appellate Window</li>
            </ul>
          </div>

          {/* Col 3: Helplines */}
          <div className="space-y-4">
            <h4 className="font-bold text-[#0A2540] text-sm sm:text-base tracking-tight">
              Public Helplines
            </h4>
            <div className="space-y-2 text-sm text-slate-600">
              <p className="flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Toll-Free:</span>
                <strong className="text-[#0A2540] font-mono font-bold">1800-11-4000</strong>
              </p>
              <p>Senior Citizen Support: <strong className="text-[#0A2540] font-mono font-bold">14567</strong></p>
              <p>Emergency Response: <strong className="text-[#0A2540] font-mono font-bold">112</strong></p>
              <div className="pt-2">
                <a
                  href="https://india.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-bold text-[#2563EB] hover:underline"
                >
                  <span>National Portal of India</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Legal bar & Back to Top button */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-slate-500 text-xs sm:text-sm gap-4">
          <p>&copy; {new Date().getFullYear()} Government of India. Designed with citizen-intent principles.</p>
          
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-medium">
              <span className="hover:text-[#0A2540] cursor-pointer">Citizen Charter</span>
              <span>&bull;</span>
              <span className="hover:text-[#0A2540] cursor-pointer">Privacy Policy</span>
              <span>&bull;</span>
              <span className="hover:text-[#0A2540] cursor-pointer">Terms of Service</span>
              <span>&bull;</span>
              <span className="hover:text-[#0A2540] cursor-pointer">Accessibility</span>
            </div>

            {/* Back to Top Button */}
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-[#2563EB] hover:text-[#2563EB] text-[#0A2540] font-bold text-xs sm:text-sm shadow-2xs transition-all duration-200 cursor-pointer shrink-0 group"
              title="Scroll back to top of page"
              aria-label="Back to top"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-4 h-4 text-[#2563EB] group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
