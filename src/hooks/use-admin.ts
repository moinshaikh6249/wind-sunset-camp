
import { useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useObjectVal } from 'react-firebase-hooks/database';
import { ref } from 'firebase/database';
import { auth, database } from '@/lib/firebase';

export function useAdmin() {
  const [user, isUserLoading] = useAuthState(auth);

  // Create a memoized reference to the admin path in the database
  const adminRef = useMemo(() => {
    if (!user) return null;
    return ref(database, `admins/${user.uid}`);
  }, [user]);

  // Use the useDatabaseValue hook to get the admin status
  const [isAdminData, isAdminLoading, error] = useObjectVal<boolean>(adminRef);
  
  const isAdmin = !!isAdminData;

  return { isAdmin, isAdminLoading: isUserLoading || isAdminLoading, error };
}
