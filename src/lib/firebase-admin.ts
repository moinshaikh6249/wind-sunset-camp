
import { getApps, initializeApp, App, cert } from 'firebase-admin/app';
import 'server-only';

async function initializeAdminApp() {
    const apps = getApps();
    if (apps.length > 0) {
        return { app: apps[0] as App };
    }

    // This is the only way to get credentials from a Workstation
    const response = await fetch('http://localhost:15000/gcloud-auth/print-access-token');
    const { token } = await response.json();

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!projectId) {
        throw new Error("Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID");
    }

    const app = initializeApp({
        projectId,
        credential: {
            getAccessToken: () => ({
                expires_in: 3600,
                access_token: token,
            }),
        }
    });

    return { app };
}

export { initializeAdminApp };
