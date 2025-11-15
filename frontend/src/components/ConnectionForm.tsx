import React, { useState } from "react";
import { Input, Button, Card } from "./index"; // Day 2 components

const ConnectionForm: React.FC = () => {
  const [connectionName, setConnectionName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [securityToken, setSecurityToken] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [metadataCount, setMetadataCount] = useState<number | null>(null);

  // Day 9: retry state
  const [retryCount, setRetryCount] = useState(0);

  // Day 9: sanitize logs (no password/token leakage)
  const sanitizeLog = (data: any) => {
    const sanitized = { ...data };
    if (sanitized.password) sanitized.password = "***";
    if (sanitized.securityToken) sanitized.securityToken = "***";
    return sanitized;
  };

  // Day 9: telemetry tracking
  const trackEvent = (eventName: string, metadata: any) => {
    fetch("/api/v1/telemetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: eventName, ...metadata }),
    }).catch(() => {});
  };

  const validateForm = () => {
    if (!connectionName || !username || !password) {
      setError("Please fill all required fields");
      return false;
    }
    setError("");
    return true;
  };

  // Day 9: retry logic
  const testWithRetry = async () => {
    try {
      const response = await fetch("/api/v1/connections/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connectionName,
          username,
          password,
          securityToken,
        }),
      });

      if (!response.ok && retryCount < 3) {
        console.warn(`Retry attempt ${retryCount + 1}...`);
        setRetryCount(retryCount + 1);
        setTimeout(testWithRetry, 2000);
        return;
      }
    } catch (err: any) {
      console.error("Retry connection failed:", err?.message);
    }
  };

  const handleTest = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setSuccess(false);
    setError("");
    setMetadataCount(null);
    setRetryCount(0);

    // Day 9: secure logging
    console.log(
      "Testing connection:",
      sanitizeLog({
        connectionName,
        username,
        password,
        securityToken,
      })
    );

    // Day 9: telemetry event
    trackEvent("connection_test_started", { provider: "salesforce" });

    // Begin retry cycle
    testWithRetry();

    try {
      const response = await fetch("/api/v1/connections/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connectionName,
          username,
          password,
          securityToken,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setMetadataCount(data.metadata?.objectCount || 0);

        // Day 9: telemetry success event
        trackEvent("connection_test_success", { duration: 1200 });
      } else {
        setError(data.message || "Connection failed");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    alert("Connection saved!");
  };

  return (
    <Card title="Connect to Salesforce">
      <div className="space-y-3">
        <Input
          label="Connection Name"
          value={connectionName}
          onChange={setConnectionName}
          placeholder="Connection Name"
          required
        />
        <Input
          label="Username"
          value={username}
          onChange={setUsername}
          placeholder="Username"
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Password"
          required
        />
        <Input
          label="Security Token"
          value={securityToken}
          onChange={setSecurityToken}
          placeholder="Security Token"
        />
      </div>

      {error && <p className="text-red-600 mt-2">{error}</p>}

      {success && (
        <p className="text-green-600 mt-2">
          ✅ Connection successful! {metadataCount} objects found.
        </p>
      )}

      {loading && <p className="text-gray-600 mt-2">Testing connection...</p>}

      <div className="mt-4 flex flex-col gap-2">
        <Button onClick={handleTest} variant="primary" disabled={loading}>
          {loading ? "Testing..." : "Test Connection"}
        </Button>

        <Button onClick={handleSave} variant="success" disabled={!success}>
          Save Connection
        </Button>
      </div>
    </Card>
  );
};

export default ConnectionForm;
