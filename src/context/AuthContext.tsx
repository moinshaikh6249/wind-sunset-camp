'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '@/lib/api';

interface User {
  _id: string;
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  photoURL?: string;
  role: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const userToken = localStorage.getItem('authToken') || localStorage.getItem('token');

      if (adminToken) {
        const adminData = await api.get('/admin/me') as any;
        const normalizedAdmin = adminData?.admin || adminData?.user || adminData;
        setUser({
          ...normalizedAdmin,
          _id: normalizedAdmin?._id || normalizedAdmin?.id,
          firstName: normalizedAdmin?.firstName || normalizedAdmin?.name,
          role: normalizedAdmin?.role || 'admin',
        } as User);
        return;
      }

      if (userToken) {
        const userData = await api.get('/auth/me') as any;
        const normalizedUser = (userData?.user || userData) as any;
        setUser({
          ...normalizedUser,
          _id: normalizedUser?._id || normalizedUser?.id,
        } as User);
        return;
      }

      setUser(null);
    } catch (error) {
      console.log('Not authenticated');
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
