import { useEffect, useState } from 'react';
import { CheckCircle, Clock, Package, Plus } from 'lucide-react';
import { solicitacoesService, Solicitacao } from '../../services/solicitacoes.service';
import { ferramentasService } from '../../services/ferramentas.service';
import AppLayout from '../../components/layout/AppLayout';
import { toast } from 'sonner';
import { Link } from 'react-router';

const statusConfig = {
  pendente: { label: 'Aguardando aprovação', color: 'bg-amber-50 border-amber-200 text-amber-700' },
  aprovada: { label: 'Aprovada', color: 'bg-green-50 border-green-200 text-green-700' },
  rejeitada: { label: 'Rejeitada', color: 'bg-red-50 border-red-200 text-red-700' },
};

export default function TecnicoDashboard() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [disponivel, setDisponivel] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      solicitacoesService.minhas(),
      ferramentasService.stats(),
    ])
      .then(([sol, stats]) => {
        setSolicitacoes(sol);
        setDisponivel(stats.disponivel);
      })
      .catch(() => toast.error('Erro ao carregar dados'))
      .finally(() => setLoading(false));
  }, []);

  const pendentes = solicitacoes.filter((s) => s.status === 'pendente').length;
  const aprovadas = solicitacoes.filter((s) => s.status === 'aprovada').length;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Dashboard — Técnico</h1>
          <div className="flex gap-2">
            <Link to="/disponibilidade" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" /> Solicitar Ferramenta
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-3">
                <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{disponivel}</p>
                  <p className="text-xs text-gray-500">Disponíveis</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{pendentes}</p>
                  <p className="text-xs text-gray-500">Pendentes</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{aprovadas}</p>
                  <p className="text-xs text-gray-500">Aprovadas</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-800 mb-4">Minhas Solicitações Recentes</h2>
              {solicitacoes.length === 0 ? (
                <p className="text-sm text-gray-400">Nenhuma solicitação feita ainda.</p>
              ) : (
                <ul className="space-y-3">
                  {solicitacoes.slice(0, 5).map((s) => {
                    const cfg = statusConfig[s.status];
                    return (
                      <li key={s.id} className={`p-3 rounded-xl border ${cfg.color}`}>
                        <p className="text-sm font-medium">{s.ferramenta.nome}</p>
                        <p className="text-xs mt-1">{new Date(s.createdAt).toLocaleDateString('pt-BR')}</p>
                        <span className="inline-block text-xs mt-1 font-medium">{cfg.label}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
