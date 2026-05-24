import { useState } from 'react';
import { Link } from 'react-router';
import { Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '../../services/auth.service';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.forgotPassword(email);
      setSent(true);
      toast.success('Instruções enviadas para ' + email);
    } catch {
      toast.error('Erro ao enviar. Verifique o e-mail informado.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <Wrench className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Controle de Ferramentas</h1>
          <p className="text-sm text-blue-600 mt-1">Recuperar Senha</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Instruções de recuperação enviadas para <strong>{email}</strong>.
            </p>
            <Link to="/login" className="text-sm text-blue-600 hover:underline block">
              ← Voltar para login
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-blue-600 text-center mb-6">
              Digite seu e-mail cadastrado e enviaremos instruções para recuperar sua senha.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors"
              >
                Enviar Instruções
              </button>
            </form>
            <p className="text-center mt-5">
              <Link to="/login" className="text-sm text-gray-600 hover:underline">
                ← Voltar para login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
