
import { getApps, initializeApp, App, applicationDefault } from 'firebase-admin/app';
import 'server-only';

// This function ensures that the admin app is initialized only once.
export function initializeAdminApp(): App {
    const apps = getApps();
    if (apps.length > 0) {
        return apps[0] as App;
    }

    // By initializing with no options, the Admin SDK will automatically
    // use the project's default service account credentials from the environment.
    return initializeApp();
}
