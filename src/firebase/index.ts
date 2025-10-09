
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// IMPORTANT: This function is simplified for reliability.
export function initializeFirebase(): {
  firebaseApp: FirebaseApp;
  auth: ReturnType<typeof getAuth>;
  firestore: ReturnType<typeof getFirestore>;
  database: ReturnType<typeof getDatabase>;
  storage: ReturnType<typeof getStorage>;
} {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  return {
    firebaseApp: app,
    auth: getAuth(app),
    firestore: getFirestore(app),
    database: getDatabase(app),
    storage: getStorage(app),
  };
}

export * from './provider';
export * from './client-provider';
export * from './errors';
export * from './error-emitter';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
    