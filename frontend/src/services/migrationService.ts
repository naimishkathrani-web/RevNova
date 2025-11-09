import apiClient from './api';

export interface MigrationRequest {
  sourceEnv: string;
  targetEnv: string;
  entities: string[];
}

export interface MigrationResponse {
  status: string;
  message: string;
  migratedCount: number;
}

export interface HealthResponse {
  status: string;
  message: string;
  timestamp?: string;
  database?: string;
}

export const migrationService = {
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

  // Start migration / status helpers (legacy helpers kept)
  startMigration: async (data: MigrationRequest): Promise<MigrationResponse> => {
    const response = await apiClient.post<MigrationResponse>('/migration/start', data);
    return response.data;
  },

  getMigrationStatus: async (): Promise<MigrationResponse> => {
    const response = await apiClient.get<MigrationResponse>('/migration/status');
    return response.data;
  },
};
