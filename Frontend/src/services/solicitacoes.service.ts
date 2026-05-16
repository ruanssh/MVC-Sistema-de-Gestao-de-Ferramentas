import { api } from './api';

export interface Solicitacao {
  id: string;
  ferramentaId: string;
  solicitanteId: string;
  previsaoDevolucao: string;
  observacoes?: string;
  status: 'pendente' | 'aprovada' | 'rejeitada';
  motivoRejeicao?: string;
  ferramenta: { id: string; codigo: string; nome: string; categoria: string; estado: string };
  solicitante: { id: string; nome: string; username: string };
  createdAt: string;
}

export const solicitacoesService = {
  findAll(params?: { status?: string }): Promise<Solicitacao[]> {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    return api.get<Solicitacao[]>(`/solicitacoes?${q}`);
  },

  minhas(): Promise<Solicitacao[]> {
    return api.get<Solicitacao[]>('/solicitacoes/minhas');
  },

  create(data: {
    ferramentaId: string;
    previsaoDevolucao: string;
    observacoes?: string;
  }): Promise<Solicitacao> {
    return api.post<Solicitacao>('/solicitacoes', data);
  },

  aprovar(id: string): Promise<Solicitacao> {
    return api.patch<Solicitacao>(`/solicitacoes/${id}/aprovar`);
  },

  rejeitar(id: string, motivoRejeicao: string): Promise<Solicitacao> {
    return api.patch<Solicitacao>(`/solicitacoes/${id}/rejeitar`, { motivoRejeicao });
  },
};
