import apiClient from './api';
import type {
  FieldMapping,
  CreateFieldMappingRequest,
  UpdateFieldMappingRequest,
  BulkCreateMappingsRequest,
  AutoMapRequest,
  AutoMapSuggestion,
  ApiResponse,
  FieldMappingFilters
} from '../types/api';

/**
 * Field Mappings API Service
 * Handles all field mapping-related API calls
 */
class FieldMappingsService {
  private readonly basePath = '/field-mappings';

  /**
   * Get all field mappings for a project
   */
  async getFieldMappings(
    projectId: number,
    filters?: FieldMappingFilters
  ): Promise<FieldMapping[]> {
    const params = new URLSearchParams();
    
    if (filters?.objectName) params.append('objectName', filters.objectName);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.mappingType) params.append('mappingType', filters.mappingType);
    if (filters?.search) params.append('search', filters.search);

    const response = await apiClient.get<ApiResponse<FieldMapping[]>>(
      `/projects/${projectId}${this.basePath}${params.toString() ? '?' + params.toString() : ''}`
    );
    
    return response.data.data || [];
  }

  /**
   * Get a single field mapping by ID
   */
  async getFieldMapping(id: number): Promise<FieldMapping> {
    const response = await apiClient.get<ApiResponse<FieldMapping>>(
      `${this.basePath}/${id}`
    );
    
    if (!response.data.data) {
      throw new Error('Field mapping not found');
    }
    
    return response.data.data;
  }

  /**
   * Create a new field mapping
   */
  async createFieldMapping(
    projectId: number,
    data: CreateFieldMappingRequest
  ): Promise<FieldMapping> {
    const response = await apiClient.post<ApiResponse<FieldMapping>>(
      `/projects/${projectId}${this.basePath}`,
      data
    );
    
    if (!response.data.data) {
      throw new Error(response.data.message || 'Failed to create field mapping');
    }
    
    return response.data.data;
  }

  /**
   * Create multiple field mappings at once
   */
  async createFieldMappingsBulk(
    projectId: number,
    data: BulkCreateMappingsRequest
  ): Promise<FieldMapping[]> {
    const response = await apiClient.post<ApiResponse<FieldMapping[]>>(
      `/projects/${projectId}${this.basePath}/bulk`,
      data
    );
    
    if (!response.data.data) {
      throw new Error(response.data.message || 'Failed to create field mappings');
    }
    
    return response.data.data;
  }

  /**
   * Update an existing field mapping
   */
  async updateFieldMapping(
    id: number,
    data: UpdateFieldMappingRequest
  ): Promise<FieldMapping> {
    const response = await apiClient.put<ApiResponse<FieldMapping>>(
      `${this.basePath}/${id}`,
      data
    );
    
    if (!response.data.data) {
      throw new Error(response.data.message || 'Failed to update field mapping');
    }
    
    return response.data.data;
  }

  /**
   * Delete a field mapping
   */
  async deleteFieldMapping(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(
      `${this.basePath}/${id}`
    );
  }

  /**
   * Get auto-mapping suggestions
   */
  async getAutoMapSuggestions(
    projectId: number,
    data: AutoMapRequest
  ): Promise<AutoMapSuggestion[]> {
    const response = await apiClient.post<ApiResponse<AutoMapSuggestion[]>>(
      `/projects/${projectId}${this.basePath}/auto-map`,
      data
    );
    
    return response.data.data || [];
  }

  /**
   * Apply auto-mapping suggestions
   */
  async applyAutoMapSuggestions(
    projectId: number,
    suggestions: AutoMapSuggestion[]
  ): Promise<FieldMapping[]> {
    const mappings: CreateFieldMappingRequest[] = suggestions.map(s => ({
      sourceObject: s.sourceObject,
      sourceField: s.sourceField,
      targetObject: s.targetObject,
      targetField: s.targetField,
      mappingType: s.mappingType
    }));

    return this.createFieldMappingsBulk(projectId, { mappings });
  }

  /**
   * Get field mappings grouped by source object
   */
  async getFieldMappingsByObject(
    projectId: number
  ): Promise<Record<string, FieldMapping[]>> {
    const mappings = await this.getFieldMappings(projectId);
    
    return mappings.reduce((acc, mapping) => {
      const objectName = mapping.source_object;
      if (!acc[objectName]) {
        acc[objectName] = [];
      }
      acc[objectName].push(mapping);
      return acc;
    }, {} as Record<string, FieldMapping[]>);
  }

  /**
   * Get mapping statistics for a project
   */
  async getMappingStats(projectId: number): Promise<{
    total: number;
    pending: number;
    validated: number;
    approved: number;
    rejected: number;
    highConfidence: number;
    mediumConfidence: number;
    lowConfidence: number;
  }> {
    const mappings = await this.getFieldMappings(projectId);
    
    return {
      total: mappings.length,
      pending: mappings.filter(m => m.status === 'pending').length,
      validated: mappings.filter(m => m.status === 'validated').length,
      approved: mappings.filter(m => m.status === 'approved').length,
      rejected: mappings.filter(m => m.status === 'rejected').length,
      highConfidence: mappings.filter(m => (m.confidence_score || 0) >= 85).length,
      mediumConfidence: mappings.filter(m => {
        const score = m.confidence_score || 0;
        return score >= 60 && score < 85;
      }).length,
      lowConfidence: mappings.filter(m => (m.confidence_score || 0) < 60).length
    };
  }

  /**
   * Validate a field mapping
   */
  async validateMapping(id: number): Promise<FieldMapping> {
    return this.updateFieldMapping(id, { status: 'validated' });
  }

  /**
   * Approve a field mapping
   */
  async approveMapping(id: number): Promise<FieldMapping> {
    return this.updateFieldMapping(id, { status: 'approved' });
  }

  /**
   * Reject a field mapping
   */
  async rejectMapping(id: number): Promise<FieldMapping> {
    return this.updateFieldMapping(id, { status: 'rejected' });
  }

  /**
   * Bulk update mapping statuses
   */
  async bulkUpdateStatus(
    ids: number[],
    status: 'validated' | 'approved' | 'rejected'
  ): Promise<FieldMapping[]> {
    const promises = ids.map(id => this.updateFieldMapping(id, { status }));
    return Promise.all(promises);
  }
}

// Export singleton instance
export const fieldMappingsService = new FieldMappingsService();
export default fieldMappingsService;
