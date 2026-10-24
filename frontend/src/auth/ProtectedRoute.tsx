import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading, token } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user && !token) return <Navigate to="/login" replace />;
  if (!user && token) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
