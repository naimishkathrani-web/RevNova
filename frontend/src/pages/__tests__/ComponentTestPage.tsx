// frontend/src/pages/__tests__/ComponentTestPage.tsx
// This file contains test components from early development
// These were used to verify component library and state management
// Can be accessed at /test route for debugging purposes

import React, { useState, useEffect } from "react";
import ConnectionForm from "../../components/ConnectionForm";
import { Button, Input, Card } from "../../components";
import { useWizardStore } from "../../store/wizardStore";
import { useConnectionStore } from "../../store/connectionStore";

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

export function ComponentTestPage() {
  const [name, setName] = useState("");

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Component Test Page</h1>
      <p className="text-gray-600 mb-6">
        This page is for testing components during development. Not for production use.
      </p>

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
          <Button variant="primary" onClick={() => alert(`Primary: ${name}`)}>
            Primary
          </Button>
          <Button variant="secondary" onClick={() => alert(`Secondary: ${name}`)}>
            Secondary
          </Button>
          <Button variant="danger" onClick={() => alert(`Danger: ${name}`)}>
            Danger
          </Button>
        </div>
      </Card>

      <TestStore />
    </div>
  );
}
