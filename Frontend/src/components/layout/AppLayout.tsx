import { ReactNode } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { Wrench, LogOut, LayoutDashboard, Package, ClipboardList, History, BarChart3, Search, ClipboardCheck, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const perfilLabel = {
  admin: 'Administrador',
  coordenador: 'Coordenador',
  almoxarife: 'Almoxarife',
  tecnico: 'Técnico',
};

const navPorPerfil = {
  admin: [
    { to: '/dashboard', label: 'Início', icon: LayoutDashboard },
    { to: '/usuarios',  label: 'Usuários', icon: Users },
  ],
  tecnico: [
    { to: '/dashboard',            label: 'Início',          icon: LayoutDashboard },
    { to: '/disponibilidade',      label: 'Disponibilidade', icon: Search },
    { to: '/minhas-solicitacoes',  label: 'Solicitações',    icon: ClipboardList },
    { to: '/historico',            label: 'Histórico',       icon: History },
  ],
  almoxarife: [
    { to: '/dashboard',   label: 'Início',      icon: LayoutDashboard },
    { to: '/catalogo',    label: 'Catálogo',    icon: Package },
    { to: '/emprestimos', label: 'Empréstimos', icon: ClipboardList },
    { to: '/historico',   label: 'Histórico',   icon: History },
  ],
  coordenador: [
    { to: '/dashboard',    label: 'Início',       icon: LayoutDashboard },
    { to: '/catalogo',     label: 'Catálogo',     icon: Package },
    { to: '/emprestimos',  label: 'Empréstimos',  icon: ClipboardList },
    { to: '/solicitacoes', label: 'Solicitações', icon: ClipboardCheck },
    { to: '/historico',    label: 'Histórico',    icon: History },
    { to: '/relatorios',   label: 'Relatórios',   icon: BarChart3 },
    { to: '/usuarios',     label: 'Usuários',     icon: Users },
  ],
};

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = user ? navPorPerfil[user.perfil] : [];

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

      <nav className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-1">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
                  active
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="p-6">{children}</main>
    </div>
  );
}
