import React from 'react';
import {
  Globe,
  Smartphone,
  Search,
  Scale,
  Building2,
  ShieldCheck,
} from 'lucide-react';

export const AboutSection: React.FC = () => {
  const highlights = [
    {
      icon: <Globe className="w-5 h-5 text-[#2563EB]" />,
      title: 'Single National Portal',
      desc: 'Directly interconnects all Central Ministries, State Secretariats, and Public Sector Undertakings with secure role-based access.',
    },
    {
      icon: <Smartphone className="w-5 h-5 text-[#6F0047]" />,
      title: 'Mobile & UMANG Enabled',
      desc: '24x7 citizen access through dedicated mobile apps on Google Play Store and full integration with the UMANG digital platform.',
    },
    {
      icon: <Search className="w-5 h-5 text-[#2563EB]" />,
      title: 'Unique Registration Tracking',
      desc: 'Transparent real-time status audit using the unique registration ID provided upon grievance lodging.',
    },
    {
      icon: <Scale className="w-5 h-5 text-[#6F0047]" />,
      title: 'Appellate & Feedback Redressal',
      desc: 'Dissatisfied citizens giving a ‘Poor’ resolution rating can immediately trigger a statutory First Appeal to higher authorities.',
    },
  ];

  return (
    <section id="about" className="py-16 sm:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* ================= LEFT COLUMN: MAIN ABOUT EDITORIAL ================= */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Eyebrow / Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[#6F0047]/10 border border-[#6F0047]/20 text-xs font-bold text-[#6F0047] tracking-wider uppercase">
              <Building2 className="w-4 h-4" />
              <span>About CPGRAMS</span>
            </div>

            {/* Section Heading */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0A2540] tracking-tight leading-tight">
              Centralised Public Grievance Redress and Monitoring System
            </h2>

            {/* Official Narrative Paragraphs with Increased Font Size */}
            <div className="space-y-5 text-slate-700 text-base sm:text-lg leading-relaxed font-normal">
              <p>
                <strong>CPGRAMS</strong> is an online platform available to citizens <strong>24x7</strong> to
                lodge their grievances to public authorities on any subject related to service delivery.
                It is a single portal connected to all the Ministries and Departments of the Government of
                India and States. Every Ministry and State has role-based access to this system. CPGRAMS is
                also accessible to citizens through a standalone mobile application downloadable via the
                Google Play Store and integrated within UMANG.
              </p>

              <p>
                The status of a grievance filed in CPGRAMS can be tracked at any time with the unique
                registration ID provided at the time of registration. CPGRAMS also provides an appeal
                facility to citizens if they are not satisfied with the resolution provided by the Grievance
                Officer. After closure of a grievance, if the complainant is not satisfied with the
                resolution, he or she can provide feedback. If the rating is <em>‘Poor’</em>, the option to file
                an appeal is enabled, and the status of the Appeal can be tracked directly with the same
                registration number.
              </p>
            </div>

            {/* Statutory Compliance Bar */}
            <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2 text-slate-800 font-semibold">
                <ShieldCheck className="w-5 h-5 text-[#6F0047]" />
                <span>Department of Administrative Reforms and Public Grievances (DARPG)</span>
              </div>
              <span className="text-[#2563EB] font-bold">21-Day Redressal Target</span>
            </div>

          </div>

          {/* ================= RIGHT COLUMN: 4 STRUCTURED HIGHLIGHT CARDS ================= */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {highlights.map((item, idx) => (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors space-y-2 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
                    {item.icon}
                  </div>
                  <h3 className="text-base font-bold text-[#0A2540]">{item.title}</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed pl-1">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
