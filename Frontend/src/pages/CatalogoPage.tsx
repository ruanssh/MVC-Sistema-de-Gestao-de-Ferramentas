import { useEffect, useState } from 'react';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { ferramentasService, Ferramenta } from '../services/ferramentas.service';
import AppLayout from '../components/layout/AppLayout';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

const estadoConfig: Record<string, { label: string; color: string }> = {
  disponivel: { label: 'Disponível', color: 'bg-green-100 text-green-700' },
  emprestada: { label: 'Emprestada', color: 'bg-blue-100 text-blue-700' },
  manutencao: { label: 'Manutenção', color: 'bg-amber-100 text-amber-700' },
  danificada: { label: 'Danificada', color: 'bg-red-100 text-red-700' },
};

const emptyForm = {
  codigo: '', nome: '', categoria: '', marca: '', estado: 'disponivel',
  estadoConservacao: 'bom', quantidade: 1, localizacao: '', observacoes: '',
};

export default function CatalogoPage() {
  const { user } = useAuth();
  const canEdit = user?.perfil === 'almoxarife';
  const [ferramentas, setFerramentas] = useState<Ferramenta[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('todas');
  const [estado, setEstado] = useState('todos');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Ferramenta | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    ferramentasService
      .findAll({ search: search || undefined, categoria: categoria !== 'todas' ? categoria : undefined, estado: estado !== 'todos' ? estado : undefined })
      .then(setFerramentas)
      .catch(() => toast.error('Erro ao carregar ferramentas'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, categoria, estado]);

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm }); setShowForm(true); };
  const openEdit = (f: Ferramenta) => { setEditing(f); setForm({ ...emptyForm, ...f } as any); setShowForm(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await ferramentasService.update(editing.id, form as any);
        toast.success('Ferramenta atualizada');
      } else {
        await ferramentasService.create(form as any);
        toast.success('Ferramenta cadastrada');
      }
      setShowForm(false);
      load();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover esta ferramenta?')) return;
    try {
      await ferramentasService.remove(id);
      toast.success('Ferramenta removida');
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Catálogo de Ferramentas</h1>
          {canEdit && (
            <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" /> Nova Ferramenta
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou código..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="todas">Todas categorias</option>
            <option value="Manual">Manual</option>
            <option value="Elétrica">Elétrica</option>
            <option value="Medição">Medição</option>
          </select>
          <select value={estado} onChange={(e) => setEstado(e.target.value)} className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="todos">Todos estados</option>
            <option value="disponivel">Disponível</option>
            <option value="emprestada">Emprestada</option>
            <option value="manutencao">Manutenção</option>
            <option value="danificada">Danificada</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Código</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Nome</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Categoria</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Qtd</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Estado</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Localização</th>
                  {canEdit && <th className="px-4 py-3" />}
                </tr>
              </thead>
              <tbody>
                {ferramentas.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-400">Nenhuma ferramenta encontrada</td></tr>
                ) : (
                  ferramentas.map((f) => {
                    const cfg = estadoConfig[f.estado];
                    return (
                      <tr key={f.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{f.codigo}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">{f.nome}</td>
                        <td className="px-4 py-3 text-gray-600">{f.categoria}</td>
                        <td className="px-4 py-3 text-gray-600">{f.quantidade}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{f.localizacao || '—'}</td>
                        {canEdit && (
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button onClick={() => openEdit(f)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                              <button onClick={() => handleDelete(f.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-5">{editing ? 'Editar Ferramenta' : 'Cadastrar Ferramenta'}</h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Código *</label>
                  <input value={form.codigo} onChange={set('codigo')} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Quantidade *</label>
                  <input type="number" min={1} value={form.quantidade} onChange={set('quantidade')} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nome *</label>
                <input value={form.nome} onChange={set('nome')} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Categoria *</label>
                  <select value={form.categoria} onChange={set('categoria')} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    <option value="">Selecione</option>
                    <option>Manual</option>
                    <option>Elétrica</option>
                    <option>Medição</option>
                    <option>Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Marca</label>
                  <input value={form.marca} onChange={set('marca')} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
                  <select value={form.estado} onChange={set('estado')} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="disponivel">Disponível</option>
                    <option value="emprestada">Emprestada</option>
                    <option value="manutencao">Manutenção</option>
                    <option value="danificada">Danificada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Conservação</label>
                  <select value={form.estadoConservacao} onChange={set('estadoConservacao')} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="excelente">Excelente</option>
                    <option value="bom">Bom</option>
                    <option value="regular">Regular</option>
                    <option value="ruim">Ruim</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Localização</label>
                <input value={form.localizacao} onChange={set('localizacao')} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Observações</label>
                <textarea value={form.observacoes} onChange={set('observacoes')} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60">{saving ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
