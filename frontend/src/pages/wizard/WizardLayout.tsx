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
  const currentStep = steps.find((s) => s.path === location.pathname)?.number || 1;

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <StepIndicator currentStep={currentStep} steps={steps} />
        <div className="bg-white p-6 rounded-lg shadow">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default WizardLayout;
