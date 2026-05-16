import { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { Wrench, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const perfilLabel = {
  coordenador: 'Coordenador',
  almoxarife: 'Almoxarife',
  tecnico: 'Técnico',
};

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Wrench className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-semibold text-gray-900 text-sm">Controle de Ferramentas</span>
            <span className="text-xs text-gray-400 ml-2">Microservice</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-800">{user?.nome}</p>
            <p className="text-xs text-gray-500">{user ? perfilLabel[user.perfil] : ''}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="p-6">{children}</main>
    </div>
  );
}
