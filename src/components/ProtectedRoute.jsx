import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ALLOWED_ROLES = ['Super_Admin', 'Editor_Admin'];

const ProtectedRoute = ({ children }) => {
  const { currentUser, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-100 border-t-blue-600"></div>
      </div>
    );
  }

  if (!currentUser || !role || !ALLOWED_ROLES.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
