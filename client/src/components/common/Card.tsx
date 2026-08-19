import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'subtle' | 'bordered' | 'elevated' | 'plain';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-2xl sm:rounded-3xl transition-all duration-200';

  const variantStyles = {
    default: 'bg-white border border-neutral-200/70 shadow-xs',
    glass: 'glass-panel',
    subtle: 'bg-neutral-50/80 border border-neutral-200/50',
    bordered: 'bg-white border border-neutral-200',
    elevated: 'bg-white border border-neutral-100 shadow-lg shadow-black/5',
    plain: 'bg-transparent',
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
    xl: 'p-8 sm:p-10',
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
