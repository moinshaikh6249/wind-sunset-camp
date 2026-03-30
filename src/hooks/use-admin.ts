'use client';

import { useAuth } from '@/context/AuthContext';
import { useMemo } from 'react';

export function useAdmin() {
  const { user, loading } = useAuth();

  const isAdmin = useMemo(() => ['admin', 'super-admin'].includes(user?.role || ''), [user?.role]);

  return {
    user,
    isAdmin,
    isAdminLoading: loading,
    error: null,
  };
}
