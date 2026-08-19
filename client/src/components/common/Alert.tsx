import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'danger' | 'saffron';
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onDismiss,
  className = '',
}) => {
  const variantStyles = {
    info: 'bg-blue-50/90 text-blue-900 border-blue-200/80',
    success: 'bg-emerald-50/90 text-emerald-950 border-emerald-200/80',
    warning: 'bg-amber-50/90 text-amber-950 border-amber-200/80',
    danger: 'bg-red-50/90 text-red-950 border-red-200/80',
    saffron: 'bg-orange-50/90 text-orange-950 border-orange-200/80',
  };

  const iconMap = {
    info: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    danger: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
    saffron: <AlertCircle className="w-5 h-5 text-orange-600 shrink-0" />,
  };

  return (
    <div
      className={`rounded-xl border p-4 flex items-start gap-3.5 shadow-2xs ${variantStyles[variant]} ${className}`}
      role="alert"
    >
      <div className="mt-0.5">{iconMap[variant]}</div>
      <div className="flex-1 text-sm">
        {title && <h4 className="font-bold mb-1 leading-snug">{title}</h4>}
        <div className="text-slate-700 leading-relaxed text-xs sm:text-sm">{children}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="rounded-lg p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
