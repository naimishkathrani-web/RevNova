// frontend/src/App.tsx
import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { WizardLayout } from "./pages/wizard/WizardLayout";
import ConnectionForm from "./components/ConnectionForm";
import { Button, Input, Card } from "./components";

// Zustand stores
import { useWizardStore } from "./store/wizardStore";
import { useConnectionStore } from "./store/connectionStore";

// HealthCheck Component (Day 2)
type HealthResponse = {
  status: string;
  message: string;
  database?: string;
};

function HealthCheck() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const check = async () => {
      try {
        await new Promise((res) => setTimeout(res, 500));
        setHealth({
          status: "ok",
          message: "Backend mocked successfully",
          database: "MockDB",
        });
      } catch (err) {
        setError("⚠️ Could not reach backend. Please check if server is running.");
      }
    };
    check();
  }, []);

  return (
    <div style={{ padding: 16, marginBottom: 16 }}>
      <h2>Server Health</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {health && (
        <div>
          <p><strong>Status:</strong> {health.status}</p>
          <p><strong>Message:</strong> {health.message}</p>
          <p><strong>Database:</strong> {health.database}</p>
        </div>
      )}
    </div>
  );
}

// Wizard Steps (Placeholders)
const ConnectStep = () => <div>Step 1: Connect to Salesforce</div>;
const AnalyzeStep = () => <div>Step 2: Analyze Schema</div>;
const MapStep = () => <div>Step 3: Map Fields</div>;
const TransformStep = () => <div>Step 4: Data Transformation</div>;
const ValidateStep = () => <div>Step 5: Validate</div>;
const ExecuteStep = () => <div>Step 6: Execute Migration</div>;
const ReportStep = () => <div>Step 7: View Report</div>;

// TestStore Component (Day 4 Task)
function TestStore() {
  const { currentStep, setCurrentStep, markStepComplete } = useWizardStore();
  const { source, setSourceConnection } = useConnectionStore();

  return (
    <div className="p-6 space-y-4 border-t mt-6">
      <h2>Zustand Store Test</h2>

      <div>Current Step: {currentStep}</div>
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

      <div>Source Instance: {source.instanceUrl || "Not set"}</div>
      <button
        onClick={() =>
          setSourceConnection({
            instanceUrl: "https://test.salesforce.com",
            isConnected: true,
          })
        }
        className="px-4 py-2 bg-purple-500 text-white rounded"
      >
        Set Source Connection
      </button>
    </div>
  );
}

function App() {
  const loadState = useWizardStore((state) => state.loadState);
  const [name, setName] = useState("");

  useEffect(() => {
    loadState?.();
  }, [loadState]);

  return (
    <>
      {/* Wizard Routes */}
      <Routes>
        <Route path="/" element={<Navigate to="/wizard/connect" replace />} />
        <Route path="/wizard" element={<WizardLayout />}>
          <Route path="connect" element={<ConnectStep />} />
          <Route path="analyze" element={<AnalyzeStep />} />
          <Route path="mapping" element={<MapStep />} />
          <Route path="transform" element={<TransformStep />} />
          <Route path="validate" element={<ValidateStep />} />
          <Route path="execute" element={<ExecuteStep />} />
          <Route path="report" element={<ReportStep />} />
        </Route>
        <Route path="*" element={<Navigate to="/wizard/connect" replace />} />
      </Routes>

      {/* Day 2 UI Components */}
      <div className="p-6 space-y-6">
        <ConnectionForm />
        <HealthCheck />
        <Card title="Test Card">
          <Input
            label="Enter Name"
            value={name}
            onChange={setName}
            placeholder="Type something..."
          />
          <div className="flex gap-2 mt-4">
            <Button variant="primary" onClick={() => alert(`Primary: ${name}`)}>Primary</Button>
            <Button variant="secondary" onClick={() => alert(`Secondary: ${name}`)}>Secondary</Button>
            <Button variant="danger" onClick={() => alert(`Danger: ${name}`)}>Danger</Button>
          </div>
        </Card>

        {/* Day 4 Store Test */}
        <TestStore />
      </div>
    </>
  );
}

export default App;
