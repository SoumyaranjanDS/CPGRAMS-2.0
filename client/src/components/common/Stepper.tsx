import React from 'react';
import { Check } from 'lucide-react';

export interface StepItem {
  id: number;
  title: string;
  description?: string;
}

export interface StepperProps {
  steps: StepItem[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      <nav aria-label="Progress">
        <ol className="flex items-center justify-between w-full">
          {steps.map((step, index) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const isClickable = onStepClick && isCompleted;

            return (
              <li
                key={step.id}
                className={`relative flex items-center ${
                  index < steps.length - 1 ? 'flex-1' : ''
                }`}
              >
                <div
                  onClick={() => isClickable && onStepClick(step.id)}
                  className={`group flex items-center gap-3 ${
                    isClickable ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 ${
                      isCompleted
                        ? 'bg-[#059669] text-white shadow-xs'
                        : isCurrent
                        ? 'bg-[#0A2540] text-white ring-4 ring-[#0A2540]/15'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isCompleted ? <Check className="h-4 w-4 stroke-[3]" /> : step.id}
                  </span>
                  <div className="hidden md:block text-left">
                    <p
                      className={`text-xs font-semibold uppercase tracking-wider ${
                        isCurrent
                          ? 'text-[#0A2540]'
                          : isCompleted
                          ? 'text-slate-900'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.title}
                    </p>
                    {step.description && (
                      <p className="text-[11px] text-slate-500 font-normal">
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Connecting Line between steps */}
                {index < steps.length - 1 && (
                  <div
                    className={`hidden sm:block flex-1 h-0.5 mx-4 transition-colors duration-200 ${
                      currentStep > step.id ? 'bg-[#059669]' : 'bg-slate-200'
                    }`}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};
