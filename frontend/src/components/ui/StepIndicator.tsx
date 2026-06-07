import React from 'react';

interface Step {
  label: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep, className = '' }) => {
  return (
    <div className={`flex items-center w-full ${className}`}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center relative">
              {/* Step circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-accent text-white'
                    : isCurrent
                    ? 'bg-accent/20 text-accent border-2 border-accent'
                    : 'bg-surface border border-border text-text-3'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>

              {/* Label */}
              <span
                className={`absolute -bottom-6 whitespace-nowrap text-[10px] font-mono uppercase tracking-wider ${
                  isCurrent ? 'text-accent' : isCompleted ? 'text-text-2' : 'text-text-3'
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {!isLast && (
              <div className="flex-1 mx-2">
                <div
                  className={`h-[2px] transition-all duration-500 ${
                    isCompleted ? 'bg-accent' : 'bg-border'
                  }`}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepIndicator;
