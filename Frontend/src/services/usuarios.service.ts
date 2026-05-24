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

  resetPassword(id: string, novaSenha: string): Promise<{ message: string }> {
    return api.patch(`/usuarios/${id}/reset-password`, { novaSenha });
  },

  deactivate(id: string): Promise<{ id: string; nome: string; ativo: boolean }> {
    return api.patch(`/usuarios/${id}/desativar`, {});
  },
};
