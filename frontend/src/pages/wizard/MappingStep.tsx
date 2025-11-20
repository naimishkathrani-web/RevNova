// frontend/src/pages/wizard/MappingStep.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fieldMappingsService } from '../../services';
import { connectionsService } from '../../services';
import type { FieldMapping, AutoMapSuggestion, Connection, MappingStatus, MappingType } from '../../types/api';

export const MappingStep: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');

  // State
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [suggestions, setSuggestions] = useState<AutoMapSuggestion[]>([]);
  const [sourceConnection, setSourceConnection] = useState<Connection | null>(null);
  const [targetConnection, setTargetConnection] = useState<Connection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<MappingStatus | 'all'>('all');
  const [selectedWorkstream, setSelectedWorkstream] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [generatingAI, setGeneratingAI] = useState(false);
  const [stats, setStats] = useState<any>(null);

  // Load data on mount
  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  const loadData = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      setError(null);

      // Load connections
      const source = await connectionsService.getSourceConnection(projectId);
      const target = await connectionsService.getTargetConnection(projectId);
      setSourceConnection(source);
      setTargetConnection(target);

      // Load mappings
      const mappingsData = await fieldMappingsService.getFieldMappings(projectId);
      setMappings(mappingsData);

      // Load stats
      const statsData = await fieldMappingsService.getMappingStats(projectId);
      setStats(statsData);

    } catch (err: any) {
      setError(err.message || 'Failed to load field mappings');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoMap = async () => {
    if (!projectId || !sourceConnection || !targetConnection) return;

    try {
      setGeneratingAI(true);
      setError(null);

      // Get AI suggestions
      const aiSuggestions = await fieldMappingsService.getAutoMapSuggestions(projectId, {
        sourceObject: 'Product2',
        targetObject: 'vlocity_cmt__CatalogItem__c',
        includeTransformLogic: true,
      });

      setSuggestions(aiSuggestions);
      setShowSuggestions(true);

    } catch (err: any) {
      setError(err.message || 'Failed to generate AI suggestions');
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleApplySuggestions = async () => {
    if (!projectId || suggestions.length === 0) return;

    try {
      setLoading(true);
      setError(null);

      await fieldMappingsService.applyAutoMapSuggestions(projectId, suggestions);
      
      // Reload mappings
      await loadData();
      setShowSuggestions(false);
      setSuggestions([]);

    } catch (err: any) {
      setError(err.message || 'Failed to apply suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (mappingId: string, status: MappingStatus) => {
    try {
      if (status === 'validated') {
        await fieldMappingsService.validateMapping(mappingId);
      } else if (status === 'approved') {
        await fieldMappingsService.approveMapping(mappingId);
      } else if (status === 'rejected') {
        await fieldMappingsService.rejectMapping(mappingId);
      }

      // Reload mappings
      await loadData();

    } catch (err: any) {
      setError(err.message || 'Failed to update mapping status');
    }
  };

  const handleDeleteMapping = async (mappingId: string) => {
    if (!confirm('Are you sure you want to delete this mapping?')) return;

    try {
      await fieldMappingsService.deleteFieldMapping(mappingId);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete mapping');
    }
  };

  // Filter mappings
  const filteredMappings = mappings.filter(mapping => {
    const statusMatch = selectedStatus === 'all' || mapping.status === selectedStatus;
    const searchMatch = !searchTerm || 
      mapping.sourceField?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mapping.targetField?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mapping.sourceObject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mapping.targetObject?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && searchMatch;
  });

  // Group by workstream
  const workstreams = [
    { id: 'WS1', name: 'Product Catalog', objects: ['Product2', 'PricebookEntry'] },
    { id: 'WS1A', name: 'Product Configuration', objects: ['SBQQ__ProductRule__c', 'SBQQ__ConfigurationAttribute__c'] },
    { id: 'WS1B', name: 'Offers & Pricing', objects: ['vlocity_cmt__Offer__c', 'vlocity_cmt__PriceListEntry__c'] },
    { id: 'WS2', name: 'Quotes', objects: ['SBQQ__Quote__c', 'SBQQ__QuoteLine__c'] },
    { id: 'WS2A', name: 'Pricing Rules', objects: ['SBQQ__PriceRule__c', 'SBQQ__PriceCondition__c'] },
  ];

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 85) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">High ({confidence}%)</span>;
    } else if (confidence >= 60) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Medium ({confidence}%)</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Low ({confidence}%)</span>;
    }
  };

  const getStatusBadge = (status: MappingStatus) => {
    const styles = {
      pending: 'bg-gray-100 text-gray-800',
      validated: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>{status}</span>;
  };

  const getMappingTypeIcon = (type: MappingType) => {
    const icons = {
      direct: '→',
      transform: '⚡',
      lookup: '🔍',
      calculated: '∑',
      formula: 'ƒ',
    };
    return icons[type] || '→';
  };

  const getComplexityColor = (complexity: string) => {
    if (complexity === 'Simple') return 'text-green-600';
    if (complexity === 'Medium') return 'text-yellow-600';
    if (complexity === 'Complex') return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading && mappings.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading field mappings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">{error}</p>
        <button 
          onClick={loadData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Field Mapping</h1>
            <p className="text-sm text-gray-600 mt-1">
              Map fields from {sourceConnection?.instanceUrl || 'Source'} to {targetConnection?.instanceUrl || 'Target'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleAutoMap}
              disabled={generatingAI}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
            >
              {generatingAI ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <span>✨</span> Auto-Map with AI
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-600">Total Mappings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-xs text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved || 0}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-xs text-gray-600">Validated</p>
              <p className="text-2xl font-bold text-blue-600">{stats.validated || 0}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-xs text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</p>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search fields or objects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as MappingStatus | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="validated">Validated</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Workstream Filter */}
          <select
            value={selectedWorkstream}
            onChange={(e) => setSelectedWorkstream(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Workstreams</option>
            {workstreams.map(ws => (
              <option key={ws.id} value={ws.id}>{ws.id} - {ws.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* AI Suggestions Panel */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="bg-purple-50 border-b border-purple-200 px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-purple-900 flex items-center gap-2">
                <span>✨</span> AI-Generated Mapping Suggestions
              </h3>
              <p className="text-sm text-purple-700 mt-1">
                Found {suggestions.length} intelligent field mapping suggestions
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleApplySuggestions}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Apply All ({suggestions.length})
              </button>
              <button
                onClick={() => setShowSuggestions(false)}
                className="px-4 py-2 bg-white border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-100"
              >
                Dismiss
              </button>
            </div>
          </div>

          {/* Suggestions Table */}
          <div className="mt-4 bg-white rounded-lg border border-purple-200 overflow-hidden">
            <table className="min-w-full divide-y divide-purple-200">
              <thead className="bg-purple-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-purple-900 uppercase">Source</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-purple-900 uppercase">Target</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-purple-900 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-purple-900 uppercase">Confidence</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-purple-900 uppercase">Reasoning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100">
                {suggestions.map((suggestion, idx) => (
                  <tr key={idx} className="hover:bg-purple-50">
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-gray-900">{suggestion.sourceField}</div>
                      <div className="text-xs text-gray-500">{suggestion.sourceObject}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-gray-900">{suggestion.targetField}</div>
                      <div className="text-xs text-gray-500">{suggestion.targetObject}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="font-mono text-xs px-2 py-1 bg-gray-100 rounded">
                        {getMappingTypeIcon(suggestion.mappingType)} {suggestion.mappingType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {getConfidenceBadge(suggestion.confidence)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {suggestion.reasoning?.substring(0, 80)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mappings Table */}
      <div className="px-6 py-4">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredMappings.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No mappings found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by using AI Auto-Map or add mappings manually.</p>
              <div className="mt-6">
                <button
                  onClick={handleAutoMap}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Generate AI Mappings
                </button>
              </div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complexity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMappings.map((mapping) => (
                  <tr key={mapping.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{mapping.sourceField}</div>
                      <div className="text-xs text-gray-500">{mapping.sourceObject}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{mapping.targetField}</div>
                      <div className="text-xs text-gray-500">{mapping.targetObject}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono px-2 py-1 bg-gray-100 rounded">
                        {getMappingTypeIcon(mapping.mappingType)} {mapping.mappingType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${getComplexityColor(mapping.complexity || 'Simple')}`}>
                        {mapping.complexity || 'Simple'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {mapping.confidence !== undefined ? getConfidenceBadge(mapping.confidence) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(mapping.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {mapping.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(mapping.id, 'validated')}
                            className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                            title="Validate"
                          >
                            ✓
                          </button>
                        )}
                        {mapping.status === 'validated' && (
                          <button
                            onClick={() => handleUpdateStatus(mapping.id, 'approved')}
                            className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                            title="Approve"
                          >
                            ✓✓
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteMapping(mapping.id)}
                          className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          title="Delete"
                        >
                          ×
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Results count */}
        {filteredMappings.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredMappings.length} of {mappings.length} mappings
          </div>
        )}
      </div>
    </div>
  );
};
