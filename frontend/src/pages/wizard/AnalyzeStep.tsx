// frontend/src/pages/wizard/AnalyzeStep.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { connectionsService } from '../../services';
import type { Connection } from '../../types/api';

interface SchemaObject {
  name: string;
  label: string;
  recordCount: number;
  fieldCount: number;
  relationships: number;
  selected: boolean;
}

export const AnalyzeStep: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectId = searchParams.get('project');

  // State
  const [sourceConnection, setSourceConnection] = useState<Connection | null>(null);
  const [targetConnection, setTargetConnection] = useState<Connection | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceObjects, setSourceObjects] = useState<SchemaObject[]>([]);
  const [targetObjects, setTargetObjects] = useState<SchemaObject[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'cpq' | 'custom'>('all');

  // Mock CPQ objects for demo
  const mockCPQObjects: SchemaObject[] = [
    { name: 'Product2', label: 'Product', recordCount: 1250, fieldCount: 45, relationships: 8, selected: true },
    { name: 'PricebookEntry', label: 'Price Book Entry', recordCount: 3500, fieldCount: 12, relationships: 3, selected: true },
    { name: 'SBQQ__Quote__c', label: 'CPQ Quote', recordCount: 8900, fieldCount: 78, relationships: 15, selected: true },
    { name: 'SBQQ__QuoteLine__c', label: 'CPQ Quote Line', recordCount: 45000, fieldCount: 62, relationships: 12, selected: true },
    { name: 'SBQQ__PriceRule__c', label: 'Price Rule', recordCount: 156, fieldCount: 28, relationships: 6, selected: true },
    { name: 'SBQQ__PriceCondition__c', label: 'Price Condition', recordCount: 420, fieldCount: 18, relationships: 4, selected: true },
    { name: 'SBQQ__PriceAction__c', label: 'Price Action', recordCount: 380, fieldCount: 22, relationships: 4, selected: true },
    { name: 'SBQQ__ProductRule__c', label: 'Product Rule', recordCount: 89, fieldCount: 24, relationships: 5, selected: true },
    { name: 'SBQQ__ProductOption__c', label: 'Product Option', recordCount: 670, fieldCount: 19, relationships: 7, selected: true },
    { name: 'SBQQ__ConfigurationAttribute__c', label: 'Configuration Attribute', recordCount: 245, fieldCount: 16, relationships: 3, selected: false },
    { name: 'Account', label: 'Account', recordCount: 12500, fieldCount: 35, relationships: 18, selected: true },
    { name: 'Opportunity', label: 'Opportunity', recordCount: 15600, fieldCount: 42, relationships: 12, selected: true },
    { name: 'Contract', label: 'Contract', recordCount: 4200, fieldCount: 28, relationships: 8, selected: true },
  ];

  const mockRCAObjects: SchemaObject[] = [
    { name: 'vlocity_cmt__CatalogItem__c', label: 'Catalog Item', recordCount: 0, fieldCount: 52, relationships: 10, selected: true },
    { name: 'vlocity_cmt__PriceListEntry__c', label: 'Price List Entry', recordCount: 0, fieldCount: 18, relationships: 5, selected: true },
    { name: 'Quote', label: 'Quote', recordCount: 0, fieldCount: 68, relationships: 14, selected: true },
    { name: 'QuoteLineItem', label: 'Quote Line Item', recordCount: 0, fieldCount: 48, relationships: 10, selected: true },
    { name: 'vlocity_cmt__PricingRule__c', label: 'Pricing Rule', recordCount: 0, fieldCount: 32, relationships: 8, selected: true },
    { name: 'vlocity_cmt__PricingCondition__c', label: 'Pricing Condition', recordCount: 0, fieldCount: 22, relationships: 6, selected: true },
    { name: 'vlocity_cmt__PricingAction__c', label: 'Pricing Action', recordCount: 0, fieldCount: 26, relationships: 6, selected: true },
    { name: 'vlocity_cmt__ProductConfigurationRule__c', label: 'Product Config Rule', recordCount: 0, fieldCount: 28, relationships: 7, selected: true },
    { name: 'vlocity_cmt__ProductChildItem__c', label: 'Product Child Item', recordCount: 0, fieldCount: 24, relationships: 9, selected: true },
    { name: 'vlocity_cmt__AttributeValue__c', label: 'Attribute Value', recordCount: 0, fieldCount: 20, relationships: 4, selected: false },
    { name: 'Account', label: 'Account', recordCount: 0, fieldCount: 35, relationships: 18, selected: true },
    { name: 'Opportunity', label: 'Opportunity', recordCount: 0, fieldCount: 42, relationships: 12, selected: true },
    { name: 'Contract', label: 'Contract', recordCount: 0, fieldCount: 28, relationships: 8, selected: true },
  ];

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

      if (!source || !target) {
        setError('Please configure both source and target connections first');
        return;
      }

      setSourceConnection(source);
      setTargetConnection(target);

      // Auto-analyze on load
      await handleAnalyze();

    } catch (err: any) {
      setError(err.message || 'Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      setError(null);

      // Simulate API call to analyze schema
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Load mock data
      setSourceObjects(mockCPQObjects);
      setTargetObjects(mockRCAObjects);

    } catch (err: any) {
      setError(err.message || 'Failed to analyze schema');
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleObjectSelection = (objectName: string, isSource: boolean) => {
    if (isSource) {
      setSourceObjects(prev => prev.map(obj =>
        obj.name === objectName ? { ...obj, selected: !obj.selected } : obj
      ));
    } else {
      setTargetObjects(prev => prev.map(obj =>
        obj.name === objectName ? { ...obj, selected: !obj.selected } : obj
      ));
    }
  };

  const handleNext = () => {
    const selectedSource = sourceObjects.filter(obj => obj.selected);
    if (selectedSource.length === 0) {
      setError('Please select at least one source object to migrate');
      return;
    }

    navigate(`/wizard/mapping?project=${projectId}`);
  };

  const filteredSourceObjects = sourceObjects.filter(obj => {
    const matchesSearch = obj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obj.label.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'cpq') {
      return matchesSearch && obj.name.includes('SBQQ__');
    } else if (filterType === 'custom') {
      return matchesSearch && obj.name.includes('__c') && !obj.name.includes('SBQQ__');
    }
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading schema...</p>
        </div>
      </div>
    );
  }

  if (analyzing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Analyzing Salesforce schema...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Schema Analysis</h1>
        <p className="text-gray-600 mt-2">
          Review and select objects to include in the migration
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Source Objects</p>
          <p className="text-2xl font-bold text-blue-600">{sourceObjects.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Selected</p>
          <p className="text-2xl font-bold text-green-600">{sourceObjects.filter(o => o.selected).length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Records</p>
          <p className="text-2xl font-bold text-purple-600">
            {sourceObjects.filter(o => o.selected).reduce((sum, obj) => sum + obj.recordCount, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Fields</p>
          <p className="text-2xl font-bold text-orange-600">
            {sourceObjects.filter(o => o.selected).reduce((sum, obj) => sum + obj.fieldCount, 0)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search objects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg ${filterType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              All Objects
            </button>
            <button
              onClick={() => setFilterType('cpq')}
              className={`px-4 py-2 rounded-lg ${filterType === 'cpq' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              CPQ Only
            </button>
            <button
              onClick={() => setFilterType('custom')}
              className={`px-4 py-2 rounded-lg ${filterType === 'custom' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Custom Objects
            </button>
          </div>
        </div>
      </div>

      {/* Source Objects Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
          <h2 className="text-lg font-semibold text-blue-900">Source Objects (SFDC CPQ)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Select</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Object</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Label</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Records</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Fields</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Relations</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSourceObjects.map((obj) => (
                <tr key={obj.name} className={`hover:bg-gray-50 ${obj.selected ? 'bg-blue-50' : ''}`}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={obj.selected}
                      onChange={() => toggleObjectSelection(obj.name, true)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-gray-900">{obj.name}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{obj.label}</td>
                  <td className="px-6 py-4 text-right text-sm text-gray-900">{obj.recordCount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-sm text-gray-900">{obj.fieldCount}</td>
                  <td className="px-6 py-4 text-right text-sm text-gray-900">{obj.relationships}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Target Objects Info */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="px-6 py-4 bg-green-50 border-b border-green-200">
          <h2 className="text-lg font-semibold text-green-900">Target Objects (Revenue Cloud)</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Selected source objects will be mapped to these Revenue Cloud objects:
          </p>
          <div className="grid grid-cols-2 gap-4">
            {targetObjects.filter(obj => obj.selected).map((obj) => (
              <div key={obj.name} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <p className="font-mono text-sm text-gray-900">{obj.name}</p>
                  <p className="text-xs text-gray-600">{obj.label}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">{obj.fieldCount} fields</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/wizard/connect?project=${projectId}`)}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          ← Back to Connections
        </button>

        <button
          onClick={handleNext}
          disabled={sourceObjects.filter(o => o.selected).length === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Field Mapping →
        </button>
      </div>
    </div>
  );
};
