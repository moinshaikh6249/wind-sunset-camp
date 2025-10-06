
'use server';

import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';
import { initializeAdminApp } from '@/lib/firebase-admin';
import { headers } from 'next/headers';
import { DecodedIdToken } from 'firebase-admin/auth';
import { revalidatePath } from 'next/cache';

async function getAdminUser(): Promise<DecodedIdToken | null> {
    const authorization = headers().get('Authorization');
    if (authorization?.startsWith('Bearer ')) {
      const idToken = authorization.split('Bearer ')[1];
      try {
        const { app } = await initializeAdminApp();
        const auth = getAuth(app);
        const decodedToken = await auth.verifyIdToken(idToken);
        
        if (decodedToken.isAdmin) {
            return decodedToken;
        }
        return null;
      } catch (error) {
        console.error('Error verifying ID token:', error);
        return null;
      }
    }
    return null;
}


export async function deleteUser(uid: string): Promise<{ success: boolean; error?: string }> {
    const adminUser = await getAdminUser();
    if (!adminUser) {
        return { success: false, error: 'Permission denied. You must be an administrator.' };
    }

    try {
        const { app } = await initializeAdminApp();
        const auth = getAuth(app);
        const db = getDatabase(app);

        // Delete from Firebase Authentication
        await auth.deleteUser(uid);

        // Delete from Realtime Database
        const userRef = db.ref(`users/${uid}`);
        await userRef.remove();
        
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting user:', error);
        return { success: false, error: error.message || 'An unexpected error occurred.' };
    }
}
