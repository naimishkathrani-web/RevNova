import apiClient from './api';
import type {
  Connection,
  CreateConnectionRequest,
  UpdateConnectionRequest,
  TestConnectionRequest,
  TestConnectionResponse,
  ApiResponse,
  ConnectionFilters
} from '../types/api';

/**
 * Connections API Service
 * Handles all connection-related API calls
 */
class ConnectionsService {
  private readonly basePath = '/connections';

  /**
   * Test Salesforce connection credentials
   */
  async testConnection(data: TestConnectionRequest): Promise<TestConnectionResponse> {
    try {
      const response = await apiClient.post<ApiResponse<TestConnectionResponse>>(
        `${this.basePath}/test`,
        data
      );
      
      return response.data.data || { success: false, error: 'Unknown error' };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Connection test failed'
      };
    }
  }

  /**
   * Get all connections for a project
   */
  async getConnectionsByProject(
    projectId: number,
    filters?: ConnectionFilters
  ): Promise<Connection[]> {
    const params = new URLSearchParams();
    
    if (filters?.connectionType) params.append('connectionType', filters.connectionType);
    if (filters?.status) params.append('status', filters.status);

    const response = await apiClient.get<ApiResponse<Connection[]>>(
      `/projects/${projectId}${this.basePath}${params.toString() ? '?' + params.toString() : ''}`
    );
    
    return response.data.data || [];
  }

  /**
   * Get a single connection by ID
   */
  async getConnection(id: number): Promise<Connection> {
    const response = await apiClient.get<ApiResponse<Connection>>(
      `${this.basePath}/${id}`
    );
    
    if (!response.data.data) {
      throw new Error('Connection not found');
    }
    
    return response.data.data;
  }

  /**
   * Create a new connection
   */
  async createConnection(
    projectId: number,
    data: CreateConnectionRequest
  ): Promise<Connection> {
    const response = await apiClient.post<ApiResponse<Connection>>(
      `/projects/${projectId}${this.basePath}`,
      data
    );
    
    if (!response.data.data) {
      throw new Error(response.data.message || 'Failed to create connection');
    }
    
    return response.data.data;
  }

  /**
   * Update an existing connection
   */
  async updateConnection(
    id: number,
    data: UpdateConnectionRequest
  ): Promise<Connection> {
    const response = await apiClient.put<ApiResponse<Connection>>(
      `${this.basePath}/${id}`,
      data
    );
    
    if (!response.data.data) {
      throw new Error(response.data.message || 'Failed to update connection');
    }
    
    return response.data.data;
  }

  /**
   * Delete a connection
   */
  async deleteConnection(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(
      `${this.basePath}/${id}`
    );
  }

  /**
   * Refresh OAuth token for a connection
   */
  async refreshToken(id: number): Promise<Connection> {
    const response = await apiClient.post<ApiResponse<Connection>>(
      `${this.basePath}/${id}/refresh`
    );
    
    if (!response.data.data) {
      throw new Error(response.data.message || 'Failed to refresh token');
    }
    
    return response.data.data;
  }

  /**
   * Get source connection for a project
   */
  async getSourceConnection(projectId: number): Promise<Connection | null> {
    const connections = await this.getConnectionsByProject(projectId, {
      connectionType: 'source'
    });
    
    return connections.length > 0 ? connections[0] : null;
  }

  /**
   * Get target connection for a project
   */
  async getTargetConnection(projectId: number): Promise<Connection | null> {
    const connections = await this.getConnectionsByProject(projectId, {
      connectionType: 'target'
    });
    
    return connections.length > 0 ? connections[0] : null;
  }

  /**
   * Check if project has both source and target connections
   */
  async hasCompleteConnections(projectId: number): Promise<boolean> {
    const connections = await this.getConnectionsByProject(projectId);
    const hasSource = connections.some(c => c.connection_type === 'source');
    const hasTarget = connections.some(c => c.connection_type === 'target');
    
    return hasSource && hasTarget;
  }
}

// Export singleton instance
export const connectionsService = new ConnectionsService();
export default connectionsService;
