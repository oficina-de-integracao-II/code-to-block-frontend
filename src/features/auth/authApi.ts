import { api } from '../../services/api';

export type RegisterPayload = {
  nome: string;
  email: string;
  senha: string;
};

export type RegisterResponse = {
  id: string;
  nome: string;
  email: string;
};

export function registerUser(payload: RegisterPayload) {
  return api.post<RegisterResponse>('/auth/register', payload);
}
