
import { getApps, initializeApp, App, applicationDefault } from 'firebase-admin/app';
import 'server-only';

// This function ensures that the admin app is initialized only once.
export function initializeAdminApp(): App {
    const apps = getApps();
    if (apps.length > 0) {
        return apps[0] as App;
    }

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!projectId) {
        throw new Error("Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID");
    }

    return initializeApp({
        projectId,
        credential: applicationDefault(),
        databaseURL: `https://${projectId}-default-rtdb.firebaseio.com`
    });
}
