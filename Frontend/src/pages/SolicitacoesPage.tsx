import { useEffect, useState } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { solicitacoesService, Solicitacao } from '../services/solicitacoes.service';
import AppLayout from '../components/layout/AppLayout';
import { toast } from 'sonner';

const statusConfig: Record<string, { label: string; color: string }> = {
  pendente: { label: 'Pendente', color: 'bg-amber-100 text-amber-700' },
  aprovada: { label: 'Aprovada', color: 'bg-green-100 text-green-700' },
  rejeitada: { label: 'Rejeitada', color: 'bg-red-100 text-red-700' },
};

export default function SolicitacoesPage() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todas');
  const [rejeitando, setRejeitando] = useState<string | null>(null);
  const [motivo, setMotivo] = useState('');

  const load = () => {
    setLoading(true);
    solicitacoesService
      .findAll({ status: filter !== 'todas' ? filter : undefined })
      .then(setSolicitacoes)
      .catch(() => toast.error('Erro ao carregar'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const handleAprovar = async (id: string) => {
    try {
      await solicitacoesService.aprovar(id);
      toast.success('Solicitação aprovada — empréstimo criado');
      load();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleRejeitar = async () => {
    if (!rejeitando) return;
    try {
      await solicitacoesService.rejeitar(rejeitando, motivo);
      toast.success('Solicitação rejeitada');
      setRejeitando(null);
      setMotivo('');
      load();
    } catch (err: any) { toast.error(err.message); }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-5">
        <h1 className="text-xl font-bold text-gray-900">Solicitações</h1>

        <div className="flex gap-2">
          {['todas', 'pendente', 'aprovada', 'rejeitada'].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium capitalize transition-colors ${filter === s ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>
        ) : (
          <div className="space-y-3">
            {solicitacoes.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">Nenhuma solicitação encontrada</div>
            ) : solicitacoes.map((s) => {
              const cfg = statusConfig[s.status];
              return (
                <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{s.ferramenta.nome}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{s.ferramenta.codigo} · Solicitante: {s.solicitante.nome}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Solicitado em {new Date(s.createdAt).toLocaleDateString('pt-BR')} · Prev. devolução: {new Date(s.previsaoDevolucao).toLocaleDateString('pt-BR')}
                      </p>
                      {s.observacoes && <p className="text-xs text-gray-500 mt-1 italic">"{s.observacoes}"</p>}
                      {s.motivoRejeicao && <p className="text-xs text-red-500 mt-1">Motivo: {s.motivoRejeicao}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                      {s.status === 'pendente' && (
                        <>
                          <button onClick={() => handleAprovar(s.id)} className="flex items-center gap-1 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors">
                            <CheckCircle className="w-3.5 h-3.5" /> Aprovar
                          </button>
                          <button onClick={() => { setRejeitando(s.id); setMotivo(''); }} className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors">
                            <X className="w-3.5 h-3.5" /> Rejeitar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {rejeitando && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Rejeitar Solicitação</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo da rejeição</label>
                <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setRejeitando(null)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">Cancelar</button>
                <button onClick={handleRejeitar} className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-red-700">Confirmar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
