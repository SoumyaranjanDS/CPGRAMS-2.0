import React from 'react';
import {
  FileText,
  GitBranch,
  ShieldAlert,
  FileCheck,
  Scale,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const ProcessFlowSection: React.FC = () => {
  const steps = [
    {
      icon: <FileText className="w-6 h-6 text-[#2563EB]" />,
      title: 'Lodge Complaint',
      desc: 'Submit your issue online or by voice with supporting documents. Receive an instant unique registration ID with automated SMS/Email acknowledgement.',
    },
    {
      icon: <GitBranch className="w-6 h-6 text-[#6F0047]" />,
      title: 'Authority Assignment',
      desc: 'System automatically examines jurisdiction and routes the grievance directly to the designated Nodal Grievance Redressal Officer (GRO).',
    },
    {
      icon: <ShieldAlert className="w-6 h-6 text-[#2563EB]" />,
      title: 'Investigation & Action',
      desc: 'Concerned department conducts inquiries, initiates field action, and works toward time-bound disposal adhering to the statutory 21-day timeline.',
    },
    {
      icon: <FileCheck className="w-6 h-6 text-[#6F0047]" />,
      title: 'Action Taken Report (ATR)',
      desc: 'Nodal Officer files an official Action Taken Report accompanied by administrative sanction orders or verification memos prior to case closure.',
    },
    {
      icon: <Scale className="w-6 h-6 text-[#2563EB]" />,
      title: 'Feedback & First Appeal',
      desc: 'Citizen rates the resolution quality. Dissatisfied citizens rating ‘Poor’ can immediately file a statutory First Appeal within 30 days.',
    },
  ];

  return (
    <section id="process" className="py-16 sm:py-20 bg-white border-b border-slate-200 text-left w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 w-full">
        
        {/* ================= SECTION HEADER ================= */}
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-blue-50 border border-blue-200 text-xs font-bold text-[#2563EB] uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>Standard Statutory Lifecycle</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0A2540] tracking-tight leading-tight">
            Public Grievance Redressal Process Flow
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Every complaint registered on the portal follows a structured, transparent 5-stage lifecycle
            governed by DARPG directives and statutory Citizen Charters.
          </p>
        </div>

        {/* ================= CONNECTED HORIZONTAL / VERTICAL TIMELINE (ICONS ONLY) ================= */}
        <div className="relative">
          
          {/* Desktop Connecting Line */}
          <div className="hidden lg:block absolute top-6 left-10 right-10 h-0.5 bg-slate-200 -z-0" />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-6 relative z-10">
            {steps.map((step, idx) => (
              <div key={idx} className="relative flex flex-col items-start space-y-3.5 group">
                
                {/* Step Marker Node (Icon Only) */}
                <div className="flex items-center gap-3 w-full">
                  <div className="w-12 h-12 rounded-xl bg-white border-2 border-slate-200 group-hover:border-[#2563EB] group-hover:bg-blue-50/50 shadow-xs flex items-center justify-center transition-all duration-200 shrink-0">
                    {step.icon}
                  </div>

                  {/* Mobile Connecting Dashed Line */}
                  <div className="lg:hidden flex-1 border-t-2 border-dashed border-slate-200" />
                </div>

                {/* Step Content */}
                <div className="space-y-1.5 pr-2">
                  <h3 className="text-lg sm:text-xl font-bold text-[#0A2540] leading-snug group-hover:text-[#2563EB] transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                    {step.desc}
                  </p>
                </div>

              </div>
            ))}
          </div>

        </div>

        {/* ================= STATUTORY SLA BOTTOM STRIP ================= */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#2563EB]/10 text-[#2563EB] shrink-0 font-bold text-sm">
              SLA
            </div>
            <div>
              <h4 className="font-bold text-base sm:text-lg text-[#0A2540]">
                21-Day Statutory Redressal Mandate
              </h4>
              <p className="text-xs sm:text-sm text-slate-600">
                Automatic escalation alerts trigger to Appellate Authorities if intermediate reports are not submitted.
              </p>
            </div>
          </div>
          
          <div className="inline-flex items-center gap-2 text-sm font-bold text-[#2563EB] hover:underline cursor-pointer shrink-0">
            <span>View Citizen Charter</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

      </div>
    </section>
  );
};
