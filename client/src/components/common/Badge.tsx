import React from 'react';
import { ComplaintStatus } from '../../types/index.js';

export interface BadgeProps {
  children?: React.ReactNode;
  status?: ComplaintStatus;
  variant?: 'neutral' | 'dark' | 'success' | 'warning' | 'error' | 'info';
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
  let resolvedVariant = variant || 'neutral';
  let label = children;

  if (status) {
    switch (status) {
      case 'DRAFT':
        resolvedVariant = 'neutral';
        label = label || 'Draft Saved';
        break;
      case 'SUBMITTED':
      case 'RECEIVED':
        resolvedVariant = 'info';
        label = label || 'Submitted';
        break;
      case 'ASSIGNED':
      case 'UNDER_REVIEW':
      case 'ACTION_IN_PROGRESS':
        resolvedVariant = 'warning';
        label = label || 'In Review';
        break;
      case 'ADDITIONAL_INFO_REQUIRED':
        resolvedVariant = 'error';
        label = label || 'Action Required';
        break;
      case 'RESOLVED':
      case 'CLOSED':
        resolvedVariant = 'success';
        label = label || 'Resolved';
        break;
      case 'RESOLUTION_DISPUTED':
      case 'APPEAL_SUBMITTED':
        resolvedVariant = 'error';
        label = label || 'In Appeal';
        break;
      case 'APPEAL_RESOLVED':
        resolvedVariant = 'success';
        label = label || 'Appeal Resolved';
        break;
      default:
        resolvedVariant = 'neutral';
    }
  }

  const variantStyles = {
    neutral: 'bg-[#F4F4F5] text-[#52525B] border-[#E4E4E7]',
    dark: 'bg-[#0A0A0B] text-white border-transparent',
    success: 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]',
    warning: 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]',
    error: 'bg-[#FFF1F2] text-[#9F1239] border-[#FECDD3]',
    info: 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium tracking-tight',
    md: 'text-xs px-2.5 py-0.5 font-medium tracking-tight',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-sans ${variantStyles[resolvedVariant]} ${sizeStyles[size]} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              resolvedVariant === 'success'
                ? 'bg-emerald-400'
                : resolvedVariant === 'error'
                ? 'bg-rose-400'
                : resolvedVariant === 'warning'
                ? 'bg-amber-400'
                : 'bg-blue-400'
            }`}
          ></span>
          <span
            className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
              resolvedVariant === 'success'
                ? 'bg-emerald-600'
                : resolvedVariant === 'error'
                ? 'bg-rose-600'
                : resolvedVariant === 'warning'
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
