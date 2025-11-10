
import { initializeApp, getApps, getApp, App } from 'firebase-admin/app';
import { credential } from 'firebase-admin';
import { firebaseConfig } from '@/firebase/config';

// This function initializes and returns the Firebase Admin App instance.
// It ensures that the app is initialized only once.
export function initializeAdminApp(): App {
  // If the default app is already initialized, return it.
  if (getApps().length) {
    return getApp();
  }

  // If GOOGLE_APPLICATION_CREDENTIALS environment variable is set,
  // it will be used automatically by `credential.applicationDefault()`.
  // This is the recommended approach for server environments.
  // The user needs to set this variable pointing to their service account JSON file.
  const app = initializeApp({
    credential: credential.applicationDefault(),
    databaseURL: firebaseConfig.databaseURL,
  });

  return app;
}
