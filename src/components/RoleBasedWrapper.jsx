import { useAuth } from '../hooks/useAuth';

const RoleBasedWrapper = ({ children, allowedRoles }) => {
  const { role, loading } = useAuth();

  if (loading) return null;

  if (!role || !allowedRoles.includes(role)) {
    return null;
  }

  return children;
};

export default RoleBasedWrapper;
