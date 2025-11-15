// frontend/src/pages/wizard/WizardLayout.tsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { StepIndicator } from '../../components/layout/StepIndicator';

const steps = [
  { number: 1, title: 'Connect', path: '/wizard/connect' },
  { number: 2, title: 'Analyze', path: '/wizard/analyze' },
  { number: 3, title: 'Map Fields', path: '/wizard/mapping' },
  { number: 4, title: 'Transform', path: '/wizard/transform' },
  { number: 5, title: 'Validate', path: '/wizard/validate' },
  { number: 6, title: 'Execute', path: '/wizard/execute' },
  { number: 7, title: 'Report', path: '/wizard/report' },
];

export const WizardLayout: React.FC = () => {
  const location = useLocation();

  // Find current step based on URL
  const currentStep =
    steps.find((s) => s.path === location.pathname)?.number || 1;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">RevNova Migration Wizard</h1>

      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} steps={steps} />

      {/* Wizard content */}
      <div className="mt-4">
        <Outlet />
      </div>
    </div>
  );
};
export default WizardLayout;