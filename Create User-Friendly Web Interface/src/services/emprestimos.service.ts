import { api } from './api';

export interface Emprestimo {
  id: string;
  ferramentaId: string;
  responsavelId: string;
  setor?: string;
  dataRetirada: string;
  dataDevolucaoPrevista: string;
  dataDevolucaoReal?: string;
  status: 'ativo' | 'devolvido' | 'atrasado';
  observacoes?: string;
  ferramenta: { id: string; codigo: string; nome: string; categoria: string };
  responsavel: { id: string; nome: string; username: string };
  registradoPor: { id: string; nome: string };
}

export interface EmprestimoStats {
  total: number;
  ativos: number;
  atrasados: number;
  devolvidos: number;
}

export const emprestimosService = {
  findAll(params?: { status?: string; responsavelId?: string }): Promise<Emprestimo[]> {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.responsavelId) q.set('responsavelId', params.responsavelId);
    return api.get<Emprestimo[]>(`/emprestimos?${q}`);
  },

  findOne(id: string): Promise<Emprestimo> {
    return api.get<Emprestimo>(`/emprestimos/${id}`);
  },

  create(data: {
    ferramentaId: string;
    responsavelId: string;
    setor?: string;
    dataDevolucaoPrevista: string;
    observacoes?: string;
  }): Promise<Emprestimo> {
    return api.post<Emprestimo>('/emprestimos', data);
  },

  devolver(id: string, observacoes?: string): Promise<Emprestimo> {
    return api.patch<Emprestimo>(`/emprestimos/${id}/devolver`, { observacoes });
  },

  stats(): Promise<EmprestimoStats> {
    return api.get<EmprestimoStats>('/emprestimos/stats');
  },

  maisUtilizadas(): Promise<{ ferramenta: any; total: number }[]> {
    return api.get('/emprestimos/mais-utilizadas');
  },
};
