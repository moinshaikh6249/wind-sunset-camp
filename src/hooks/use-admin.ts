'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { auth, db } from '@/lib/firebase';
import { doc } from 'firebase/firestore';
import { useMemo } from 'react';

export function useAdmin() {
  const [user, authLoading, authError] = useAuthState(auth);

  const adminDocRef = useMemo(() => {
    if (!user) return null;
    return doc(db, 'admins', user.uid);
  }, [user]);

  const [adminDoc, adminLoading, adminError] = useDocumentData(adminDocRef);

  const isAdmin = useMemo(() => !!adminDoc, [adminDoc]);
  const isLoading = authLoading || (user && adminLoading);

  return {
    user,
    isAdmin,
    isAdminLoading: isLoading,
    error: authError || adminError,
  };
}
