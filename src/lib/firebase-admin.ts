
import { getApps, initializeApp, App, cert } from 'firebase-admin/app';
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

    let credential;
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        // Production or local with service account file
        credential = cert(JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS));
    } else {
        // Workstation or environment with implicit credentials
        const response = await fetch('http://localhost:15000/gcloud-auth/print-access-token');
        const { token } = await response.json();
        credential = {
            getAccessToken: () => ({
                expires_in: 3600,
                access_token: token,
            }),
        };
    }
    
    const app = initializeApp({
        projectId,
        credential,
        databaseURL: `https://${projectId}-default-rtdb.firebaseio.com`
    });

    return { app };
}

export { initializeAdminApp };
