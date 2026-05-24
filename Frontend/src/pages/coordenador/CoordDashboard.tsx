import { useEffect, useState } from 'react';
import { Package, ClipboardList, AlertCircle, TrendingUp, BarChart3, FileText } from 'lucide-react';
import { ferramentasService, FerramentaStats } from '../../services/ferramentas.service';
import { emprestimosService, EmprestimoStats } from '../../services/emprestimos.service';
import { Link } from 'react-router';
import AppLayout from '../../components/layout/AppLayout';
import { toast } from 'sonner';

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

export default function CoordDashboard() {
  const [fStats, setFStats] = useState<FerramentaStats | null>(null);
  const [eStats, setEStats] = useState<EmprestimoStats | null>(null);
  const [maisUsadas, setMaisUsadas] = useState<{ ferramenta: any; total: number }[]>([]);
  const [categorias, setCategorias] = useState<{ categoria: string; total: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ferramentasService.stats(),
      emprestimosService.stats(),
      emprestimosService.maisUtilizadas(),
      ferramentasService.categorias(),
    ])
      .then(([fs, es, mu, cat]) => {
        setFStats(fs);
        setEStats(es);
        setMaisUsadas(mu);
        setCategorias(cat);
      })
      .catch(() => toast.error('Erro ao carregar dados'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Dashboard — Coordenador</h1>
          <Link to="/relatorios" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
            <FileText className="w-4 h-4" />
            Relatórios Gerenciais
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Package} label="Total Ferramentas" value={fStats?.total} color="bg-blue-50 text-blue-600" />
              <StatCard icon={ClipboardList} label="Em Uso" value={fStats?.emprestada} color="bg-amber-50 text-amber-600" />
              <StatCard icon={AlertCircle} label="Atrasadas" value={eStats?.atrasados} color="bg-red-50 text-red-600" />
              <StatCard icon={TrendingUp} label="Total Empréstimos" value={eStats?.total} color="bg-green-50 text-green-600" />
            </div>

            {(eStats?.atrasados ?? 0) > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <p className="text-sm text-red-700">
                  <strong>Atenção: Devoluções Atrasadas</strong> — Há {eStats?.atrasados} ferramenta(s) com devolução em atraso.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="font-semibold text-gray-800 mb-4">Ferramentas Mais Utilizadas</h2>
                {maisUsadas.length === 0 ? (
                  <p className="text-sm text-gray-400">Nenhum dado disponível</p>
                ) : (
                  <ol className="space-y-2">
                    {maisUsadas.map((item, i) => (
                      <li key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{item.ferramenta?.nome}</p>
                            <p className="text-xs text-gray-400">{item.ferramenta?.codigo}</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-blue-600">{item.total}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> Distribuição por Categoria
                </h2>
                {categorias.length === 0 ? (
                  <p className="text-sm text-gray-400">Nenhum dado disponível</p>
                ) : (
                  <ul className="space-y-2">
                    {categorias.map((c) => (
                      <li key={c.categoria} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{c.categoria}</span>
                        <span className="text-sm font-bold text-gray-900">{c.total}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
