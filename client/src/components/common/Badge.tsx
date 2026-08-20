import React from 'react';
import { ComplaintStatus } from '../../types/index.js';

export interface BadgeProps {
  children?: React.ReactNode;
  status?: ComplaintStatus;
  variant?:
    | 'neutral'
    | 'dark'
    | 'success'
    | 'warning'
    | 'error'
    | 'info'
    | 'saffron'
    | 'emerald'
    | 'crimson'
    | 'slate'
    | 'amber'
    | 'blue'
    | 'primary';
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  status,
  variant,
  size = 'md',
  pulse = false,
  className = '',
}) => {
  let resolvedVariant = variant || 'slate';
  let label = children;

  if (status) {
    switch (status) {
      case 'DRAFT':
        resolvedVariant = 'slate';
        label = label || 'Draft Saved';
        break;
      case 'SUBMITTED':
      case 'RECEIVED':
        resolvedVariant = 'blue';
        label = label || 'Submitted';
        break;
      case 'ASSIGNED':
      case 'UNDER_REVIEW':
      case 'ACTION_IN_PROGRESS':
        resolvedVariant = 'amber';
        label = label || 'In Progress';
        break;
      case 'ADDITIONAL_INFO_REQUIRED':
        resolvedVariant = 'saffron';
        label = label || 'Action Required';
        break;
      case 'RESOLVED':
      case 'CLOSED':
        resolvedVariant = 'emerald';
        label = label || 'Resolved';
        break;
      case 'RESOLUTION_DISPUTED':
      case 'APPEAL_SUBMITTED':
        resolvedVariant = 'crimson';
        label = label || 'Disputed / In Appeal';
        break;
      case 'APPEAL_RESOLVED':
        resolvedVariant = 'emerald';
        label = label || 'Appeal Resolved';
        break;
      default:
        resolvedVariant = 'slate';
    }
  }

  const variantStyles = {
    primary: 'bg-[#0A2540]/10 text-[#0A2540] border-[#0A2540]/20',
    saffron: 'bg-amber-50 text-amber-800 border-amber-300',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    crimson: 'bg-red-50 text-red-700 border-red-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    dark: 'bg-[#0A2540] text-white border-transparent',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium tracking-tight',
    md: 'text-xs px-2.5 py-0.5 font-semibold tracking-tight',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-sans ${variantStyles[resolvedVariant]} ${sizeStyles[size]} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              resolvedVariant === 'emerald' || resolvedVariant === 'success'
                ? 'bg-emerald-400'
                : resolvedVariant === 'crimson' || resolvedVariant === 'error'
                ? 'bg-red-400'
                : resolvedVariant === 'amber' || resolvedVariant === 'saffron' || resolvedVariant === 'warning'
                ? 'bg-amber-400'
                : 'bg-blue-400'
            }`}
          ></span>
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              resolvedVariant === 'emerald' || resolvedVariant === 'success'
                ? 'bg-emerald-600'
                : resolvedVariant === 'crimson' || resolvedVariant === 'error'
                ? 'bg-red-600'
                : resolvedVariant === 'amber' || resolvedVariant === 'saffron' || resolvedVariant === 'warning'
                ? 'bg-amber-600'
                : 'bg-blue-600'
            }`}
          ></span>
        </span>
      )}
      {label}
    </span>
  );
};
