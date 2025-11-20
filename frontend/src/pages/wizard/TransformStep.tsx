// frontend/src/pages/wizard/TransformStep.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fieldMappingsService } from '../../services';
import type { FieldMapping } from '../../types/api';

interface TransformRule {
  id: string;
  sourceField: string;
  targetField: string;
  ruleType: 'valueMap' | 'formula' | 'lookup' | 'concatenate' | 'split' | 'dateFormat' | 'custom';
  configuration: any;
  testResult?: string;
}

export const TransformStep: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectId = searchParams.get('project');

  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [selectedMapping, setSelectedMapping] = useState<FieldMapping | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testValue, setTestValue] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);

  // Transform rule types
  const ruleTypes = [
    { value: 'valueMap', label: 'Value Mapping', icon: '🔄', description: 'Map values (e.g., Active → true)' },
    { value: 'formula', label: 'Formula', icon: '∑', description: 'Apply mathematical formulas' },
    { value: 'lookup', label: 'Lookup', icon: '🔍', description: 'Lookup values from other objects' },
    { value: 'concatenate', label: 'Concatenate', icon: '➕', description: 'Combine multiple fields' },
    { value: 'split', label: 'Split', icon: '✂️', description: 'Split field into parts' },
    { value: 'dateFormat', label: 'Date Format', icon: '📅', description: 'Convert date formats' },
    { value: 'custom', label: 'Custom Logic', icon: '⚙️', description: 'Custom JavaScript transformation' },
  ];

  useEffect(() => {
    if (projectId) {
      loadMappings();
    }
  }, [projectId]);

  const loadMappings = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await fieldMappingsService.getFieldMappings(projectId, {
        mappingType: 'transform',
      });
      setMappings(data);
      if (data.length > 0) {
        setSelectedMapping(data[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load mappings');
    } finally {
      setLoading(false);
    }
  };

  const handleTestTransform = () => {
    if (!testValue) return;

    // Mock transformation logic
    let result = testValue;
    if (selectedMapping?.transformLogic) {
      // Simple demo transformation
      if (selectedMapping.transformLogic.includes('uppercase')) {
        result = testValue.toUpperCase();
      } else if (selectedMapping.transformLogic.includes('lowercase')) {
        result = testValue.toLowerCase();
      } else if (selectedMapping.transformLogic.includes('trim')) {
        result = testValue.trim();
      } else {
        result = `Transformed: ${testValue}`;
      }
    }
    setTestResult(result);
  };

  const handleNext = () => {
    navigate(`/wizard/validate?project=${projectId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transformations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Data Transformation Rules</h1>
        <p className="text-gray-600 mt-2">
          Configure transformation logic for complex field mappings
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Transforms</p>
          <p className="text-2xl font-bold text-purple-600">{mappings.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Value Maps</p>
          <p className="text-2xl font-bold text-blue-600">
            {mappings.filter(m => m.transformLogic?.includes('map')).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Formulas</p>
          <p className="text-2xl font-bold text-green-600">
            {mappings.filter(m => m.transformLogic?.includes('formula')).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Lookups</p>
          <p className="text-2xl font-bold text-orange-600">
            {mappings.filter(m => m.transformLogic?.includes('lookup')).length}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Transform Rules List */}
        <div className="col-span-1 bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Transform Rules</h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {mappings.map((mapping) => (
              <div
                key={mapping.id}
                onClick={() => setSelectedMapping(mapping)}
                className={`p-4 cursor-pointer hover:bg-gray-50 ${
                  selectedMapping?.id === mapping.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                }`}
              >
                <p className="font-medium text-sm text-gray-900">{mapping.sourceField}</p>
                <p className="text-xs text-gray-500 mt-1">→ {mapping.targetField}</p>
                <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                  {mapping.mappingType}
                </span>
              </div>
            ))}
            {mappings.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <p className="text-sm">No transform rules found</p>
                <p className="text-xs mt-1">Complex mappings will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Transform Configuration */}
        <div className="col-span-2 bg-white rounded-lg shadow">
          {selectedMapping ? (
            <>
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {selectedMapping.sourceField} → {selectedMapping.targetField}
                </h2>
                <p className="text-sm text-gray-600">{selectedMapping.sourceObject} to {selectedMapping.targetObject}</p>
              </div>

              <div className="p-6">
                {/* Rule Type Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Transformation Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {ruleTypes.map((type) => (
                      <div
                        key={type.value}
                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{type.icon}</span>
                          <span className="font-medium text-gray-900">{type.label}</span>
                        </div>
                        <p className="text-xs text-gray-600">{type.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transform Logic */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transform Logic</label>
                  <textarea
                    value={selectedMapping.transformLogic || ''}
                    readOnly
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50"
                    placeholder="Transformation logic will be generated here..."
                  />
                </div>

                {/* Test Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Test Transformation</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Input Value</label>
                      <input
                        type="text"
                        value={testValue}
                        onChange={(e) => setTestValue(e.target.value)}
                        placeholder="Enter test value..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      onClick={handleTestTransform}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Run Test
                    </button>
                    {testResult && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-medium text-green-900 mb-1">Result:</p>
                        <p className="font-mono text-green-800">{testResult}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-gray-500">
              <p>Select a transform rule to configure</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => navigate(`/wizard/mapping?project=${projectId}`)}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          ← Back to Mapping
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Next: Validate →
        </button>
      </div>
    </div>
  );
};
