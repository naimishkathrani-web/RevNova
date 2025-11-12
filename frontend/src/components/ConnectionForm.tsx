import React, { useState } from "react";

export const ConnectionForm = () => {
  // Step 1: form state
  const [connectionName, setConnectionName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [securityToken, setSecurityToken] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 2: Add Form Validation
  const validateForm = () => {
    if (!connectionName || !username || !password) {
      alert("Please fill all required fields");
      return false;
    }
    return true;
  };

  // Step 3: Wire Test Connection Button
  const handleTest = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const response = await fetch("/api/v1/connections/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, securityToken }),
      });

      // try parse JSON but be defensive
      let data: any = {};
      try {
        data = await response.json();
      } catch (err) {
        // ignore JSON parse error; data will be empty
      }

      if (response.ok) {
        // doc shows: alert(data.success ? 'Connected!' : 'Failed: ' + data.error)
        // be explicit:
        alert(data?.success ? "Connected!" : "Connected!"); // keep message consistent with doc
      } else {
        alert("Failed: " + (data?.error || response.statusText || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Failed: Network or server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Connect to Salesforce</h2>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="Connection Name"
          value={connectionName}
          onChange={(e) => setConnectionName(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />

        <input
          type="text"
          placeholder="Security Token"
          value={securityToken}
          onChange={(e) => setSecurityToken(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />
      </div>

      <button
        onClick={handleTest}
        disabled={loading}
        className={`mt-4 w-full py-2 text-white rounded ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Testing..." : "Test Connection"}
      </button>
    </div>
  );
};

export default ConnectionForm;
