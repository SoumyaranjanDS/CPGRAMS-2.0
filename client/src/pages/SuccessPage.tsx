import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  FileCheck,
} from 'lucide-react';
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

  const handleTrack = () => {
    if (onTrack) {
      onTrack();
    } else {
      navigate(`/track?id=${grievanceId}`);
    }
  };

  const handleReturnHome = () => {
    if (onReturnHome) {
      onReturnHome();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in zoom-in-95 duration-300">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold text-[#0A2540]">
          Public Grievance Registered Successfully
        </h2>
        <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto">
          Your grievance has been acknowledged and transmitted to the concerned authority under
          statutory registration protocol.
        </p>
      </div>

      <Card padding="lg" className="space-y-6 border-slate-200 bg-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Grievance Registration Number
            </span>
            <p className="text-2xl font-mono font-extrabold text-[#0A2540]">{grievanceId}</p>
          </div>
          <Badge variant="blue" size="md">
            Assigned &bull; Clock Started
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block text-xs">Statutory SLA:</span>
            <strong className="text-slate-800 flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-blue-700" />
              21 Calendar Days
            </strong>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block text-xs">Target Redressal Date:</span>
            <strong className="text-slate-800 mt-0.5 block">11 Sept 2026</strong>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
            <span className="text-slate-400 block text-xs">Official Notifications:</span>
            <strong className="text-slate-800 mt-0.5 block">SMS + Email Dispatch</strong>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Button
            variant="primary"
            onClick={handleTrack}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full sm:w-auto font-bold"
          >
            Track Live Progress
          </Button>
          <Button
            variant="outline"
            onClick={handleReturnHome}
            leftIcon={<FileCheck className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Return to Home
          </Button>
        </div>
      </Card>
    </div>
  );
};
