
'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useMemo } from 'react';

const ADMIN_EMAIL = 'moinshaikh6249@gmail.com';

export function useAdmin() {
  const [user, loading, error] = useAuthState(auth);

  const isAdmin = useMemo(() => {
    if (!user) {
      return false;
    }
    return user.email === ADMIN_EMAIL;
  }, [user]);

  return {
    user,
    isAdmin,
    isAdminLoading: loading,
    error,
  };
}
