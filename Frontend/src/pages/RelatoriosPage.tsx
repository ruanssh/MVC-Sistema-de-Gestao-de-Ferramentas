import { useEffect, useState } from 'react';
import { api } from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import { toast } from 'sonner';
import { BarChart3 } from 'lucide-react';

const statusConfig: Record<string, string> = {
  ativo: 'bg-blue-100 text-blue-700',
  atrasado: 'bg-red-100 text-red-700',
  devolvido: 'bg-green-100 text-green-700',
};

type Tipo = 'ferramenta' | 'colaborador' | 'atrasos' | 'periodo';

export default function RelatoriosPage() {
  const [tipo, setTipo] = useState<Tipo>('ferramenta');
  const [dados, setDados] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      let data: any[] = [];
      if (tipo === 'ferramenta') data = await api.get<any[]>('/relatorios/por-ferramenta');
      else if (tipo === 'colaborador') data = await api.get<any[]>('/relatorios/por-colaborador');
      else if (tipo === 'atrasos') data = await api.get<any[]>('/relatorios/atrasos');
      else if (tipo === 'periodo' && inicio && fim) data = await api.get<any[]>(`/relatorios/por-periodo?inicio=${inicio}&fim=${fim}`);
      setDados(data);
    } catch { toast.error('Erro ao gerar relatório'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (tipo !== 'periodo') load(); }, [tipo]);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">Relatórios Gerenciais</h1>
        </div>

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
              <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Data fim</label>
              <input type="date" value={fim} onChange={(e) => setFim(e.target.value)} className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button onClick={load} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700">Gerar</button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>
        ) : (
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
                    <td className="px-4 py-3 text-gray-500 text-xs">{e.dataRetirada ? new Date(e.dataRetirada).toLocaleDateString('pt-BR') : '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{e.dataDevolucaoPrevista ? new Date(e.dataDevolucaoPrevista).toLocaleDateString('pt-BR') : '—'}</td>
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
        )}
      </div>
    </AppLayout>
  );
}
