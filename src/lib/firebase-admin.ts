
// This file is no longer used for Firebase Admin SDK initialization
// in the context of user/review management, as those actions have been
// moved to the client-side with security enforced by rules.
// It is kept for potential future use cases but is currently inactive.

import { getApps, initializeApp, App, applicationDefault } from 'firebase-admin/app';
import 'server-only';

export function initializeAdminApp(): App {
    const apps = getApps();
    if (apps.length > 0) {
        return apps[0] as App;
    }

    const projectId = process.env.GCLOUD_PROJECT;
    if (!projectId) {
        throw new Error("GCLOUD_PROJECT environment variable is not set.");
    }

    return initializeApp({
        credential: applicationDefault(),
        databaseURL: `https://${projectId}-default-rtdb.firebaseio.com`,
        projectId: projectId,
    });
}

    