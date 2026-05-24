import { useAuth } from '../contexts/AuthContext';
import CoordDashboard from './coordenador/CoordDashboard';
import AlmoxDashboard from './almoxarife/AlmoxDashboard';
import TecnicoDashboard from './tecnico/TecnicoDashboard';

export default function DashboardPage() {
  const { user } = useAuth();

  if (user?.perfil === 'admin') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h1 className="text-xl font-bold text-gray-900">Administração</h1>
        <p className="text-sm text-gray-500 mt-2">
          Use o menu Usuários para cadastrar pessoas, redefinir senhas e atribuir perfis.
        </p>
      </div>
    );
  }
  if (user?.perfil === 'coordenador') return <CoordDashboard />;
  if (user?.perfil === 'almoxarife') return <AlmoxDashboard />;
  return <TecnicoDashboard />;
}
