// frontend/src/services/migrationService.ts
import apiClient from './api';

export interface HealthResponse {
  status: string;
  message: string;
  timestamp: string;
  database: string;
}

export const migrationService = {
  // Health check
  checkHealth: async (): Promise<HealthResponse> => {
    const response = await apiClient.get<HealthResponse>('/health');
    return response.data;
  },

  // Create migration (placeholder for Week 2)
  createMigration: async (name: string) => {
    const response = await apiClient.post('/migrations', { name });
    return response.data;
  },

  // Get migrations list (placeholder)
  getMigrations: async () => {
    const response = await apiClient.get('/migrations');
    return response.data;
  },
};
