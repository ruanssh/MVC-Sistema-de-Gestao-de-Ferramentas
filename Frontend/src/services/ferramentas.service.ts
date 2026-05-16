import { api } from './api';

export interface Ferramenta {
  id: string;
  codigo: string;
  nome: string;
  categoria: string;
  marca?: string;
  estado: 'disponivel' | 'emprestada' | 'manutencao' | 'danificada';
  estadoConservacao: 'excelente' | 'bom' | 'regular' | 'ruim';
  quantidade: number;
  localizacao?: string;
  observacoes?: string;
}

export interface FerramentaStats {
  total: number;
  disponivel: number;
  emprestada: number;
  manutencao: number;
  danificada: number;
}

export const ferramentasService = {
  findAll(params?: { search?: string; categoria?: string; estado?: string }): Promise<Ferramenta[]> {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.categoria) q.set('categoria', params.categoria);
    if (params?.estado) q.set('estado', params.estado);
    return api.get<Ferramenta[]>(`/ferramentas?${q}`);
  },

  findOne(id: string): Promise<Ferramenta> {
    return api.get<Ferramenta>(`/ferramentas/${id}`);
  },

  create(data: Partial<Ferramenta>): Promise<Ferramenta> {
    return api.post<Ferramenta>('/ferramentas', data);
  },

  update(id: string, data: Partial<Ferramenta>): Promise<Ferramenta> {
    return api.put<Ferramenta>(`/ferramentas/${id}`, data);
  },

  updateEstado(id: string, estado: string): Promise<Ferramenta> {
    return api.patch<Ferramenta>(`/ferramentas/${id}/estado`, { estado });
  },

  remove(id: string): Promise<void> {
    return api.delete<void>(`/ferramentas/${id}`);
  },

  stats(): Promise<FerramentaStats> {
    return api.get<FerramentaStats>('/ferramentas/stats');
  },

  categorias(): Promise<{ categoria: string; total: number }[]> {
    return api.get('/ferramentas/categorias');
  },
};
