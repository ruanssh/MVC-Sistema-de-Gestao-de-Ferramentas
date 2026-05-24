import { useEffect, useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { api } from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import { toast } from 'sonner';
import { BarChart3, AlertCircle, ClipboardList, CheckCircle, Clock } from 'lucide-react';

const statusConfig: Record<string, string> = {
  ativo: 'bg-blue-100 text-blue-700',
  atrasado: 'bg-red-100 text-red-700',
  devolvido: 'bg-green-100 text-green-700',
};

const BAR_COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#be185d', '#65a30d'];

type Tipo = 'ferramenta' | 'colaborador' | 'atrasos' | 'periodo';

interface DashboardStats {
  ferramentasStats: { estado: string; _count: { estado: number } }[];
  emprestimosStats: { status: string; _count: { status: number } }[];
  atrasados: number;
  novosMes: number;
}

export default function RelatoriosPage() {
  const [tipo, setTipo] = useState<Tipo>('ferramenta');
  const [dados, setDados] = useState<any[]>([]);
  const [dashStats, setDashStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');

  useEffect(() => {
    api.get<DashboardStats>('/relatorios/dashboard')
      .then(setDashStats)
      .catch(() => {});
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      let data: any[] = [];
      if (tipo === 'ferramenta') data = await api.get<any[]>('/relatorios/por-ferramenta');
      else if (tipo === 'colaborador') data = await api.get<any[]>('/relatorios/por-colaborador');
      else if (tipo === 'atrasos') data = await api.get<any[]>('/relatorios/atrasos');
      else if (tipo === 'periodo' && inicio && fim)
        data = await api.get<any[]>(`/relatorios/por-periodo?inicio=${inicio}&fim=${fim}`);
      setDados(data);
    } catch { toast.error('Erro ao gerar relatório'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (tipo !== 'periodo') load(); }, [tipo]);

  const chartData = useMemo(() => {
    const grouped: Record<string, number> = {};
    dados.forEach((e) => {
      const key = tipo === 'colaborador'
        ? (e.responsavel?.nome || 'N/A')
        : (e.ferramenta?.nome || 'N/A');
      grouped[key] = (grouped[key] || 0) + 1;
    });
    return Object.entries(grouped)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [dados, tipo]);

  const statCards = useMemo(() => {
    if (!dashStats) return [];
    const fMap = Object.fromEntries(dashStats.ferramentasStats.map((f) => [f.estado, f._count.estado]));
    const eMap = Object.fromEntries(dashStats.emprestimosStats.map((e) => [e.status, e._count.status]));
    return [
      { icon: CheckCircle, label: 'Disponíveis', value: fMap['disponivel'] ?? 0, color: 'bg-green-50 text-green-600' },
      { icon: ClipboardList, label: 'Em uso', value: fMap['emprestada'] ?? 0, color: 'bg-blue-50 text-blue-600' },
      { icon: AlertCircle, label: 'Atrasadas', value: dashStats.atrasados, color: 'bg-red-50 text-red-600' },
      { icon: Clock, label: 'Empréstimos este mês', value: dashStats.novosMes, color: 'bg-amber-50 text-amber-600' },
    ];
  }, [dashStats]);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">Relatórios Gerenciais</h1>
        </div>

        {/* Stats cards */}
        {statCards.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {([['ferramenta', 'Por Ferramenta'], ['colaborador', 'Por Colaborador'], ['atrasos', 'Atrasos'], ['periodo', 'Por Período']] as [Tipo, string][]).map(([t, label]) => (
            <button key={t} onClick={() => setTipo(t)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${tipo === t ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
              {label}
            </button>
          ))}
        </div>

        {tipo === 'periodo' && (
          <div className="flex gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Data início</label>
              <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)}
                className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Data fim</label>
              <input type="date" value={fim} onChange={(e) => setFim(e.target.value)}
                className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button onClick={load} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700">Gerar</button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* Gráfico */}
            {chartData.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-4">
                  {tipo === 'colaborador' ? 'Empréstimos por colaborador' : 'Empréstimos por ferramenta'}
                </h2>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e5e7eb' }}
                      formatter={(v: number) => [v, 'Empréstimos']}
                    />
                    <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Tabela */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Ferramenta</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Responsável</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Retirada</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Prev. Devolução</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-8 text-gray-400">Nenhum dado encontrado</td></tr>
                  ) : dados.map((e: any, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{e.ferramenta?.nome}</p>
                        <p className="text-xs text-gray-400">{e.ferramenta?.codigo}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{e.responsavel?.nome}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {e.dataRetirada ? new Date(e.dataRetirada).toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {e.dataDevolucaoPrevista ? new Date(e.dataDevolucaoPrevista).toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[e.status] || 'bg-gray-100 text-gray-600'}`}>
                          {e.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
