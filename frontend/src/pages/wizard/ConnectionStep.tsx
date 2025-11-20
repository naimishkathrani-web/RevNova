// frontend/src/pages/wizard/ConnectionStep.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { connectionsService, projectsService } from '../../services';
import type { Connection, TestConnectionResponse, CreateConnectionRequest } from '../../types/api';

export const ConnectionStep: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectId = searchParams.get('project');

  // State
  const [sourceConnection, setSourceConnection] = useState<Connection | null>(null);
  const [targetConnection, setTargetConnection] = useState<Connection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testingSource, setTestingSource] = useState(false);
  const [testingTarget, setTestingTarget] = useState(false);
  const [sourceTestResult, setSourceTestResult] = useState<TestConnectionResponse | null>(null);
  const [targetTestResult, setTargetTestResult] = useState<TestConnectionResponse | null>(null);

  // Form state for new connections
  const [sourceForm, setSourceForm] = useState({
    instanceUrl: '',
    username: '',
    password: '',
    securityToken: '',
  });

  const [targetForm, setTargetForm] = useState({
    instanceUrl: '',
    username: '',
    password: '',
    securityToken: '',
  });

  // Load existing connections
  useEffect(() => {
    if (projectId) {
      loadConnections();
    }
  }, [projectId]);

  const loadConnections = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      setError(null);

      const source = await connectionsService.getSourceConnection(projectId);
      const target = await connectionsService.getTargetConnection(projectId);

      setSourceConnection(source);
      setTargetConnection(target);

      // Pre-fill forms if connections exist
      if (source) {
        setSourceForm({
          instanceUrl: source.instanceUrl,
          username: source.username,
          password: '••••••••',
          securityToken: '••••••••',
        });
      }

      if (target) {
        setTargetForm({
          instanceUrl: target.instanceUrl,
          username: target.username,
          password: '••••••••',
          securityToken: '••••••••',
        });
      }

    } catch (err: any) {
      setError(err.message || 'Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const handleTestSource = async () => {
    if (!sourceForm.instanceUrl || !sourceForm.username || !sourceForm.password) {
      setError('Please fill in all source connection fields');
      return;
    }

    try {
      setTestingSource(true);
      setSourceTestResult(null);
      setError(null);

      const result = await connectionsService.testConnection({
        instanceUrl: sourceForm.instanceUrl,
        username: sourceForm.username,
        password: sourceForm.password,
        securityToken: sourceForm.securityToken,
      });

      setSourceTestResult(result);

      if (result.success) {
        // Save connection
        if (projectId) {
          if (sourceConnection) {
            await connectionsService.updateConnection(sourceConnection.id, {
              instanceUrl: sourceForm.instanceUrl,
              username: sourceForm.username,
              password: sourceForm.password,
              securityToken: sourceForm.securityToken,
            });
          } else {
            const newConn = await connectionsService.createConnection(projectId, {
              connectionType: 'source',
              instanceUrl: sourceForm.instanceUrl,
              username: sourceForm.username,
              password: sourceForm.password,
              securityToken: sourceForm.securityToken,
            });
            setSourceConnection(newConn);
          }
        }
      }

    } catch (err: any) {
      setError(err.message || 'Failed to test source connection');
      setSourceTestResult({ success: false, message: err.message, orgId: null, orgName: null });
    } finally {
      setTestingSource(false);
    }
  };

  const handleTestTarget = async () => {
    if (!targetForm.instanceUrl || !targetForm.username || !targetForm.password) {
      setError('Please fill in all target connection fields');
      return;
    }

    try {
      setTestingTarget(true);
      setTargetTestResult(null);
      setError(null);

      const result = await connectionsService.testConnection({
        instanceUrl: targetForm.instanceUrl,
        username: targetForm.username,
        password: targetForm.password,
        securityToken: targetForm.securityToken,
      });

      setTargetTestResult(result);

      if (result.success) {
        // Save connection
        if (projectId) {
          if (targetConnection) {
            await connectionsService.updateConnection(targetConnection.id, {
              instanceUrl: targetForm.instanceUrl,
              username: targetForm.username,
              password: targetForm.password,
              securityToken: targetForm.securityToken,
            });
          } else {
            const newConn = await connectionsService.createConnection(projectId, {
              connectionType: 'target',
              instanceUrl: targetForm.instanceUrl,
              username: targetForm.username,
              password: targetForm.password,
              securityToken: targetForm.securityToken,
            });
            setTargetConnection(newConn);
          }
        }
      }

    } catch (err: any) {
      setError(err.message || 'Failed to test target connection');
      setTargetTestResult({ success: false, message: err.message, orgId: null, orgName: null });
    } finally {
      setTestingTarget(false);
    }
  };

  const handleNext = async () => {
    if (!sourceConnection || !targetConnection) {
      setError('Please test and save both source and target connections before proceeding');
      return;
    }

    // Navigate to analyze step
    navigate(`/wizard/analyze?project=${projectId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Connect Salesforce Orgs</h1>
        <p className="text-gray-600 mt-2">
          Connect your source (SFDC CPQ) and target (Revenue Cloud) Salesforce organizations
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source Connection */}
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">📤</span> Source Org
            </h2>
            {sourceConnection && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                Connected
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-4">SFDC CPQ (Classic or Lightning)</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instance URL *
              </label>
              <input
                type="url"
                value={sourceForm.instanceUrl}
                onChange={(e) => setSourceForm({ ...sourceForm, instanceUrl: e.target.value })}
                placeholder="https://yourinstance.salesforce.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username *
              </label>
              <input
                type="text"
                value={sourceForm.username}
                onChange={(e) => setSourceForm({ ...sourceForm, username: e.target.value })}
                placeholder="user@company.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                value={sourceForm.password}
                onChange={(e) => setSourceForm({ ...sourceForm, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Security Token
              </label>
              <input
                type="password"
                value={sourceForm.securityToken}
                onChange={(e) => setSourceForm({ ...sourceForm, securityToken: e.target.value })}
                placeholder="Optional - required for non-trusted IPs"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleTestSource}
              disabled={testingSource}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {testingSource ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Testing...
                </>
              ) : (
                <>
                  <span>🔌</span> Test Connection
                </>
              )}
            </button>

            {/* Test Result */}
            {sourceTestResult && (
              <div className={`p-4 rounded-lg ${sourceTestResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <p className={`font-medium ${sourceTestResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {sourceTestResult.success ? '✅ Connection Successful' : '❌ Connection Failed'}
                </p>
                <p className={`text-sm mt-1 ${sourceTestResult.success ? 'text-green-700' : 'text-red-700'}`}>
                  {sourceTestResult.message}
                </p>
                {sourceTestResult.orgName && (
                  <p className="text-sm mt-2 text-gray-600">
                    <strong>Org:</strong> {sourceTestResult.orgName}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Target Connection */}
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-green-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">📥</span> Target Org
            </h2>
            {targetConnection && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                Connected
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-4">Revenue Cloud (with Vlocity/OmniStudio)</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instance URL *
              </label>
              <input
                type="url"
                value={targetForm.instanceUrl}
                onChange={(e) => setTargetForm({ ...targetForm, instanceUrl: e.target.value })}
                placeholder="https://yourinstance.salesforce.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username *
              </label>
              <input
                type="text"
                value={targetForm.username}
                onChange={(e) => setTargetForm({ ...targetForm, username: e.target.value })}
                placeholder="user@company.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                value={targetForm.password}
                onChange={(e) => setTargetForm({ ...targetForm, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Security Token
              </label>
              <input
                type="password"
                value={targetForm.securityToken}
                onChange={(e) => setTargetForm({ ...targetForm, securityToken: e.target.value })}
                placeholder="Optional - required for non-trusted IPs"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleTestTarget}
              disabled={testingTarget}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {testingTarget ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Testing...
                </>
              ) : (
                <>
                  <span>🔌</span> Test Connection
                </>
              )}
            </button>

            {/* Test Result */}
            {targetTestResult && (
              <div className={`p-4 rounded-lg ${targetTestResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <p className={`font-medium ${targetTestResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {targetTestResult.success ? '✅ Connection Successful' : '❌ Connection Failed'}
                </p>
                <p className={`text-sm mt-1 ${targetTestResult.success ? 'text-green-700' : 'text-red-700'}`}>
                  {targetTestResult.message}
                </p>
                {targetTestResult.orgName && (
                  <p className="text-sm mt-2 text-gray-600">
                    <strong>Org:</strong> {targetTestResult.orgName}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          ← Back to Dashboard
        </button>

        <button
          onClick={handleNext}
          disabled={!sourceConnection || !targetConnection}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Analyze Schema →
        </button>
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Connection Tips:</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Use production or sandbox URLs (e.g., https://login.salesforce.com or https://test.salesforce.com)</li>
          <li>Security token is only required if connecting from untrusted IP addresses</li>
          <li>Make sure the user has API access and appropriate permissions</li>
          <li>Connections are encrypted and stored securely</li>
        </ul>
      </div>
    </div>
  );
};
