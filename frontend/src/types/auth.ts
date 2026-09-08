export type UserRole = 'employee' | 'admin';

export interface User {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginRequest {
  employeeId: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}