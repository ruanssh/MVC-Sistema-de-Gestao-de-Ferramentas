import { useEffect, useState } from 'react';
import { Package, ClipboardList, AlertCircle, TrendingUp, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ferramentasService, FerramentaStats } from '../services/ferramentas.service';
import { emprestimosService, EmprestimoStats, Emprestimo } from '../services/emprestimos.service';
import { solicitacoesService, Solicitacao } from '../services/solicitacoes.service';
import AppLayout from '../components/layout/AppLayout';
import CoordDashboard from './coordenador/CoordDashboard';
import AlmoxDashboard from './almoxarife/AlmoxDashboard';
import TecnicoDashboard from './tecnico/TecnicoDashboard';

export default function DashboardPage() {
  const { user } = useAuth();

  if (user?.perfil === 'coordenador') return <CoordDashboard />;
  if (user?.perfil === 'almoxarife') return <AlmoxDashboard />;
  return <TecnicoDashboard />;
}
