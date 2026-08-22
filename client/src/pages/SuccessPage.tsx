import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  FileCheck,
  Building2,
  Copy,
  Check,
} from 'lucide-react';
import axios from 'axios';
import { Card } from '../components/common/Card.js';
import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';

export interface SuccessPageProps {
  grievanceId?: string;
  onTrack?: () => void;
  onReturnHome?: () => void;
}

export const SuccessPage: React.FC<SuccessPageProps> = ({
  grievanceId: propId,
  onTrack,
  onReturnHome,
}) => {
  const { id: paramId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const grievanceId = propId || paramId || 'GRV-2026-004821';

  const [copied, setCopied] = useState(false);
  const [complaintData, setComplaintData] = useState<any>(null);

  useEffect(() => {
    if (grievanceId) {
      axios
        .get(`/api/v1/complaints/${grievanceId}`)
        .then((res) => {
          setComplaintData(res.data.data?.complaint || null);
        })
        .catch(() => {});
    }
  }, [grievanceId]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(grievanceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTrack = () => {
    if (onTrack) {
      onTrack();
    } else {
      navigate('/track');
    }
  };

  const handleReturnHome = () => {
    if (onReturnHome) {
      onReturnHome();
    } else {
      navigate('/');
    }
  };

  const formattedDueDate = complaintData?.slaDueDate
    ? new Date(complaintData.slaDueDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 text-left animate-in zoom-in-95 duration-200">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-xs">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A2540] tracking-tight">
          Public Complaint Registered Successfully
        </h2>
        <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
          Your complaint has been acknowledged by the portal and transmitted to the concerned
          authority under official DARPG statutory protocol.
        </p>
      </div>

      <Card padding="lg" className="space-y-6 border-slate-200 bg-white shadow-xs rounded-2xl">
        
        {/* Registration ID Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Grievance Registration Number
            </span>
            <div className="flex items-center gap-3 pt-0.5">
              <p className="text-2xl sm:text-3xl font-mono font-extrabold text-[#0A2540]">
                {grievanceId}
              </p>
              <button
                type="button"
                onClick={handleCopyId}
                className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                title="Copy Registration Number"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Badge variant="blue" size="md" className="font-bold shrink-0">
            Assigned &bull; Clock Started
          </Badge>
        </div>

        {/* Assigned Details & 21-Day SLA Target */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-400 block text-xs">Statutory SLA:</span>
            <strong className="text-slate-900 flex items-center gap-1.5 font-bold text-sm">
              <Clock className="w-4 h-4 text-[#2563EB]" />
              21 Calendar Days
            </strong>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-400 block text-xs">Target Redressal Date:</span>
            <strong className="text-slate-900 block font-bold text-sm">
              {formattedDueDate}
            </strong>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-400 block text-xs">Official Notifications:</span>
            <strong className="text-slate-900 block font-bold text-sm">
              SMS + Email Dispatched
            </strong>
          </div>
        </div>

        {/* Assigned Department Info */}
        {complaintData?.assignedDepartment && (
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex items-start gap-3">
            <Building2 className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Nodal Grievance Redressal Authority
              </span>
              <strong className="text-sm sm:text-base font-bold text-[#0A2540] block">
                {complaintData.assignedDepartment.departmentName}
              </strong>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Button
            variant="primary"
            onClick={handleTrack}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full sm:w-auto font-bold text-sm px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8]"
          >
            Track Live Status
          </Button>
          <Button
            variant="outline"
            onClick={handleReturnHome}
            leftIcon={<FileCheck className="w-4 h-4" />}
            className="w-full sm:w-auto text-sm py-3"
          >
            Return to Home Portal
          </Button>
        </div>
      </Card>
    </div>
  );
};
