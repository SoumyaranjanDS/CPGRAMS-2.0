import React from 'react';
import { Department } from '../../types/index.js';
import { Badge } from '../common/Badge.js';
import { Skeleton } from '../common/Skeleton.js';

export interface MinistriesSectionProps {
  departments: Department[];
  isLoading: boolean;
  onStartComplaint: (deptName?: string) => void;
}

export const MinistriesSection: React.FC<MinistriesSectionProps> = ({
  departments,
  isLoading,
  onStartComplaint,
}) => {
  return (
    <section id="directory" className="p-6 sm:p-10 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-8 text-left w-full max-w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1.5">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0A2540] tracking-tight">
            Integrated Ministries, State Departments &amp; Authorities
          </h3>
          <p className="text-sm sm:text-base text-slate-600">
            Direct connectivity to Central Ministries, State Secretariats, District Collectors, and Civic Local Bodies.
          </p>
        </div>
        <Badge variant="blue" className="text-xs sm:text-sm px-3 py-1 font-bold shrink-0">
          {departments.length} Public Bodies Configured
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <Skeleton height={90} />
        ) : (
          departments.map((dept) => (
            <div
              key={dept.departmentId}
              className="p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-colors space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {dept.name}
                </h4>
                <Badge variant="blue" size="sm" className="shrink-0 font-bold">
                  {dept.slaDays} Days SLA
                </Badge>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm">{dept.ministry}</p>
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs sm:text-sm text-slate-700">
                <span>Nodal GRO: <strong>{dept.nodalOfficerName}</strong></span>
                <span
                  className="text-[#2563EB] font-bold cursor-pointer hover:underline"
                  onClick={() => onStartComplaint(dept.name)}
                >
                  Lodge &rarr;
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};
