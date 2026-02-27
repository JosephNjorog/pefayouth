import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'member' | 'super_admin' | 'finance_admin' | 'secretary';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string, role: UserRole) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = (email: string, _password: string, role: UserRole): boolean => {
    const roleProfiles: Record<UserRole, AuthUser> = {
      member: { id: 'm1', name: 'Grace Wanjiku', email, role: 'member' },
      super_admin: { id: 'sa1', name: 'Pastor Daniel Mutua', email, role: 'super_admin' },
      finance_admin: { id: 'fa1', name: 'Mary Wambui', email, role: 'finance_admin' },
      secretary: { id: 'sec1', name: 'Ruth Njeri', email, role: 'secretary' },
    };
    setUser(roleProfiles[role]);
    return true;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const isAdminRole = (role: UserRole) =>
  role === 'super_admin' || role === 'finance_admin' || role === 'secretary';
