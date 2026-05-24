import { useEffect, useState } from 'react';
import { CheckCircle, ClipboardList, AlertCircle, Clock, Plus, Bell } from 'lucide-react';
import { ferramentasService, FerramentaStats } from '../../services/ferramentas.service';
import { emprestimosService, Emprestimo, EmprestimoStats } from '../../services/emprestimos.service';
import { solicitacoesService, Solicitacao } from '../../services/solicitacoes.service';
import AppLayout from '../../components/layout/AppLayout';
import { toast } from 'sonner';
import { Link } from 'react-router';

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function AlmoxDashboard() {
  const [fStats, setFStats] = useState<FerramentaStats | null>(null);
  const [eStats, setEStats] = useState<EmprestimoStats | null>(null);
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [pendentes, setPendentes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      ferramentasService.stats(),
      emprestimosService.findAll(),
      solicitacoesService.findAll({ status: 'pendente' }),
      emprestimosService.stats(),
    ])
      .then(([fs, emp, sol, es]) => {
        setFStats(fs);
        setEmprestimos(emp);
        setPendentes(sol);
        setEStats(es);
      })
      .catch(() => toast.error('Erro ao carregar dados'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDevolver = async (id: string) => {
    try {
      await emprestimosService.devolver(id);
      toast.success('Devolução registrada');
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900 mr-auto">Dashboard — Almoxarife</h1>
          <Link to="/catalogo" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Cadastrar Ferramenta
          </Link>
          <Link to="/emprestimos" className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            <ClipboardList className="w-4 h-4" /> Registrar Empréstimo
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={CheckCircle} label="Disponíveis" value={fStats?.disponivel} color="bg-green-50 text-green-600" />
              <StatCard icon={ClipboardList} label="Emprestadas" value={fStats?.emprestada} color="bg-blue-50 text-blue-600" />
              <StatCard icon={AlertCircle} label="Atrasadas" value={eStats?.atrasados} color="bg-red-50 text-red-600" />
              <StatCard icon={Clock} label="Manutenção" value={fStats?.manutencao} color="bg-amber-50 text-amber-600" />
            </div>

            {(eStats?.atrasados ?? 0) > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <p className="text-sm text-red-700">
                  <strong>Devoluções atrasadas:</strong> {eStats?.atrasados} ferramenta(s) com devolução em atraso.{' '}
                  <Link to="/emprestimos" className="underline font-medium">Ver empréstimos</Link>
                </p>
              </div>
            )}

            {pendentes.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                <Bell className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-sm text-amber-700">
                  <strong>Solicitações pendentes:</strong> {pendentes.length} aguardando aprovação.{' '}
                  <Link to="/solicitacoes" className="underline font-medium">Ver solicitações</Link>
                </p>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-800 mb-4">Empréstimos em Aberto</h2>
              {emprestimos.filter(e => e.status !== 'devolvido').length === 0 ? (
                <p className="text-sm text-gray-400">Nenhum empréstimo em aberto no momento</p>
              ) : (
                <ul className="space-y-3">
                  {emprestimos.filter(e => e.status !== 'devolvido').map((e) => (
                    <li key={e.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{e.ferramenta.nome}</p>
                        <p className="text-xs text-gray-500">
                          {e.responsavel.nome} · {new Date(e.dataDevolucaoPrevista).toLocaleDateString('pt-BR')}
                          {e.status === 'atrasado' && (
                            <span className="ml-2 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">Atrasado</span>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDevolver(e.id)}
                        className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Devolver
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
