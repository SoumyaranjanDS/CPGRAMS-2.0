import React from 'react';
import {
  ExternalLink,
  ShieldAlert,
  Info,
  Check,
} from 'lucide-react';

export const ExclusionsAndNoticeSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-white border-b border-slate-200 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
        
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-blue-50 border border-blue-200 text-xs font-bold text-[#2563EB] uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Important Guidelines &amp; Exclusions</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0A2540] tracking-tight">
            Issues Which Are Not Taken Up for Redress
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-normal max-w-3xl leading-relaxed">
            The following categories of grievances cannot be processed under the CPGRAMS portal and must be submitted through their respective statutory authorities.
          </p>
        </div>

        {/* Highlighted Points List (Clean Black & Blue Typography with Increased Font Size) */}
        <div className="border border-slate-200 rounded-2xl bg-slate-50/50 divide-y divide-slate-200">
          
          {/* Point 1: RTI Matters */}
          <div className="p-5 sm:p-6 flex items-start gap-4">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
              1
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#0A2540]">
                RTI Matters
              </h3>
              <p className="text-sm sm:text-base text-slate-700 mt-1 leading-relaxed">
                Matters governed under the Right to Information Act, 2005 have separate statutory application and appeal channels.
              </p>
            </div>
          </div>

          {/* Point 2: Court Related */}
          <div className="p-5 sm:p-6 flex items-start gap-4">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
              2
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#0A2540]">
                Court Related / Subjudice Matters
              </h3>
              <p className="text-sm sm:text-base text-slate-700 mt-1 leading-relaxed">
                Any case, appeal, or dispute pending before any Court of Law, Tribunal, or quasi-judicial authority.
              </p>
            </div>
          </div>

          {/* Point 3: Religious Matters */}
          <div className="p-5 sm:p-6 flex items-start gap-4">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
              3
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#0A2540]">
                Religious Matters
              </h3>
              <p className="text-sm sm:text-base text-slate-700 mt-1 leading-relaxed">
                Matters relating to religious customs, disputes, or community practices.
              </p>
            </div>
          </div>

          {/* Point 4: Service Matters */}
          <div className="p-5 sm:p-6 flex items-start gap-4">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
              4
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#0A2540]">
                Grievances of Government Employees Concerning Service Matters
              </h3>
              <p className="text-sm sm:text-base text-slate-700 mt-1 leading-relaxed">
                Grievances concerning service matters including disciplinary proceedings etc., unless the aggrieved employee
                has already exhausted the prescribed channels keeping in view the{' '}
                <a
                  href="https://pgportal.gov.in/Home/Preview/RE9QVF9PTV9PblNlcnZpY2VNYXR0ZXJzKEVuZ2xpc2gpMzEtMDgtMjAxMy1Fc3R0LUEtSUlJLUVuZy5wZGY%3d"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2563EB] font-bold underline hover:text-[#1D4ED8] inline-flex items-center gap-1"
                >
                  DoPT OM No. 11013/08/2013-Estt.(A-III) dated 31.08.2015
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>.
              </p>
            </div>
          </div>

        </div>

        {/* Highlighted Official Notes & Declarations */}
        <div className="space-y-4 pt-2">
          
          {/* Note 1: DPG Advisory */}
          <div className="p-5 sm:p-6 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-start gap-4">
            <Info className="w-6 h-6 text-[#2563EB] shrink-0 mt-0.5" />
            <div className="text-sm sm:text-base text-slate-800 leading-relaxed">
              <strong className="text-[#0A2540] font-bold">Note on DPG Resolution: </strong>
              If you have not got a satisfactory redress of your grievance within a reasonable period of time, relating to{' '}
              <a
                href="https://dpg.gov.in/AuthPages/OgCovered.aspx"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2563EB] font-bold underline hover:text-[#1D4ED8] inline-flex items-center gap-1"
              >
                Ministries/Departments and Organisations
                <ExternalLink className="w-3.5 h-3.5" />
              </a>{' '}
              under the purview of Directorate of Public Grievances (DPG), Cabinet Secretariat, GOI, you may seek help of
              DPG in resolution. Please{' '}
              <a
                href="https://dpg.gov.in/Default.aspx"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2563EB] font-bold underline hover:text-[#1D4ED8] inline-flex items-center gap-1"
              >
                click here for details
                <ExternalLink className="w-3.5 h-3.5" />
              </a>.
            </div>
          </div>

          {/* Note 2: Zero Government Fee Notice */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-4 h-4 font-bold" />
            </div>
            <div className="text-sm sm:text-base text-slate-800 leading-relaxed">
              <strong className="text-[#0A2540] font-bold">Zero Government Fee: </strong>
              Government is not charging fee from the public for filing grievances. All money being paid by the public for
              filing grievance is going only to M/s CSC only for kiosk facilitation services.
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
