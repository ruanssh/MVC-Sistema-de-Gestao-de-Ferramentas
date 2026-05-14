import { useEffect, useState } from 'react';
import { emprestimosService, Emprestimo } from '../services/emprestimos.service';
import AppLayout from '../components/layout/AppLayout';
import { toast } from 'sonner';

const statusConfig: Record<string, string> = {
  ativo: 'bg-blue-100 text-blue-700',
  atrasado: 'bg-red-100 text-red-700',
  devolvido: 'bg-green-100 text-green-700',
};

export default function HistoricoPage() {
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    emprestimosService
      .findAll()
      .then(setEmprestimos)
      .catch(() => toast.error('Erro ao carregar histórico'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-5">
        <h1 className="text-xl font-bold text-gray-900">Histórico de Movimentações</h1>

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
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Devolvido em</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {emprestimos.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">Nenhum registro encontrado</td></tr>
                ) : emprestimos.map((e) => (
                  <tr key={e.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{e.ferramenta.nome}</p>
                      <p className="text-xs text-gray-400">{e.ferramenta.codigo}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{e.responsavel.nome}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(e.dataRetirada).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(e.dataDevolucaoPrevista).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {e.dataDevolucaoReal ? new Date(e.dataDevolucaoReal).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[e.status]}`}>
                        {e.status.charAt(0).toUpperCase() + e.status.slice(1)}
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
