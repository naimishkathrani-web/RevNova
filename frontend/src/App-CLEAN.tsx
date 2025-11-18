// frontend/src/App.tsx
import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { WizardLayout } from "./pages/wizard/WizardLayout";
import { ConnectionStep } from "./pages/wizard/ConnectionStep";
import { AnalyzeStep } from "./pages/wizard/AnalyzeStep";
import { MappingStep } from "./pages/wizard/MappingStep";
import { TransformStep } from "./pages/wizard/TransformStep";
import { ValidateStep } from "./pages/wizard/ValidateStep";
import { ExecuteStep } from "./pages/wizard/ExecuteStep";
import { ReportStep } from "./pages/wizard/ReportStep";

// Zustand stores
import { useWizardStore } from "./store/wizardStore";

function App() {
  const loadState = useWizardStore((state) => state.loadState);

  useEffect(() => {
    loadState?.();
  }, [loadState]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/wizard/connect" replace />} />
      <Route path="/wizard" element={<WizardLayout />}>
        <Route path="connect" element={<ConnectionStep />} />
        <Route path="analyze" element={<AnalyzeStep />} />
        <Route path="mapping" element={<MappingStep />} />
        <Route path="transform" element={<TransformStep />} />
        <Route path="validate" element={<ValidateStep />} />
        <Route path="execute" element={<ExecuteStep />} />
        <Route path="report" element={<ReportStep />} />
      </Route>
      <Route path="*" element={<Navigate to="/wizard/connect" replace />} />
    </Routes>
  );
}

export default App;
