import { useAuth } from '../contexts/AuthContext';
import CoordDashboard from './coordenador/CoordDashboard';
import AlmoxDashboard from './almoxarife/AlmoxDashboard';
import TecnicoDashboard from './tecnico/TecnicoDashboard';

export default function DashboardPage() {
  const { user } = useAuth();

  if (user?.perfil === 'coordenador') return <CoordDashboard />;
  if (user?.perfil === 'almoxarife') return <AlmoxDashboard />;
  return <TecnicoDashboard />;
}
