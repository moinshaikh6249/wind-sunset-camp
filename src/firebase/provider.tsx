'use client';

import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth, User } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import type { Firestore } from 'firebase/firestore';
import type { Database, Query } from 'firebase/database';
import { getDatabase, ref } from 'firebase/database';
import { useDatabaseValue } from './database/use-database-value';
import type { FirebaseStorage } from 'firebase/storage';

interface FirebaseContextValue {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
  database: Database | null;
  storage: FirebaseStorage | null;
}

const FirebaseContext = createContext<FirebaseContextValue>({
  firebaseApp: null,
  auth: null,
  firestore: null,
  database: null,
  storage: null,
});

export const useFirebase = () => useContext(FirebaseContext);
export const useFirebaseApp = () => useContext(FirebaseContext).firebaseApp;
export const useAuth = () => useContext(FirebaseContext).auth!;
export const useFirestore = () => useContext(FirebaseContext).firestore;
export const useDatabase = () => useContext(FirebaseContext).database;
export const useStorage = () => useContext(FirebaseContext).storage;

export const useUser = () => {
  const auth = useAuth();
  const [user, loading, error] = useAuthState(auth);
  return { user, isUserLoading: loading, error };
};

export function useAdmin() {
  const { user, isUserLoading } = useUser();
  const database = useDatabase();

  // Create a memoized reference to the admin path in the database
  const adminRef = useMemo(() => {
    if (!database || !user) return null;
    return ref(database, `admins/${user.uid}`);
  }, [database, user]);

  // Use the useDatabaseValue hook to get the admin status
  const { data: isAdminData, isLoading: isAdminLoading, error } = useDatabaseValue<boolean>(adminRef);
  
  const isAdmin = !!isAdminData;

  return { isAdmin, isAdminLoading: isUserLoading || isAdminLoading, error };
}

// Custom hook to memoize Firebase queries
export const useMemoFirebase = <T extends Query | null>(
  getQuery: () => T,
  deps: React.DependencyList
): T => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(getQuery, deps);
};

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
  database: Database | null;
  storage: FirebaseStorage | null;
}

export function FirebaseProvider({
  children,
  firebaseApp,
  auth,
  firestore,
  database,
  storage,
}: FirebaseProviderProps) {
  const contextValue = useMemo(() => ({
    firebaseApp,
    auth,
    firestore,
    database,
    storage
  }), [firebaseApp, auth, firestore, database, storage]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
}
