import { useEffect, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { solicitacoesService, Solicitacao } from '../../services/solicitacoes.service';
import AppLayout from '../../components/layout/AppLayout';
import { toast } from 'sonner';

const statusConfig: Record<string, { label: string; color: string }> = {
  pendente:  { label: 'Aguardando aprovação', color: 'bg-amber-100 text-amber-700' },
  aprovada:  { label: 'Aprovada',             color: 'bg-green-100 text-green-700' },
  rejeitada: { label: 'Rejeitada',            color: 'bg-red-100 text-red-700'    },
};

const filtros = ['todas', 'pendente', 'aprovada', 'rejeitada'] as const;

export default function MinhasSolicitacoesPage() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [filtro, setFiltro] = useState<string>('todas');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    solicitacoesService
      .minhas()
      .then(setSolicitacoes)
      .catch(() => toast.error('Erro ao carregar solicitações'))
      .finally(() => setLoading(false));
  }, []);

  const visiveis = filtro === 'todas'
    ? solicitacoes
    : solicitacoes.filter((s) => s.status === filtro);

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">Minhas Solicitações</h1>
        </div>

        <div className="flex flex-wrap gap-2">
          {filtros.map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium capitalize transition-colors ${
                filtro === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : visiveis.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
            Nenhuma solicitação encontrada
          </div>
        ) : (
          <ul className="space-y-3">
            {visiveis.map((s) => {
              const cfg = statusConfig[s.status];
              return (
                <li key={s.id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-800">{s.ferramenta.nome}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {s.ferramenta.codigo} · {s.ferramenta.categoria}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Solicitado em {new Date(s.createdAt).toLocaleDateString('pt-BR')} ·{' '}
                        Prev. devolução: {new Date(s.previsaoDevolucao).toLocaleDateString('pt-BR')}
                      </p>
                      {s.observacoes && (
                        <p className="text-xs text-gray-500 mt-1 italic">"{s.observacoes}"</p>
                      )}
                      {s.motivoRejeicao && (
                        <p className="text-xs text-red-500 mt-1">
                          Motivo da rejeição: {s.motivoRejeicao}
                        </p>
                      )}
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AppLayout>
  );
}
