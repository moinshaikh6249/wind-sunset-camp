
import { getApps, initializeApp, App, applicationDefault } from 'firebase-admin/app';
import 'server-only';

async function initializeAdminApp() {
    const apps = getApps();
    if (apps.length > 0) {
        return { app: apps[0] as App };
    }

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!projectId) {
        throw new Error("Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID");
    }

    const app = initializeApp({
        projectId,
        credential: applicationDefault(),
        databaseURL: `https://${projectId}-default-rtdb.firebaseio.com`
    });

    return { app };
}

export { initializeAdminApp };
