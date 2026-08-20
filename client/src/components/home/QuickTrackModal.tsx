import React, { useState } from 'react';
import { Search, Shield, CheckCircle2, Clock, MapPin, Building, ArrowRight, UserCheck } from 'lucide-react';
import { Modal } from '../common/Modal.js';
import { Input } from '../common/Input.js';
import { Button } from '../common/Button.js';
import { Badge } from '../common/Badge.js';
import { Alert } from '../common/Alert.js';

export interface QuickTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialId?: string;
}

export const QuickTrackModal: React.FC<QuickTrackModalProps> = ({
  isOpen,
  onClose,
  initialId = 'GRV-2026-004821',
}) => {
  const [grievanceId, setGrievanceId] = useState(initialId);
  const [phone, setPhone] = useState('+91 98765 43210');
  const [trackedRecord, setTrackedRecord] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleTrack = () => {
    if (!grievanceId) return;
    setIsLoading(true);
    setHasSearched(true);

    setTimeout(() => {
      // Mock realistic tracking state
      setTrackedRecord({
        grievanceId: grievanceId.toUpperCase(),
        title: 'Non-Credit / Delay of Monthly Pension Arrears',
        department: 'Department of Social Security & Empowerment (SSEPD)',
        ministry: 'Govt of Odisha',
        location: 'Saheed Nagar, Bhubaneswar (PIN: 751001)',
        status: 'UNDER_REVIEW',
        submittedAt: '18 Aug 2026, 10:30 AM',
        slaDueDate: '08 Sept 2026 (21 Days Statutory SLA)',
        daysElapsed: 3,
        daysRemaining: 18,
        nodalOfficer: 'Dr. Debasis Pattnaik, GRO',
        timeline: [
          {
            title: 'Grievance Lodged Successfully',
            time: '18 Aug 2026, 10:30 AM',
            status: 'completed',
            desc: 'System generated ID & authenticated via Mobile OTP.',
          },
          {
            title: 'AI Auto-Routing to SSEPD Odisha',
            time: '18 Aug 2026, 10:31 AM',
            status: 'completed',
            desc: 'Confidence: 96.4% based on pension intent keywords.',
          },
          {
            title: 'Officer Portal Login & Case Inspection',
            time: '19 Aug 2026, 09:45 AM',
            status: 'completed',
            desc: 'Grievance Redressal Officer opened case files and verified bank passbook attachment.',
          },
          {
            title: 'Field Verification & Arrears Disbursement',
            time: 'In Progress',
            status: 'current',
            desc: 'PFMS DBT verification underway with Treasury branch.',
          },
          {
            title: 'Action Taken Report (ATR) Disposal',
            time: 'Expected by 08 Sept 2026',
            status: 'pending',
            desc: 'Mandatory 3-declaration officer sign-off & sanction document upload.',
          },
        ],
      });
      setIsLoading(false);
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5 text-[#0A2540]">
          <div className="p-2 rounded-xl bg-blue-100 text-[#0A2540]">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Track Public Grievance</h3>
            <p className="text-xs text-slate-500 font-normal">
              Enter your Grievance Registration Number for live, tamper-proof tracking.
            </p>
          </div>
        </div>
      }
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Search Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Grievance Registration Number"
            value={grievanceId}
            onChange={(e) => setGrievanceId(e.target.value)}
            placeholder="e.g. GRV-2026-004821"
            leftIcon={<Shield className="w-4 h-4" />}
          />
          <Input
            label="Registered Mobile / Email"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98XXXXXXXX"
          />
        </div>

        <Button
          variant="primary"
          onClick={handleTrack}
          isLoading={isLoading}
          className="w-full justify-center font-bold"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Track Grievance Status Live
        </Button>

        {/* Search Result & Event-Sourced Timeline */}
        {trackedRecord && (
          <div className="space-y-5 pt-2 animate-in fade-in duration-300">
            {/* Header Summary Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/60 border border-slate-200 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-xs font-bold text-slate-500">
                    {trackedRecord.grievanceId}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug mt-0.5">
                    {trackedRecord.title}
                  </h4>
                </div>
                <Badge status="UNDER_REVIEW" pulse>
                  Under Investigation
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-200/80">
                <div>
                  <span className="text-slate-400 block text-[11px]">Department:</span>
                  <strong className="text-slate-800 flex items-center gap-1">
                    <Building className="w-3 h-3 text-slate-400" />
                    SSEPD Odisha
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Location:</span>
                  <strong className="text-slate-800 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    Bhubaneswar
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Nodal GRO:</span>
                  <strong className="text-slate-800 flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-slate-400" />
                    Dr. D. Pattnaik
                  </strong>
                </div>
              </div>

              {/* SLA Progress Bar */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#FF9933]" />
                    Statutory SLA: 21 Days Max
                  </span>
                  <span className="text-emerald-700 font-bold">{trackedRecord.daysRemaining} days remaining</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-[#FF9933] rounded-full w-[25%]" />
                </div>
              </div>
            </div>

            {/* Event Timeline */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Official Redressal Timeline
              </h5>
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {trackedRecord.timeline.map((step: any, idx: number) => (
                  <div key={idx} className="relative">
                    <span
                      className={`absolute -left-6 top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-white text-[10px] ${
                        step.status === 'completed'
                          ? 'bg-[#059669]'
                          : step.status === 'current'
                          ? 'bg-[#FF9933] ring-4 ring-orange-100 animate-pulse'
                          : 'bg-slate-300'
                      }`}
                    >
                      {step.status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : ''}
                    </span>
                    <div className="text-xs">
                      <div className="flex items-center justify-between">
                        <strong
                          className={
                            step.status === 'completed'
                              ? 'text-slate-900'
                              : step.status === 'current'
                              ? 'text-[#0A2540] font-bold'
                              : 'text-slate-400'
                          }
                        >
                          {step.title}
                        </strong>
                        <span className="text-[10px] text-slate-400 font-mono">{step.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Alert variant="info">
              Need to upload additional documents or dispute premature closure? Use the{' '}
              <strong>Grievance Support Assistant</strong>.
            </Alert>
          </div>
        )}

        {hasSearched && !trackedRecord && !isLoading && (
          <p className="text-xs text-red-600 text-center font-medium">
            No grievance found matching this registration number. Please check and try again.
          </p>
        )}
      </div>
    </Modal>
  );
};
