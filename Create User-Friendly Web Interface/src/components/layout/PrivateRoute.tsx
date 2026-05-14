import { Navigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  children: React.ReactNode;
  roles?: string[];
}

export default function PrivateRoute({ children, roles }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.perfil)) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
