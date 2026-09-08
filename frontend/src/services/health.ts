import { apiRequest } from './api';

export interface HealthResponse {
  status: string;
}

export async function checkBackendHealth(): Promise<HealthResponse> {
  return apiRequest<HealthResponse>('/health');
}