import { apiRequest } from './api';

import {
  DashboardData,
} from '../types/dashboard';


export async function getDashboardData(): Promise<DashboardData> {

  return apiRequest<DashboardData>(
    '/api/dashboard'
  );
}