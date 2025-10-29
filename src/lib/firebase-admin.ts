
import { getApps, initializeApp, App, applicationDefault } from 'firebase-admin/app';
import 'server-only';

// This function ensures that the admin app is initialized only once using the
// application default credentials, which is the standard and most reliable way in this environment.
export function initializeAdminApp(): App {
    const apps = getApps();
    if (apps.length > 0) {
        return apps[0] as App;
    }

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!projectId) {
        throw new Error("NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable is not set.");
    }

    // Initialize with application default credentials.
    // The SDK will automatically use the GOOGLE_APPLICATION_CREDENTIALS environment variable
    // and other gcloud context in this environment.
    return initializeApp({
        credential: applicationDefault(),
        databaseURL: `https://${projectId}-default-rtdb.firebaseio.com`,
        projectId: projectId,
    });
}
