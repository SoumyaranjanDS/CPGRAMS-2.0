import React from 'react';
import { AlertCircle } from 'lucide-react';

export const EmailWarningBanner: React.FC = () => {
  return (
    <aside aria-label="Official Policy Notice" className="bg-[#6F0047] text-white py-3.5 px-4 sm:px-6 lg:px-8 border-y border-[#580038]">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-center">
        <AlertCircle className="w-5 h-5 text-white shrink-0" />
        <p className="text-sm sm:text-base font-medium leading-normal text-white">
          Any Grievance sent by email will not be attended to / entertained. Please lodge your grievance on this portal.
        </p>
      </div>
    </aside>
  );
};
