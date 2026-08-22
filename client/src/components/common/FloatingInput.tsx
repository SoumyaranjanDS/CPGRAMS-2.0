import React, { useId } from 'react';

export interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  required?: boolean;
}

export const FloatingInput: React.FC<FloatingInputProps> = ({
  label,
  leftIcon,
  rightIcon,
  error,
  required,
  value,
  id,
  className = '',
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className="w-full text-left">
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 pointer-events-none z-10">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          value={value}
          placeholder=" "
          required={required}
          className={`peer w-full ${leftIcon ? 'pl-10' : 'pl-3.5'} ${
            rightIcon ? 'pr-11' : 'pr-3.5'
          } pt-3.5 pb-2.5 rounded-xl border ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              : 'border-slate-300 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20'
          } bg-white text-[15px] sm:text-base font-medium text-slate-900 placeholder-transparent transition-all duration-200 outline-none ${className}`}
          {...props}
        />

        <label
          htmlFor={inputId}
          className={`absolute ${
            leftIcon ? 'left-10 peer-focus:left-2.5 peer-[:not(:placeholder-shown)]:left-2.5' : 'left-3.5 peer-focus:left-2.5 peer-[:not(:placeholder-shown)]:left-2.5'
          } top-3 text-[14px] sm:text-[15px] text-slate-500 transition-all duration-200 pointer-events-none select-none origin-top-left
          peer-focus:-top-2.5 peer-focus:text-xs peer-focus:font-bold peer-focus:text-[#2563EB] peer-focus:bg-white peer-focus:px-1.5 peer-focus:z-10
          peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:text-slate-700 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1.5 peer-[:not(:placeholder-shown)]:z-10`}
        >
          {label} {required && <span className="text-red-500 font-bold">*</span>}
        </label>

        {rightIcon && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 z-10">
            {rightIcon}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-600 font-semibold mt-1 pl-1">{error}</p>}
    </div>
  );
};

export interface FloatingSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  required?: boolean;
  options: { label: string; value: string }[];
}

export const FloatingSelect: React.FC<FloatingSelectProps> = ({
  label,
  error,
  required,
  value,
  id,
  options,
  className = '',
  ...props
}) => {
  const generatedId = useId();
  const selectId = id || generatedId;

  return (
    <div className="w-full text-left">
      <div className="relative flex items-center">
        <select
          id={selectId}
          value={value}
          required={required}
          className={`peer w-full px-3.5 pt-3.5 pb-2.5 rounded-xl border ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              : 'border-slate-300 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20'
          } bg-white text-[15px] sm:text-base font-medium text-slate-900 transition-all duration-200 outline-none appearance-none cursor-pointer ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <label
          htmlFor={selectId}
          className={`absolute left-2.5 -top-2.5 text-xs font-bold text-slate-700 bg-white px-1.5 z-10 transition-all duration-200 pointer-events-none select-none origin-top-left peer-focus:text-[#2563EB]`}
        >
          {label} {required && <span className="text-red-500 font-bold">*</span>}
        </label>

        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>

      {error && <p className="text-xs text-red-600 font-semibold mt-1 pl-1">{error}</p>}
    </div>
  );
};
