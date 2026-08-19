import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  maxLength?: number;
  currentLength?: number;
  rightAction?: React.ReactNode;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  helperText,
  error,
  maxLength,
  currentLength,
  rightAction,
  className = '',
  id,
  rows = 4,
  ...props
}) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
          >
            {label}
          </label>
        )}
        {rightAction && <div className="shrink-0">{rightAction}</div>}
      </div>

      <div className="relative">
        <textarea
          id={textareaId}
          rows={rows}
          maxLength={maxLength}
          className={`block w-full rounded-lg border bg-white text-slate-900 text-sm p-3.5 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed resize-y ${
            error
              ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-200'
              : 'border-slate-300 hover:border-slate-400 focus:border-[#0A2540] focus:ring-[#0A2540]/20'
          } ${className}`}
          {...props}
        />
      </div>

      <div className="flex items-center justify-between mt-1.5 text-xs">
        {error ? (
          <p className="text-red-600 font-medium">{error}</p>
        ) : (
          <p className="text-slate-500">{helperText || ''}</p>
        )}
        {maxLength !== undefined && (
          <p className="text-slate-400 font-mono ml-auto">
            {currentLength ?? 0}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
};
