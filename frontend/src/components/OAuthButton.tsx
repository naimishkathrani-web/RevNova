import React, { useState, useEffect } from 'react';

export const OAuthButton = () => {
  const handleOAuth = () => {
    const authUrl = `/api/v1/auth/salesforce?redirect_uri=${encodeURIComponent(window.location.origin + '/oauth/callback')}`;
    window.open(authUrl, 'oauth', 'width=600,height=700');
  };

  // 🔹 Step 3: Display Connection Status
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetch('/api/v1/connections/1/status')
      .then(res => res.json())
      .then(data => setStatus(data));
  }, []);

  return (
    <div>
      <button onClick={handleOAuth} className="bg-blue-600 text-white px-4 py-2 rounded">
        Connect with OAuth
      </button>
      <div>Status: {status?.connected ? '✅ Connected' : '❌ Disconnected'}</div>
    </div>
  );
};
