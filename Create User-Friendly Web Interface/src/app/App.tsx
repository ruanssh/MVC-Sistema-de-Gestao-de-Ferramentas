import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Toaster } from 'sonner';
import { AuthProvider } from '../contexts/AuthContext';
import PrivateRoute from '../components/layout/PrivateRoute';

import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import DashboardPage from '../pages/DashboardPage';
import CatalogoPage from '../pages/CatalogoPage';
import EmprestimosPage from '../pages/EmprestimosPage';
import SolicitacoesPage from '../pages/SolicitacoesPage';
import DisponibilidadePage from '../pages/DisponibilidadePage';
import HistoricoPage from '../pages/HistoricoPage';
import RelatoriosPage from '../pages/RelatoriosPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />

          {/* Rotas autenticadas */}
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/catalogo" element={<PrivateRoute><CatalogoPage /></PrivateRoute>} />
          <Route path="/disponibilidade" element={<PrivateRoute><DisponibilidadePage /></PrivateRoute>} />
          <Route path="/historico" element={<PrivateRoute><HistoricoPage /></PrivateRoute>} />

          {/* Rotas de almoxarife/coordenador */}
          <Route path="/emprestimos" element={<PrivateRoute roles={['almoxarife', 'coordenador']}><EmprestimosPage /></PrivateRoute>} />
          <Route path="/solicitacoes" element={<PrivateRoute roles={['almoxarife', 'coordenador']}><SolicitacoesPage /></PrivateRoute>} />
          <Route path="/relatorios" element={<PrivateRoute roles={['coordenador', 'almoxarife']}><RelatoriosPage /></PrivateRoute>} />

          {/* Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
