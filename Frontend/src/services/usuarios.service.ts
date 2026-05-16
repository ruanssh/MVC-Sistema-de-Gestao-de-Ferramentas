import { api } from './api';

export interface UsuarioLista {
  id: string;
  nome: string;
  username: string;
  email: string;
  perfil: string;
}

export const usuariosService = {
  findAll(): Promise<UsuarioLista[]> {
    return api.get<UsuarioLista[]>('/usuarios');
  },

  findByPerfil(perfil: string): Promise<UsuarioLista[]> {
    return api.get<UsuarioLista[]>(`/usuarios?perfil=${perfil}`);
  },
};
