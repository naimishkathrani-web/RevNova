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

  const validateForm = () => {
    if (!connectionName || !username || !password) {
      setError("Please fill all required fields");
      return false;
    }
    setError("");
    return true;
  };

  const handleTest = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setSuccess(false);
    setError("");
    setMetadataCount(null);

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

      {/* Error message */}
      {error && <p className="text-red-600 mt-2">{error}</p>}

      {/* Success message */}
      {success && (
        <p className="text-green-600 mt-2">
          ✅ Connection successful! {metadataCount} objects found.
        </p>
      )}

      {/* Loading state */}
      {loading && <p className="text-gray-600 mt-2">Testing connection...</p>}

      <div className="mt-4 flex flex-col gap-2">
        <Button onClick={handleTest} variant="primary" disabled={loading}>
          {loading ? "Testing..." : "Test Connection"}
        </Button>

        <Button
          onClick={handleSave}
          variant="success"
          disabled={!success}
        >
          Save Connection
        </Button>
      </div>
    </Card>
  );
};

export default ConnectionForm;
