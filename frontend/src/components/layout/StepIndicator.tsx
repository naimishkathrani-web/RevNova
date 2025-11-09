import React from 'react';

interface Step {
  number: number;
  title: string;
  path: string;
}

interface StepIndicatorProps {
  currentStep: number;
  steps: Step[];
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => {
  return (
    <nav aria-label="Progress" className="mb-6">
      <ol className="flex items-center gap-4">
        {steps.map((step, index) => {
          const completed = step.number <= currentStep;
          const active = step.number === currentStep;

          return (
            <li key={step.number} className="flex items-center">
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm ${
                    completed ? 'bg-blue-600 text-white' : active ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {step.number}
                </div>
                <div className="ml-2 text-sm text-gray-700">{step.title}</div>
              </div>

              {index < steps.length - 1 && (
                <div className="flex-1 h-px bg-gray-200 mx-4" style={{ width: 48 }} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
