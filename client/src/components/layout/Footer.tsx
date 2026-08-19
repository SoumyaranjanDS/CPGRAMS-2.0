import React from 'react';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-24 border-t border-[#E4E4E7] bg-white text-[#52525B] text-xs font-sans">
      {/* Top Footer Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 pb-10 border-b border-[#E4E4E7]">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-[#0A0A0B] text-white flex items-center justify-center font-bold text-[10px]">
                <span className="text-[#2563EB]">C</span>P
              </div>
              <span className="font-bold text-sm text-[#0A0A0B] tracking-tight">
                CPGRAMS 2.0
              </span>
            </div>
            <p className="text-xs text-[#71717A] leading-relaxed max-w-sm">
              Centralised Public Grievance Redress and Monitoring System. Reimagined to deliver
              citizen-intent driven public service accountability across Indian Central & State
              departments.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#A1A1AA]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
              <span>DARPG Statutory Redressal Infrastructure</span>
            </div>
          </div>

          {/* Col 1: Citizen Services */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-[#0A0A0B] text-xs tracking-tight">Citizen Portals</h4>
            <ul className="space-y-1.5 text-xs text-[#71717A]">
              <li><a href="#lodge" className="hover:text-[#0A0A0B] transition-colors">Lodge Public Grievance</a></li>
              <li><a href="#track" className="hover:text-[#0A0A0B] transition-colors">Track Existing Reference</a></li>
              <li><a href="#appeal" className="hover:text-[#0A0A0B] transition-colors">Statutory First Appeal</a></li>
              <li><a href="#pin" className="hover:text-[#0A0A0B] transition-colors">PIN Code Authority Resolver</a></li>
            </ul>
          </div>

          {/* Col 2: Statutory Compliance */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-[#0A0A0B] text-xs tracking-tight">Governance Norms</h4>
            <ul className="space-y-1.5 text-xs text-[#71717A]">
              <li>Standard 21-Day Redressal SLA</li>
              <li>Mandatory Officer ATR Upload</li>
              <li>3-Factor Anti-Fraud Verification</li>
              <li>Statutory 30-Day Appellate Window</li>
            </ul>
          </div>

          {/* Col 3: Helplines */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-[#0A0A0B] text-xs tracking-tight">Public Helplines</h4>
            <div className="space-y-1 text-xs text-[#71717A]">
              <p>National Toll-Free: <strong className="text-[#0A0A0B] font-mono">1800-11-4000</strong></p>
              <p>Senior Support: <strong className="text-[#0A0A0B] font-mono">14567</strong></p>
              <p>Emergency Response: <strong className="text-[#0A0A0B] font-mono">112</strong></p>
              <div className="pt-1">
                <a
                  href="https://india.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[#2563EB] hover:underline"
                >
                  <span>National Portal of India</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[#71717A] text-[11px] gap-3">
          <p>&copy; {new Date().getFullYear()} Government of India. Designed with citizen-intent principles.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-[#0A0A0B] cursor-pointer">Citizen Charter</span>
            <span>&bull;</span>
            <span className="hover:text-[#0A0A0B] cursor-pointer">Privacy Policy</span>
            <span>&bull;</span>
            <span className="hover:text-[#0A0A0B] cursor-pointer">Terms of Service</span>
            <span>&bull;</span>
            <span className="hover:text-[#0A0A0B] cursor-pointer">Accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
