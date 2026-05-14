import { useEffect, useState } from 'react';
import { Search, Send } from 'lucide-react';
import { ferramentasService, Ferramenta } from '../services/ferramentas.service';
import { solicitacoesService } from '../services/solicitacoes.service';
import AppLayout from '../components/layout/AppLayout';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

const estadoConfig: Record<string, { label: string; color: string }> = {
  disponivel: { label: 'Disponível', color: 'bg-green-100 text-green-700' },
  emprestada: { label: 'Emprestada', color: 'bg-blue-100 text-blue-700' },
  manutencao: { label: 'Manutenção', color: 'bg-amber-100 text-amber-700' },
  danificada: { label: 'Danificada', color: 'bg-red-100 text-red-700' },
};

export default function DisponibilidadePage() {
  const { user } = useAuth();
  const [ferramentas, setFerramentas] = useState<Ferramenta[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [solicitando, setSolicitando] = useState<Ferramenta | null>(null);
  const [form, setForm] = useState({ previsaoDevolucao: '', observacoes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    ferramentasService
      .findAll({ search: search || undefined })
      .then(setFerramentas)
      .catch(() => toast.error('Erro ao carregar'))
      .finally(() => setLoading(false));
  }, [search]);

  const handleSolicitar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solicitando) return;
    setSaving(true);
    try {
      await solicitacoesService.create({ ferramentaId: solicitando.id, previsaoDevolucao: form.previsaoDevolucao, observacoes: form.observacoes });
      toast.success('Solicitação enviada com sucesso');
      setSolicitando(null);
      setForm({ previsaoDevolucao: '', observacoes: '' });
    } catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-5">
        <h1 className="text-xl font-bold text-gray-900">Consultar Disponibilidade</h1>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar ferramenta..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ferramentas.map((f) => {
              const cfg = estadoConfig[f.estado];
              return (
                <div key={f.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{f.nome}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{f.codigo} · {f.categoria}{f.marca ? ` · ${f.marca}` : ''}</p>
                    <p className="text-xs text-gray-400">{f.localizacao || '—'}</p>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${cfg.color}`}>{cfg.label}</span>
                  </div>
                  {user?.perfil === 'tecnico' && f.estado === 'disponivel' && (
                    <button
                      onClick={() => setSolicitando(f)}
                      className="flex items-center gap-1.5 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors ml-3 shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" /> Solicitar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {solicitando && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Solicitar Ferramenta</h2>
            <p className="text-sm text-gray-500 mb-5">{solicitando.nome}</p>
            <form onSubmit={handleSolicitar} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Previsão de Devolução *</label>
                <input type="date" value={form.previsaoDevolucao} onChange={(e) => setForm(f => ({ ...f, previsaoDevolucao: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Observações</label>
                <textarea value={form.observacoes} onChange={(e) => setForm(f => ({ ...f, observacoes: e.target.value }))} rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setSolicitando(null)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60">{saving ? 'Enviando...' : 'Enviar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
