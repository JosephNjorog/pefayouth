import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authLogin, authLogout, authMe, authRegister } from '@/lib/api';

export type UserRole = 'member' | 'super_admin' | 'finance_admin' | 'secretary';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  memberId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from cookie on mount
  useEffect(() => {
    authMe()
      .then((u) => setUser(u as AuthUser))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const u = await authLogin(email, password);
      setUser(u as AuthUser);
      return true;
    } catch {
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const u = await authRegister(name, email, password);
      setUser(u as AuthUser);
      return { success: true };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Registration failed' };
    }
  };

  const logout = async () => {
    try { await authLogout(); } catch {}
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
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
