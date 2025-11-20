// frontend/src/pages/wizard/ValidateStep.tsx
import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

interface ValidationResult {
  category: string;
  test: string;
  status: 'passed' | 'warning' | 'failed';
  message: string;
  details?: string;
}

export const ValidateStep: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectId = searchParams.get('project');

  const [validating, setValidating] = useState(false);
  const [validated, setValidated] = useState(false);
  const [results, setResults] = useState<ValidationResult[]>([]);

  const handleValidate = async () => {
    setValidating(true);
    
    // Simulate validation process
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock validation results
    const mockResults: ValidationResult[] = [
      { category: 'Connections', test: 'Source org connectivity', status: 'passed', message: 'Connection successful', details: 'Connected to prod-01.salesforce.com' },
      { category: 'Connections', test: 'Target org connectivity', status: 'passed', message: 'Connection successful', details: 'Connected to prod-02.salesforce.com' },
      { category: 'Schema', test: 'Object availability', status: 'passed', message: 'All objects accessible', details: '13/13 objects found' },
      { category: 'Schema', test: 'Field accessibility', status: 'warning', message: '2 fields not accessible', details: 'SBQQ__Quote__c.CustomField1__c, Product2.CustomField2__c' },
      { category: 'Mappings', test: 'Field type compatibility', status: 'passed', message: 'All mappings compatible', details: '142/142 mappings valid' },
      { category: 'Mappings', test: 'Required fields mapped', status: 'passed', message: 'All required fields mapped', details: '28/28 required fields' },
      { category: 'Mappings', test: 'Lookup relationships', status: 'warning', message: '1 lookup not configured', details: 'PricebookEntry.Product2Id lookup pending' },
      { category: 'Data Quality', test: 'Null value handling', status: 'passed', message: 'Null handling configured', details: 'Default values set for 12 fields' },
      { category: 'Data Quality', test: 'Data type conversions', status: 'passed', message: 'All conversions valid', details: '8 type conversions configured' },
      { category: 'Transformations', test: 'Transform logic syntax', status: 'passed', message: 'All transforms valid', details: '15/15 transforms tested' },
      { category: 'Transformations', test: 'Sample data test', status: 'passed', message: 'Sample data transformed successfully', details: '100 records tested' },
      { category: 'Security', test: 'Field-level security', status: 'passed', message: 'FLS permissions verified', details: 'User has access to all mapped fields' },
      { category: 'Security', test: 'Object permissions', status: 'passed', message: 'Object access verified', details: 'CRUD permissions confirmed' },
      { category: 'Performance', test: 'Batch size optimization', status: 'passed', message: 'Batch size configured', details: 'Using 200 records per batch' },
      { category: 'Performance', test: 'API limit projection', status: 'warning', message: 'May approach API limits', details: 'Estimated 18,000 API calls (limit: 100,000)' },
    ];

    setResults(mockResults);
    setValidated(true);
    setValidating(false);
  };

  const handleNext = () => {
    navigate(`/wizard/execute?project=${projectId}`);
  };

  const passed = results.filter(r => r.status === 'passed').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  const failed = results.filter(r => r.status === 'failed').length;

  const categories = [...new Set(results.map(r => r.category))];

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Validation & Testing</h1>
        <p className="text-gray-600 mt-2">
          Validate migration configuration and run pre-flight checks
        </p>
      </div>

      {/* Validation Button */}
      {!validated && (
        <div className="bg-white rounded-lg shadow p-8 text-center mb-6">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Ready to Validate</h2>
            <p className="text-gray-600 mb-6">
              Run comprehensive validation checks to ensure your migration is ready for execution
            </p>
            <button
              onClick={handleValidate}
              disabled={validating}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-lg font-medium flex items-center justify-center gap-3 mx-auto"
            >
              {validating ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Validating...
                </>
              ) : (
                <>
                  <span>🚀</span> Start Validation
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Validation Progress */}
      {validating && (
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Running Validation Checks</h3>
            <p className="text-gray-600">This may take a few moments...</p>
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                Checking connections...
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {validated && results.length > 0 && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Passed</p>
                  <p className="text-3xl font-bold text-green-600">{passed}</p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Warnings</p>
                  <p className="text-3xl font-bold text-yellow-600">{warnings}</p>
                </div>
                <div className="text-4xl">⚠️</div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-3xl font-bold text-red-600">{failed}</p>
                </div>
                <div className="text-4xl">❌</div>
              </div>
            </div>
          </div>

          {/* Results by Category */}
          {categories.map((category) => (
            <div key={category} className="bg-white rounded-lg shadow mb-4 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">{category}</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {results
                  .filter((r) => r.category === category)
                  .map((result, idx) => (
                    <div key={idx} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">
                              {result.status === 'passed' ? '✅' : result.status === 'warning' ? '⚠️' : '❌'}
                            </span>
                            <div>
                              <p className="font-medium text-gray-900">{result.test}</p>
                              <p
                                className={`text-sm ${
                                  result.status === 'passed'
                                    ? 'text-green-600'
                                    : result.status === 'warning'
                                    ? 'text-yellow-600'
                                    : 'text-red-600'
                                }`}
                              >
                                {result.message}
                              </p>
                            </div>
                          </div>
                          {result.details && (
                            <p className="text-sm text-gray-600 ml-11">{result.details}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}

          {/* Recommendation */}
          <div className={`p-6 rounded-lg border-2 ${
            failed > 0
              ? 'bg-red-50 border-red-200'
              : warnings > 0
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-green-50 border-green-200'
          }`}>
            <h3 className="font-semibold text-gray-900 mb-2">Recommendation</h3>
            <p className="text-gray-700">
              {failed > 0
                ? '❌ Please fix the failed checks before proceeding with migration.'
                : warnings > 0
                ? '⚠️ Review warnings and proceed with caution. Address warnings if possible.'
                : '✅ All checks passed! Your migration is ready for execution.'}
            </p>
          </div>
        </>
      )}

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => navigate(`/wizard/transform?project=${projectId}`)}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          ← Back to Transform
        </button>
        <button
          onClick={handleNext}
          disabled={!validated || failed > 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Execute Migration →
        </button>
      </div>
    </div>
  );
};
