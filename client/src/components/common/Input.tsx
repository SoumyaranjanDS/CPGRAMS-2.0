import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  leftIcon,
  rightIcon,
  isPassword = false,
  className = '',
  id,
  type = 'text',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-[#52525B] mb-1.5 tracking-tight"
        >
          {label}
        </label>
      )}
      <div className="relative rounded-lg">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A1A1AA]">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          type={resolvedType}
          className={`block w-full rounded-lg border bg-white text-[#0A0A0B] text-sm px-3.5 py-2 transition-all duration-150 focus:outline-none focus:ring-1 focus:ring-[#0A0A0B] focus:border-[#0A0A0B] disabled:bg-[#F4F4F5] disabled:text-[#A1A1AA] disabled:cursor-not-allowed ${
            leftIcon ? 'pl-9' : ''
          } ${isPassword || rightIcon ? 'pr-9' : ''} ${
            error
              ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500'
              : 'border-[#E4E4E7] hover:border-[#D4D4D8]'
          } ${className}`}
          {...props}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#A1A1AA] hover:text-[#52525B] focus:outline-none cursor-pointer"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        ) : (
          rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#A1A1AA]">
              {rightIcon}
            </div>
          )
        )}
      </div>
      {error ? (
        <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
      ) : (
        helperText && <p className="mt-1 text-xs text-[#71717A]">{helperText}</p>
      )}
    </div>
  );
};
