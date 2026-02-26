import { Navigate } from 'react-router-dom';
import { useAuth, isAdminRole } from '@/contexts/AuthContext';
import Login from './Login';

const Index = () => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    return <Navigate to={isAdminRole(user.role) ? '/admin' : '/member'} replace />;
  }

  return <Login />;
};

export default Index;
