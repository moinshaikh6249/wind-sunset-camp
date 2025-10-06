
'use server';

import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';
import { initializeAdminApp } from '@/lib/firebase-admin';
import { DecodedIdToken } from 'firebase-admin/auth';
import { revalidatePath } from 'next/cache';

async function getAdminUser(idToken: string): Promise<DecodedIdToken | null> {
    if (!idToken) return null;
      
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


export async function deleteUser(idToken: string, uid: string): Promise<{ success: boolean; error?: string }> {
    const adminUser = await getAdminUser(idToken);
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
