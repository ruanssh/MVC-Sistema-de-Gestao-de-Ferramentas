import { api } from './api';

export interface Usuario {
  id: string;
  nome: string;
  username: string;
  email: string;
  perfil: 'coordenador' | 'almoxarife' | 'tecnico';
}

export interface AuthResponse {
  access_token: string;
  user: Usuario;
}

export const authService = {
  async login(username: string, senha: string): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/login', { username, senha });
  },

  async register(data: {
    nome: string;
    username: string;
    email: string;
    senha: string;
    perfil: string;
  }): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/register', data);
  },

  async me(): Promise<Usuario> {
    return api.get<Usuario>('/auth/me');
  },
};
