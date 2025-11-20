// frontend/src/pages/wizard/ReportStep.tsx
import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

interface ObjectSummary {
  object: string;
  recordsProcessed: number;
  recordsSucceeded: number;
  recordsFailed: number;
  avgProcessingTime: number;
}

export const ReportStep: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectId = searchParams.get('project');

  // Mock report data
  const migrationSummary = {
    status: 'completed',
    startTime: new Date(Date.now() - 3600000),
    endTime: new Date(),
    duration: '58 minutes',
    totalRecords: 92450,
    successRecords: 91823,
    failedRecords: 627,
    successRate: 99.32,
  };

  const objectSummaries: ObjectSummary[] = [
    { object: 'Product2', recordsProcessed: 1250, recordsSucceeded: 1250, recordsFailed: 0, avgProcessingTime: 0.45 },
    { object: 'PricebookEntry', recordsProcessed: 3500, recordsSucceeded: 3498, recordsFailed: 2, avgProcessingTime: 0.32 },
    { object: 'SBQQ__Quote__c', recordsProcessed: 8900, recordsSucceeded: 8756, recordsFailed: 144, avgProcessingTime: 0.78 },
    { object: 'SBQQ__QuoteLine__c', recordsProcessed: 45000, recordsSucceeded: 44523, recordsFailed: 477, avgProcessingTime: 0.52 },
    { object: 'SBQQ__PriceRule__c', recordsProcessed: 156, recordsSucceeded: 156, recordsFailed: 0, avgProcessingTime: 0.64 },
    { object: 'Account', recordsProcessed: 12500, recordsSucceeded: 12500, recordsFailed: 0, avgProcessingTime: 0.38 },
    { object: 'Opportunity', recordsProcessed: 15600, recordsSucceeded: 15596, recordsFailed: 4, avgProcessingTime: 0.42 },
    { object: 'Contract', recordsProcessed: 4200, recordsSucceeded: 4200, recordsFailed: 0, avgProcessingTime: 0.56 },
  ];

  const errorCategories = [
    { category: 'Required Field Missing', count: 144, percentage: 23.0 },
    { category: 'Invalid Foreign Key', count: 477, percentage: 76.1 },
    { category: 'Data Type Mismatch', count: 4, percentage: 0.6 },
    { category: 'Validation Rule Failed', count: 2, percentage: 0.3 },
  ];

  const handleDownloadReport = () => {
    alert('Report download would be triggered here');
  };

  const handleRetryFailed = () => {
    alert('Retry failed records would be triggered here');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Migration Report</h1>
        <p className="text-gray-600 mt-2">Complete summary of the migration execution</p>
      </div>

      {/* Success Banner */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg p-8 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-5xl">🎉</span>
              <h2 className="text-3xl font-bold">Migration Completed Successfully!</h2>
            </div>
            <p className="text-green-100 text-lg">
              {migrationSummary.successRecords.toLocaleString()} of {migrationSummary.totalRecords.toLocaleString()} records migrated
            </p>
          </div>
          <div className="text-right">
            <div className="text-6xl font-bold">{migrationSummary.successRate}%</div>
            <p className="text-green-100">Success Rate</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Duration</p>
          <p className="text-2xl font-bold text-gray-900">{migrationSummary.duration}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Total Records</p>
          <p className="text-2xl font-bold text-blue-600">{migrationSummary.totalRecords.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Succeeded</p>
          <p className="text-2xl font-bold text-green-600">{migrationSummary.successRecords.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Failed</p>
          <p className="text-2xl font-bold text-red-600">{migrationSummary.failedRecords.toLocaleString()}</p>
        </div>
      </div>

      {/* Object Summaries */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Records by Object</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Object</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Processed</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Succeeded</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Failed</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg Time (s)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Success Rate</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {objectSummaries.map((obj) => (
                <tr key={obj.object} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-sm text-gray-900">{obj.object}</td>
                  <td className="px-6 py-4 text-right text-sm text-gray-900">{obj.recordsProcessed.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-sm text-green-600 font-medium">{obj.recordsSucceeded.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-sm text-red-600 font-medium">{obj.recordsFailed}</td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">{obj.avgProcessingTime.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      obj.recordsFailed === 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {((obj.recordsSucceeded / obj.recordsProcessed) * 100).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Error Analysis */}
      {migrationSummary.failedRecords > 0 && (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 bg-red-50 border-b border-red-200">
            <h3 className="font-semibold text-red-900">Error Analysis</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {errorCategories.map((error) => (
                <div key={error.category}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{error.category}</span>
                    <span className="text-sm text-gray-600">
                      {error.count} records ({error.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-full rounded-full"
                      style={{ width: `${error.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <button
          onClick={handleDownloadReport}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          <span>📥</span> Download Full Report
        </button>
        {migrationSummary.failedRecords > 0 && (
          <button
            onClick={handleRetryFailed}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2"
          >
            <span>🔄</span> Retry Failed Records
          </button>
        )}
        <button
          onClick={handleBackToDashboard}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2"
        >
          <span>🏠</span> Back to Dashboard
        </button>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">✅ Next Steps:</h3>
        <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
          <li>Review failed records and address issues</li>
          <li>Verify data integrity in target org</li>
          <li>Run post-migration validation tests</li>
          <li>Update documentation and notify stakeholders</li>
          <li>Monitor system performance and user feedback</li>
        </ul>
      </div>
    </div>
  );
};
