import { api } from '../../services/api';

export type AuthUser = {
  id: number;
  nome: string;
  email: string;
  role: 'USER' | 'ADMIN';
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

export type RegisterPayload = {
  nome: string;
  email: string;
  senha: string;
};

export function registerUser(payload: RegisterPayload) {
  return api.post<AuthResponse>('/auth/register', payload);
}

export type LoginPayload = {
  email: string;
  senha: string;
};

export function loginUser(payload: LoginPayload) {
  return api.post<AuthResponse>('/auth/login', payload);
}
