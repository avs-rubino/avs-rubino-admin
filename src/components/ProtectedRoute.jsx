import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ALLOWED_ROLES = ['Super_Admin', 'Editor_Admin'];

const ProtectedRoute = ({ children, requireSuperAdmin = false }) => {
  const { currentUser, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-100 border-t-teal-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Zero-Trust: utenti con ruolo 'Utente_Normale' (o non approvati) vengono respinti
  if (role === 'Utente_Normale' || !role || !ALLOWED_ROLES.includes(role)) {
    return <Navigate to="/login?status=pending" replace />;
  }

  if (requireSuperAdmin && role !== 'Super_Admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
