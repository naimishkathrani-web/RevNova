import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { WizardLayout } from './pages/wizard/WizardLayout';
import { useWizardStore } from './store/wizardStore';
import { useConnectionStore } from './store/connectionStore';
import { migrationService, HealthResponse } from './services/migrationService';

function TestStore() {
  const { currentStep, setCurrentStep, markStepComplete } = useWizardStore();
  const { source, setSourceConnection } = useConnectionStore();

  return (
    <div>
      <h2>Zustand Store Test</h2>
      <p>Current Step: {currentStep}</p>
      <button
        onClick={() => setCurrentStep(currentStep + 1)}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Next Step
      </button>
      <button
        onClick={() => markStepComplete(currentStep)}
        className="px-4 py-2 bg-green-500 text-white rounded ml-2"
      >
        Mark Complete
      </button>
      <p>Source Instance: {source.instanceUrl || 'Not set'}</p>
      <button
        onClick={() => setSourceConnection({
          instanceUrl: 'https://test.salesforce.com',
          isConnected: true
        })}
        className="px-4 py-2 bg-purple-500 text-white rounded"
      >
        Set Source Connection
      </button>
    </div>
  );
}

function HealthTest() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const check = async () => {
      try {
        const data = await migrationService.checkHealth();
        setHealth(data as HealthResponse);
      } catch (err) {
        setError('Failed to connect to backend. Is it running on configured port?');
      }
    };
    check();
  }, []);

  return (
    <div style={{ marginBottom: 18 }}>
      <h3>API Connection Test</h3>
      {error && <div style={{ background: '#ffe6e6', color: '#a00', padding: 8, borderRadius: 6 }}>{error}</div>}
      {health && (
        <div style={{ background: '#e6ffed', padding: 8, borderRadius: 6 }}>
          <div><strong>Status:</strong> {health.status}</div>
          <div><strong>Message:</strong> {health.message}</div>
          {health.database && <div><strong>Database:</strong> {health.database}</div>}
        </div>
      )}
    </div>
  );
}

// Placeholder components
const ConnectionStep = () =>
"Step 1: Connect to Salesforce";
const AnalyzeStep = () =>
"Step 2: Analyze Schema";
const MappingStep = () =>
"Step 3: Map Fields";
const TransformStep = () =>
"Step 4: Transform Data";
const ValidateStep = () =>
"Step 5: Validate";
const ExecuteStep = () =>
"Step 6: Execute Migration";
const ReportStep = () =>
"Step 7: View Report";

function App() {
  return (
    <>
      <HealthTest />
      <TestStore />
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
    </>
  );
}

export default App;
