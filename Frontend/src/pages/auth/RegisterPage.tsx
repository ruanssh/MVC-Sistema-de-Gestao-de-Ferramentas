import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { perfisService, Perfil } from '../../services/perfis.service';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [form, setForm] = useState({
    nome: '',
    username: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    perfil: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    perfisService
      .findAll()
      .then((lista) => {
        setPerfis(lista);
        setForm((prev) => ({ ...prev, perfil: prev.perfil || lista[0]?.slug || '' }));
      })
      .catch(() => toast.error('Erro ao carregar perfis'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.senha !== form.confirmarSenha) {
      toast.error('As senhas não coincidem');
      return;
    }
    setLoading(true);
    try {
      await register({ nome: form.nome, username: form.username, email: form.email, senha: form.senha, perfil: form.perfil });
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-3">
            <Wrench className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Controle de Ferramentas</h1>
          <p className="text-sm text-gray-500 mt-1">Criar Nova Conta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {[
            { label: 'Nome Completo', key: 'nome', type: 'text', placeholder: 'Digite seu nome completo' },
            { label: 'Usuário', key: 'username', type: 'text', placeholder: 'Escolha um nome de usuário' },
            { label: 'E-mail', key: 'email', type: 'email', placeholder: 'seu@email.com' },
            { label: 'Senha', key: 'senha', type: 'password', placeholder: 'Mínimo 6 caracteres' },
            { label: 'Confirmar Senha', key: 'confirmarSenha', type: 'password', placeholder: 'Digite a senha novamente' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type={type}
                placeholder={placeholder}
                value={(form as any)[key]}
                onChange={set(key)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
            <select
              value={form.perfil}
              onChange={set('perfil')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={perfis.length === 0}
              >
              {perfis.map((perfil) => (
                <option key={perfil.id} value={perfil.slug}>{perfil.nome}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-blue-700 disabled:opacity-60 transition-colors mt-2"
          >
            {loading ? 'Criando...' : 'Criar Conta'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-5">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}
