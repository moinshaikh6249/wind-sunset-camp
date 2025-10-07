
import { getApps, initializeApp, App, applicationDefault } from 'firebase-admin/app';
import 'server-only';

// This function ensures that the admin app is initialized only once using the
// application default credentials, which is the standard and most reliable way in this environment.
export function initializeAdminApp(): App {
    const apps = getApps();
    if (apps.length > 0) {
        return apps[0] as App;
    }

    // Initialize with application default credentials.
    // This allows the Admin SDK to automatically find and use the service account
    // credentials provided by the cloud environment.
    return initializeApp({
        credential: applicationDefault(),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
}
