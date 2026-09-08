import { apiRequest } from './api';


export interface LoginUser {
  employee_id: string;
  name: string;
  email: string;
  department: string | null;
  job_title: string | null;
  role: string | null;
}


export interface LoginResponse {
  status: string;
  access_token: string;
  token_type: string;
  expires_in: number;
  user: LoginUser;
}


export interface MeResponse {
  status: string;
  user: LoginUser;
}


export async function login(
  employeeId: string,
  password: string
): Promise<LoginResponse> {

  return apiRequest<LoginResponse>(
    '/api/auth/login',
    {
      method: 'POST',
      body: {
        employee_id: employeeId,
        password,
      },
    }
  );
}


export async function getCurrentUser(): Promise<MeResponse> {

  return apiRequest<MeResponse>(
    '/api/auth/me'
  );
}