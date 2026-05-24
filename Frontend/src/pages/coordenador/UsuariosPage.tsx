import { useEffect, useState } from 'react';
import { Users, KeyRound, UserX } from 'lucide-react';
import { usuariosService, UsuarioLista } from '../../services/usuarios.service';
import AppLayout from '../../components/layout/AppLayout';
import { toast } from 'sonner';

const perfilLabel: Record<string, string> = {
  coordenador: 'Coordenador',
  almoxarife: 'Almoxarife',
  tecnico: 'Técnico',
};

const perfilColor: Record<string, string> = {
  coordenador: 'bg-purple-100 text-purple-700',
  almoxarife: 'bg-blue-100 text-blue-700',
  tecnico: 'bg-green-100 text-green-700',
};

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioLista[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetando, setResetando] = useState<UsuarioLista | null>(null);
  const [novaSenha, setNovaSenha] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    usuariosService
      .findAll()
      .then(setUsuarios)
      .catch(() => toast.error('Erro ao carregar usuários'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleReset = async () => {
    if (!resetando || !novaSenha.trim()) return;
    setSaving(true);
    try {
      await usuariosService.resetPassword(resetando.id, novaSenha);
      toast.success(`Senha de ${resetando.nome} redefinida`);
      setResetando(null);
      setNovaSenha('');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDesativar = async (u: UsuarioLista) => {
    if (!confirm(`Desativar o usuário "${u.nome}"?`)) return;
    try {
      await usuariosService.deactivate(u.id);
      toast.success(`${u.nome} desativado`);
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">Usuários</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Nome</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Usuário</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">E-mail</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Perfil</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {usuarios.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">Nenhum usuário encontrado</td></tr>
                ) : usuarios.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{u.nome}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{u.username}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${perfilColor[u.perfil]}`}>
                        {perfilLabel[u.perfil] ?? u.perfil}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => { setResetando(u); setNovaSenha(''); }}
                          className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2.5 py-1.5 rounded-lg hover:bg-amber-200 transition-colors"
                          title="Redefinir senha"
                        >
                          <KeyRound className="w-3.5 h-3.5" /> Redefinir senha
                        </button>
                        <button
                          onClick={() => handleDesativar(u)}
                          className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2.5 py-1.5 rounded-lg hover:bg-red-200 transition-colors"
                          title="Desativar usuário"
                        >
                          <UserX className="w-3.5 h-3.5" /> Desativar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {resetando && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Redefinir Senha</h2>
            <p className="text-sm text-gray-500 mb-4">Usuário: <strong>{resetando.nome}</strong></p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nova senha</label>
                <input
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setResetando(null)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReset}
                  disabled={saving || novaSenha.length < 6}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? 'Salvando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
