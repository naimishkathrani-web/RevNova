import React, { useState } from "react";
import { Input, Button, Card } from "./index"; // Day 2 reusable components

const ConnectionForm: React.FC = () => {
  const [connectionName, setConnectionName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [securityToken, setSecurityToken] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [metadataCount, setMetadataCount] = useState<number | null>(null);

  const [retryCount, setRetryCount] = useState(0);

  // --------------------------
  // Day 9: Secure Logging
  // --------------------------
  const sanitizeLog = (data: any) => {
    const clean = { ...data };
    if (clean.password) clean.password = "***";
    if (clean.securityToken) clean.securityToken = "***";
    return clean;
  };

  // --------------------------
  // Day 9: Telemetry
  // --------------------------
  const trackEvent = (event: string, meta: any) => {
    fetch("/api/v1/telemetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, ...meta }),
    }).catch(() => {});
  };

  // --------------------------
  // Form Validation
  // --------------------------
  const validateForm = () => {
    if (!connectionName || !username || !password) {
      setError("Please fill all required fields");
      return false;
    }
    setError("");
    return true;
  };

  // --------------------------
  // Day 9: Retry Logic (max 3 attempts)
  // --------------------------
  const testWithRetry = async (): Promise<Response> => {
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

      // If successful → return immediately
      if (response.ok) return response;

      // Retry if < 3 attempts
      if (retryCount < 3) {
        console.warn(`Retry attempt ${retryCount + 1}...`);
        setRetryCount((prev) => prev + 1);

        await new Promise((resolve) => setTimeout(resolve, 2000));
        return testWithRetry();
      }

      return response;
    } catch {
      if (retryCount < 3) {
        setRetryCount((prev) => prev + 1);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return testWithRetry();
      }
      throw new Error("Network error");
    }
  };

  // --------------------------
  // Test Connection
  // --------------------------
  const handleTest = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setSuccess(false);
    setError("");
    setMetadataCount(null);
    setRetryCount(0);

    console.log(
      "Testing connection:",
      sanitizeLog({ connectionName, username, password, securityToken })
    );

    trackEvent("connection_test_started", { provider: "salesforce" });

    try {
      const response = await testWithRetry();
      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setMetadataCount(data.metadata?.objectCount || 0);

        trackEvent("connection_test_success", { attempts: retryCount + 1 });
      } else {
        setError(data.message || "Connection failed");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------
  // Save Connection
  // --------------------------
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
